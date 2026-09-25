# [PRODUCT NAME]

**The Spotify for local events.** [PRODUCT NAME] knows what you and your friends will love, and tells hosts what Toronto wants next.

A two-sided Toronto event app for **attendees** and **hosts**, with three parts:

- **Solo discovery:** Weekly Mix, Scene Mixes and Near You Radar, a personal mix of Toronto events.
- **Crew Blend:** finds the event a whole friend group will love.
- **Demand Signals:** attendees tap "I'd go if…", and hosts see what people want before they book.

> **North star:** Connect every Torontonian, solo or with their crew, to events they'll love, and help hosts create the events Toronto wants.
> *Metric: weekly matched attendances.* See [`strategy/Northstar.md`](./strategy/Northstar.md).

---

## Team

| Name | Role | Logbook |
| --- | --- | --- |
| Asia  | Role | [logbook-asia.md](./logbooks/logbook-asia.md) |
| Kim | Role | [logbook-kim.md](./logbooks/logbook-kim.md) |
| Mary| Role | [logbook-mary.md](./logbooks/logbook-mary.md) |
| Mimi | Role | [logbook-mimi.md](./logbooks/logbook-mimi.md) |
| Nermin | Role | [logbook-nermin.md](./logbooks/logbook-nermin.md) |
| Taylor | Role | [logbook-taylor.md](./logbooks/logbook-taylor.md) |

---

## Meetings

All times are Toronto time (ET).

| Day | Time | Focus |
| --- | --- | --- |
| Saturday | 6:00 – 8:00 PM | Working session |
| Sunday | 8:00 – 10:00 PM | Review and planning for the week |

**Meeting link:** [Add Zoom / Google Meet / Teams link](#)

**Before each meeting:** add agenda items to the next notes file in [`/meeting-notes`](./meeting-notes).

---

## Meeting notes

| Date | Meeting | Notes |
| --- | --- | --- |
| YYYY-MM-DD | Saturday session | [Notes](./meeting-notes/YYYY-MM-DD-saturday.md) |
| YYYY-MM-DD | Sunday session | [Notes](./meeting-notes/YYYY-MM-DD-sunday.md) |

Name new notes files `YYYY-MM-DD-day.md` and add a row here, newest first. Individual progress goes in each person's [logbook](./logbooks).

<details>
<summary>Meeting notes template</summary>

```markdown
# Meeting — YYYY-MM-DD (Saturday/Sunday)

**Attendees:**
**Facilitator / note-taker:**

## Agenda
1.

## Decisions
-

## Action items
- [ ] Task — @owner — due YYYY-MM-DD

## Next meeting
-
```

</details>

---

## Repository structure

```
├── README.md
├── handouts/                     # User research materials
│   ├── ACTUALQUESTIONS.MD        # Final interview questions
│   ├── demo-transcript.md        # Sample interview transcript
│   ├── interview-protocol.md     # How to run an interview
│   └── synthesis-worksheet.md    # Template for synthesizing findings
├── logbooks/                     # One logbook per team member
│   ├── logbook-asia.md
│   ├── logbook-kim.md
│   ├── logbook-mary.md           # (create this file)
│   ├── logbook-mimi.md
│   ├── logbook-nermin.md
│   └── logbook-taylor.md
├── meeting-notes/                # One file per meeting (create this folder)
├── sketch-0/                     # First prototype
│   ├── public/                   # Front-end files
│   ├── .env.example              # Environment variables template
│   ├── README.md                 # How to run the prototype
│   ├── events.json               # Sample event data
│   ├── server.js                 # Server
│   └── strategy.md               # Strategy notes for this sketch
└── strategy/
    ├── CLAUDE.md                 # Project context for Claude
    └── Northstar.md              # North star statement and metrics
```

## Quick links

| Area | Start here |
| --- | --- |
| Research | [Interview protocol](./handouts/interview-protocol.md) · [Questions](./handouts/ACTUALQUESTIONS.MD) · [Synthesis worksheet](./handouts/synthesis-worksheet.md) |
| Prototype | [sketch-0 README](./sketch-0/README.md) |
| Strategy | [North star](./strategy/Northstar.md) · [Sketch-0 strategy](./sketch-0/strategy.md) |
| External | [Product proposal](https://claude.ai/code/artifact/7954b6f0-30c3-4b01-9982-40ea00251521) · [Figma deck](https://www.figma.com/slides/SIkLI2fz0Kzf9BA0c2h2zr) |
| Competitors | [Motivez](https://motivez.app/) · [Fever](https://feverup.com/en/toronto) · [DICE](https://dice.fm) · [Eventbrite](https://www.eventbrite.ca/d/canada--toronto/events/) |
