#!/bin/bash
export PATH="/usr/local/Cellar/node/25.8.1_1/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")/flock"
exec npm run web -- --port 8081
