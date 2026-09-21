# Quiz scoring model research (2026-09-20)

Compiled by a Sonnet 5 research agent. Question: is axis-based profile matching a sound scoring model for a "which Legend fits you" quiz with a growing catalog?

## How existing quizzes score

- MTG color quizzes: Likert point-tally into 5 color buckets, single-label result. https://www.idrlabs.com/magic-color/test.php
- Pokemon type/starter quizzes: short branching decision trees, single label.
- 16Personalities: ~60 Likert items scored as continuous percentages on 5 dichotomies, then thresholded to a 4-letter label. Documented weakness: near-50/50 scores flip label on noise. https://soultrace.app/en/blog/16-personalities-test
- IPIP-NEO-120: 30 facets x 4 items each, reported as per-trait percentiles, never collapsed to one type. Closest analog to a "scores are the result" design.
- Open Source Psychometrics "Which Character" test: user trait vector (30 axes) matched to 2,000+ character vectors via Pearson correlation, rescaled to 0-100. Same structural problem as ours: fixed axes, growing catalog, one row per item. https://openpsychometrics.org/tests/characters/development/

## Recommender framing

- This is content-based filtering: user vector vs item vectors in one feature space.
- For bounded, commensurable, zero-centered axes, weighted Euclidean distance is the natural default over cosine.
- Pitfalls and standard fixes:
  - Correlated axes double-count signal. Fix: audit the Legend coordinate correlation matrix; down-weight or merge correlated axes.
  - Items clustering in the center win too often. Fix: check the Legend coordinates actually spread; consider rank-normalized distance.
  - Axes fed by more questions have larger variance and dominate distance. Fix: normalize each axis to the same range before computing distance.
  - Likert response bias (acquiescence, central tendency) compresses scores.

## Psychometric basics

- Minimum 3 to 4 items per axis; 4 to 6 is the sweet spot. Below 3, scores are unstable. https://onlinelibrary.wiley.com/doi/full/10.1002/hrm.21852
- Reverse-keyed items counter acquiescence bias.
- Forced-choice items reduce bias and are faster to answer but produce ipsative scores. Scenario-choice questions are a practical middle ground for a fan quiz.

## Alternatives

| Approach | Meets "new Legend = one row"? |
|---|---|
| Additive category points | No, unless categories are coarse; loses 49-way granularity |
| Decision tree | No, every new Legend edits the tree |
| Pairwise / Bradley-Terry | No, a new Legend must be compared against all existing ones |
| Axis vector matching | Yes |
| Hybrid: axis matching with an axis-based gate | Yes |

## Assessment

Axis matching with weighted Euclidean distance is sound and is the only surveyed approach that satisfies the one-row requirement. It matches the architecture used by IPIP-NEO and the Open Source Psychometrics character matcher.

Top risks and mitigations:
1. Too few questions per axis. Raise count to 3 to 4 per axis, or load questions on multiple axes deliberately, and present scores as bands not exact points.
2. Scale mismatch and axis correlation. Normalize each axis; audit Legend coordinate correlations.
3. Response bias pushing scores to the center. Prefer scenario/forced-choice items; include reverse-keyed items per axis.

## Unverified

- Scoring methodology of Hearthstone or Legends of Runeterra class quizzes.
- Whether the Open Source Psychometrics matching code is public.
- No open-source axis-matching game quiz repo found to reference.
