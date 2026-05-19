# Un-Reel Engine v0.3

> AI-powered content automation system for faceless Instagram Reels.
> One operator. Any niche. Any tone. Full script package in under 10 seconds.

![Status](https://img.shields.io/badge/status-inactive-brightgreen)
![Stack](https://img.shields.io/badge/stack-n8n%20%7C%20Groq%20%7C%20Airtable%20%7C%20Lovable-purple)

## What It Does

Un-Reel Engine automates the full pre-production pipeline for short-form video content:

1. **Viral Angle Research** — returns 4 scored ideas with hook strength, emotional engagement, relevancy, virality potential
2. **Script Generation** — full content package: hook, voiceover script, caption, CTA, hashtags
3. **Multi-slot Scheduling UI** — plan multiple posts per day with niche/tone per slot
4. **Airtable Storage** — every generated script saved to Content Queue with status tracking

## Architecture
*Phase 2

## Stack

| Layer | Tool |
|-------|------|
| Workflow | n8n |
| AI Generation | Groq (llama-3.3-70b-versatile) |
| Database | Airtable |
| Frontend | Lovable |
| Voiceover | ElevenLabs (Phase 2) |
| Scheduling | Metricool (Phase 2) |
| Video | Kling AI (Phase 2) |

## Airtable Schema

**Content Queue**
- Niche, NicheLabel, Tone, Topic, Duration
- Hook, Script, Caption, CTA, Hashtags
- WordCount, EstDuration, GeneratedAt, Status

**Channel Config**
- Niche, VoiceID, SystemPrompt, PostingAccount, PostTime

## API Endpoints

**Research Stage**
```json
POST /webhook/reel-engine
{
  "niche": "health",
  "tone": "Controversial",
  "topic": "gym myths",
  "duration": 45,
  "stage": "research"
}
```

**Generate Stage**
```json
POST /webhook/reel-engine
{
  "niche": "health",
  "tone": "Controversial",
  "topic": "gym myths",
  "duration": 45,
  "stage": "generate"
}
```

## Phase 2 Roadmap

- [ ] ElevenLabs voiceover generation per slot
- [ ] Kling AI video assembly triggered post-voiceover
- [ ] Metricool auto-scheduling via API
- [ ] Analytics feedback loop — engagement data retrains tone/angle weights per niche
- [ ] Cross-niche content repurposing

## Built By

Yash Raj Shukla — Aspiring AI Product Manager  
[LinkedIn](https://linkedin.com/in/yashrajshukla) · [Portfolio](https://notion.so)
