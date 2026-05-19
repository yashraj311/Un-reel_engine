# Un-Reel Engine v0.3

> AI-powered content automation system for faceless Instagram Reels.
> One operator. Any niche. Any tone. Full script package in under 10 seconds.

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-n8n%20%7C%20Groq%20%7C%20Airtable%20%7C%20Lovable-purple)

---

## What Is This?

Un-Reel Engine is a full-stack content automation system that takes a creator from **niche + topic → publish-ready script package in under 10 seconds.**

It was built to solve one specific, painful problem: running multiple faceless Instagram Reel channels manually means writing 20+ scripts every single day. That's 3–4 hours of research and writing before a single frame is shot. Un-Reel Engine eliminates that entirely.

The system is built around a two-stage AI pipeline:

- **Stage 1 — Research:** Given a niche, tone, and topic, Groq returns 4 scored viral angle ideas with quantified metrics (hook strength, emotional engagement, relevancy, virality potential, average score). The creator picks the angle that fits their channel best.
- **Stage 2 — Generate:** The selected angle + per-channel configuration from Airtable is passed to Groq, which returns a complete content package: voiceover hook, full script, Instagram caption, CTA, and hashtag set. Everything is saved to Airtable automatically.

The UI — built in Lovable — lets a single operator plan an entire day of content across multiple slots, niches, and tones without touching the backend.

---

Links & Images:
- 🔗 Live UI: ![Lovable link]([https://unreelengine.lovable.app](https://unreelengine.lovable.app/))
- 🔗 n8n Workflow:
<img width="1687" height="841" alt="image" src="https://github.com/user-attachments/assets/f8ff7d23-42cd-49e4-9ace-411c0ba265ad" />

- 🔗 AirtableDB log:
<img width="1830" height="891" alt="image" src="https://github.com/user-attachments/assets/ef23d30e-a861-4be1-a46c-efc965915f2d" />
<img width="1477" height="881" alt="image" src="https://github.com/user-attachments/assets/e487f22e-165f-447b-93eb-e4727e8f51a7" />


---
## System Architecture

```
                        ┌─────────────────────────────────┐
                        │         LOVABLE FRONTEND         │
                        │  Niche → Tone → Topic → Duration │
                        └────────────┬────────────────────┘
                                     │ POST /webhook/reel-engine
                                     ▼
                        ┌─────────────────────────────────┐
                        │         n8n WORKFLOW             │
                        │                                  │
                        │  Webhook Trigger                 │
                        │       ↓                          │
                        │  Validate Input                  │
                        │       ↓                          │
                        │  Fetch Channel Config (Airtable) │
                        │       ↓                          │
                        │  Merge Config with Input         │
                        │       ↓                          │
                        │  IF node — stage routing         │
                        │   ├── stage: "research"          │
                        │   │     ↓                        │
                        │   │  Groq API (llama-3.3-70b)    │
                        │   │     ↓                        │
                        │   │  Parser (Code node)          │
                        │   │     ↓                        │
                        │   │  Respond to UI               │
                        │   │                              │
                        │   └── stage: "generate"          │
                        │         ↓                        │
                        │  Groq API (llama-3.3-70b)        │
                        │         ↓                        │
                        │  Parse Claude Output             │
                        │         ↓                        │
                        │  ElevenLabs* → Airtable          │
                        │         ↓                        │
                        │  Update Status → Metricool*      │
                        └─────────────────────────────────┘

* Phase 2
```
<img width="1440" height="1640" alt="image" src="https://github.com/user-attachments/assets/58aa70c8-7fab-4362-8fe6-38819ad14f74" />

---

## Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Workflow Orchestration | n8n (cloud) | Node-based automation, webhook routing, API calls |
| AI Generation | Groq — llama-3.3-70b-versatile | Fast inference for research + script generation |
| Content Database | Airtable | Stores all generated scripts + per-channel config |
| Frontend UI | Lovable | No-code React UI with Claude API integration |
| Voiceover | ElevenLabs | Per-niche voice generation — Phase 2 |
| Scheduling | Metricool | Auto-posting to Instagram — Phase 2 |
| Video Generation | Kling AI | AI video assembly from script + audio — Phase 2 |

<img width="1440" height="1000" alt="image" src="https://github.com/user-attachments/assets/38c4316f-1ad6-41e0-980b-68b230e7be1b" />

---

## Key Design Decisions

### 1. Two-Stage Pipeline (Research → Generate)
Rather than going straight to script generation, the system first surfaces 4 scored viral angles. This mirrors how a real content strategist works — you don't write before you know your angle. It also gives the creator editorial control without breaking the automation.

### 2. Channel Config in Airtable
Every niche has its own row in the Channel Config table with:
- **VoiceID** — ElevenLabs voice persona per niche
- **SystemPrompt** — full AI persona and tone instructions per niche
- **PostingAccount** — Instagram handle
- **PostTime** — optimal post time

This means one webhook supports unlimited channels. A non-technical operator can add a new niche in Airtable — no n8n changes required.

### 3. Stage Routing via IF Node
A single webhook endpoint handles both research and generate stages. The `stage` field in the request body routes to the correct branch. This keeps the frontend integration simple (one endpoint) while keeping the backend logic cleanly separated.

### 4. JSON Parsing in a Dedicated Code Node
Groq returns content in JSON format but occasionally wraps it in markdown fences or adds whitespace. A dedicated Code node handles cleaning and parsing — more reliable than regex, easier to debug, and decoupled from the Groq node itself.

### 5. Graceful Degradation
The Error Handler and Respond with Error nodes ensure the frontend always gets a response — even if Groq fails or Airtable times out. This prevents silent failures in the UI.

---

## Airtable Schema

### Content Queue
Stores every generated script with full metadata.

| Field | Type | Description |
|-------|------|-------------|
| Niche | Text | Internal niche key (e.g. "health") |
| NicheLabel | Text | Display label (e.g. "Health & Fitness") |
| Tone | Text | Selected tone (e.g. "Controversial") |
| Topic | Text | Input topic |
| Duration | Number | Target duration in seconds |
| WordTarget | Number | Target word count |
| Hook | Long Text | Opening hook line |
| Script | Long Text | Full voiceover script |
| Caption | Long Text | Instagram caption |
| CTA | Long Text | Call to action |
| Hashtags | Long Text | Flat hashtag string |
| WordCount | Number | Actual word count of script |
| EstDuration | Number | Estimated reel duration |
| Status | Text | "Audio Ready" after ElevenLabs |
| GeneratedAt | DateTime | Timestamp |

### Channel Config
Per-channel configuration driving personalized output.

| Field | Type | Description |
|-------|------|-------------|
| Niche | Text | Niche key — matched against input |
| VoiceID | Text | ElevenLabs voice ID |
| SystemPrompt | Long Text | Full AI persona for this niche |
| PostingAccount | Text | Instagram handle |
| PostTime | Text | Default post time |

---

## API Reference

### Research Stage
```http
POST https://yashrajaipm.app.n8n.cloud/webhook/reel-engine
Content-Type: application/json

{
  "niche": "health",
  "tone": "Controversial",
  "topic": "gym myths",
  "duration": 45,
  "stage": "research"
}
```

**Response:**
```json
{
  "success": true,
  "ideas": [
    {
      "id": 1,
      "angle": "Debunking the most common gym myths",
      "hook": "Everything your trainer told you is wrong",
      "why_viral": "Challenges authority figures in a space people trust blindly",
      "hook_strength": 5,
      "emotional_engagement": 5,
      "relevancy": 4,
      "virality_potential": 5,
      "average_score": 4.75
    }
  ]
}
```

### Generate Stage
```http
POST https://yashrajaipm.app.n8n.cloud/webhook/reel-engine
Content-Type: application/json

{
  "niche": "health",
  "tone": "Controversial",
  "topic": "gym myths",
  "duration": 45,
  "stage": "generate"
}
```

**Response:**
```json
{
  "success": true,
  "hook": "Everything your trainer told you is wrong",
  "script": "Full voiceover script...",
  "caption": "Instagram caption...",
  "cta": "Call to action...",
  "hashtags": "#gymmyths #fitnessfacts ...",
  "wordCount": 87,
  "estDuration": 35,
  "niche": "health",
  "generatedAt": "2026-05-14T10:23:00.000Z"
}
```

---

## UI — Un-Reel Engine v0.3

The frontend is a 7-step flow built in Lovable:

1. **Pick Your Niche** — pill selector across 7 niches + locked Cross-Niche tile (Phase 2)
2. **Choose Your Tone** — per-niche suggested tone with ⓘ psychology tooltip explaining why
3. **Topic & Format** — topic input, reel duration (30s/45s/60s/90s), weekly summary toggle
4. **Top Viral Angles** — 4 scored idea cards with real hook lines from the API, star ratings per metric, average score
5. **Angle → Slot Assignment** — hover "Select This Angle" to assign to any active slot in Plan Your Day
6. **Plan Your Day** — persistent right-side panel with up to 4 scheduling slots, each with time, niche/tone context, and assigned hook
7. **Generate All Scripts + Schedule All** — generates content per slot, then separate Schedule All action shows confirmation

---

## Supported Niches

| Niche | Key | Default Tone |
|-------|-----|-------------|
| Motivation & Mindset | motivation | Bold & direct |
| Personal Finance | finance | Controversial |
| Health & Fitness | health | Controversial |
| AI Tools | ai_tools | Educational |
| News & Current Affairs | news | Storytelling |
| Relationships | relationships | Raw & honest |
| Business | business | Controversial |

---

## Phase 2 Roadmap

| Feature | Tool | Dependency |
|---------|------|------------|
| Voiceover generation | ElevenLabs | VoiceID already stored in Channel Config |
| Auto-scheduling | Metricool | Node exists in workflow, needs API key |
| Video generation | Kling AI | Triggered post-voiceover |
| Analytics feedback loop | Metricool + n8n | Engagement data retrains angle weights |
| Cross-niche repurposing | Groq | Top scripts adapted across niches automatically |

---

## What I'd Build Next

**If I had 2 more weeks:**

1. Wire ElevenLabs — the VoiceID is already in Airtable per niche. It's one node away from generating a voiceover for every script automatically.

2. Add a real analytics loop — pull Metricool engagement data weekly, feed the top-performing hooks back into the research prompt as examples. The system gets better the more it runs.

3. Cross-niche repurposing — take the highest-scoring script from any niche, auto-adapt tone and references for 3 other niches. One idea → 4 pieces of content, zero extra research.

4. Operator dashboard — a simple Airtable interface showing Content Queue status across all channels, with filters by niche, status, and date. One operator can see everything in one view.

---

## Project Context

Built as a hiring assignment for Matiks — an AI Workflow Builder role focused on scalable content automation systems. The brief: reverse engineer a viral AI content machine and build a working prototype.

The reverse engineering (Part 1) involved mapping the full 8-stage pipeline of two account types — a faceless motivation page and an AI UGC/avatar brand — including tool stack, bottleneck analysis, and scale architecture.

This repo covers Part 2 — the working prototype.

---

## Built By

**Yash Raj Shukla** — Aspiring AI Product Manager

Interests: AI product thinking, workflow automation, content systems, no-code/low-code tooling

[LinkedIn](https://www.linkedin.com/in/yash-raj-shukla-3112ko) · [Portfolio Notion](https://yashraj-aipm-311.notion.site/Yash-Raj-Shukla-Product-Portfolio-312a1333ad5b80b6b45af4df93227245?source=copy_link) · [GitHub](https://github.com/yashraj311)
