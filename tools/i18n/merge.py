#!/usr/bin/env python3
"""One-shot assembler for i18n/translations.yaml.

Reads the French source catalog (extraction + hand-authored JS strings) and
one JSON file per target language ({key: translation}), and writes the single
YAML catalog with every language inline, in a stable, reviewable layout.

Not needed in day-to-day work (edit translations.yaml directly, then run
`i18n.py build`); kept for bulk (re)imports of translated batches.

Usage:
  python3 tools/i18n/merge.py fr-full.json trans-en.json trans-es.json ...
    (each trans-<lang>.json filename must end in -<lang>.json)
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "i18n" / "translations.yaml"

LANGUAGES = {
    "fr": {"label": "Français", "dir": "ltr"},
    "en": {"label": "English", "dir": "ltr"},
    "es": {"label": "Español", "dir": "ltr"},
    "it": {"label": "Italiano", "dir": "ltr"},
    "pt": {"label": "Português", "dir": "ltr"},
    "de": {"label": "Deutsch", "dir": "ltr"},
    "tr": {"label": "Türkçe", "dir": "ltr"},
    "el": {"label": "Ελληνικά", "dir": "ltr"},
    "ro": {"label": "Română", "dir": "ltr"},
    "zh": {"label": "中文", "dir": "ltr"},
    "ja": {"label": "日本語", "dir": "ltr"},
    "th": {"label": "ไทย", "dir": "ltr"},
    "hi": {"label": "हिन्दी", "dir": "ltr"},
    "ta": {"label": "தமிழ்", "dir": "ltr"},
    "ar": {"label": "العربية", "dir": "rtl"},
    "ar-lb": {"label": "عربي لبناني", "dir": "rtl"},
    "he": {"label": "עברית", "dir": "rtl"},
}

HEADER = """\
version: 1
description: >
  Captain.Food MARKETING-SITE translation catalog — same conventions as
  specs/translations.yaml in TheCaptainCompany/captain-food (errors.yaml-style):
  one dotted KEY per string, optional typed `params` ({placeholder} tokens the
  client interpolates), and a `messages` map that MUST cover every language
  declared under `languages` (the validator, tools/i18n/i18n.py, fails
  otherwise). French is the SOURCE language: for keys annotated in index.html
  the fr message must match the page copy exactly (drift-checked); the other
  languages are the most spoken in France (INSEE) + Arabic and Hebrew (RTL).
  Generated artifacts: i18n/generated/<lang>.json (run `make`-less:
  python3 tools/i18n/i18n.py build) — consumed at runtime by /i18n.js.
  NEVER hand-edit the generated JSON; edit THIS file and rebuild.

languages:
"""


def yq(value):
    """YAML double-quoted scalar via JSON escaping (JSON is a YAML subset)."""
    return json.dumps(value, ensure_ascii=False)


def main():
    sources = [Path(p) for p in sys.argv[1:]]
    if not sources:
        sys.exit(__doc__)
    fr_bundle = json.loads(sources[0].read_text(encoding="utf-8"))
    fr = fr_bundle["fr"]
    params = fr_bundle.get("params", {})

    translations = {"fr": fr}
    for path in sources[1:]:
        match = re.search(r"trans-([a-z]{2}(?:-[a-z]{2})?)\.json$", path.name)
        if not match or match.group(1) not in LANGUAGES:
            sys.exit("cannot infer language from filename: %s" % path)
        translations[match.group(1)] = json.loads(path.read_text(encoding="utf-8"))

    missing_langs = [c for c in LANGUAGES if c not in translations]
    if missing_langs:
        sys.exit("missing translation files for: %s" % ", ".join(missing_langs))

    lines = [HEADER]
    for code, meta in LANGUAGES.items():
        lines.append(
            "  %s: { label: %s, dir: %s }\n" % (code, yq(meta["label"]), meta["dir"])
        )
    lines.append("\nkeys:\n")

    section = None
    for key in sorted(fr):
        prefix = key.split(".")[0]
        if prefix != section:
            section = prefix
            lines.append("\n  # ---- %s ----\n" % section)
        lines.append("  %s:\n" % key)
        if key in params:
            lines.append("    params:\n")
            for name, desc in params[key].items():
                lines.append("      %s: %s\n" % (name, yq(desc)))
        lines.append("    messages:\n")
        for code in LANGUAGES:
            value = translations[code].get(key)
            if not value:
                sys.exit("missing %s translation for key %s" % (code, key))
            lines.append("      %s: %s\n" % (code, yq(value)))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("".join(lines), encoding="utf-8")
    print("wrote %s (%d keys x %d languages)" % (OUT, len(fr), len(LANGUAGES)))


if __name__ == "__main__":
    main()
