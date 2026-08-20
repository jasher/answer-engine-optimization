# Walkthrough — Dynamic Config-Driven Model Architecture

We have implemented and verified the **Dynamic Model Configuration Architecture** (`config/models.json`) for the AEO Ready platform.

---

## 1. What Was Implemented

### 1. Central Model Registry (`config/models.json`)
- Models to execute for assessments are now **100% config-driven** rather than hardcoded in application logic.
- Configured across two distinct tiers:
  - **(a) Free Tier:** Google Gemini (`gemini-2.0-flash-001`), OpenAI ChatGPT (`gpt-4o-mini`), Anthropic Claude (`claude-3-haiku`).
  - **(b) Paid Tier:** Claude 3.7 Sonnet, ChatGPT 5.6 Terra, xAI Grok 4.6, Gemini 3.1 Pro, Perplexity Sonar.

```json
{
  "version": "1.0",
  "tiers": {
    "free": [
      {
        "id": "gemini",
        "name": "Google Gemini",
        "modelId": "google/gemini-2.0-flash-001",
        "provider": "openrouter",
        "badge": "Fast",
        "accentColor": "#38bdf8",
        "maxTokens": 350,
        "enabled": true
      },
      ...
    ],
    "paid": [
      ...
    ]
  }
}
```

### 2. Backend Dynamic Execution ([`lib/engines.js`](file:///Users/jonathanasher/Projects/aeo/lib/engines.js) & [`server.js`](file:///Users/jonathanasher/Projects/aeo/server.js))
- `getModelsForTier(tier)` dynamically reads models from `config/models.json`.
- `server.js` loops over the enabled models in parallel and streams the results with full display metadata (`name`, `badge`, `accentColor`, `mentionRate`, `citationRate`, `band`).

### 3. Dynamic UI Result Cards ([`report.js`](file:///Users/jonathanasher/Projects/aeo/report.js))
- Result cards are generated dynamically from stream payloads.
- Adding, renaming, or swapping any AI model in `config/models.json` automatically renders the new card and styling with **zero frontend code changes**.

---

## 2. Verification

Ran the dynamic model pipeline test:
```
Free Tier Models Loaded: [ 'Google Gemini', 'OpenAI ChatGPT', 'Anthropic Claude' ]
Paid Tier Models Loaded: [ 'Claude 3.7 Sonnet', 'ChatGPT 5.6 Terra', 'xAI Grok 4.6', 'Gemini 3.1 Pro', 'Perplexity Sonar' ]
Sample Result Card Payload: {
  engine: 'gemini',
  name: 'Google Gemini',
  badge: 'Fast',
  accentColor: '#38bdf8',
  mentionRate: 100,
  citationRate: 0,
  band: 'A'
}
✅ Dynamic models.json architecture verified!
```
