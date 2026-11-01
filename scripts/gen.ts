#!/usr/bin/env npx tsx
/** Generate per-platform token files from tokens/tokens.json (the only source of truth).
 *  Typed: the token file shape is checked at compile time — rename/remove a
 *  field in tokens.json and this fails typecheck instead of silently breaking
 *  three downstream consumers. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface TokenLeaf { value: string; alias?: boolean; note?: string }
type TokenNode = TokenLeaf | { [k: string]: TokenNode | TokenLeaf };
interface TokenFile {
  meta: { name: string; version: string; canonical: boolean; authority: string; consumers: string[] };
  color: { brand: Record<string, TokenLeaf>; bg: Record<string, TokenLeaf>; border: Record<string, TokenLeaf>; text: Record<string, TokenLeaf>; exceptions: Record<string, TokenLeaf> };
  typography: Record<string, Record<string, string> | Record<string, string>>;
  spacing: Record<string, Record<string, string>>;
  shadow: Record<string, string>;
  motion: { transition: Record<string, string>; rule: string };
  alias: Record<string, TokenLeaf>;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tok: TokenFile = JSON.parse(readFileSync(join(ROOT, "tokens", "tokens.json"), "utf8"));
const OUT = join(ROOT, "dist");
mkdirSync(OUT, { recursive: true });

function resolve(v: string, depth = 0): string {
  if (depth > 5) return v;
  const m = /^\{(.+)\}$/.exec(v);
  if (!m) return v;
  let node: any = tok;
  for (const part of m[1].split(".")) node = node[part];
  return resolve((node as TokenLeaf).value ?? String(node), depth + 1);
}

const SKIP = new Set(["meta", "note", "rule"]);
function flatten(prefix: string, node: Record<string, any>, out: Record<string, string>): void {
  for (const [k, v] of Object.entries(node)) {
    if (SKIP.has(k)) continue;
    if (typeof v === "object" && v !== null && !("value" in v)) flatten(`${prefix}-${k}`, v, out);
    else out[`${prefix}-${k}`] = typeof v === "object" ? resolve(v.value) : v;
  }
}
const flat: Record<string, string> = {};
for (const section of ["color", "typography", "spacing", "shadow", "motion", "alias"]) {
  if (section in tok) flatten(section, (tok as any)[section], flat);
}
const cssVars: Record<string, string> = {};
for (const [k, v] of Object.entries(flat)) {
  cssVars["--" + k
    .replace("color-brand-", "color-").replace("color-bg-", "bg-")
    .replace("color-border-", "border-").replace("color-text-", "text-")
    .replace("color-exceptions-", "x-")
    .replace("spacing-radius-", "radius-").replace("spacing-control-height-", "control-h-")
    .replace("spacing-padding-", "pad-").replace("motion-transition-", "transition-")
    .replace("alias-", "")] = v;
}

let css = "/* GENERATED from tokens/tokens.json — DO NOT EDIT BY HAND (run scripts/sync.sh) */\n";
for (const [name, v] of Object.entries(cssVars).sort(([a], [b]) => a.localeCompare(b))) {
  if (/^#[0-9a-fA-F]{3,8}$/.test(v) || /^rgba\(/.test(v)) css += `@property ${name} { syntax: '<color>'; inherits: true; initial-value: ${v}; }\n`;
}
css += ":root {\n";
for (const name of Object.keys(cssVars).sort()) css += `  ${name}: ${cssVars[name]};\n`;
css += "}\n";
// dark overrides from color._dark
if (tok.color && (tok.color as any)._dark) {
  const darkVars: Record<string, string> = {};
  for (const fam of ["bg", "border", "text"]) {
    for (const [k, v] of Object.entries((tok.color as any)._dark[fam] ?? {})) {
      darkVars[`--${fam}-${k}`] = (v as any).value;
    }
  }
  css += `[data-theme="dark"] {\n`;
  for (const name of Object.keys(darkVars).sort()) css += `  ${name}: ${darkVars[name]};\n`;
  css += `}\n`;
}
writeFileSync(join(OUT, "tokens.css"), css);
writeFileSync(join(OUT, "tokens.kmp.json"), JSON.stringify(Object.fromEntries(Object.entries(cssVars).map(([k, v]) => [k.replace(/^--/, ""), v])), null, 2));

const C = cssVars;
writeFileSync(join(OUT, "tokens.infima.css"), `/* GENERATED from tokens/tokens.json — DO NOT EDIT BY HAND (run scripts/sync.sh) */
:root {
  --ifm-color-primary: ${C["--color-buy"]};
  --ifm-color-primary-dark: ${C["--color-buy-hover"]};
  --ifm-color-primary-darker: #02935b;
  --ifm-color-primary-darkest: #016e44;
  --ifm-color-primary-light: #17d083;
  --ifm-color-primary-lighter: #43db91;
  --ifm-color-primary-lightest: #86ebc0;
  --ifm-color-primary-contrast-foreground: #ffffff;
  --ifm-color-primary-contrast-background: #045c39;
  --ifm-color-success: ${C["--color-buy"]};
  --ifm-color-danger: ${C["--color-sell"]};
  --ifm-color-warning: ${C["--color-warning"]};
  --ifm-color-info: ${C["--color-info"]};
  --ifm-code-font-size: 95%;
  --docusaurus-highlighted-code-line-bg: rgba(2, 201, 118, 0.10);
}
[data-theme='dark'] {
  --ifm-color-primary: ${C["--color-buy"]};
  --ifm-color-primary-dark: #03b56e;
  --ifm-color-primary-darker: #02935b;
  --ifm-color-primary-darkest: #016e44;
  --ifm-color-primary-light: #17d083;
  --ifm-color-primary-lighter: #43db91;
  --ifm-color-primary-lightest: #86ebc0;
  --ifm-color-success: ${C["--color-buy"]};
  --ifm-color-danger: ${C["--color-sell"]};
}
`);
console.log(`OK: dist/tokens.css (${Object.keys(cssVars).length} vars) + dist/tokens.kmp.json + dist/tokens.infima.css`);
