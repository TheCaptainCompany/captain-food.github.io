#!/usr/bin/env python3
"""Captain.Food marketing-site i18n tool — validate & build.

The single source of truth for translations is i18n/translations.yaml
(same conventions as specs/translations.yaml in TheCaptainCompany/captain-food:
one dotted KEY per string, optional typed `params`, and a `messages` map that
MUST cover every declared language). French is additionally anchored to the
markup: for every key annotated on index.html, the YAML `fr` message must match
the French text in the HTML exactly (normalized whitespace) — so the page and
the catalog can never drift apart.

Commands
  check     validate everything (completeness, placeholders, key parity, fr
            drift, generated-JSON drift). Exit 1 on any error.
  build     (re)generate i18n/generated/<lang>.json from the YAML.
  extract   dump the fr strings found in index.html as JSON (catalog seeding).

Requires: python3 + PyYAML (pip install pyyaml).
"""

import json
import re
import sys
from html import escape
from html.parser import HTMLParser
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("PyYAML is required: pip install pyyaml")

ROOT = Path(__file__).resolve().parent.parent.parent
CATALOG = ROOT / "i18n" / "translations.yaml"
GENERATED_DIR = ROOT / "i18n" / "generated"

# Files scanned for used keys. The HTML pages are also the French source of
# truth: their annotated copy IS the fr catalog (drift-checked).
HTML_SOURCES = [
    ROOT / name
    for name in (
        "index.html",
        "tarifs.html",
        "manifeste.html",
        "financement.html",
        "livraison.html",
        "alternative-uber-eats-tours.html",
        "alternative-deliveroo-tours.html",
        "restaurant-sans-commission-tours.html",
        "commande-en-ligne-restaurant-tours.html",
        "click-and-collect-tours.html",
        "livraison-ethique-tours.html",
        "restaurants-tours-indre-et-loire.html",
        "confidentialite.html",
        "mentions-legales.html",
        "404.html",
    )
]
JS_SOURCES = [ROOT / "partials.js", ROOT / "i18n.js", ROOT / "script.js"]

I18N_ATTRS = (
    "data-i18n",
    "data-i18n-html",
    "data-i18n-aria-label",
    "data-i18n-alt",
    "data-i18n-content",
    "data-i18n-placeholder",
)
VOID_TAGS = {"br", "img", "input", "meta", "link", "hr", "area", "base",
             "col", "embed", "source", "track", "wbr"}
PARAM_RE = re.compile(r"\{([a-zA-Z][a-zA-Z0-9_]*)\}")
KEY_ATTR_RE = re.compile(
    r"data-i18n(?:-html|-aria-label|-alt|-content|-placeholder)?=(?:\\?[\"'])"
    r"([a-z0-9_.]+)(?:\\?[\"'])"
)
# t("some.key") / cfT("some.key") calls in JS (i18n.js runtime + script.js),
# plus the { key: "hero.quote.N", … } lookup tables in script.js.
T_CALL_RE = re.compile(r"\b(?:cfT|t)\(\s*[\"']([a-z0-9_.]+)[\"']")
KEY_PROP_RE = re.compile(r"\bkey:\s*[\"']([a-z0-9_.]+)[\"']")


def norm(text):
    """Collapse whitespace runs to single spaces (HTML rendering semantics)."""
    return re.sub(r"\s+", " ", text).strip()


class Node:
    __slots__ = ("tag", "attrs", "raw_start", "children")

    def __init__(self, tag, attrs, raw_start):
        self.tag = tag
        self.attrs = dict(attrs)
        self.raw_start = raw_start
        self.children = []  # str (unescaped text) or Node


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("#root", [], "")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.get_starttag_text())
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(tag, attrs, self.get_starttag_text()))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def text_content(node):
    parts = []
    for child in node.children:
        parts.append(child if isinstance(child, str) else text_content(child))
    return "".join(parts)


def inner_html(node):
    parts = []
    for child in node.children:
        if isinstance(child, str):
            parts.append(escape(child, quote=False))
        else:
            parts.append(child.raw_start)
            if child.tag not in VOID_TAGS:
                parts.append(inner_html(child))
                parts.append("</%s>" % child.tag)
    return "".join(parts)


def has_element_children(node):
    return any(not isinstance(c, str) for c in node.children)


def walk(node):
    yield node
    for child in node.children:
        if not isinstance(child, str):
            yield from walk(child)


def extract_fr(errors=None):
    """Return {key: normalized fr string} extracted from the annotated HTML."""
    out = {}

    def record(key, value, where):
        if errors is not None and key in out and out[key] != value:
            errors.append(
                "duplicate key '%s' with different French text (%s)" % (key, where)
            )
        out[key] = value

    for path in HTML_SOURCES:
        builder = TreeBuilder()
        builder.feed(path.read_text(encoding="utf-8"))
        for node in walk(builder.root):
            attrs = node.attrs
            if "data-i18n" in attrs:
                if errors is not None and has_element_children(node):
                    errors.append(
                        "%s: <%s data-i18n=\"%s\"> has element children — "
                        "use data-i18n-html" % (path.name, node.tag, attrs["data-i18n"])
                    )
                record(attrs["data-i18n"], norm(text_content(node)), path.name)
            if "data-i18n-html" in attrs:
                record(attrs["data-i18n-html"], norm(inner_html(node)), path.name)
            for attr_key, target in (
                ("data-i18n-aria-label", "aria-label"),
                ("data-i18n-alt", "alt"),
                ("data-i18n-content", "content"),
                ("data-i18n-placeholder", "placeholder"),
            ):
                if attr_key in attrs:
                    value = attrs.get(target)
                    if value is None:
                        if errors is not None:
                            errors.append(
                                "%s: %s=\"%s\" but the element has no %s attribute"
                                % (path.name, attr_key, attrs[attr_key], target)
                            )
                        continue
                    record(attrs[attr_key], norm(value), path.name)
    return out


def used_keys():
    keys = set()
    for path in HTML_SOURCES + JS_SOURCES:
        if not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        keys.update(KEY_ATTR_RE.findall(content))
        keys.update(T_CALL_RE.findall(content))
        keys.update(KEY_PROP_RE.findall(content))
    return keys


def load_catalog():
    data = yaml.safe_load(CATALOG.read_text(encoding="utf-8"))
    return data


def check():
    errors = []
    warnings = []

    if not CATALOG.exists():
        sys.exit("missing %s" % CATALOG)

    data = load_catalog()
    languages = data.get("languages") or {}
    keys = data.get("keys") or {}
    lang_codes = list(languages.keys())

    if "fr" not in lang_codes:
        errors.append("languages must include 'fr' (the source language)")
    for code, meta in languages.items():
        if not isinstance(meta, dict) or meta.get("dir") not in ("ltr", "rtl"):
            errors.append("languages.%s: 'dir' must be 'ltr' or 'rtl'" % code)
        if not (meta or {}).get("label"):
            errors.append("languages.%s: missing 'label'" % code)

    # 1. Per-key completeness: every declared language, non-empty, no extras.
    for key, entry in keys.items():
        if not isinstance(entry, dict) or "messages" not in entry:
            errors.append("%s: entry must have a 'messages' map" % key)
            continue
        messages = entry["messages"] or {}
        missing = [c for c in lang_codes if not (messages.get(c) or "").strip()]
        extra = [c for c in messages if c not in lang_codes]
        if missing:
            errors.append("%s: missing translation(s): %s" % (key, ", ".join(missing)))
        if extra:
            errors.append("%s: unknown language(s): %s" % (key, ", ".join(extra)))

        # 2. Placeholder consistency: {tokens} in every language == declared params.
        declared = set((entry.get("params") or {}).keys())
        for code, message in messages.items():
            if not isinstance(message, str):
                errors.append("%s.messages.%s: must be a string" % (key, code))
                continue
            tokens = set(PARAM_RE.findall(message))
            if tokens != declared:
                errors.append(
                    "%s.messages.%s: placeholders %s do not match declared params %s"
                    % (key, code, sorted(tokens), sorted(declared))
                )

    # 3. Key parity: every key used in HTML/JS exists; every key is used.
    used = used_keys()
    for key in sorted(used - set(keys)):
        errors.append("key '%s' is used in HTML/JS but missing from the catalog" % key)
    for key in sorted(set(keys) - used):
        warnings.append("key '%s' is in the catalog but never used" % key)

    # 4. French drift: YAML fr must equal the French text in index.html.
    extracted = extract_fr(errors)
    for key, html_fr in sorted(extracted.items()):
        entry = keys.get(key)
        if not entry:
            continue  # already reported as missing
        yaml_fr = norm((entry.get("messages") or {}).get("fr") or "")
        if yaml_fr and yaml_fr != html_fr:
            errors.append(
                "%s: fr drift between index.html and translations.yaml\n"
                "    html: %s\n    yaml: %s" % (key, html_fr, yaml_fr)
            )

    # 5. Generated JSON drift.
    for code in lang_codes:
        path = GENERATED_DIR / ("%s.json" % code)
        expected = generate_lang(code, languages, keys)
        if not path.exists():
            errors.append("missing generated file %s (run: build)" % path.name)
        elif path.read_text(encoding="utf-8") != expected:
            errors.append("generated file %s is stale (run: build)" % path.name)

    for warning in warnings:
        print("warning: %s" % warning)
    if errors:
        for error in errors:
            print("error: %s" % error, file=sys.stderr)
        print("\n%d error(s)." % len(errors), file=sys.stderr)
        return 1
    print("i18n check OK: %d keys x %d languages." % (len(keys), len(lang_codes)))
    return 0


def generate_lang(code, languages, keys):
    payload = {
        "lang": code,
        "dir": languages[code].get("dir", "ltr"),
        "label": languages[code].get("label", code),
        "strings": {
            key: (entry.get("messages") or {}).get(code, "")
            for key, entry in sorted(keys.items())
        },
    }
    return json.dumps(payload, ensure_ascii=False, indent=1, sort_keys=False) + "\n"


def build():
    data = load_catalog()
    languages = data.get("languages") or {}
    keys = data.get("keys") or {}
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    for code in languages:
        path = GENERATED_DIR / ("%s.json" % code)
        path.write_text(generate_lang(code, languages, keys), encoding="utf-8")
        print("wrote %s" % path.relative_to(ROOT))


def main():
    command = sys.argv[1] if len(sys.argv) > 1 else "check"
    if command == "check":
        sys.exit(check())
    elif command == "build":
        build()
    elif command == "extract":
        errors = []
        print(json.dumps(extract_fr(errors), ensure_ascii=False, indent=2))
        for error in errors:
            print("error: %s" % error, file=sys.stderr)
        sys.exit(1 if errors else 0)
    else:
        sys.exit("unknown command %r (use: check | build | extract)" % command)


if __name__ == "__main__":
    main()
