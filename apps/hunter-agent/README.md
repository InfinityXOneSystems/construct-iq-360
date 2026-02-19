# Hunter Agent - Autonomous Lead Scraper

## Overview

The **Hunter Agent** is an autonomous web scraping system that discovers and qualifies construction project leads from various online sources.

## Capabilities

- 🔍 **Multi-Source Scraping:** Government bid sites, construction portals, permit databases
- 🤖 **Intelligent Extraction:** AI-powered data parsing and validation
- 🎯 **Lead Qualification:** Automatic scoring based on project size, location, and fit
- 📊 **GitHub Integration:** Creates issues automatically for qualified leads

## Technology Stack

- **Language:** Python 3.11+
- **Web Scraping:** Playwright (headless browser automation)
- **Data Parsing:** BeautifulSoup4, lxml
- **AI Integration:** OpenAI API (for text extraction and analysis)
- **Storage:** GitHub Issues as database

## Target Sources (Planned)

1. **Government Portals**
   - SAM.gov (federal contracts)
   - State/local procurement sites
   
2. **Construction Networks**
   - Dodge Data & Analytics
   - BuildingConnected
   - Procore public projects
   
3. **Permit Databases**
   - Municipal building permits
   - Commercial construction filings

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run the hunter agent
python main.py

# Run with custom config
python main.py --config custom_config.json
```

## Configuration

Create a `config.json` file:

```json
{
  "sources": ["sam_gov", "permits"],
  "filters": {
    "min_value": 50000,
    "project_types": ["commercial", "residential", "infrastructure"],
    "radius_miles": 100,
    "center_location": "Seattle, WA"
  },
  "github": {
    "auto_create_issues": true,
    "label_prefix": "lead"
  }
}
```

## Output

The agent produces:
- JSON files with raw lead data
- Qualified leads posted as GitHub Issues
- Daily summary reports

## Workflow Integration

This agent runs automatically via GitHub Actions (see `.github/workflows/hunter-cron.yml`):
- **Schedule:** Daily at 8:00 AM UTC
- **Trigger:** Can also be manually triggered
- **Failure Handling:** Self-repair workflow activates on errors

---

**Status:** 🚧 Stub - Core logic to be implemented

## Development Roadmap

- [x] Project structure
- [ ] Playwright integration for dynamic sites
- [ ] BeautifulSoup for static parsing
- [ ] AI text extraction module
- [ ] Lead qualification algorithm
- [ ] GitHub API integration
- [ ] Error handling and retry logic
- [ ] Rate limiting and politeness policies
