#!/usr/bin/env python3
"""Generate per-platform token files from tokens/tokens.json (the only source of truth)."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tok = json.load(open(os.path.join(ROOT, "tokens", "tokens.json")))
OUT = os.path.join(ROOT, "dist")
os.makedirs(OUT, exist_ok=True)

def resolve(v, depth=0):
    if depth > 5: return v
    m = re.fullmatch(r"\{(.+)\}", v)
    if not m: return v
    node = tok
    for part in m.group(1).split("."):
        node = node[part]
    return resolve(node["value"] if isinstance(node, dict) else node, depth + 1)

def flatten(prefix, node, out):
    for k, v in node.items():
        if k in ("meta",): continue
        if isinstance(v, dict) and "value" not in v:
            flatten(f"{prefix}-{k}", v, out)
        else:
            out[f"{prefix}-{k}"] = resolve(v["value"]) if isinstance(v, dict) else v

flat = {}
for section in ("color", "typography", "spacing", "motion"):
    if section in tok:
        flatten(section.replace("color", "color"), tok[section], flat)
# rename to css-var style: color-brand-buy -> --color-buy handled by explicit map below
css_vars = {}
for k, v in flat.items():
    name = "--" + k
    # collapse color.brand.X -> --color-X ; color.bg.X -> --bg-X (match existing web names)
    name = name.replace("--color-brand-", "--color-").replace("--color-bg-", "--bg-") \
               .replace("--color-border-", "--border-").replace("--color-text-", "--text-") \
               .replace("--color-exceptions-", "--x-")
    css_vars[name] = v

with open(os.path.join(OUT, "tokens.css"), "w") as f:
    f.write("/* GENERATED from tokens/tokens.json — DO NOT EDIT BY HAND (run scripts/sync.sh) */\n")
    f.write(":root {\n")
    for k in sorted(css_vars):
        f.write(f"  {k}: {css_vars[k]};\n")
    f.write("}\n")

with open(os.path.join(OUT, "tokens.kmp.json"), "w") as f:
    json.dump({k.lstrip("-"): v for k, v in css_vars.items()}, f, indent=2)

print(f"OK: dist/tokens.css ({len(css_vars)} vars) + dist/tokens.kmp.json")
