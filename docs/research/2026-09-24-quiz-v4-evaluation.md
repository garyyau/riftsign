# Quiz v4 evaluation: plain-language Questions (2026-12b)

Date: 2026-09-24
Related:
- docs/adr/0006-plain-language-questions.md
- docs/research/2026-09-24-quiz-v3-evaluation.md (method, panel and earlier runs)
- docs/eval/experiments/2026-12-plain-language-rationale.md

The method matches the v3 evaluation:
- 16 role-played Players, with true Profiles from two raters who agree closely
- fresh Sonnet takes that read only their own Player file and the answer sheet
- real scoring, with oracle agreement measured on the same Legend data

The Legend ratings are held fixed; their quality is evaluated separately. Players also listed any word they didn't understand.

## How the set was written

1. **Sample and full set.** Fable drafted a six-question sample, and the maintainer approved the tone with two notes: questions felt conceptually alike, and "Turn one / Midgame" framing was too specific. The full 2026-12 set of 21 Questions gives each Question its own framing and drops timestamps unless the timing is the point.
2. **v4 panel.** A take and a retake exposed three fixable problems:
   - **Mind** sat in only three Questions, two of them against Calm or Chaos, so Mind-loving control players always took the Calm or Chaos answer (Mind rho 0.15, then −0.08).
   - **"Send everything. Win big or lose big"** read as aggression, not luck, so aggressive players who dislike gambles scored as gamblers.
   - **Stance.** "Their turn is my break" and "I'm sticking to my plan" scored as maximally proactive. Patient board-builders who were simply focused on their own game picked them.
3. **2026-12b.** Mind gained a fourth Question ("Hang on, let me draw a few more"), the luck item became "Shuffling up for a big game, you're secretly hoping for…", and stance got a real middle answer ("Thinking about my own board more than theirs"). Its proactive answers now mean pressuring the opponent.

## Results

| | v3 (27 Q) | Statements (33 Q) | v4 (21 Q) | 2026-12b (21 Q) |
| --- | --- | --- | --- | --- |
| Stance MAE / rho | 2.07 / 0.77 | 2.23 / 0.76 | 1.77 / 0.61 | 0.99 / 0.81 |
| Variance MAE / rho | 1.47 / 0.70 | 1.05 / 0.76 | 1.57 / 0.61 | 1.00 / 0.79 |
| Complexity MAE | 1.68 | 1.56 | 1.30 | 1.02 |
| Pace MAE | 1.59 | 1.25 | 1.20 | 1.47 |
| Six-Domain MAE | 1.71 / 1.60 | 1.36 / 1.33 | 1.38 / 1.60 | 1.50 |
| Top-2 Domains shared with truth | 19 / 22 of 32 | 23 / 22 | 23 / 20 | 23 |
| Regret (fit points) | 4.6 / 5.4 | 3.5 / 4.9 | 4.3 / 5.4 | 4.1 |
| Median rank of the oracle's #1 | 1 | 2 | 6 | 2 |
| Players within 3 fit points | 9 / 6 of 16 | 10 / 7 | 9 / – | 10 |
| Test-retest: same #1 | 9 / 16 | 9 / 16 | 9 / 16 | not run |

Pairs are take / retake. 2026-12b was run once.

- **Readability.** Across 48 v4 and 2026-12b takes, one term was flagged as unclear: "face-down" cards, by the fence-sitter.
- **Tone.** The role-players called it fun:
  - Theo (five games): "way easier to read than half my cards".
  - Rafael (loves Fury and Calm): "actually got the burn-then-lock-down thing instead of making me pick a side".
  - Hannah, the competitive player, dissented. She wanted more questions that test matchup reads.
- **`pnpm simulate` at threshold 2.5:**
  - Build recovery is 83% / 100% noise-free and 65% / 93% with 25% neighbour slips. Slips on graded answers now land on the neighbouring answer, which is harsher and more realistic than before.
  - The playstyle-first share of the top 3 is 71%, against 60% for v3.
  - Fans' #1 holds their pair 84% of the time.
  - Domain-neutral Players stay quiet 100% of the time.

## Remaining gaps

1. **"Surprise" answers pull control players up on Chaos.** "Where did that even come from?" and "You never know what's coming" are the culprits (Wen and Mateo +5).
2. **Calm reads low for two Players** (Sofía −4.3, Grace −3.0).
3. **Legend side, for the separate review:**
   - Every Combo Build is rated variance 6 or higher, so luck-averse combo players land on Control. The puzzle-loving combo Persona is marked as a known failure until the ratings change.
   - No Aggro Build is Fury/Order, so a swarm-loving aggro player lands on Darius, rated Tempo.
