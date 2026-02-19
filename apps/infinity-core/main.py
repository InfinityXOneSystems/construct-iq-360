#!/usr/bin/env python3
"""
Infinity Core - Central Coordinator for Construct-IQ-360
=========================================================

This is the entry point for the Infinity Core service.
It acts as the central coordination layer for the Construct-IQ-360 system,
managing health monitoring, inter-agent communication, and system status.

Architecture:
    1. System Initialization: Verify environment and dependencies
    2. Health Monitoring: Poll agent status and report metrics
    3. Event Processing: Route events between system components
    4. Status Reporting: Publish system state to shared data store
    5. Graceful Shutdown: Handle termination signals cleanly

Environment Variables:
    GITHUB_TOKEN      - GitHub API token for repository access
    LOG_LEVEL         - Logging verbosity (DEBUG, INFO, WARNING, ERROR)
    POLL_INTERVAL     - Health-check interval in seconds (default: 30)
"""

import os
import sys
import json
import time
import logging
import signal
from datetime import datetime, timezone
from pathlib import Path


# ---------------------------------------------------------------------------
# Logging configuration
# ---------------------------------------------------------------------------

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.Formatter.converter = time.gmtime  # Force UTC for all log timestamps
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
    stream=sys.stdout,
)
logger = logging.getLogger("infinity-core")


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

VERSION = "1.0.0"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "30"))
DATA_DIR = Path(__file__).parent / "data"
STATUS_FILE = DATA_DIR / "status.json"

_SHUTDOWN = False


# ---------------------------------------------------------------------------
# Signal handling
# ---------------------------------------------------------------------------

def _handle_shutdown(signum, frame):
    """Handle SIGTERM / SIGINT for graceful shutdown."""
    global _SHUTDOWN
    logger.info("Shutdown signal received (signal %d). Stopping...", signum)
    _SHUTDOWN = True


signal.signal(signal.SIGTERM, _handle_shutdown)
signal.signal(signal.SIGINT, _handle_shutdown)


# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

def initialize() -> None:
    """Initialize the Infinity Core service and verify environment."""
    logger.info("=" * 60)
    logger.info("INFINITY CORE v%s", VERSION)
    logger.info("=" * 60)
    logger.info("Timestamp : %s", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"))
    logger.info("Python    : %s", sys.version.split()[0])
    logger.info("Working   : %s", os.getcwd())
    logger.info("Poll interval: %ds", POLL_INTERVAL)

    # Ensure data directory exists
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    logger.info("Data directory ready: %s", DATA_DIR)

    # Verify optional environment variables
    github_token = os.getenv("GITHUB_TOKEN")
    if github_token:
        logger.info("GitHub token: present")
    else:
        logger.warning("GitHub token: not set (some features may be unavailable)")

    logger.info("Initialization complete.")


def collect_status() -> dict:
    """Collect current system status snapshot."""
    return {
        "version": VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_check": "ok",
        "agents": {
            "hunter": _check_agent("hunter-agent"),
            "architect": _check_agent("architect-ai"),
        },
    }


def _check_agent(name: str) -> dict:
    """
    Lightweight agent reachability check.

    Reads the most recent output artifact from the agent's output directory
    when available; otherwise reports 'unknown'.
    """
    agent_dir = Path(__file__).parent.parent / name / "output"
    if not agent_dir.exists():
        return {"status": "unknown", "reason": "output directory not found"}

    logs = sorted(agent_dir.glob("*.json"), reverse=True)
    if not logs:
        return {"status": "unknown", "reason": "no output files found"}

    try:
        with open(logs[0], "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return {"status": "ok", "last_run": str(logs[0].name), "data": data}
    except (OSError, json.JSONDecodeError) as exc:
        return {"status": "error", "reason": str(exc)}


def write_status(status: dict) -> None:
    """Persist status snapshot to disk."""
    try:
        with open(STATUS_FILE, "w", encoding="utf-8") as fh:
            json.dump(status, fh, indent=2)
        logger.debug("Status written to %s", STATUS_FILE)
    except OSError as exc:
        logger.error("Failed to write status file: %s", exc)


def run_loop() -> None:
    """Main health-monitoring loop."""
    logger.info("Entering health-monitoring loop (interval=%ds).", POLL_INTERVAL)
    iteration = 0

    while not _SHUTDOWN:
        iteration += 1
        logger.info("--- Health check #%d ---", iteration)

        status = collect_status()
        write_status(status)

        for agent, info in status["agents"].items():
            logger.info("  Agent %-12s : %s", agent, info.get("status", "unknown"))

        if _SHUTDOWN:
            break

        # Sleep in small increments so we respond to shutdown quickly
        elapsed = 0
        while elapsed < POLL_INTERVAL and not _SHUTDOWN:
            time.sleep(1)
            elapsed += 1

    logger.info("Health-monitoring loop exited cleanly.")


def main() -> None:
    """Entry point."""
    initialize()

    try:
        run_loop()
    except Exception as exc:
        logger.exception("Unhandled exception in main loop: %s", exc)
        sys.exit(1)

    logger.info("Infinity Core shutdown complete.")


if __name__ == "__main__":
    main()
