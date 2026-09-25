# Spec 0003: Riftward redesign and rebrand

Status: Agreed with the maintainer 2026-09-24. Not yet implemented.
Date: 2026-09-24
Related: Penpot file "Riftward", page "Final Designs" (boards 01 Brand to 05 Assets), docs/adr/0005-six-independent-domain-scores.md

## Summary

The project is renamed Riftward and gets a visual redesign. The Penpot "Final Designs" page is the source of truth for layout, colours, type and components. Most of the redesign restyles what the app already does. This spec records the behaviour changes and the decisions on everything the designs leave open. There are no mobile designs, so mobile layouts follow the desktop designs.

## Rename

Rename everything from Riftsign to Riftward: the code, the package, the repo, `PROJECT_TITLE`, the docs, `CONTEXT.md`, the share pages and the Open Graph images.

Riftward is a brand, not a noun for the result. Use it where the designs use it: the logo, the wordmark and the legal line. "Riftsign" as the Player-facing name for the Profile goes away. Result copy uses the plain wording from the designs ("Your top Build", "Your playstyle", "Your Domains"). `CONTEXT.md` keeps Profile as the project term and drops the Riftsign alias.

Existing share links may break. The site is moving to a new host, so the new build doesn't need to stay compatible with old links.

## Foundations

Take colours, type styles and components from the Penpot library. Michroma is for display type and the wordmark. Manrope is for everything else. Space Grotesk, Inter and JetBrains Mono go. The header uses the row logo on every screen, and the landing hero uses the column logo.

## Header and footer

- The header holds only the row logo, which links home. The Piltover Archive link goes.
- Every screen, quiz included, has a small footer with Riot's Legal Jibber Jabber line, styled like the one on the Result design. Riot's policy asks for the line, so it can't live on the Result page alone.
- The Landing page keeps its short fan-project note as well.

## Landing

- The layout follows the design: the column logo, the eyebrow, the title, the body, the start button, "About five minutes", then the Legend card row.
- The card row shows every Legend, newest set first (reverse `SET_CODES` order: VEN, UNL, SFD, OGS, OGN). Within a set, Legends sort by name. New sets such as Radiance go to the front when their Legends are added.
- The row scrolls on its own, pauses on hover and stays still when the Player has reduced motion turned on.
- "49 Legends · six Domains · one that fits" uses the real Legend count.
- The returning-Player buttons ("Continue where you left off" and "Start the test", or "See your result" and "Retake the test") use the primary and secondary styles.

## Quiz

- Picking an Answer only selects it. The quiz no longer moves on by itself. Next moves on and stays disabled until an Answer is picked.
- Number keys 1 to n pick Answers. Enter presses Next. The hint reads "Press 1-n to answer".
- On the last Question, Next reads "Show my Legends".
- Back on the first Question returns to the Landing page, as now.
- Answers that move no score (`moves: []`, such as "I'm more of a quiet player, honestly") look like every other Answer, so they don't draw attention. This overrides the dashed style in Penpot.
- Progress is the chevron trail with the "n of 21" count. The chevrons shrink on narrow screens so all 21 fit.
- The favourite-champion step is removed.

## Result

### Hero

- The hero shows the card, "Your top Build / n% fit", the Legend name, Domain tags, "played as Archetype", the Build's "Why you might like it" text, the deck list box and "Also played as".
- Each Archetype in "Also played as" is a link. Clicking one swaps the hero to that Build. The eyebrow becomes "Another Build / n% fit", and the why-text and deck list change with it. The row then links back to the best-fit Build, marked "(your best fit)".
- Buttons are "Copy share link" and "Retake the test". The copy label becomes "Link copied" or "Could not copy" for a moment, as now.
- The fit note ("Fit is about how a Legend plays...") sits under the buttons.
- The starter-deck tag shows only when the Legend has a starter deck.

### Deck list box

- When a Build has its own deck list, the box reads "Legend Archetype deck list" and "Open on Piltover Archive".
- When it doesn't (today that's any `deckListUrl` equal to the generic `https://piltoverarchive.com/decks`), the box reads "No featured deck list yet" and "Browse Champion decks on Piltover Archive".
- The browse link should open Piltover Archive filtered to that Legend. No URL for that filter has been found yet. Research it during implementation, and fall back to the generic deck page if there isn't one.

### Also plays like you

The #2 Match, with rank, fit, name, tags, "played as", the starter tag, "How it plays" and its deck list box.

### Your playstyle

The four Axes with band labels and scores, as in the design. The bars keep a simple fill animation on a fresh result. The one-Axis-at-a-time reveal goes.

### Your Domains and More in these Domains

- The six Domain bars show the feeling, the score and a tick at neutral. Leading Domains fill in their Domain colour, and the rest fill grey.
- The right column is titled "More in Domain and Domain" and lists the Domain-lean Legends, as now.
- With no clear lead, or when the Legends above already cover the lead, the right column shows the current sentence for that case.
- "See all 49 Legends, ranked" scrolls to Explore.

### Explore other Legends

- The carousel holds every Legend, sorted by the Player's ranking. Each portrait shows the rank (#n) and the champion name. Champions with more than one Legend (Master Yi) also show the subtitle.
- Sort options are "Best fit first" (the default) and "A to Z". Ranks stay the same under either sort.
- Search narrows the carousel by name without changing ranks. With no results the carousel shows one line saying so.
- The panel starts on the best-fit Legend not already shown above, usually #3.
- The panel shows the card, "#n of 49 / n% fit", the name, tags, "played as", "How it plays", the deck list box and "Compared with you". Legends with more than one Build get the Build picker from the component sheet, defaulting to the best fit.
- "Compared with you" shows each Axis as a gap in points ("0.3 faster", "About the same"). The summary line under it uses the existing gap wording.
- Portraits come from the Penpot Assets board, exported into `public/`.

### Removed from the Result

- The "You play Archetype" headline and the Archetype descriptions (`ARCHETYPE_COPY` and `deriveArchetype`, if nothing else uses them).
- The close-call line.
- The Domain descriptions under each bar (`DOMAIN_COPY`). The Build text already says what each deck does.
- "Has the look you like" and everything behind it: `favouritePick`, the saved favourite champions and the champion list.
- The collapsible full ranking, replaced by Explore.

The hero shows only "Why you might like it". The #2 Match and the Explore panel show only "How it plays". This split is intended.

### Shared and older results

- A shared result is the same page with a thin banner above the hero, restyled to match the new design. The banner says this is someone else's result and links to "Take the test".
- On a shared result the copy moves to third person ("Their top Build", "Their playstyle", "Their Domains"). The "Compared with" key reads "Them", and "Copy share link" is hidden. "Retake the test" becomes "Take the test".
- The "test has changed since you took it" and "made with an earlier version of the test" notices use the same banner.

## Docs to update

- `CONTEXT.md`: the rename, dropping Riftsign, dropping favourite champions from Match, and the Explore carousel.
- ADR 0005: favourite champions no longer appear on the result page. Record this as a new ADR that supersedes that part.
- `README.md` and `AGENTS.md`: the rename.
- Penpot's Assets board still has an old hidden caption about the favourite-champion step. It's harmless, but worth tidying.

## Out of scope

- Moving to the new host and changing the deploy workflow.
- Changing the Questions, scoring or Legend ratings.
