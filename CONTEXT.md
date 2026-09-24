# Riftsign: Domain Glossary

Game terms below are facts about Riftbound. Project terms are decisions made in design sessions and are marked as such.

## Game terms

**Domain**: One of six factions a card belongs to: Fury, Calm, Mind, Body, Chaos, Order. They form three opposite pairs (Fury/Calm, Mind/Body, Chaos/Order).

**Legend**: The card that defines a deck. It names a Champion and fixes exactly two Domains. Every other card in the deck must fit those two Domains. Printed Legends are named "Champion, Subtitle" (e.g. "Kennen, Heart of the Tempest").

**Champion**: A named League of Legends character. One Champion may have several Legend printings with different Domain pairs and playstyles.

**Set**: A quarterly card release (Origins, Spiritforged, Unleashed, Vendetta, Radiance). Each set adds new Legends.

**Starter deck**: A preconstructed retail deck built around one Legend, aimed at new players.

## Project terms

**Player**: The person taking the test. Assumed to know Riftbound's basic rules and to be looking for a deck that suits them. Not assumed to know deck-building jargon such as "aggro" or "tempo".

**Axis**: One continuous dimension of playstyle preference (for example speed, or Domain affinity). Every Answer moves the Player along one or more Axes. Every Legend has a fixed position on every Axis.

**Profile**: The Player's position on all Axes after finishing the test. The Profile, not a label, is the Player's result. Two Players matched to the same Legend can have different Profiles. In Player-facing copy the Profile is called their **Riftsign**.

**Archetype**: A named playstyle family (such as Aggro, Midrange, Control, Combo). An Archetype is a region of Axis space. Legends belong to Archetypes through their Builds; Archetypes are stable across Sets while Legends come and go.

**Build**: One played way of piloting a Legend, with its own Archetype and Axis position (for example Lux as Control, Lux as Combo). A Legend has one to three Builds, each a different Archetype, and a Build exists only if relevant decks show players running it. See ADR 0003.

**Match**: A Legend recommended to a Player because one of its Builds sits close to the Player's Profile. Playstyle Axes weigh more than Domain Axes, so the top Matches are decks that play like the Player (ADR 0004). The Match shows that closest Build. A Match is ranked, not binary. A Domain lean in the Profile may also surface Legends sharing those Domains as secondary Matches.

**Domain lean**: The Domains a Profile points to clearly enough to name. A Domain Axis counts only when the Profile scores at least 2.5 from its centre. The Domain-lean section lists Legends in those Domains for Players who choose decks by Domain.

**Legend rating**: The Builds (each an Archetype, Axis position and short description) assigned to a Legend when it is ingested. Drafted from published guides and card text, then reviewed by a human before it can appear as a Match.

**Ingestion**: The manual, reviewed process of adding a newly released Legend to the pool of possible Matches, or re-rating an existing Legend's Builds. Triggered per Set release, and re-run on existing Legends when a ban list or tournament results shift how they are played. Never changes the Questions.

**Question / Answer**: A Question is a prompt shown to the Player. Each Answer carries Axis movements, possibly on more than one Axis. Questions never name a Legend or Archetype.

**Persona**: A fixed, fictional set of Answers representing a recognisable kind of Player (for example "impatient aggro player"). Personas exist to check that Questions still lead where they should; they are never shown to Players.
