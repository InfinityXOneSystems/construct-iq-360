# Command Center - Construct-OS Dashboard

## Overview

The **Command Center** is the central intelligence dashboard for Construct-OS. It provides real-time visibility into:

- 🎯 Active leads and their qualification status
- 🏗️ Project pipeline and estimation progress
- 📊 System health metrics and autonomous agent activity
- 📈 Revenue forecasting and conversion analytics

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **UI:** TailwindCSS + shadcn/ui
- **Data:** GitHub API + Issues as Database
- **Deployment:** Vercel (auto-deploy from main)

## Features (Roadmap)

- [ ] Live dashboard with system status
- [ ] Lead qualification viewer
- [ ] AI estimation review interface
- [ ] Proposal generation monitoring
- [ ] Agent activity logs
- [ ] Health metrics visualization

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Architecture Integration

The Command Center acts as the "visual cortex" of Construct-OS, pulling data from:
- GitHub Issues (leads, bugs, proposals)
- GitHub Actions (workflow status, logs)
- Active Memory (system state)

All data flows are read-only to maintain autonomous operation integrity.

## Environment Variables

Create a `.env.local` file:

```env
GITHUB_TOKEN=your_token_here
GITHUB_OWNER=InfinityXOneSystems
GITHUB_REPO=construct-iq-360
```

---

**Status:** 🚧 Stub - Awaiting full implementation
