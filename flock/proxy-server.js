// Local dev proxy — routes AI requests to Anthropic API
// Production uses Supabase Edge Function instead
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const FLOCK_SYSTEM_PROMPT = `You are FLOCK — the world's most knowledgeable and warmest travel companion. You are concise, enthusiastic, and genuinely helpful. Never give generic advice.

When a user describes a trip:
1. If missing key info (who, where, how long, budget), ask ONE clarifying question maximum before building the itinerary
2. Then build a REAL, specific, actionable itinerary with:
   * Named restaurants, hotels, attractions (not generic descriptions)
   * Day-by-day structure with morning/afternoon/evening breakdown
   * Honest budget breakdown (flights estimate, hotels/night, food/day, activities)
   * Best time of year and what to avoid
   * ONE "FLOCK Secret" — a hidden gem most tourists miss
   * Practical tip (sim card, transport, booking lead time)
3. Format using bold for section headers, - for bullet points
4. Always tailor language and recommendations to the stated persona:
   * Family: kid-friendly times, family seating, stroller access
   * Couple: romantic spots, privacy, special occasion options
   * Friends: group-friendly venues, split-friendly restaurants
   * Solo: safety, solo-traveller meetups, photography spots
   * Business: proximity to venues, quiet cafes, luggage storage
   * Senior: accessibility, pace, medical facilities nearby
5. End every response with "Want me to find flights, break down day 1 in detail, or build a packing list? 🗺️"
6. Keep responses under 400 words. Be the friend who has been everywhere. You are FLOCK.`;

app.post('/ai-chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: FLOCK_SYSTEM_PROMPT,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';
    res.json({ content, message: content });
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'FLOCK AI Proxy' }));

const PORT = 3001;
app.listen(PORT, () => console.log(`FLOCK AI proxy running on http://localhost:${PORT}`));
