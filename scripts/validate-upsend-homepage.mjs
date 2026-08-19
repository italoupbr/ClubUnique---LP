#!/usr/bin/env node
/**
 * Valida contrato Upsend para homepage Club Unique.
 * Usage: node scripts/validate-upsend-homepage.mjs [path/to/index.html]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const target = resolve(process.argv[2] ?? "LP Unique/index.html");
const html = readFileSync(target, "utf8");

const errors = [];

const hasGeoBlock =
  /id=["']geo-answer["']/i.test(html) || /class=["'][^"']*geo-answer/i.test(html);
const hasProvaSocial =
  /id=["']prova_social["']/i.test(html) || /class=["'][^"']*prova-social/i.test(html);

if (!hasGeoBlock) {
  errors.push("Falta bloco geo-answer (#geo-answer ou .geo-answer).");
}

if (!hasProvaSocial) {
  errors.push("Falta seção prova social (#prova_social ou .prova-social).");
}

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
const bodyInner = bodyMatch ? bodyMatch[1] : html;

const visibleText = bodyInner
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const first60Words = visibleText.split(/\s+/).slice(0, 60).join(" ").toLowerCase();

const entityOk = first60Words.includes("club unique");
const cityOk = first60Words.includes("alphaville nova lima");
const categoryOk =
  first60Words.includes("evento empresarial exclusivo") ||
  first60Words.includes("encontro empresarial exclusivo");

if (!entityOk) {
  errors.push('Primeiras 60 palavras: falta entidade "Club Unique".');
}
if (!cityOk) {
  errors.push('Primeiras 60 palavras: falta cidade "Alphaville Nova Lima".');
}
if (!categoryOk) {
  errors.push(
    'Primeiras 60 palavras: falta categoria ("evento empresarial exclusivo" ou "encontro empresarial exclusivo").'
  );
}

if (errors.length) {
  console.error(`\n❌ Upsend audit FAILED — ${target}\n`);
  errors.forEach((e) => console.error(`  • ${e}`));
  console.error("\nContrato: docs/UPsend-HOMEPAGE-CONTRACT.md\n");
  process.exit(1);
}

console.log(`✅ Upsend audit OK — ${target}`);
