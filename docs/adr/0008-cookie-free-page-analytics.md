# 0008. Cookie-free page analytics

Date: 2026-09-25
Status: Accepted (approved by the maintainer 2026-09-25). Amends the "no analytics" line in docs/specs/0001-riftsign-v1.md's out-of-scope list.

## Context

The site moved from GitHub Pages to Cloudflare Workers static assets at riftward.app. Cloudflare's Worker metrics count requests but say nothing about which pages people visit or where they come from. Cloudflare Web Analytics answers both without cookies, local storage or fingerprinting, and is free.

## Decision

- Every page loads the Cloudflare Web Analytics beacon from `index.html`. The share pages copy `index.html`, so they carry it too.
- No other analytics, no cookies, no accounts. The beacon records page views, referrers, countries, browsers and page-load timing only.
- Quiz answers, Profiles and share-link fragments are never sent anywhere. The fragment stays in the browser.

## Consequences

- The README's "no analytics" becomes "cookie-free page analytics".
- A Player with a tracker blocker won't be counted, so numbers run low.
