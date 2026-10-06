#!/usr/bin/env node
/**
 * Set the homepage footer month from the latest content commit.
 * Citation bot commits (author "GitHub Actions") are ignored.
 * The month is the commit date in Asia/Shanghai, e.g. "October 2026".
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

export const BOT_AUTHOR = 'GitHub Actions';
export const BOT_EMAIL = 'action@github.com';

const SPAN = /(<span class="last-updated">Last Updated:\s*)([A-Z][a-z]+ \d{4})(\s*<\/span>)/;

export function formatLastUpdated(iso) {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    throw new Error(`Invalid commit date: ${iso}`);
  }
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    month: 'long',
    year: 'numeric',
  }).formatToParts(dt);
  const month = parts.find((part) => part.type === 'month')?.value;
  const year = parts.find((part) => part.type === 'year')?.value;
  if (!month || !year) {
    throw new Error(`Could not format commit date: ${iso}`);
  }
  return `${month} ${year}`;
}

export function selectContentCommit(records) {
  for (const record of records) {
    if (record.author === BOT_AUTHOR || record.email === BOT_EMAIL) continue;
    if (record.iso) return record.iso;
  }
  return null;
}

export function applyLastUpdated(html, label) {
  const match = html.match(SPAN);
  if (!match) {
    throw new Error('last-updated span not found in index.html');
  }
  if (match[2] === label) {
    return { html, changed: false };
  }
  return {
    html: html.replace(SPAN, `$1${label}$3`),
    changed: true,
  };
}

export function readCommitRecords(repoRoot) {
  const output = execFileSync('git', ['log', '--format=%an%x1f%ae%x1f%cI'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  return output.split(/\r?\n/).filter(Boolean).map((line) => {
    const [author, email, iso] = line.split('\x1f');
    return { author, email, iso };
  });
}

export function repoRootFromHere() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

function invokedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  return path.resolve(entry) === path.resolve(fileURLToPath(import.meta.url));
}

export function updateLastUpdatedFile(repoRoot) {
  const iso = selectContentCommit(readCommitRecords(repoRoot));
  if (!iso) {
    throw new Error('No content commit found');
  }
  const label = formatLastUpdated(iso);
  const file = path.join(repoRoot, 'index.html');
  const current = fs.readFileSync(file, 'utf8');
  const next = applyLastUpdated(current, label);
  if (next.changed) {
    fs.writeFileSync(file, next.html);
  }
  return { label, changed: next.changed, iso };
}

if (invokedDirectly()) {
  const result = updateLastUpdatedFile(repoRootFromHere());
  console.log(
    `Last Updated: ${result.label} (${result.changed ? 'changed' : 'unchanged'}) from ${result.iso}`
  );
}
