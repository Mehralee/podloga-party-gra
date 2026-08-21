"""
PODLOGA PARTY - CHEATSHEET GENERATOR

Creates a separate cheatsheet folder for every category.

Each original image is copied individually and renamed:

    001 - Answer.png
    002 - Answer.png
    003 - Answer.jpg
    ...

The order is the same alphabetical order used by categoriesData.ts.

Project structure expected:

    podloga-party-gra/
    ├── categories/
    │   ├── airline/
    │   ├── cartoon/
    │   ├── chemistry/
    │   └── ...
    ├── src/
    │   └── game/
    │       └── categoriesData.ts
    └── ...

This script is located at:

    src/routes/generate_cheatsheets.py
"""

from pathlib import Path
import shutil
import re
import sys


# ============================================================
# PATHS
# ============================================================

# This file is:
#
# project/
#   src/
#     routes/
#       generate_cheatsheets.py
#
# parents[0] = routes
# parents[1] = src
# parents[2] = project root

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

CATEGORIES_ROOT = PROJECT_ROOT / "categories"
CATEGORY_DATA_FILE = PROJECT_ROOT / "src" / "game" / "categoriesData.ts"
OUTPUT_ROOT = PROJECT_ROOT / "cheatsheets"


# ============================================================
# SUPPORTED IMAGE TYPES
# ============================================================

IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}


# ============================================================
# JAVASCRIPT / TYPESCRIPT HELPERS
# ============================================================

def extract_balanced_object(text: str, start_index: int) -> str:
    """
    Starting at a '{', extract the complete balanced {...} object.

    Handles braces inside quoted strings reasonably safely.
    """

    if start_index >= len(text) or text[start_index] != "{":
        raise ValueError(
            f"Expected '{{' at position {start_index}"
        )

    depth = 0

    in_string = False
    string_char = None
    escaped = False

    for i in range(start_index, len(text)):

        char = text[i]

        if in_string:

            if escaped:
                escaped = False
                continue

            if char == "\\":
                escaped = True
                continue

            if char == string_char:
                in_string = False
                string_char = None

            continue

        if char in ("'", '"', "`"):
            in_string = True
            string_char = char
            continue

        if char == "{":
            depth += 1

        elif char == "}":
            depth -= 1

            if depth == 0:
                return text[start_index:i + 1]

    raise ValueError(
        "Could not find matching closing brace for object."
    )


def find_object(text: str, object_name: str) -> str:
    """
    Find:

        const OBJECT_NAME = {

    and return the complete object.
    """

    pattern = re.compile(
        rf"\b{re.escape(object_name)}\s*:\s*|"
        rf"\b{re.escape(object_name)}\s*=\s*"
    )

    match = pattern.search(text)

    if not match:
        raise ValueError(
            f"Could not find {object_name}"
        )

    brace_index = text.find("{", match.end())

    if brace_index == -1:
        raise ValueError(
            f"Could not find opening '{{' for {object_name}"
        )

    return extract_balanced_object(
        text,
        brace_index,
    )


def unescape_js_string(value: str) -> str:
    """
    Convert basic escaped JS string content into normal text.
    """

    value = value.replace('\\"', '"')
    value = value.replace("\\'", "'")
    value = value.replace("\\\\", "\\")

    return value


def parse_custom_answers(
    data: str,
) -> dict[str, dict[str, str]]:
    """
    Parse the CUSTOM_ANSWERS object from categoriesData.ts.

    Example:

        cartoon: {
            bambi: "Bambi",
            shrek: "Shrek",
        }

    becomes:

        {
            "cartoon": {
                "bambi": "Bambi",
                "shrek": "Shrek",
            }
        }
    """

    custom_object = find_object(
        data,
        "CUSTOM_ANSWERS",
    )

    # Remove the outer { ... }
    inner = custom_object[1:-1]

    result: dict[str, dict[str, str]] = {}

    # Find category objects at the top level.
    #
    # Current categoriesData.ts uses names such as:
    #
    # cartoon: {
    # dogs: {
    # landrmarks: {
    # logos: {
    #

    category_pattern = re.compile(
        r"(?m)^[ \t]*"
        r"([A-Za-z_][A-Za-z0-9_]*)"
        r"\s*:\s*\{"
    )

    category_matches = list(
        category_pattern.finditer(inner)
    )

    for index, category_match in enumerate(category_matches):

        category = category_match.group(1)

        object_start = (
            category_match.end() - 1
        )

        # Only search until the next top-level category.
        if index + 1 < len(category_matches):
            section_end = (
                category_matches[index + 1].start()
            )
        else:
            section_end = len(inner)

        category_section = inner[
            object_start:section_end
        ]

        # Extract the actual category object.
        try:
            category_object = extract_balanced_object(
                category_section,
                0,
            )
        except ValueError:
            continue

        answers: dict[str, str] = {}

        # Supports:
        #
        # bambi: "Bambi"
        # "lhasa apso": "Lhasa Apso"
        # "bank-polskie": "PKO Bank Polski"

        answer_pattern = re.compile(
            r"""
            (?:
                "([^"]+)"
                |
                '([^']+)'
                |
                ([A-Za-z0-9_-]+)
            )
            \s*:\s*
            (?:
                "((?:\\.|[^"])*)"
                |
                '((?:\\.|[^'])*)'
            )
            """,
            re.VERBOSE,
        )

        for match in answer_pattern.finditer(
            category_object
        ):

            key = (
                match.group(1)
                or match.group(2)
                or match.group(3)
            )

            value = (
                match.group(4)
                or match.group(5)
            )

            if key is None or value is None:
                continue

            answers[key] = unescape_js_string(
                value
            )

        result[category] = answers

    return result


# ============================================================
# ANSWER GENERATION
# ============================================================

def get_stem(filename: str) -> str:
    """
    Remove extension.

    example:

        robert_lewandowski_1.jpg
        -> robert_lewandowski_1
    """

    return Path(filename).stem


def clean_stem(stem: str) -> str:
    """
    Reproduce:

        return stem.replace(/_\d+$/, "");

    from categoriesData.ts
    """

    return re.sub(
        r"_\d+$",
        "",
        stem,
    )


def capitalize(value: str) -> str:

    if not value:
        return value

    return value[0].upper() + value[1:]


def automatic_answer(
    category: str,
    filename: str,
    custom_answers: dict[str, dict[str, str]],
) -> str:
    """
    Reproduce the automaticAnswer() function
    from categoriesData.ts.
    """

    original_stem = get_stem(filename)

    stem = clean_stem(
        original_stem
    )

    # --------------------------------------------------------
    # CUSTOM ANSWERS
    # --------------------------------------------------------

    category_answers = custom_answers.get(
        category,
        {},
    )

    custom_answer = category_answers.get(
        stem
    )

    if custom_answer:
        return custom_answer

    # --------------------------------------------------------
    # MATH
    # --------------------------------------------------------

    if category == "math":

        return re.sub(
            r"^math_",
            "",
            stem,
        )

    # --------------------------------------------------------
    # MIRRORED WORDS
    # --------------------------------------------------------

    if category == "mirroredwords":

        word = re.sub(
            r"^mirroredwords_",
            "",
            stem,
        )

        if not word:
            return stem

        return (
            word[0].upper()
            + word[1:]
        )

    # --------------------------------------------------------
    # LICENSE PLATES
    # --------------------------------------------------------

    if category == "license":

        value = re.sub(
            r"^plate_",
            "",
            stem,
        )

        return " ".join(
            capitalize(part)
            for part in value.split("_")
        )

    # --------------------------------------------------------
    # GENERAL CASE
    # --------------------------------------------------------

    return " ".join(
        capitalize(part)
        for part in stem.split("_")
    )


# ============================================================
# FILENAME SANITIZATION
# ============================================================

def sanitize_filename(value: str) -> str:
    """
    Make an answer safe to use as a Windows filename.

    Windows does not allow:

        < > : " / \ | ? *

    Also removes trailing dots/spaces.
    """

    value = re.sub(
        r'[<>:"/\\|?*]',
        "",
        value,
    )

    value = value.strip()

    value = value.rstrip(
        ". "
    )

    if not value:
        value = "Answer"

    return value


# ============================================================
# IMAGE DISCOVERY
# ============================================================

def discover_categories() -> dict[str, list[Path]]:
    """
    Discover EVERY category folder under:

        categories/

    and EVERY supported image inside it.

    This does NOT use CATEGORY_CONFIG.

    Therefore newly added categories are automatically included.
    """

    if not CATEGORIES_ROOT.exists():

        raise FileNotFoundError(
            f"\nCould not find categories folder:\n"
            f"{CATEGORIES_ROOT}\n\n"
            f"Make sure your project actually has:\n"
            f"{PROJECT_ROOT / 'categories'}"
        )

    if not CATEGORIES_ROOT.is_dir():

        raise NotADirectoryError(
            f"Categories path is not a directory:\n"
            f"{CATEGORIES_ROOT}"
        )

    categories: dict[str, list[Path]] = {}

    # Every direct child directory = category.
    for category_dir in CATEGORIES_ROOT.iterdir():

        if not category_dir.is_dir():
            continue

        category = category_dir.name

        images = [
            path
            for path in category_dir.iterdir()
            if path.is_file()
            and path.suffix.lower()
            in IMAGE_EXTENSIONS
        ]

        if images:
            categories[category] = images

    return categories


# ============================================================
# JS-LIKE FILE ORDER
# ============================================================

def sort_images(images: list[Path]) -> list[Path]:
    """
    categoriesData.ts uses:

        [...files].sort(
            (a, b) => a.localeCompare(b)
        );

    This gives us a stable filename-based ordering.

    We sort by filename case-insensitively first and then
    by the original filename to keep the ordering deterministic.
    """

    return sorted(
        images,
        key=lambda path: (
            path.name.casefold(),
            path.name,
        ),
    )


# ============================================================
# COPY IMAGES
# ============================================================

def copy_category(
    category: str,
    images: list[Path],
    custom_answers: dict[str, dict[str, str]],
) -> tuple[int, int]:

    output_category = (
        OUTPUT_ROOT / category
    )

    output_category.mkdir(
        parents=True,
        exist_ok=True,
    )

    sorted_images = sort_images(
        images
    )

    copied = 0
    failed = 0

    print()
    print(
        f"  {category.upper()}"
    )
    print(
        f"  {'-' * 60}"
    )

    for index, source in enumerate(
        sorted_images,
        start=1,
    ):

        try:

            answer = automatic_answer(
                category,
                source.name,
                custom_answers,
            )

            safe_answer = sanitize_filename(
                answer
            )

            extension = (
                source.suffix
            )

            destination = (
                output_category
                / f"{index:03d} - {safe_answer}{extension}"
            )

            # If somehow two images have exactly the same
            # answer and same index is impossible, but this
            # makes the script completely safe.
            counter = 2

            while destination.exists():

                destination = (
                    output_category
                    / (
                        f"{index:03d} - "
                        f"{safe_answer} "
                        f"({counter})"
                        f"{extension}"
                    )
                )

                counter += 1

            shutil.copy2(
                source,
                destination,
            )

            copied += 1

            print(
                f"    {index:03d}. "
                f"{source.name} "
                f"-> {destination.name}"
            )

        except Exception as exc:

            failed += 1

            print(
                f"    ERROR: {source.name}"
            )

            print(
                f"           {exc}"
            )

    return copied, failed


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    print()
    print("=" * 70)
    print(
        "PODLOGA PARTY - CHEATSHEET GENERATOR"
    )
    print("=" * 70)

    print()
    print(
        f"Project root:\n"
        f"  {PROJECT_ROOT}"
    )

    print()
    print(
        f"Categories:\n"
        f"  {CATEGORIES_ROOT}"
    )

    print()
    print(
        f"Category data:\n"
        f"  {CATEGORY_DATA_FILE}"
    )

    print()
    print(
        f"Output:\n"
        f"  {OUTPUT_ROOT}"
    )

    # --------------------------------------------------------
    # CHECK CATEGORIES
    # --------------------------------------------------------

    if not CATEGORIES_ROOT.exists():

        print()
        print(
            "ERROR: categories folder does not exist."
        )

        print(
            f"\nExpected:\n{CATEGORIES_ROOT}"
        )

        sys.exit(1)

    # --------------------------------------------------------
    # READ CATEGORIES DATA
    # --------------------------------------------------------

    if not CATEGORY_DATA_FILE.exists():

        print()
        print(
            "ERROR: categoriesData.ts does not exist."
        )

        print(
            f"\nExpected:\n{CATEGORY_DATA_FILE}"
        )

        sys.exit(1)

    print()
    print(
        "Reading categoriesData.ts..."
    )

    try:

        data = CATEGORY_DATA_FILE.read_text(
            encoding="utf-8"
        )

        custom_answers = parse_custom_answers(
            data
        )

    except Exception as exc:

        print()
        print(
            "ERROR while reading custom answers:"
        )

        print(
            f"  {exc}"
        )

        sys.exit(1)

    print(
        f"  Custom-answer categories found: "
        f"{len(custom_answers)}"
    )

    for category, answers in custom_answers.items():

        print(
            f"    {category}: "
            f"{len(answers)} custom answers"
        )

    # --------------------------------------------------------
    # DISCOVER ALL CATEGORIES
    # --------------------------------------------------------

    print()
    print(
        "Discovering images..."
    )

    try:

        categories = discover_categories()

    except Exception as exc:

        print()
        print(
            "ERROR while discovering categories:"
        )

        print(
            f"  {exc}"
        )

        sys.exit(1)

    if not categories:

        print()
        print(
            "ERROR: No image categories were found."
        )

        print(
            f"\nChecked:\n{CATEGORIES_ROOT}"
        )

        sys.exit(1)

    total_source_images = sum(
        len(images)
        for images in categories.values()
    )

    print()
    print(
        f"FOUND {len(categories)} CATEGORIES"
    )

    print(
        f"FOUND {total_source_images} IMAGES"
    )

    print()

    for category, images in sorted(
        categories.items(),
        key=lambda item: item[0].casefold(),
    ):

        print(
            f"  {category}: "
            f"{len(images)} images"
        )

    # --------------------------------------------------------
    # REMOVE OLD CHEATSHEETS
    # --------------------------------------------------------

    print()
    print(
        "Removing old cheatsheets..."
    )

    if OUTPUT_ROOT.exists():

        try:

            shutil.rmtree(
                OUTPUT_ROOT
            )

        except PermissionError:

            print()
            print(
                "ERROR: Windows says the cheatsheets "
                "folder is currently in use."
            )

            print()
            print(
                "Close anything that may have files "
                "open from the cheatsheets folder:"
            )

            print(
                "  - File Explorer"
            )

            print(
                "  - VS Code preview"
            )

            print(
                "  - image viewer"
            )

            print(
                "  - another Python script"
            )

            print()
            print(
                f"Then manually delete:\n"
                f"{OUTPUT_ROOT}"
            )

            sys.exit(1)

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    # --------------------------------------------------------
    # GENERATE
    # --------------------------------------------------------

    print()
    print(
        "Generating cheatsheets..."
    )

    total_copied = 0
    total_failed = 0

    for category, images in sorted(
        categories.items(),
        key=lambda item: item[0].casefold(),
    ):

        copied, failed = copy_category(
            category,
            images,
            custom_answers,
        )

        total_copied += copied
        total_failed += failed

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print(
        "GENERATION COMPLETE"
    )
    print("=" * 70)

    print()
    print(
        f"Categories found:    {len(categories)}"
    )

    print(
        f"Source images:       {total_source_images}"
    )

    print(
        f"Images copied:       {total_copied}"
    )

    print(
        f"Failed:              {total_failed}"
    )

    print()
    print(
        f"Cheatsheets saved to:"
    )

    print(
        f"  {OUTPUT_ROOT}"
    )

    print()

    if total_copied != total_source_images:

        print(
            "WARNING:"
        )

        print(
            "Not every source image was copied."
        )

        print(
            "Check the ERROR lines above."
        )

    else:

        print(
            "SUCCESS: Every discovered image "
            "was copied individually."
        )

    print()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()