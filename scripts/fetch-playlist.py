#!/usr/bin/env python3
"""Fetch YouTube playlist metadata and save as monthly archive.

Usage:
  python3 scripts/fetch-playlist.py              # current month (e.g. 2026-02)
  python3 scripts/fetch-playlist.py 2026-01      # specific month
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("[ERROR] yt-dlp is not installed. Run: pip3 install yt-dlp", file=sys.stderr)
    sys.exit(1)

# --- Configuration ---
PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLU0rNA-At9MKseLxkleWNHra-1oa65CLd"

DATA_DIR = Path(__file__).resolve().parent.parent / "public" / "data"
INDEX_FILE = DATA_DIR / "index.json"


def load_index():
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return {"months": []}


def save_index(index):
    INDEX_FILE.write_text(json.dumps(index, ensure_ascii=False, indent=2))


def main():
    # Determine target month
    if len(sys.argv) > 1:
        month = sys.argv[1]
    else:
        month = datetime.now().strftime("%Y-%m")

    print(f"Fetching playlist for {month}: {PLAYLIST_URL}")

    ydl_opts = {
        "quiet": True,
        "extract_flat": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(PLAYLIST_URL, download=False)

    if not info:
        print("[ERROR] Failed to extract playlist info", file=sys.stderr)
        sys.exit(1)

    # Generate title like "2026年2月のピックアップ"
    y, m = month.split("-")
    month_title = f"{int(y)}年{int(m)}月のピックアップ"

    playlist = {
        "month": month,
        "title": month_title,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "videos": [],
    }

    for entry in info.get("entries", []):
        if entry is None:
            continue
        playlist["videos"].append({
            "id": entry.get("id", ""),
            "title": entry.get("title", ""),
            "channel": entry.get("channel", "") or entry.get("uploader", ""),
            "duration": entry.get("duration", 0),
        })

    # Save monthly file
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    month_file = DATA_DIR / f"{month}.json"
    month_file.write_text(json.dumps(playlist, ensure_ascii=False, indent=2))
    print(f"Wrote {len(playlist['videos'])} videos to {month_file}")

    # Update index
    index = load_index()
    if month not in index["months"]:
        index["months"].append(month)
    index["months"].sort(reverse=True)
    index["latest"] = index["months"][0]
    save_index(index)
    print(f"Updated index: {index['months']}")


if __name__ == "__main__":
    main()
