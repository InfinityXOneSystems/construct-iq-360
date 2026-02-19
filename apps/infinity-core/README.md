# Infinity Core

Central coordination service for Construct-IQ-360.  
Monitors agent health, aggregates system status, and provides a single
source of truth for all container-based components.

---

## Quick Start

```bash
cd apps/infinity-core
docker compose up -d
docker logs infinity-core --tail 20
```

---

## Recovery: Corrupted Container / Volume

If the container fails to start with a Python encoding error such as:

```
SyntaxError: Non-UTF-8 code starting with '\xff' in file /app/main.py on line 1
```

The volume or host-mounted file is corrupted.  Follow these steps to perform
a **full clean rebuild** from the repository source:

### Step 1 — Remove the broken container and its volume

```bash
# Stop and force-remove the container
docker rm -f infinity-core

# Remove the named volume so the stale file is gone
docker volume rm infinity-core_infinity-core-data
```

### Step 2 — Rebuild the image from source

```bash
cd apps/infinity-core

# Force a fresh image build (no cache)
docker compose build --no-cache
```

### Step 3 — Start the fresh container

```bash
docker compose up -d
```

### Step 4 — Confirm recovery

```bash
docker logs infinity-core --tail 10
```

You should see output similar to:

```
2026-01-01T00:00:00Z [INFO] infinity-core: ============================================================
2026-01-01T00:00:00Z [INFO] infinity-core: INFINITY CORE v1.0.0
2026-01-01T00:00:00Z [INFO] infinity-core: ============================================================
2026-01-01T00:00:00Z [INFO] infinity-core: Initialization complete.
2026-01-01T00:00:00Z [INFO] infinity-core: Entering health-monitoring loop (interval=30s).
```

---

## Configuration

| Variable       | Default | Description                          |
|----------------|---------|--------------------------------------|
| `LOG_LEVEL`    | `INFO`  | Logging verbosity                    |
| `POLL_INTERVAL`| `30`    | Health-check interval (seconds)      |
| `GITHUB_TOKEN` | —       | GitHub API token (optional)          |

---

## File Encoding Requirements

All source files in this directory **must** be:

- Encoding: **UTF-8** (no BOM)
- Line endings: **LF** (Unix-style, `\n`)

On Windows, configure your editor to save with LF endings and no BOM before
copying files into the container. Using Git, set:

```bash
git config core.autocrlf false
git config core.eol lf
```

And add a `.gitattributes` entry:

```
apps/infinity-core/*.py text eol=lf
```
