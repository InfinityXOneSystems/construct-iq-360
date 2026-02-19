# Architect AI - Intelligent Estimation Engine

## Overview

The **Architect AI** is an autonomous cost estimation and project analysis system. It processes qualified leads and generates detailed project estimates using AI and historical data.

## Capabilities

- 📐 **Automated Takeoffs:** AI vision-based quantity extraction from plans
- 💰 **Cost Estimation:** Machine learning models trained on historical projects
- 📊 **Risk Assessment:** Identify potential challenges and contingencies
- 📝 **Proposal Generation:** Create detailed scope and pricing documents

## Technology Stack

- **Language:** Python 3.11+
- **AI Models:** OpenAI GPT-4, Claude (for document analysis)
- **Computer Vision:** PyTorch, OpenCV (for plan interpretation)
- **Data Science:** Pandas, NumPy, Scikit-learn
- **Integration:** GitHub API for issue/PR automation

## Estimation Process

1. **Input Processing**
   - Parse lead data from GitHub Issues
   - Download plans/specifications if available
   - Extract key project parameters

2. **Analysis**
   - AI-powered document understanding
   - Quantity takeoff from drawings
   - Material and labor cost lookup

3. **Estimation**
   - Calculate direct costs (materials + labor)
   - Apply overhead and profit margins
   - Generate contingency recommendations
   - Produce itemized breakdown

4. **Output**
   - Create detailed estimate document
   - Post as GitHub Issue comment
   - Trigger Orator Agent for proposal

## Data Sources

- **Historical Projects:** Past estimates and actuals
- **Market Rates:** Real-time material and labor costs
- **Industry Benchmarks:** RSMeans, local union rates
- **Custom Database:** Company-specific pricing

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Run estimator on a specific lead
python estimator.py --lead-id 123

# Batch process all new leads
python estimator.py --batch --status new
```

## Workflow Integration

- **Triggered By:** New lead issues with 'needs-estimation' label
- **Outputs To:** Comment on lead issue + create proposal draft
- **Next Step:** Triggers Orator Agent for final proposal generation

## AI Model Architecture

```
Input (Plans + Specs)
    ↓
Document Parser (GPT-4 Vision)
    ↓
Quantity Extractor (Custom CNN)
    ↓
Cost Calculator (ML Regression)
    ↓
Risk Analyzer (Classification)
    ↓
Report Generator (GPT-4)
    ↓
Output (Structured Estimate)
```

## Configuration

Create a `.env` file:

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GITHUB_TOKEN=your_token_here
DATABASE_URL=your_db_connection
```

---

**Status:** 🚧 Stub - AI integration pending

## Development Roadmap

- [x] Project structure
- [ ] Document parser implementation
- [ ] Vision model for plan analysis
- [ ] Cost database integration
- [ ] Estimation algorithm
- [ ] Risk assessment module
- [ ] Report generation
- [ ] GitHub API integration
- [ ] Batch processing system
