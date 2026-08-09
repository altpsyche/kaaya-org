/**
 * How full is this session's context window?
 *
 * The number is not a guess: every assistant message in the session transcript
 * records its own `usage`, and the newest one's
 * `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` is the
 * size of the context that message was answered with. That is the working set.
 *
 * Usage: node .claude/context-used.mjs
 *
 * Prints used tokens, the percentage of the window, and a verdict:
 *   CONTINUE   under 40% — safe to start another task
 *   FINISH     40-50% — land what is in hand, then hand over
 *   HAND OVER  over 50% — commit, tick the backlog, tell the user to /clear
 *
 * The window is read from the configured model: an `[1m]` suffix means 1M
 * tokens, anything else 200k. Override with CONTEXT_WINDOW=<tokens>.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CLAUDE_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude');

function windowSize() {
  if (process.env.CONTEXT_WINDOW) return Number(process.env.CONTEXT_WINDOW);
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(CLAUDE_DIR, 'settings.json'), 'utf8'));
    return /\[1m\]/i.test(settings.model ?? '') ? 1_000_000 : 200_000;
  } catch {
    return 200_000;
  }
}

/** Claude Code names a project directory after its cwd, with separators flattened. */
function projectDir() {
  const slug = process.cwd().replace(/[/\\:]/g, '-');
  return path.join(CLAUDE_DIR, 'projects', slug);
}

function newestTranscript(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length === 0) throw new Error(`no transcripts in ${dir}`);
  return files[0].full;
}

function lastUsage(file) {
  let usage = null;
  let turns = 0;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    if (entry.type !== 'assistant' || !entry.message?.usage) continue;
    usage = entry.message.usage;
    turns++;
  }
  if (!usage) throw new Error('no assistant message with usage in the transcript');
  return { usage, turns };
}

const limit = windowSize();
const { usage, turns } = lastUsage(newestTranscript(projectDir()));
const used =
  (usage.input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0) + (usage.cache_creation_input_tokens ?? 0);
const pct = (used / limit) * 100;
const verdict = pct >= 50 ? 'HAND OVER' : pct >= 40 ? 'FINISH' : 'CONTINUE';

console.log(
  `${used.toLocaleString('en-US')} / ${limit.toLocaleString('en-US')} tokens  ${pct.toFixed(1)}%  over ${turns} turns  ${verdict}`
);
