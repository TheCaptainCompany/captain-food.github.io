#!/usr/bin/env python3
"""Static per-language page emitter for the Captain.Food marketing site.

Transforms each annotated FRENCH source page through the translation catalog
(i18n/translations.yaml) into real per-language files:

    /<lang>/<translated-slug>.html      (index.html -> /<lang>/)

Each generated page differs from its French source by:
  - every data-i18n / data-i18n-html / attribute annotation swapped for the
    language's message (the content is in the served HTML — no JS needed);
  - <html lang dir data-static-lang> (RTL languages flip statically);
  - its own self-referencing canonical + og:url + og:locale;
  - the shared hreflang cluster (fr + the `indexable` languages + x-default);
  - <meta name="robots" content="noindex,follow"> for languages not yet in
    `indexable` (i18n/slugs.yaml) — flipped per language after human review;
  - internal links rewritten to same-language siblings, assets to root-absolute;
  - JSON-LD blocks dropped (they are French; per-language structured data is a
    follow-up).

Also emits i18n/generated/pages.json (the French-page -> per-language URL map
used by i18n.js for redirects and the switcher), rewrites the hreflang blocks
of the French source pages to the static cluster, and regenerates sitemap.xml.

Everything under /<lang>/ is GENERATED — never hand-edit; run:
    python3 tools/i18n/i18n.py pages        # regenerate
    python3 tools/i18n/i18n.py pages --check  # CI drift gate
"""

import json
import re
import sys
from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent.parent
BASE_URL = "https://join.captain.food"

VOID_TAGS = {"br", "img", "input", "meta", "link", "hr", "area", "base",
             "col", "embed", "source", "track", "wbr"}
RAW_TEXT_TAGS = {"script", "style"}

# lang -> (dir, og:locale). Mirrors LANGS in i18n.js.
LANG_META = {
    "en": ("ltr", "en_GB"), "es": ("ltr", "es_ES"), "it": ("ltr", "it_IT"),
    "pt": ("ltr", "pt_PT"), "de": ("ltr", "de_DE"), "tr": ("ltr", "tr_TR"),
    "el": ("ltr", "el_GR"), "ro": ("ltr", "ro_RO"), "zh": ("ltr", "zh_CN"),
    "ja": ("ltr", "ja_JP"), "th": ("ltr", "th_TH"), "hi": ("ltr", "hi_IN"),
    "ta": ("ltr", "ta_IN"), "ar": ("rtl", "ar_MA"), "ar-lb": ("rtl", "ar_LB"),
    "he": ("rtl", "he_IL"),
}

# French sitemap profile: path -> (changefreq, priority). 404 excluded.
SITEMAP = {
    "index.html": ("weekly", "1.0"),
    "tarifs.html": ("monthly", "0.9"),
    "manifeste.html": ("monthly", "0.8"),
    "financement.html": ("monthly", "0.8"),
    "livraison.html": ("monthly", "0.8"),
    "alternative-uber-eats-tours.html": ("monthly", "0.9"),
    "alternative-deliveroo-tours.html": ("monthly", "0.9"),
    "restaurant-sans-commission-tours.html": ("monthly", "0.9"),
    "commande-en-ligne-restaurant-tours.html": ("monthly", "0.8"),
    "click-and-collect-tours.html": ("monthly", "0.8"),
    "livraison-ethique-tours.html": ("monthly", "0.8"),
    "restaurants-tours-indre-et-loire.html": ("monthly", "0.8"),
    "confidentialite.html": ("yearly", "0.2"),
    "mentions-legales.html": ("yearly", "0.2"),
}


# ---------------------------------------------------------------- tree model
class Node:
    __slots__ = ("kind", "tag", "attrs", "children", "text")

    def __init__(self, kind, tag=None, attrs=None, text=None):
        self.kind = kind  # root | element | text | raw | comment | decl
        self.tag = tag
        self.attrs = attrs if attrs is not None else []  # list[(name, value)]
        self.children = []
        self.text = text

    def attr(self, name):
        for key, value in self.attrs:
            if key == name:
                return value
        return None

    def set_attr(self, name, value):
        for i, (key, _) in enumerate(self.attrs):
            if key == name:
                self.attrs[i] = (name, value)
                return
        self.attrs.append((name, value))


class DocBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root")
        self.stack = [self.root]

    def handle_decl(self, decl):
        self.root.children.append(Node("decl", text=decl))

    def handle_comment(self, data):
        self.stack[-1].children.append(Node("comment", text=data))

    def handle_starttag(self, tag, attrs):
        node = Node("element", tag, list(attrs))
        self.stack[-1].children.append(node)
        if tag not in VOID_TAGS:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node("element", tag, list(attrs)))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        kind = "raw" if self.stack[-1].tag in RAW_TEXT_TAGS else "text"
        self.stack[-1].children.append(Node(kind, text=data))


def serialize(node, out):
    if node.kind == "root":
        for child in node.children:
            serialize(child, out)
    elif node.kind == "decl":
        out.append("<!%s>" % node.text)
    elif node.kind == "comment":
        out.append("<!--%s-->" % node.text)
    elif node.kind == "text":
        out.append(escape(node.text, quote=False))
    elif node.kind == "raw":
        out.append(node.text)
    elif node.kind == "element":
        parts = ["<" + node.tag]
        for name, value in node.attrs:
            if value is None:
                parts.append(" " + name)
            else:
                parts.append(' %s="%s"' % (name, value.replace("&", "&amp;").replace('"', "&quot;")))
        parts.append(">")
        out.append("".join(parts))
        if node.tag not in VOID_TAGS:
            for child in node.children:
                serialize(child, out)
            out.append("</%s>" % node.tag)


def walk(node):
    yield node
    for child in list(node.children):
        if child.kind in ("element", "root"):
            yield from walk(child)


# ------------------------------------------------------------- config access
def load_slugs():
    data = yaml.safe_load((ROOT / "i18n" / "slugs.yaml").read_text(encoding="utf-8"))
    return data["slugs"], list(data.get("indexable") or [])


def load_strings(lang):
    data = json.loads((ROOT / "i18n" / "generated" / ("%s.json" % lang)).read_text(encoding="utf-8"))
    return data["strings"]


def lang_path(page, lang, slugs):
    """Site-absolute path of a page in a language ('' slug -> directory root)."""
    if lang == "fr":
        return "/" if page == "index.html" else "/" + page
    per_page = slugs[page]
    slug = per_page.get(lang, per_page["en"])  # non-Latin scripts fall back to en
    return "/%s/%s" % (lang, (slug + ".html") if slug else "")


def hreflang_cluster(page, slugs, indexable):
    fr_url = BASE_URL + lang_path(page, "fr", slugs)
    lines = ['<link rel="alternate" hreflang="fr" href="%s" />' % fr_url]
    for lang in indexable:
        code = "ar-LB" if lang == "ar-lb" else lang
        lines.append('<link rel="alternate" hreflang="%s" href="%s%s" />'
                     % (code, BASE_URL, lang_path(page, lang, slugs)))
    lines.append('<link rel="alternate" hreflang="x-default" href="%s" />' % fr_url)
    return lines


# --------------------------------------------------------------- URL rewrite
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")


def rewrite_url(value, lang, slugs):
    if not value or value.startswith("#") or value.startswith("//") or SCHEME_RE.match(value):
        return value
    path, _, anchor = value.partition("#")
    anchor = ("#" + anchor) if anchor else ""
    bare = path.lstrip("/")
    if bare in ("", "index.html"):
        return lang_path("index.html", lang, slugs) + anchor
    if bare in slugs:
        return lang_path(bare, lang, slugs) + anchor
    # Anything else (assets, styles.css, script.js, demo/, 404.html, llms.txt…)
    # becomes root-absolute so it works from inside /<lang>/.
    return "/" + bare + anchor


URL_ATTRS = {("a", "href"), ("link", "href"), ("img", "src"), ("script", "src")}


# ------------------------------------------------------------ page transform
def transform(source_html, page, lang, strings, slugs, indexable):
    builder = DocBuilder()
    builder.feed(source_html)
    doc = builder.root
    page_url = BASE_URL + lang_path(page, lang, slugs)
    direction, og_locale = LANG_META[lang]

    head = None
    body = None
    for node in walk(doc):
        if node.kind != "element":
            continue
        if node.tag == "html":
            node.set_attr("lang", lang)
            node.set_attr("dir", direction)
            node.set_attr("data-static-lang", lang)
        elif node.tag == "head":
            head = node
        elif node.tag == "body" and body is None:
            body = node

        # Translations (annotations stay in place — harmless, and they let the
        # runtime re-apply the same language to the injected footer).
        key = node.attr("data-i18n")
        if key and key in strings:
            node.children = [Node("text", text=strings[key])]
        hkey = node.attr("data-i18n-html")
        if hkey and hkey in strings:
            node.children = [Node("raw", text=strings[hkey])]
        for attr_key, target in (("data-i18n-aria-label", "aria-label"),
                                 ("data-i18n-alt", "alt"),
                                 ("data-i18n-content", "content"),
                                 ("data-i18n-placeholder", "placeholder")):
            akey = node.attr(attr_key)
            if akey and akey in strings:
                node.set_attr(target, strings[akey])

        # Head metadata.
        if node.tag == "link" and node.attr("rel") == "canonical":
            node.set_attr("href", page_url)
        if node.tag == "meta":
            prop = node.attr("property")
            if prop == "og:url":
                node.set_attr("content", page_url)
            elif prop == "og:locale":
                node.set_attr("content", og_locale)

        # Internal links & assets.
        for tag, attr_name in URL_ATTRS:
            if node.tag == tag and node.attr(attr_name) is not None:
                if node.tag == "link" and node.attr("rel") in ("canonical", "alternate"):
                    continue
                node.set_attr(attr_name, rewrite_url(node.attr(attr_name), lang, slugs))

    if head is None:
        raise SystemExit("%s: no <head>" % page)

    # Robots: replace any existing directive rather than stacking a second
    # (the SEO pages ship index,follow) — most-restrictive wins ambiguity is
    # not something to leave to the crawler.
    robots_meta = None
    for child in head.children:
        if child.kind == "element" and child.tag == "meta" \
                and child.attr("name") == "robots":
            robots_meta = child
    if lang not in indexable:
        if robots_meta is not None:
            robots_meta.set_attr("content", "noindex,follow")
    elif robots_meta is not None:
        robots_meta.set_attr("content", "index,follow")

    # Drop French JSON-LD + old hreflang links; note where the canonical sits.
    canonical_index = None
    cleaned = []
    for child in head.children:
        if child.kind == "element" and child.tag == "script" \
                and child.attr("type") == "application/ld+json":
            # also swallow the whitespace text node that follows the block
            continue
        if child.kind == "element" and child.tag == "link" \
                and child.attr("rel") == "alternate" and child.attr("hreflang"):
            continue
        cleaned.append(child)
        if child.kind == "element" and child.tag == "link" \
                and child.attr("rel") == "canonical":
            canonical_index = len(cleaned) - 1
    head.children = cleaned

    insert = []
    for line in hreflang_cluster(page, slugs, indexable):
        insert.append(Node("text", text="\n  "))
        insert.append(Node("raw", text=line))
    if lang not in indexable and robots_meta is None:
        insert.append(Node("text", text="\n  "))
        robots = Node("element", "meta")
        robots.attrs = [("name", "robots"), ("content", "noindex,follow")]
        insert.append(robots)
    position = (canonical_index + 1) if canonical_index is not None else 0
    head.children[position:position] = insert

    # Honest machine-translation notice at the top of every generated page,
    # in the page's own language, inviting readers to help improve the copy.
    if body is not None and "i18n.helpnote" in strings:
        note = Node("element", "p", [("class", "translation-note")])
        note.set_attr("data-i18n-html", "i18n.helpnote")
        note.children = [Node("raw", text=strings["i18n.helpnote"])]
        body.children[0:0] = [Node("text", text="\n  "), note]

    out = []
    serialize(doc, out)
    html = "".join(out)
    if not html.startswith("<!"):
        html = "<!doctype html>" + html
    # Collapse the blank runs left where head lines were removed.
    html = re.sub(r"\n(?:[ \t]*\n)+", "\n", html)
    return html


# ------------------------------------------------- French sources + sitemap
def french_hreflang_rewrite(slugs, indexable):
    """Replace each French source page's hreflang block with the static
    cluster (they previously listed the ?lang= variants)."""
    changed = []
    for page in SITEMAP:
        path = ROOT / page
        text = path.read_text(encoding="utf-8")
        without = re.sub(r'[ \t]*<link rel="alternate" hreflang=[^\n]*\n', "", text)
        cluster = "".join("  %s\n" % line for line in hreflang_cluster(page, slugs, indexable))
        replaced, count = re.subn(
            r'([ \t]*<link rel="canonical"[^\n]*\n)',
            r"\1" + cluster.replace("\\", "\\\\"),
            without, count=1)
        if count != 1:
            raise SystemExit("%s: canonical link not found" % page)
        if replaced != text:
            path.write_text(replaced, encoding="utf-8")
            changed.append(page)
    return changed


def build_sitemap(slugs, indexable):
    today = date.today().isoformat()
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
             '        xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for page, (freq, priority) in SITEMAP.items():
        for lang in ["fr"] + indexable:
            lines.append("  <url>")
            lines.append("    <loc>%s%s</loc>" % (BASE_URL, lang_path(page, lang, slugs)))
            lines.append("    <lastmod>%s</lastmod>" % today)
            lines.append("    <changefreq>%s</changefreq>" % freq)
            lines.append("    <priority>%s</priority>" % priority)
            for link in hreflang_cluster(page, slugs, indexable):
                lines.append("    " + link.replace("<link ", "<xhtml:link ").replace(" />", "/>"))
            lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def pages_json(slugs):
    mapping = {}
    for page in SITEMAP:
        mapping[page] = {"fr": lang_path(page, "fr", slugs)}
        for lang in LANG_META:
            mapping[page][lang] = lang_path(page, lang, slugs)
    return json.dumps(mapping, ensure_ascii=False, indent=1, sort_keys=True) + "\n"


# --------------------------------------------------------------------- main
def run(check_only=False):
    slugs, indexable = load_slugs()
    outputs = {}  # site path (no leading /) -> content

    for lang in LANG_META:
        strings = load_strings(lang)
        for page in SITEMAP:
            target = lang_path(page, lang, slugs).lstrip("/")
            if target.endswith("/"):
                target += "index.html"
            source = (ROOT / page).read_text(encoding="utf-8")
            outputs[target] = transform(source, page, lang, strings, slugs, indexable)

    outputs["i18n/generated/pages.json"] = pages_json(slugs)

    if check_only:
        stale = []
        for target, content in outputs.items():
            path = ROOT / target
            if not path.exists() or path.read_text(encoding="utf-8") != content:
                stale.append(target)
        # The sitemap embeds lastmod dates; only its structure is checked.
        current = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
        expected = build_sitemap(slugs, indexable)
        strip = lambda s: re.sub(r"<lastmod>[^<]*</lastmod>", "", s)
        if strip(current) != strip(expected):
            stale.append("sitemap.xml")
        if stale:
            print("stale generated pages (run: python3 tools/i18n/i18n.py pages):",
                  file=sys.stderr)
            for target in stale[:20]:
                print("  - " + target, file=sys.stderr)
            return 1
        print("static pages check OK: %d files across %d languages."
              % (len(outputs), len(LANG_META)))
        return 0

    for target, content in outputs.items():
        path = ROOT / target
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    (ROOT / "sitemap.xml").write_text(build_sitemap(slugs, indexable), encoding="utf-8")
    changed = french_hreflang_rewrite(slugs, indexable)
    print("wrote %d generated pages (%d languages), pages.json, sitemap.xml%s"
          % (len(outputs) - 1, len(LANG_META),
             ("; refreshed hreflang in: " + ", ".join(changed)) if changed else ""))
    return 0


if __name__ == "__main__":
    sys.exit(run(check_only="--check" in sys.argv))
