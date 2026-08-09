---
name: next
description: >
  Pick up work where the last session left it and land the next task. Reads
  docs/kaaya_website_implementation_tasks.md for state, plans a task before working it,
  and lands each step with /land. Use at the start of a session, after a /clear, or
  whenever the user says "next", "continue", "carry on", "what's next", or invokes /next.
---

Session entry point. **[`docs/kaaya_website_implementation_tasks.md`](../../../docs/kaaya_website_implementation_tasks.md) is the handover.** There is no separate handover file and you must not write one.

CLAUDE.md is already loaded and holds the standing rules, the gate and the voice brief. This file is the sequence only, so nothing here repeats it.

## 0. Budget

```
node .claude/context-used.mjs
```

**CONTINUE** picks a task. **FINISH** lands what is in hand and stops. **HAND OVER** starts nothing. Re-check after every `/land`, not at the end.

Handing over is three lines: what landed with its numbers, what the next task is, and `/clear` then `/next`.

## 1. Read the state, do not trust memory

Read as little as answers the question. The startup floor is paid by every session.

- **The backlog in full.** It is the only queue.
- **TDD §2's decisions table** when the task touches a design call, and **§6.2's behaviour table** when it touches routing. **Never read the technical design end to end** — it is 45KB, and §2 plus the one section a task names answers nearly everything. Find a section with `grep -n '^## 9\.' docs/kaaya_website_technical_design.md` and read to the next `## `.
- **The build doc's amendments block** before trusting any statement in its body, which the amendments override in 12 places without correcting inline.
- `git log --oneline -15`, and `git log -S'<symbol>'` when you need to know why a line is the way it is.

The same rule holds downstream. Grep for the symbol, read the function, open a whole file only when the whole file is the subject. A subagent is right when locating something means reading many files, because it returns the answer instead of the files.

**Check the tree is clean before anything else.** `git status --short` with output means a previous session left work uncommitted, and that is the first thing to resolve rather than build on.

## 2. Pick one task

**Epic order wins — E0 through E10, and inside an epic the task's own number.** Dependencies point backwards only, so the first task whose dependencies are all ticked is the pick. Only when several are equally ready does preference apply: the one that unblocks the most others, then the cheapest that closes a whole epic.

If the task already carries a step list, the pick is **its first unticked step**, not the task.

Skip and say so when a task is blocked **externally** — the blockers table at the end of the backlog is the list, and every entry on it is content only the Kaaya team can supply. Build the empty state, flag it, move on. **Do not invent placeholder content to unblock yourself**, and never ship the Wix placeholder date or address.

**A design call nothing settles is not a reason to skip** — but check TDD §2 first, because 18 of them are already answered. If it is genuinely unsettled, deciding it is the session's work: research it, write it into the TDD as a new numbered decision with its reasoning, and let that count as the finding. **If implementation proves an existing §2 decision wrong, stop and say so.** Do not quietly pick differently.

State the pick in one line before touching anything: `[task id] [what it is] [what it measures today].`

## 3. Plan first when the task is bigger than one commit

**When the chosen task has no step list under it and is bigger than one commit, planning it is the entire session and no code is touched.**

Research it by reading the files it will change rather than reasoning about them, then write into that backlog entry:

- **An ordered list of steps, each one commit-sized**, each naming the measurement its commit will quote. That is what keeps one finding per commit true across a task spanning several sessions, and what makes a bad step bisectable.
- **The step that re-baselines**, whenever the task moves a route count, the built-page count, or the content leaf-string count. Every later step diffs against the new baseline, and that commit quotes both old and new.

The task's acceptance criteria are already its done-criteria — do not rewrite them into a second list. If an AC is not checkable line by line, that is the finding: say which one and what would make it checkable.

Present the plan and stop. **Nothing lands until Siva says go.** One turn here is cheaper than ten commits down a wrong arc.

A task genuinely small enough to be one commit needs no plan. Say so, and work it.

## 4. Resume, do not re-plan

Take the first unticked step. Do not redesign the remainder because a different order occurred to you.

Mirror the steps into TodoWrite as a session-local view. That copy may die at `/clear`. The backlog's may not, which is why it is the one that gets ticked.

**When a step proves the plan wrong, stop.** Rewrite the remaining steps in the backlog, say so in the session's report, and continue from the corrected list.

## 5. Measure the before-state

Against `dist/`, from `npm run build`, before the edit. That number is what the commit body and the backlog tick quote.

**A content move measures with `npm run gate:content HEAD` before it starts**, so the after-run has something to be a diff of.

If the backlog's claim about the current state does not reproduce, **that is the finding**. Say so and record it.

## 6. Do the work

One step, one finding. Resist widening. A second defect goes into the backlog as a new task, not into this commit.

## 7. Land it

Invoke `/land`. It gates at the depth the change earns, commits, and ticks **that step** with its measurement.

## 8. Close the task

When the last step ticks, closing is its own piece of work:

- Run the **full gate**, whatever that last step touched. Cheap gates on the final commit prove nothing about the nine before it.
- Verify the acceptance criteria line by line, saying which number satisfies which line.
- Tick the task itself. **Do not delete it** — unlike an open-ended roadmap, this backlog is a fixed-scope migration and the closed tasks are the record of what shipped.
- Update CLAUDE.md's baseline table in the same commit if a baseline moved.

## 9. Boundary

Re-run the budget script and decide out loud. **CONTINUE** goes back to step 2. **FINISH or HAND OVER** hands over whatever is left, and never starts what it cannot land and record in the same session, because a half-landed finding stops the backlog describing the tree. **Nothing unblocked left** says what blocks the rest and stops.

**Never invent work to keep the loop alive.** A backlog whose remaining tasks are all externally blocked is a real answer, and the blockers table is what to report.

## The one rule this loop adds

**Prefer a mechanical finding over a decision when both are available.** Eighteen decisions are already made and recorded; spend new ones only when the measurable work runs out.
