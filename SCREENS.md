# MyStreet — Screen Map

A reference of every routed screen in the app, grouped by flow. Routes are expo-router paths (relative to `app/`).

---

## 1. Boot & onboarding

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `app/index.tsx` | **Splash.** Terracotta full-bleed crest, hydrates session + sell-draft stores, auto-advances to `/welcome` (new user) or `/(tabs)/map` (returning) after ~1.4s. |
| `/welcome` | `app/welcome.tsx` | Hero pitch with "Get started" / "Sign in" CTAs into the auth flow. |
| `/onboarding/slides` | `app/onboarding/slides.tsx` | Single horizontal pager (FlatList) of three intro slides; swipe + Skip/Next, animated dot pill. |
| `/onboarding/address` | `app/onboarding/address.tsx` | Lille-only address picker. Debounced Photon (komoot) geocoder, real Apple/Google map preview that follows the picked suggestion. |
| `/onboarding/profile` | `app/onboarding/profile.tsx` | Avatar (image picker), display name, age (wheel sheet), profession typeahead with custom-add, basic bio. |
| `/onboarding/success` | `app/onboarding/success.tsx` | "You're in." confirmation. Real Apple/Google map locked on the picked address with radius rings, glass success card + CTA into the tabs. |

---

## 2. Auth

| Route | File | Purpose |
| --- | --- | --- |
| `/auth` | `app/auth/index.tsx` | Method picker (email / phone). |
| `/auth/email` | `app/auth/email.tsx` | Email entry → OTP. |
| `/auth/phone` | `app/auth/phone.tsx` | French-flag SVG + phone entry → OTP. |
| `/auth/otp` | `app/auth/otp.tsx` | Shared 6-digit OTP screen for both email and SMS, 30 s resend ticker. |

---

## 3. Tabs (main app)

The tab layout (`app/(tabs)/_layout.tsx`) renders a custom **Floating pill tab bar** (`src/components/navigation/FloatingTabBar.tsx`) with 5 destinations: **Map · Search · Sell (+) · Messages · You**. The Sell `+` button opens the sell modal stack. The bar auto-hides on full-immersion routes (e.g. chat threads) via a `HIDE_ON` regex list.

### 3.1 Map

| Route | File | Purpose |
| --- | --- | --- |
| `/(tabs)/map` | `app/(tabs)/map/index.tsx` | **Home.** Real Apple/Google basemap with custom React price pins driven by Reanimated shared values + `onCameraMove` (smooth, no swim). Native circle for the 500 m radius, top floating search bar, locate button (recenters camera). Default state is map-only; tapping a pin opens a glass listings sheet (drag-to-dismiss + close button + working "See all"). When a saved sell-draft exists, a "Complete your listing" container/pill anchors above the tab bar. |
| `/(tabs)/map/filters` | `app/(tabs)/map/filters.tsx` | Modal filter sheet: price histogram, distance presets (`Custom…` opens the subscription paywall), category pills, condition, sort. Sticky "Show N listings" CTA. |

### 3.2 Search

| Route | File | Purpose |
| --- | --- | --- |
| `/(tabs)/search` | `app/(tabs)/search/index.tsx` | Search entry. Search-anything pill, recent queries, trending, **Browse** category tiles using `CategoryGlyph` SVGs. |
| `/(tabs)/search/results` | `app/(tabs)/search/results.tsx` | Result list, "POPULAR" badges (SVG flame), "Save this search" upsell. |
| `/(tabs)/search/filters` | `app/(tabs)/search/filters.tsx` | Search-side filter sheet (separate from map filters). Category row uses CategoryGlyph. |

### 3.3 Sell tab

| Route | File | Purpose |
| --- | --- | --- |
| `/(tabs)/sell-tab` | `app/(tabs)/sell-tab.tsx` | Empty placeholder — tapping the `+` in the tab bar pushes `/sell` (modal) directly, this screen is rarely seen. |

### 3.4 Messages

| Route | File | Purpose |
| --- | --- | --- |
| `/(tabs)/messages` | `app/(tabs)/messages/index.tsx` | **Inbox.** All / Buying / Selling tab pills with live counts. Top-right magnifier toggles a search input that filters by participant name + listing title + last message. Per-thread row with avatar + listing thumb + offer status badge. |
| `/(tabs)/messages/<id>` | `app/(tabs)/messages/[id].tsx` | **Chat thread.** Fully interactive: per-thread seeded message log; typing-indicator bot replies; auto-scroll; tappable header avatar → seller's public profile; three-dot overflow menu (View profile / Mute / Report / Block / Delete). Composer: multi-line input, paper-plane send, **`+` Attach menu** (Photo / Location / Offer / Pickup) and **`€ Offer`** quick action (hidden in seller-role threads). Offers support Accept / Counter / Decline. Pickup proposal renders right-aligned with "Waiting for confirmation…" → auto-confirms after 2 s; pickup *received* shows a Confirm button. Tab bar is hidden here. |

### 3.5 Profile (your own)

| Route | File | Purpose |
| --- | --- | --- |
| `/(tabs)/profile` | `app/(tabs)/profile/index.tsx` | **You.** Self-profile with stats, current listings, settings link. |

---

## 4. Sell flow (modal stack from the `+` button)

Registered as `presentation: 'modal'` in the root layout, so dismissing returns to whichever tab was underneath. Persisted via `useSellDraft` (AsyncStorage) — "Save & exit" stores a snapshot + last route, surfaced as a "Complete your listing" container on the map.

| Route | File | Purpose |
| --- | --- | --- |
| `/sell` | `app/sell/index.tsx` | Step 1 — Photos. Up to 8 photos, first becomes the cover. |
| `/sell/title` | `app/sell/title.tsx` | Step 2 — Title + AI-suggested category card (SVG sparkle) + tags. |
| `/sell/category` | `app/sell/category.tsx` | Picker pushed from the title step. **36 categories** in 8 sections, search bar, SVG glyph per row. |
| `/sell/description` | `app/sell/description.tsx` | Step 3 — Description (with "Help me write" SVG sparkle action) + condition pills. |
| `/sell/price` | `app/sell/price.tsx` | Step 4 — Price entry, **MARKET RANGE** badge (SVG sparkle), "Accept offers" toggle, Minimum offer row. |
| `/sell/min-offer` | `app/sell/min-offer.tsx` | Sub-screen of price. Big serif amount input matching the price step's typography, percent-of-list-price hint, 60/70/80/90 % quick-set pills. |
| `/sell/pickup` | `app/sell/pickup.tsx` | Step 5 — How do you meet? `At my place / Public meeting point / Shipping (coming soon)` with stroke-SVG icons + availability pills. |
| `/sell/review` | `app/sell/review.tsx` | Step 6 — Final review + Publish. Publish clears the saved draft and dismisses the whole modal. |

Every step's StepHeader has a **Save & exit** button that calls `useSellDraft.saveAndExit(pathname)` and `router.dismissTo('/(tabs)/map')`.

---

## 5. Listing detail

| Route | File | Purpose |
| --- | --- | --- |
| `/listing/<id>` | `app/listing/[id].tsx` | Buyer-POV listing detail (gallery, title, price, seller card, offer + message CTAs). |
| `/listing/<id>/gallery` | `app/listing/[id]/gallery.tsx` | Full-bleed photo carousel. |

---

## 6. Profiles & seller dashboard

Two distinct routes for the two perspectives — they used to collide, now cleanly separated.

| Route | File | Purpose |
| --- | --- | --- |
| `/profile/<id>` | `app/profile/[id].tsx` | **Public profile** (buyer's POV of someone else). Avatar + name, verified badge, "<distance> away · neighborhood", stats row (rating + reviews, sales, joined), trust badges, Message / Follow CTAs, tabs: **Reviews** (rating breakdown + per-review cards), **Selling** (active grid), **Sold**. Falls back to the `BUYERS` map when navigating to a counterparty from a seller-role chat. |
| `/seller/<id>` | `app/seller/[id].tsx` | **Owner POV** of one of your live listings. Stats strip (Views / Saves / Messages / Offers), performance hint, action grid (Edit / Pause / Mark as sold / Boost €1.99), sticky "View offers" CTA. |
| `/seller/<id>/offers` | `app/seller/[id]/offers.tsx` | Incoming offers list, "Below your min" warning chip (SVG triangle-bang), Accept / Counter / Decline per row. |
| `/seller/<id>/sold` | `app/seller/[id]/sold.tsx` | Past sales list (post-completion view). |

---

## 7. Misc / standalone

| Route | File | Purpose |
| --- | --- | --- |
| `/subscription` | `app/subscription.tsx` | **MyStreet+ paywall** (modal). Surfaced from the filters' `Custom…` distance pill. €1.99/mo plan card, perk list, sticky CTA. |
| `/settings` | `app/settings.tsx` | Account settings (notifications, privacy, sign out). |

---

## State stores

Reference for what backs the screens above:

- `src/lib/session.ts` — `useSession`. Hydrated on splash. Holds onboarding completion, address (lat/lng), display name, avatar URI.
- `src/lib/sellDraft.ts` — `useSellDraft`. AsyncStorage-persisted on Save & exit. Holds full sell-flow state + `lastRoute` for resume.
- `src/lib/threads.ts` — `THREADS` fixture with `iAmSeller` flag and per-thread `seed` message logs (3 buyer-role + 3 seller-role threads).
- `src/lib/myListings.ts` — `MY_LISTING` (the user's bike) + `INCOMING_OFFERS` for the offers screen.
- `src/lib/categories.ts` — 36-entry category catalog grouped into 8 sections, with `CategoryGlyph` keys.
- `src/lib/professions.ts` — 100+ French professions with diacritic-insensitive search.
- `src/lib/reviews.ts` — Per-seller deterministic review slices and bios.

---

## Navigation cheatsheet

- **Sell flow** is a modal — `router.dismissTo('/(tabs)/map')` closes it from any step.
- **Chat threads** hide the floating tab bar via the `HIDE_ON` regex in `FloatingTabBar.tsx`.
- **Tap avatar/name** in chat header → `/profile/<sellerId>`.
- **Tap listing strip** in chat header → `/seller/<listingId>` when `iAmSeller`, otherwise `/listing/<listingId>`.
- **Filters → Custom… distance** → `/subscription` (modal).
- **Map "Resume draft" container** → pushes the saved `lastRoute` (or `/sell` as fallback).
