# Riftward: Domain Glossary

Game terms below are facts about Riftbound. Project terms are decisions made in design sessions and are marked as such.

## Game terms

**Domain**: One of six factions a card belongs to: Fury, Calm, Mind, Body, Chaos, Order. They form three opposite pairs (Fury/Calm, Mind/Body, Chaos/Order).

**Legend**: The card that defines a deck. It names a Champion and fixes exactly two Domains. Every other card in the deck must fit those two Domains. Printed Legends are named "Champion, Subtitle" (e.g. "Kennen, Heart of the Tempest").

**Champion**: A named League of Legends character. One Champion may have several Legend printings with different Domain pairs and playstyles.

**Set**: A quarterly card release (Origins, Spiritforged, Unleashed, Vendetta, Radiance). Each set adds new Legends.

**Starter deck**: A preconstructed retail deck built around one Legend, aimed at new players.

## Project terms

**Player**: The person taking the test. Assumed to know Riftbound's basic rules and to be looking for a deck that suits them. Not assumed to know deck-building jargon such as "aggro" or "tempo".

**Axis**: One continuous dimension of playstyle preference, scored 0 to 10: Pace, Stance, Complexity or Variance. Every Build has a fixed position on every Axis. Domains are not Axes; see Domain score.

**Domain score**: How much the Player enjoys one Domain, 0 to 10, where 5 means no feeling either way. There are six, and they are independent: liking Fury says nothing about Calm. Legends have no Domain scores; their two Domains come from the card (ADR 0005).

**Profile**: The Player's ten scores after finishing the test: the four Axes and the six Domain scores. The Profile, not a label, is the Player's result. Two Players matched to the same Legend can have different Profiles.

**Archetype**: A named playstyle family (such as Aggro, Midrange, Control, Combo). An Archetype is a region of Axis space. Legends belong to Archetypes through their Builds; Archetypes are stable across Sets while Legends come and go.

**Build**: One played way of piloting a Legend, with its own Archetype and Axis position (for example Lux as Control, Lux as Combo). A Legend has one to three Builds, each a different Archetype, and a Build exists only if relevant decks show players running it. See ADR 0003.

**Match**: A Legend recommended to a Player because one of its Builds sits close to the Player's Profile. Playstyle Axes weigh more than Domain scores, so the top Matches are decks that play like the Player (ADR 0004). The result page headlines the top two. The Match shows that closest Build. A Match is ranked, not binary. A Domain lean may also surface Legends holding those Domains as secondary Matches. The Player never names favourite champions; every Legend can be explored, in fit order, in the result page's Explore carousel (ADR 0007).

**Domain lean**: The one or two Domains that clearly lead a Profile. That means the top two Domain scores if both are at least 3 above neutral and ahead of the rest, otherwise the top one on the same terms, otherwise none. Scores tied at the cut are left out. The "Your Domains" section lists other Legends holding them, for Players who choose decks by Domain.

**Legend rating**: The Builds (each an Archetype, Axis position and short description) assigned to a Legend when it is ingested. Drafted from published guides and card text, then reviewed by a human before it can appear as a Match.

**Ingestion**: The manual, reviewed process of adding a newly released Legend to the pool of possible Matches, or re-rating an existing Legend's Builds. Triggered per Set release, and re-run on existing Legends when a ban list or tournament results shift how they are played. Never changes the Questions.

**Question / Answer**: A Question is a prompt shown to the Player. Each Answer moves one or more scores: Axes, Domain scores or both. Questions never name a Legend or Archetype.

**Persona**: A fixed, fictional set of Answers representing a recognisable kind of Player (for example "impatient aggro player"). Personas exist to check that Questions still lead where they should; they are never shown to Players.
