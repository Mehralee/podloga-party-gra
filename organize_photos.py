#!/usr/bin/env python3
"""Sort flat `category_item.ext` photos into categories/<category>/<item>.ext.

Example: a source folder containing

    food_pierogi.png
    food_bigos.jpg
    dogs_beagle.png

becomes

    categories/food/pierogi.png
    categories/food/bigos.jpg
    categories/dogs/beagle.png

Category folders are created on demand and reused when they already exist
(matched case-insensitively, so `Food_pierogi.png` lands in the existing
`food/` folder instead of making a second one).

Usage:
    python organize_photos.py --source "C:/path/to/downloaded/photos"
    python organize_photos.py --source ./incoming --dry-run
    python organize_photos.py --source ./incoming --move --overwrite
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".bmp"}

# Folders that already exist in this repo under a different spelling than the
# one you would naturally type in a filename. Left side = what you type in the
# photo name, right side = the folder that actually exists.
ALIASES = {
    "landmarks": "landrmarks",
}


def slugify(text: str) -> str:
    """Lowercase, strip spaces/punctuation so names match the existing files."""
    text = text.strip().lower().replace(" ", "").replace("-", "")
    return re.sub(r"[^a-z0-9_]", "", text)


def split_name(stem: str) -> tuple[str, str] | None:
    """`food_pierogi_ruskie` -> ('food', 'pierogi_ruskie'). None if no split."""
    if "_" not in stem:
        return None
    category, _, item = stem.partition("_")
    category, item = slugify(category), slugify(item)
    if not category or not item:
        return None
    return category, item


def resolve_category_dir(dest_root: Path, category: str) -> Path:
    """Reuse an existing folder (any casing / known alias) or name a new one."""
    category = ALIASES.get(category, category)
    if dest_root.is_dir():
        for existing in dest_root.iterdir():
            if existing.is_dir() and existing.name.lower() == category:
                return existing
    return dest_root / category


def organize(source: Path, dest_root: Path, *, move: bool, overwrite: bool, dry_run: bool) -> int:
    if not source.is_dir():
        print(f"error: source folder not found: {source}", file=sys.stderr)
        return 1

    placed = skipped = created = 0
    action, action_past = ("move", "moved") if move else ("copy", "copied")

    for photo in sorted(source.iterdir()):
        if not photo.is_file():
            continue
        if photo.suffix.lower() not in IMAGE_EXTS:
            print(f"skip   {photo.name} (not an image)")
            skipped += 1
            continue

        parts = split_name(photo.stem)
        if parts is None:
            print(f"skip   {photo.name} (expected category_item, e.g. food_pierogi)")
            skipped += 1
            continue

        category, item = parts
        category_dir = resolve_category_dir(dest_root, category)
        target = category_dir / f"{item}{photo.suffix.lower()}"

        if not category_dir.is_dir():
            print(f"mkdir  {category_dir}")
            created += 1
            if not dry_run:
                category_dir.mkdir(parents=True, exist_ok=True)

        if target.exists() and not overwrite:
            print(f"skip   {photo.name} -> {target.relative_to(dest_root)} already exists")
            skipped += 1
            continue

        print(f"{action:<6} {photo.name} -> {target.relative_to(dest_root)}")
        if not dry_run:
            if move:
                shutil.move(str(photo), str(target))
            else:
                shutil.copy2(photo, target)
        placed += 1

    prefix = "[dry run] " if dry_run else ""
    print(f"\n{prefix}{placed} photo(s) {action_past}, {created} folder(s) created, {skipped} skipped.")
    return 0


def main() -> int:
    repo_root = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--source", required=True, type=Path, help="folder holding the category_item.ext photos")
    parser.add_argument("--dest", type=Path, default=repo_root / "categories", help="categories root (default: ./categories)")
    parser.add_argument("--move", action="store_true", help="move instead of copy (source folder is emptied)")
    parser.add_argument("--overwrite", action="store_true", help="replace a photo that is already in the category")
    parser.add_argument("--dry-run", action="store_true", help="print what would happen, change nothing")
    args = parser.parse_args()

    return organize(
        args.source.expanduser(),
        args.dest.expanduser(),
        move=args.move,
        overwrite=args.overwrite,
        dry_run=args.dry_run,
    )


if __name__ == "__main__":
    sys.exit(main())
