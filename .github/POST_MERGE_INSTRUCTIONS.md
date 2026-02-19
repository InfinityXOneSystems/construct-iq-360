# 📋 Post-Merge Instructions

## Immediate Actions Required

### 1. Enable GitHub Pages (REQUIRED)
**Without this, the Command Center dashboard will not be accessible.**

**Steps:**
1. Navigate to repository Settings
2. Click "Pages" in left sidebar
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. Click "Save"

**Expected Result:**
- Deployment workflow triggers automatically
- Dashboard available at: https://infinity-x-one-systems.github.io/construct-iq-360/
- Deployment completes in 2-3 minutes

---

### 2. Close Conflicting Draft PRs
**PRs to close:** #3, #5, #6, #7

**Reason:** All have merge conflicts ("dirty" mergeable_state) and cannot auto-merge.

**Suggested Comment:**
```
This PR is being closed as part of the PR consolidation strategy.

All necessary changes have been consolidated into PR #10 which has been merged with a clean state.

See documentation:
- Strategy: .github/scripts/PR_CONSOLIDATION.md
- Completion: .github/E2E_COMPLETION_SUMMARY.md

Thank you for your contribution!
```

---

### 3. Verify System Operation

**Command Center Dashboard:**
- Visit: https://infinity-x-one-systems.github.io/construct-iq-360/
- Verify all sections load correctly
- Check system status shows "ONLINE"
- Verify all 8 workflows show "ACTIVE"

**Workflows:**
- Check GitHub Actions tab
- Verify E2E test runs (scheduled daily @ 09:00 UTC)
- Confirm Genesis Loop scheduled (every 6 hours)
- Monitor first auto-merge attempt on next PR

**Agents:**
- Hunter agent logs in Actions (runs daily @ 08:00 UTC)
- Check data/leads.json updates after Hunter runs

---

## Verification Checklist

- [ ] GitHub Pages enabled and deployed
- [ ] Dashboard accessible at URL
- [ ] PRs #3, #5, #6, #7 closed with comment
- [ ] E2E test workflow scheduled
- [ ] Genesis Loop workflow scheduled
- [ ] Auto-merge workflow active
- [ ] Heartbeat running every 5 minutes
- [ ] No workflow failures in Actions

---

## Expected Timeline

| Action | Timeline | Status Check |
|--------|----------|--------------|
| Enable Pages | Immediate | Visit dashboard URL |
| First deployment | 2-3 minutes | Check Actions tab |
| E2E test | Next day 09:00 UTC | Check Actions history |
| Genesis Loop | Next 6-hour mark | Check Actions history |
| Hunter Cron | Next day 08:00 UTC | Check data/leads.json |

---

## Troubleshooting

### Dashboard 404 Error
- **Cause:** GitHub Pages not enabled
- **Fix:** Follow step 1 above

### Workflow Not Running
- **Cause:** Workflow disabled or schedule not triggered
- **Fix:** Manually trigger via Actions → Workflow → "Run workflow"

### PR Close Access Denied
- **Cause:** Insufficient permissions
- **Fix:** Request owner/admin to close PRs

---

## Success Indicators

✅ Dashboard loads and displays:
- System status: ONLINE
- 5 agents listed
- 8 workflows tracked
- Auto-refresh working

✅ Workflows execute on schedule:
- E2E test (daily)
- Genesis Loop (every 6h)
- Hunter Cron (daily)
- Heartbeat (every 5m)

✅ Auto-merge operational:
- Next autonomous PR auto-merges
- No manual approval needed
- Squash merge applied

---

## Contact

For issues or questions:
- Review: `.github/E2E_COMPLETION_SUMMARY.md`
- Check: `.github/scripts/PR_CONSOLIDATION.md`
- Run: `.github/scripts/validate-system.py`

---

**System is ready for autonomous 24/7 operation once these steps are complete.**
