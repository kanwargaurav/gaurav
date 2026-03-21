import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';

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
5. End every response with one natural follow-up question OR "Want me to find flights, break down day 1 in detail, or build a packing list? 🗺️"
6. Keep responses under 400 words. Be the friend who has been everywhere. Never mention you are an AI or Claude. You are FLOCK.`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: FLOCK_SYSTEM_PROMPT,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';

    return new Response(JSON.stringify({ content, message: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
