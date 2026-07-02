# Site Improvement Committee Report

*Produced 2026-07-01 by a six-member review committee (art direction, conversion, typography, UX/mobile, performance, copy/trust). 73 raw findings were consolidated to 30 and each was adversarially re-verified against the code and the running site; 29 were confirmed, 1 refuted. Line numbers were re-checked during verification.*

## 1. Concierge launcher sits on top of the mobile 'Secure Deposit' button on the $185k landing page

**Conversion · impact: high · effort: small**

**Evidence:** src/App.tsx:20-31 renders the global concierge launcher as `fixed bottom-6 right-6 z-[90000]` (verified at App.tsx:24); measured at 375x812 it occupies x253-351, y714-788. src/components/CrocJacketLanding.tsx:699-721 renders the mobile sticky buy bar `fixed bottom-0 z-50 lg:hidden` whose deposit button (flex-1 max-w-[220px], py-3.5) spans approx x139-359, y742-800. z-[90000] beats z-50, so the launcher intercepts taps over the top ~40px of the deposit button's rightmost ~72-98px on every mobile view — and mix-blend-difference renders it as a dark blob over the cream bar.

**Verifier corrections:** Core claim holds and is understated. Live-measured at 375px: overlap is 98px wide x 34px tall (not ~40px tall x 72-98px wide), covering 36% of the deposit button's area, and hit-testing shows even the geometric CENTER of the 'Secure Deposit' button opens the concierge launcher — 4 of 5 sampled tap points inside the button are intercepted. At 812px viewport height the deposit button spans y754-800 (46px tall), not y742-800. Launcher coordinates x253-351/y714-788 confirmed exact. All file/line citations (App.tsx:20-31/24/33/340; CrocJacketLanding.tsx:699-721/724) verified accurate.

**Recommendation:** On /bespoke-crocodile-jacket mobile, suppress the launcher (route check in ConciergeGate, App.tsx:33) or raise it to bottom-24 while the sticky bar is present (the page already reserves h-16 padding at CrocJacketLanding.tsx:724). A thumb aiming at 'Secure Deposit' — the single most valuable tap target the house owns — must never open the chat widget instead.

---

## 2. Bespoke and Private Client forms swallow API failures, show success, and fire the Ads conversion anyway — silent loss of the highest-value leads

**Conversion · impact: high · effort: small**

**Evidence:** src/components/Bespoke.tsx:100-114: the POST to /api/private-client ends in .catch(() => {}); line 129 fires reportInquiryConversion() and line 130 setIsSubmitted(true) unconditionally; the submit button (lines 464-467) advances to the 'Received… Expect a personal correspondence shortly' screen regardless of outcome. Same pattern in src/components/PrivateClientForm.tsx:148-162 (.catch(() => {})) and line 167 (conversion fires unconditionally). Contrast: Contact.tsx:133 and InquiryModal.tsx:98 correctly throw on !res.ok and show a retry path with concierge@matteoperin.com.

**Verifier corrections:** All line citations are accurate (Bespoke.tsx:100-114, 129, 130, 464-467; PrivateClientForm.tsx:148-162, 167; Contact.tsx:133; InquiryModal.tsx:98). Correction to the failure scenario: an expired HUBSPOT_ACCESS_TOKEN does NOT produce a non-ok response — api/private-client.js:119-121 only logs the failed HubSpot create and lines 250-254 still return 200 {success:true, contactId:null} (missing token likewise returns 200 at line 19), so the recommended res.ok gate would not detect that case; it silently loses leads across ALL four forms and needs a server-side fix (return non-2xx when contactId is null / create fails). The client-side res.ok + no-swallow fix in Bespoke.tsx and PrivateClientForm.tsx is still correct and needed for the failure modes it does catch: network errors, function crashes (500 from private-client.js:257), 405s, and misdeployments — which currently show 'Received… Expect a personal correspondence shortly' and fire reportInquiryConversion() on a lost lead.

**Recommendation:** Gate success + conversion on res.ok exactly as Contact.tsx does: on failure keep the user on step 3 with the existing house error pattern ('write directly to concierge@matteoperin.com'). One expired HUBSPOT token currently makes every /bespoke and /private-client lead vanish invisibly while analytics reports them as won — a bespoke lead promising a personal reply that never comes is the single worst outcome for this brand.

---

## 3. A quick tap on the mobile logo hijacks visitors into the hidden /vault page 3 seconds later, and blocks scrolling

**UX · impact: high · effort: small**

**Evidence:** src/components/Navigation.tsx:23-41 (3s hold timer that navigates to /vault) and :103-115 (the Link binds BOTH onPointerDown and onTouchStart to startHold). On touch, pointerdown then touchstart each start a timer; holdTimer.current is overwritten, so endHold clears only the second — the first always fires. Measured headless on iPhone viewport (375x812, touch): a quick tap on the centered logo lands on '/' then spontaneously navigates to '/vault' 3s later (pathAfter4s: "/vault"). Line 114 also sets touch-none, killing scroll gestures that start on the logo.

**Verifier corrections:** All cited details were accurate as written. Minor additions from re-measurement: the reproduced tap event order was pointerdown → touchstart → pointerup → pointerleave → touchend → click (pointerleave also calls endHold, but only the second, already-cleared timer); the tap in my reproduction started from /bespoke and still landed on "/" then "/vault" at 4s, matching the finding's numbers exactly. The /vault destination is additionally an access-code-gated page (src/components/Vault.tsx:17-36), so hijacked mobile visitors land on a locked black gate screen.

**Recommendation:** Remove the duplicated onTouchStart/onTouchEnd/onTouchCancel handlers (pointer events already cover touch) so only one timer ever exists, drop touch-none, and gate the 3s vault hold to e.pointerType === 'mouse' so phone users can never trigger it accidentally. The logo is the primary go-home control on mobile; teleporting every visitor who taps it into a dark easter-egg page mid-browse is a credibility disaster for a house selling $185k commissions.

---

## 4. Google Ads inquiry conversion fires on CTA click, not form completion — double/triple-counted leads poison bidding for the $185k campaign

**Conversion · impact: high · effort: small**

**Evidence:** src/components/CrocJacketLanding.tsx:111-113 defines fireConversion() = reportInquiryConversion() (Ads label AW-17701157571/_FdXCPrx3ZkcEMP1yPhB + GA4 generate_lead, src/lib/gtagConversion.ts:6-14). It fires on mere clicks: line 150 (inside handleBuyNow — before Stripe even opens), 481-483 ('Request a Commission Conversation' click that only opens the modal), 508-510 ('Schedule a Private Viewing' click), 678-680 (final-band 'Private Inquiry' click). The same conversion then fires AGAIN on actual successful submit: CrocJacketLanding.tsx:793-794 (viewing form) and InquiryModal.tsx:100 (commission form). A user who clicks 'Secure with $25,000 Deposit' and abandons at Stripe still registers an inquiry conversion; a user who completes the viewing form registers two.

**Verifier corrections:** Two minor precisions: (1) fireConversion() sits at exactly lines 482, 509, 679, and 794 (the cited ranges 481-483/508-510/678-680/793-794 span the surrounding handler lines — substantively correct). (2) The GA4 side is even worse than stated: each click handler also calls fireEvent('generate_lead', ...) (lines 481, 508, 678) immediately before fireConversion(), whose reportInquiryConversion() fires generate_lead again (gtagConversion.ts:13) — so a single modal-opening click emits generate_lead twice, and a click-then-submit flow emits it three times. One caveat that does not overturn the finding: if the Ads conversion action is configured to count 'One per click', same-gclid duplicates would be deduped account-side (unverifiable from the repo), but even then, abandoners who only clicked a button still register as converted leads, which is the Smart Bidding poisoning claim.

**Recommendation:** Remove fireConversion() from the four click handlers (keep only intent events like deposit_initiated); let reportInquiryConversion fire exclusively where a submission verifiably reached the server (CrocJacketLanding.tsx:793-794 and InquiryModal.tsx:100 already do this correctly). Reported 'conversions' roughly halve, but Smart Bidding starts optimizing toward real $185k-qualified inquiries instead of button-clickers.

---

## 5. The lookbook lightbox's only CTA — 'Inquire About Look' — is 100% clipped and unreachable on standard-height phones

**Conversion · impact: high · effort: small**

**Evidence:** src/components/LookbookPage.tsx:326 (modal is max-h-[100vh] ... overflow-hidden), :330 (image fixed h-[60vh]), :355-363 (Inquire button last in a non-scrolling pane). Measured at 375x667 (iPhone SE/8 class): 'Inquire About Look 01' renders at top=669px in a 667px viewport — fully clipped, with zero scrollable ancestors, so it is unreachable. At 375x812 it survives with only 6px to spare (bottom 806/812).

**Verifier corrections:** Minor precision note only: the image pane is not unconditionally fixed at 60vh — before the lightbox image loads, flexbox shrinks it to ~316px and the button is briefly visible (settled top ~585px); once the portrait image loads, min-height:auto (min of content 562px and specified 400px) locks the pane at 400.188px and reflow pushes the button to top=669.2px, fully off-screen at 375x667. On a real phone the image loads within moments, so the practical effect is exactly as claimed — and slightly worse, since the CTA can flash into view and then vanish as the image pops in. All cited numbers (669px top at 667vh, ~6px spare at 812vh, zero scrollable ancestors) were independently reproduced.

**Recommendation:** The lookbooks are the commission funnel for /lookbook/men and /lookbook/women, and on half the phones in circulation the lightbox's only CTA does not exist. Add overflow-y-auto to the details pane (line 345) and shrink the image to h-[50vh] below md, or pin the Inquire button as a sticky bottom bar inside the lightbox (same pattern as DigitalConcierge's sticky input row, DigitalConcierge.tsx:410).

---

## 6. The house's own responsive-webp pipeline is bypassed on its highest-traffic surfaces: 3.14MB of JPEGs on the croc money page, 21.5MB across the lookbooks, and desktop always fetching -lg for card-size slots

**Performance · impact: high · effort: small**

**Evidence:** (1) src/components/CrocJacketLanding.tsx:27-40 hardcodes GALLERY_IMAGES as 12 .jpg files (3,219,008 bytes total) rendered as plain <img> (main image 349-362, thumbnails 386-405) — measured on /bespoke-crocodile-jacket at 390x844: 3.14MB downloads immediately, nine files fetched at natural 1200-1350px to paint 80x96px thumbnails, while all 12 have -sm/-md/-lg.webp variants on disk (sum of -sm.webp = 837,170B, 74% smaller); sibling CrocJacketHero.tsx:150-154 already uses ResponsiveImage. (2) src/constants.ts lookbook arrays: 55 of 91 entries end in .jpg; ResponsiveImage.tsx:24-36 returns a plain full-size <img> for non-.webp src, so both lookbooks pull the originals (sum of all 55 jpgs = 21,493,040 bytes) — every one has webp variants generated (0 missing). (3) ResponsiveImage.tsx:49-51 uses <source media="(min-width:1025px)"> so any desktop gets -lg regardless of slot: measured homepage at 1440x900, 13 Collection -lg.webp files totaling 4,247,358B (WLook4_005-lg.webp 532,618B at 1920x2879px) fill cards rendered at 504x756 CSS px; the same files as -md total 1,058,826B.

**Verifier corrections:** Three small corrections: (a) '55 of 91 entries' — the two lookbook arrays total 78 entries (32 mens + 46 womens), not 91; 91 is reachable only by adding the 13 Collection PRODUCTS images. The 55-jpg count and 21,493,040-byte sum are exact. (b) At a 390px viewport the thumbnails render at 64x80 CSS px (w-16 h-20); the cited 80x96 (md:w-20 md:h-24) applies only at ≥768px — the waste is the same either way. (c) '3.14MB downloads immediately' — the byte sum is 3,219,008 B (3.07 MiB / 3.22 MB decimal), and thumbnails carry loading="lazy" (CrocJacketLanding.tsx:401), so offscreen strip items defer — consistent with the reviewer's own 'nine files fetched'. Bonus in the finding's favor: the -sm variants of the 55 lookbook jpgs measure 9,206-28,458 B (median 16,720 B), so the '20-45KB each' savings estimate is conservative.

**Recommendation:** Three mechanical fixes: switch CrocJacketLanding's GALLERY_IMAGES to .webp bases via ResponsiveImage (thumbnails pinned to -sm, fetchpriority="high" on the selected main image); rename the 55 .jpg extensions in src/constants.ts to .webp; add a maxVariant/sizes prop to ResponsiveImage (Collection cards get -md). Cuts the ad landing page from 3.14MB to ~0.9MB and lookbook looks from ~400KB to 20-45KB each — the money page should be the fastest page on the site, and HNW visitors browse on phones in town (PRODUCT.md:9).

---

## 7. Everything that explains the $25,000 deposit is 10px all-caps at 2.40-4.30:1 contrast — the money block is the least legible text on the site

**Conversion · impact: high · effort: small**

**Evidence:** src/components/CrocJacketLanding.tsx (all measured): line 431 '$185,000 USD — Full Commission' label at #8C8C8C on #F2EFE9 = 2.93:1 at 10px; line 436 'Deposit to Reserve' at matteo-orange/70 = 2.40:1; lines 438-440 deposit terms ('Secure your commission slot today with a $25,000 deposit. Remaining balance due before production begins.') at charcoal/60 = 4.30:1, 10px uppercase; line 442 shipping/tax line 2.93:1; lines 455-457 'Accepting Commissions — Three Per Year' at #CB5C38 = 3.57:1; line 512 'Schedule a Private Viewing' 2.93:1; line 711 mobile bar 'Full price: $185,000' at 10px stone. Lines 493-502 set three full sentences of post-deposit reassurance in 10px all-caps — DESIGN.md line 170 forbids all-caps body copy, and line 117 reserves Playfair italic for exactly this kind of human aside.

**Verifier corrections:** Two ratios were computed against plain cream but the deposit box (line 433) has bg-matteo-orange/5, making the real numbers slightly WORSE than cited: 'Deposit to Reserve' (line 436) is ~2.32:1 (not 2.40:1) and the deposit-terms paragraph (lines 438-440) is ~4.18:1 (not 4.30:1) against the actual tinted background. The 4.30:1 figure is exact for the post-deposit reassurance lines (493-502), which sit on plain cream. Minor line-ref imprecision: the 'Schedule a Private Viewing' label text is on line 514; line 512 is its className carrying text-matteo-stone. All corrections strengthen rather than weaken the finding.

**Recommendation:** Keep 10px tracked caps for the 4-row ledger (lines 519-531), but set the deposit-terms paragraph (438-440), the shipping line (442), and the post-deposit reassurance (493-502) in the house's Italic Aside register — font-serif text-[15px] sentence case at text-matteo-charcoal/80 — and change 'Deposit to Reserve' to a darkened accent #A0421F (5.56:1 on cream, measured). 'Three Per Year' is the single best conversion string on the page; it currently fails AA at 3.57:1. These lines answer 'what happens to my $25,000' and must survive a squint.

---

## 8. The atelier is in Verona on every selling page but 'Milan' in the concierge, vault, and client portal

**Copy / Credibility · impact: high · effort: small**

**Evidence:** DigitalConcierge.tsx:19 loading message 'Accessing the Milan Vault...'; ClientPortal.tsx:14 location 'Milan Atelier'; Vault.tsx:258 ledger Location 'Milan Vault'. Meanwhile every credibility-bearing surface says Verona: TheHouse.tsx:155 'Verona, Italy', TheHouse.tsx:200 'heart of Verona', CrocJacketLanding.tsx:228/264/289 '100 hours of artisanal labor in Verona, Italy', CrocJacketHero.tsx:100 'Bench: One hundred hours, Verona'.

**Verifier corrections:** The finding undercounts: there is a fourth Milan instance the reviewer missed — DossierDashboard.tsx:93 renders "Last updated: Sept 12, 2026 (Milan)" (routed at /dossier-dashboard, App.tsx:314). The fix should cover DigitalConcierge.tsx:19, ClientPortal.tsx:14, Vault.tsx:258, AND DossierDashboard.tsx:93. All other cited file/line references are exact as stated.

**Recommendation:** Provenance is the entire pitch, and the house currently tells two origin stories — a client who chats with the concierge after reading the croc page catches the contradiction in one session. Global-replace Milan with Verona across DigitalConcierge, ClientPortal, and Vault; better, name the actual workshop street/district in Verona once and reuse it verbatim everywhere, the way '164 E Deloney Ave' is reused for Jackson.

---

## 9. Press page meta claims Robb Report coverage that does not exist anywhere in the codebase

**Copy / Credibility · impact: high · effort: small**

**Evidence:** src/components/Press.tsx:11 meta description: 'featured in Robb Report, Private Air Magazine, JH Style, and more' — but PRESS_ARTICLES (src/constants.ts:408-445) contains exactly four items: JH Style, Private Air, Hollywood in Toto, and a Jackson Hole Chamber of Commerce directory listing (constants.ts:436-444, linking to jacksonholechamber.com/listing/). grep 'Robb' returns only this meta tag. The header calls this 'Global Coverage' (Press.tsx:24).

**Verifier corrections:** All citations hold as written. One trivial precision fix: the Chamber directory entry object spans constants.ts:436-445 (closing brace on 445), not 436-444. Grep count: exactly 1 match for 'Robb' in source (src/components/Press.tsx:11); the string also propagates into the production dist bundle since it is compiled from the same source.

**Recommendation:** HNW buyers and their advisors verify press claims; a Google snippet promising Robb Report the page cannot back up reads as fabrication. Remove 'Robb Report' from the meta description (or add the real feature if it exists), drop the Chamber directory listing from the press wall — a chamber listing beside actual journalism cheapens the Travolta feature, the strongest asset here — and replace excerpts like 'Superbly-creative lifestyle designer' (constants.ts:416) with verbatim, attributed pull-quotes.

---

## 10. The house's label color tokens fail AA on every surface: stone 2.93:1 across 77 usages, terracotta eyebrows 3.57:1 codified in DESIGN.json, dark-surface whispers down to 1.77:1

**Accessibility · impact: high · effort: small**

**Evidence:** Computed: #8C8C8C on #F2EFE9 = 2.93:1 (fails AA even for large text) across 77 text-matteo-stone occurrences in 19 components, mostly at text-[10px]/text-xs — including Checkout.tsx:215-218 ('Payment is completed on Stripe's secure page. We never see your card details.' at the moment of a $25,000 charge), Checkout.tsx:188-190, InventoryProductPage.tsx:526-531 ('Complimentary insured delivery… 14-day returns / Authenticity guaranteed' at 10px charcoal/50 = 3.18:1). #CB5C38 on cream = 3.57:1 with ~67 text-matteo-orange labels at 10-11px — the signature eyebrow spec in DESIGN.md:157 and DESIGN.json institutionalizes the failure. On dark: Footer.tsx:159-165 white/40 = 3.81:1 (the Client Dossier gateway link), text-white/30 x19 = 2.71:1, text-white/20 x5 = 1.77:1 (DigitalConcierge.tsx:428). PRODUCT.md:36 and DESIGN.md:173 both flag exactly this weak spot.

**Verifier corrections:** Corrections to an otherwise-accurate finding: (a) orange small-label count — 75 text-matteo-orange usages co-occur with text-[10px]/text-[11px] on the same line (not ~67), plus 22 more at text-xs (12px), all below the 4.5:1 requirement at 3.57:1 on cream; (b) charcoal/50 on cream composites to 3.19:1, not 3.18; (c) white/40 on the footer's bg-matteo-charcoal (#1C1C1C, Footer.tsx:79) = 3.80:1, not 3.81; (d) text-white/30 = 2.60:1 on #0A0A0A surfaces and 2.72:1 on #1C1C1C (the finding's 2.71 matches the charcoal case); (e) the 77 stone usages span 20 files (19 components + App.tsx). Additionally strengthening the claim: ThemeContext.tsx:14-24 permanently disables dark mode, so every stone-on-cream instance renders in the failing light theme with no dark-mode escape hatch, and DESIGN.md's own stated measurement of "~3.1:1" (DESIGN.md:93) is optimistic — the true ratio is 2.93:1, below even the large-text threshold.

**Recommendation:** Split the tokens: add matteo-stone-ink #6B665F (4.96:1 on cream, measured) for all text on cream/sand, keeping #8C8C8C for hairlines and dark surfaces (5.89:1 on #0A0A0A, passes); add matteo-orange-ink #A0421F (5.56:1 on cream) exclusively for eyebrows/labels on light, keeping #CB5C38 for rules, focus rings, and dark surfaces; floor content-bearing dark-surface text at white/60 (7.30:1). Update the eyebrow spec in DESIGN.json so future pages inherit the fix — the annotations qualifying a $185,000 price should not be the hardest text on the site to read.

---

## 11. The Digital Concierge breaks character: raw debug dumps to returning clients, timed browser hijacking, fabricated busyness, and a price line contradicting the croc page

**UX · impact: high · effort: small**

**Evidence:** src/components/DigitalConcierge.tsx:135-138 (verified at :137): when Gemini's welcome-back response fails JSON parsing, the chat displays 'WELCOME BACK JSON FORMAT ERROR: The raw text received was -> ${responseText || 'EMPTY PAYLOAD'}' — fired automatically on open for anyone with saved history (triggerWelcomeBack, lines 71-145). Lines 221-228 auto-navigate the browser to another page 2.5s after certain replies ('Browser Hijacking Logic'). Hardcoded fallbacks fabricate scarcity on any API error: 'Due to the high volume of private commissions today, the Master Tailor is currently in a fitting' (:238), 'The Concierge line is currently saturated' (:242); the pricing fallback says 'exotic outerwear starting at $185,000' (:240) while the croc page sells the flagship AT $185,000 full commission (CrocJacketLanding.tsx:430). Voice: 'Command the Intelligence...' placeholder (:416), 'The Concierge Intelligence' (:428), 'Concierge Analysis' (:340), 'Dossier purged.' (:150).

**Verifier corrections:** Two precision fixes, neither fatal: (1) The debug dump fires only when an HTTP-200 response fails JSON extraction/parsing; outright network/500 errors in triggerWelcomeBack are silently swallowed by the outer catch (DigitalConcierge.tsx:139-144) with no user-visible message at all — a separate small flaw (returning client sees typing indicator, then nothing). (2) The price contradiction is best stated against PRODUCT.md:9 ("up to a $185,000 crocodile jacket" — $185k is the top of the range) and CrocJacketLanding.tsx:430-431 ("$185,000 / USD — Full Commission"): the fallback presents the flagship's exact price as the ENTRY point for exotic outerwear. Bonus inconsistency the finding missed: the inlined catalog fed to Gemini prices the Bespoke Crocodile Jacket at 25000 (api/chat.ts:21), so even successful AI answers can quote the $25k deposit as the piece's price.

**Recommendation:** Reuse the graceful fallback already written at line 200 ('The secure line has experienced interference...') for the welcome-back parse failure and log the error to monitoring only; replace timed auto-navigation with an inline 'View the piece →' link. Rewrite fallbacks as honest concierge notes ('The atelier is offline at this moment — leave your name and the concierge will write to you personally'), fix the price line to match the landing page, and kill 'Command the Intelligence', 'Analysis', and 'purged' — a house speaks like a person, not a mainframe.

---

## 12. The catalog runs on invented placeholder data and template filler — 'Spring Look 05' at $650 with sunglasses copy on a couture gown, every item 'Super 200s Wool from Biella', a literal 'Fabric Detail' placeholder, and 'finest materials' fallbacks

**Copy / Credibility · impact: high · effort: medium**

**Evidence:** src/constants.ts:156-318: PRODUCTS are lookbook photos wearing invented titles/prices — id 5 'Spring Look 05', category Couture, $650, description 'Japanese acetate. Titanium hardware. Clarity and protection.' (eyewear copy on a women's look, lines 206-213); id 11 '$450 … Wild Amazonian Peccary' gloves copy on a tailoring look (271-279). These feed Home's Collection slider (Collection.tsx:82-94) and ProductDetail.tsx, whose fact sheet hardcodes 'Origin: Biella, Italy' and 'Material: Super 200s Wool' for every non-croc item including leather bags (lines 166-183), ships an empty box literally labeled 'Fabric Detail' (134-136), and falls back to 'Crafted from the finest materials available. A testament to Italian heritage...' (line 186). FurnitureCollection.tsx:63 'A masterpiece of Italian comfort'; :398 'sourced from the world's finest mills'. PRODUCT.md:9: these users 'are fluent in luxury codes and immediately detect imitation.'

**Verifier corrections:** Two imprecisions, neither affecting the core claim: (1) The HiddenInventoryTest.tsx ledger at lines 320-324 renders Edition / Status / Colours / Price — not 'hide, hours, bench, edition' as the recommendation states; the ledger pattern exists at those exact lines but with different field names. (2) Minor line drift: id 5 spans constants.ts:204-214 (not 206-213), id 11 spans 270-280 (not 271-279), PRODUCTS array ends at line 319 (not 318); 'sourced from the world's finest mills' spans FurnitureCollection.tsx:397-398. Additionally, the invented $650/$450 prices render with dollar signs on live ProductDetail pages (ProductDetail.tsx:150-153), and the fact sheet also fabricates '65+ Hours' for every non-croc item (line 177).

**Recommendation:** Point the Collection quick-view at the real Google-Sheets-backed inventory (the /shop Current Edit), or strip prices/fact-sheets from the Spring Look tiles and treat them purely as editorial looks with 'Request this look' → InquiryModal (which already accepts a look reference). Delete the 'Fabric Detail' tile, the fabricated Origin/Material grid, and the 'finest materials' fallback — make a per-piece ledger (hide, hours, bench, edition — fields HiddenInventoryTest.tsx:320-324 already renders) a publishing requirement, and name the actual mill in Casa copy.

---

## 13. 'The Vault' access gate accepts any 4+ character passphrase and opens a fake client dashboard with another client's commission

**UX · impact: high · effort: medium**

**Evidence:** src/components/PrivateAccess.tsx:103-106: comment 'Accept MATTEO or any code > 3 chars for demo' and `if (code.length > 3)` grants access after a fake 'VERIFYING IDENTITY...' animation (:165-171 shows ACCESS DENIED/WELCOME in green/red terminal type). It routes to /portal, which renders hardcoded mock data: clientName 'Alessio Rossi', 'Client ID: MP-8842-XJ', a fictional 'Bespoke Cashmere Overcoat, EST. DELIVERY: NOV 12' at 65% complete (ClientPortal.tsx:10-14, 29, 68-69).

**Verifier corrections:** Minor line-range corrections that strengthen the finding: the status messages span PrivateAccess.tsx:164-178 ("VERIFYING IDENTITY..." line 166 in orange, "ACCESS DENIED" line 171 in text-red-500, "WELCOME" line 176 in text-green-500), not :165-171. ClientPortal.tsx also exposes fake client body measurements (lines 105-126: height 188cm, chest 102cm, etc.) and a "Private Allocations / Reserved" section (lines 134-167), compounding the privacy-breach read. Most importantly, the finding understates severity: /portal is directly reachable with no guard whatsoever — visiting matteoperin.com/portal bypasses even the fake 4-character gate, and the mock data is confirmed present in the production bundle (dist/assets/ClientPortal-DUBDingB.js).

**Recommendation:** Any curious visitor or journalist who types 'test' into the by-invitation-only gate is 'verified' and shown another client's commission — the exclusivity is provably theater and the mock data reads as a privacy breach. The house already has a real Supabase auth flow (DossierLogin.tsx:46): point /access at that, or remove the /access, /vault, and /portal routes from App.tsx (306-308) until the portal is real. The particle-network canvas and green terminal text (PrivateAccess.tsx:9-87) are hacker-movie chrome — the DossierLogin dark-cream treatment is the right register.

---

## 14. Homepage buries the $185k flagship at screen 8.5 and the inquiry form near 9,500px, behind a prohibited hero+grid opener and a ~5,300px scroll-jack

**Conversion · impact: high · effort: medium**

**Evidence:** src/components/Home.tsx:23-28 orders DualHero (h-[200vh], DualHero.tsx:77) -> HiddenInventoryTest -> Collection -> CrocJacketHero -> Interlude -> Contact. Measured at 1280x720: document = 14.1 screens; the Collection scroll-jack occupies screens 2.7-8.5 (Collection.tsx:177-183 sets height = maxTranslate*0.55 + viewport ≈ 5,300px for 13 cards at 35vw); CrocJacketHero begins at screen 8.5 — with the Current Edit grid EMPTY locally, so production pushes it deeper — and Contact lands near 9,500px. src/components/HiddenInventoryTest.tsx:170 renders the Current Edit as a symmetric `grid grid-cols-2 lg:grid-cols-4` card grid directly under the hero — the exact 'hero + card grid' composition DESIGN.md line 169 prohibits. DualHero's only CTAs are 12-14px text links (lines 194-229) with no bespoke/commission entry above the fold.

**Verifier corrections:** Four corrections, none fatal: (1) The Collection scroll-jack section height is 4,158px measured (maxTranslate ≈ 6,251px x 0.55 + 720px viewport), not ~5,300px — the finding's own screens figure (2.7-8.5 = 5.8 screens x 720px) is internally consistent with 4,158px, so the 5,300px was a computational slip. (2) The Contact section top measures 7,947px locally (screen 11.04), with the inquiry form at 8,260px and its submit button at 8,873px — "near 9,500px" overstates the local measurement by ~600-1,300px, though a populated production Current Edit grid pushes it deeper toward that figure. (3) DESIGN.md:169's verbatim prohibition is "centered hero + 3-col card grid + testimonial strip"; the homepage embed is a numbered 2-col/4-col grid without a testimonial strip, so "the exact composition prohibited" is a mild overstatement — the stronger citation is PRODUCT.md:21's anti-reference to "interchangeable hero-grid-footer pages". (4) "No bespoke/commission entry above the fold" is true of the hero itself, but the fixed desktop nav does carry a 10px tracked-uppercase "Bespoke" link (src/constants.ts:70, rendered in src/components/Navigation.tsx:144-148 at lg+ breakpoints; hidden behind the hamburger on mobile) — the hero-CTA gap claim stands, but paid/press desktop traffic technically has a one-click bespoke path in the nav.

**Recommendation:** Reorder Home to DualHero -> Current Edit -> CrocJacketHero -> Contact; cut the homepage Current Edit teaser to 2-3 asymmetric numbered-ledger entries reusing the editorial alternating treatment already built for /shop (HiddenInventoryTest.tsx:224-373); shrink or delete the Collection scroll-jack (it duplicates the lookbooks with fake prices). Add a fourth hero link 'Commission' next to 'Shop One-of-One' (DualHero.tsx:218-228) so paid/press traffic reaches the bespoke funnel in one act, not seven.

---

## 15. Six sitemap-indexed Journal articles all render the identical hardcoded essay while /journal itself says 'Coming Soon'

**Copy / Credibility · impact: high · effort: medium**

**Evidence:** dist/sitemap.xml lists /journal plus 6 article URLs (art-of-patina, dolomites-notes, private-air-essentials, vicuna-commission, silent-stitch, urban-armor). src/components/ArticleDetail.tsx:195-260 renders one hardcoded body ('It is in the details that we find the true measure of luxury...', pull-quote at :212) for every slug — only title/date swap (constants.ts:351-406 defines titles and excerpts but no body). The /journal index shows only 'Coming Soon' (Journal.tsx:46) under a meta description promising 'essays on the art of patina, bespoke craftsmanship, exotic materials' (Journal.tsx:16).

**Verifier corrections:** Minor precision fixes only: the hardcoded body spans ArticleDetail.tsx ~197-273 (not 195-260); the opening sentence is at line 198 and the pull-quote at line 212. Sitemap article entries are at dist/sitemap.xml lines 82-116 (also duplicated in public/sitemap.xml). Additional supporting evidence: src/types.ts:21-29 (Article interface lacks a body field), src/services/productService.ts:38-53 (static ARTICLES array is the only data source), and ArticleDetail.tsx:282-316 (Read Next chain cycles through all six identical bodies). The /journal index page links to zero articles, so the duplicate pages are reachable only via sitemap/search or the Read Next loop.

**Recommendation:** A visitor who opens two articles sees identical body text under different headlines — instantly detectable imitation — and Google indexes 6 duplicate pages. Either write the six real essays (the excerpts are good briefs: 'Sourcing the world's rarest fiber for a private client in Geneva' is exactly the concrete provenance storytelling the croc page proves works) or remove the /journal/:slug routes and sitemap entries and hide the footer link (Footer.tsx:110) until content exists. Never ship 'Coming Soon' as a destination on a house selling $185k commissions.

---

## 16. 'The Matteo Perin Story' page contains no Matteo — no biography, no dates, no artisans — and recycles the homepage's two hero photographs

**Copy / Credibility · impact: high · effort: medium**

**Evidence:** TheHouse.tsx:64 titles the page 'The House — The Matteo Perin Story' but the content is an unattributed quote (:105), a Verona/Jackson transition with abstract captions ('Centuries of Italian craftsmanship' :157), and three design pillars — zero biographical facts: no founding year, no training lineage, no named artisans, nothing about the Travolta collaboration already documented on /press (constants.ts:430-434); the hero tagline is 'The Architect of Lifestyle' (:90) and the Verona blurb says 'this is where the alchemy happens' (:200). TheHouse.tsx:121 and 136 reuse hero_grand_estate.jpg and hero_teton_buffalo_v2.jpg — the identical files serving the homepage DualHero (DualHero.tsx:57,63) — as raw full-size JPGs (382,913B + 216,506B) instead of the existing webp variants; lines 21-33 contain a dead video system (videoRef/handleVideoLoaded never attached).

**Verifier corrections:** Line-number corrections: hero_grand_estate.jpg is at TheHouse.tsx:120 (not 121); DualHero.tsx references are lines 57 and 62 (not 63). Substantive correction: DualHero.tsx uses hero_grand_estate.webp and hero_teton_buffalo_v2.webp — the same two photographs but NOT 'the identical files'; TheHouse.tsx serves the .jpg versions. The 'instead of the existing webp variants' framing is backwards as a perf point: the webps are larger (hero_grand_estate.webp 526,712B vs jpg 382,913B; hero_teton_buffalo_v2.webp 245,140B vs jpg 216,506B), so the duplication issue is recycled imagery on the brand-story page, not a missed compression win — drop the webp-swap sub-recommendation. All other cited facts verified exactly: title (:64), unattributed quote (:105, sourced from constants.ts:455), 'The Architect of Lifestyle' (:90), 'Centuries of Italian craftsmanship' (:157), 'alchemy'/'mass production' (:200), Travolta press entry (constants.ts:430-434, surfaced only via /press route at App.tsx:302), dead video handlers (TheHouse.tsx:21-33, no <video> element in the file), house-hero-latest.mp4 = 3,908,449B referenced nowhere in src/, ledger pattern at CrocJacketHero.tsx:96-108, JH Style 'From the Dolomites to Deloney Avenue' at constants.ts:412, and 258MB in public/assets with about/, bespoke/, fabrics/, Finals/ directories present.

**Recommendation:** This is the page where a $185k prospect decides the house is real, and it answers with abstractions and reruns. Add one dated timeline (Verona apprenticeship → celebrity commissions → Deloney Ave) using the ledger aesthetic from CrocJacketHero.tsx:96-108 — the JH Style piece 'From the Dolomites to Deloney Avenue' already tells this arc. Give the Verona layer actual atelier evidence — hands, bench, hides, chalk lines — from the 258MB archive (public/assets: about/, bespoke/, fabrics/, Finals/), cut 'alchemy' and the defensive 'mass production' comparison, and delete or wire the orphaned video handler to house-hero-latest.mp4 (3.9MB, on disk, referenced nowhere).

---

## 17. Homepage first paint is gated by an empty SPA shell, 314KB of duplicated Google tag stacks, unpreloaded fonts, and an opacity-0 hero intro

**Performance · impact: high · effort: medium**

**Evidence:** Measured LCP on / at 1440x900: the 'The Provenance' SPAN at 1,040ms on localhost. dist/index.html #root is empty (no prerendered HTML despite scripts/prerender.mjs); critical JS before the Home chunk = react-vendor 45,879B + framer-motion 42,334B + index 22,987B + router 7,565B gzip; DualHero.tsx:72+156 starts the headline at opacity:0 with a 0.6s fade; playfair-display-latin-400-normal woff2 (21,856B) has no <link rel=preload>. index.html:5-11 loads GTM-PDJX36NL (148,442B gz) AND index.html:13-24 loads standalone gtag/js?id=G-HEBJ5FMBVQ (166,148B gz) — the comment at lines 13-16 admits the GA4 config tag 'is NOT published in the live GTM container'; combined 314KB gz exceeds the entire 119KB app-critical bundle. Also competing in the LCP window: DualHero.tsx:123-128 loads the Layer-2 bison image with loading="eager" though it sits at opacity 0 until 30-60% scroll (230,316B desktop), and SpinningLogo.tsx:20 ships a 68,708B 600x599px PNG rendered at 64x64 (an early LCP candidate at 380ms on mobile).

**Verifier corrections:** Minor precision notes, none material: GTM/gtag gzip payloads measured 148,446B and 166,144B on today's fetch (finding said 148,442B/166,148B — Google-served sizes jitter a few bytes per request; combined ≈314.6KB either way). Independent LCP run at 1440x900 localhost gave the same final LCP element (the 'Provenance' SPAN) at 824ms rather than 1,040ms, with logo-seal.png as an intermediate LCP candidate at 660ms on desktop (the finding's 380ms figure was for mobile, which I did not separately reproduce). Sum of the four critical chunks is 118,765B gz (≈119KB as claimed). All file/line citations (index.html:5-11/13-24, DualHero.tsx:72/156/123-128 with natureOpacity at line 27, SpinningLogo.tsx:20, Navigation.tsx:117-118) are accurate.

**Recommendation:** Fix the chain: (1) preload the two brand woff2 files in index.html; (2) render the DualHero h1 visible on first paint and animate a wrapper transform/clip instead of opacity; (3) verify the puppeteer prerender actually emits dist/<route>/index.html on Vercel — this build has none, so crawlers and first paint get an empty shell; (4) publish the GA4 config inside GTM and delete the standalone gtag.js block (keep the inline dataLayer stub so existing conversion calls keep working); (5) lazy-load the hidden second hero layer and export a ~5KB 128px webp for the nav logo.

---

## 18. The Private Client intake page runs a rogue gold design system — the exact 'old-money' palette the brief forbids — with contrast down to 1.70:1

**Visual / Editorial · impact: high · effort: medium**

**Evidence:** src/components/PrivateClientForm.tsx is built on an off-palette system: gold #c49a6c x25 (eyebrows line 82, progress bar 204, submit button 511), brown ink #2a2520 x20, background #FAF8F5 (line 194, not atelier-cream #F2EFE9), plus #c8c0b4, #8a8078, #a09890, #0e0d0c — none in DESIGN.md's palette. Contrast: gold eyebrows 2.42:1 on #FAF8F5 (line 82), step indicator #c8c0b4 = 1.70:1 (line 223), form labels #a09890 = 2.68:1 (line 372). DESIGN.md line 172 forbids gold; line 96 (One Flame Rule) names terracotta the only accent.

**Verifier corrections:** Two imprecisions, neither fatal. (1) Line 511 is not the submit button — it is the thank-you screen's gold-filled "View Available Creations" CTA (an <a href="/shop"> with bg-[#c49a6c]); the actual submit button is line 486, bg-[#2a2520] with hover:bg-[#c49a6c] (still a gold hover flood). (2) The recommendation cites tokens that do not exist in the repo: there is no #A0421F anywhere and no "stone-ink" token. The real Tailwind tokens (tailwind.config.js:14-18) are matteo-orange #CB5C38, matteo-cream #F2EFE9, matteo-charcoal #1C1C1C, matteo-stone #8C8C8C. The substance survives: #CB5C38 on cream #F2EFE9 measures ~3.57:1 (computed), so small terracotta text would indeed need a darkened variant (a new token such as the proposed #A0421F), and DESIGN.md:93 already mandates darkening stone toward #6E6E6E below 14px — so map #a09890/#8a8078/#c8c0b4 to matteo-stone darkened per that rule, not to a nonexistent "stone-ink" token.

**Recommendation:** This is the HNW qualification funnel — the one page where a fluent luxury reader will smell a different hand. Retoken wholesale: #c49a6c → matteo-orange (#A0421F for text-on-light), #2a2520 → matteo-charcoal, #FAF8F5 → matteo-cream, #a09890/#8a8078/#c8c0b4 → the stone-ink token. The page's structure (serif mega-inputs, one question per screen) is excellent and on-brief; only its palette betrays the house.

---

## 19. On mobile the lookbooks break: parallax slides garments over their own captions, and the editorial voice (pull-quotes) is deleted below lg

**Visual / Editorial · impact: high · effort: medium**

**Evidence:** src/components/LookbookPage.tsx:53-79 — featureY/rightY/leftY useTransform offsets (0..100, 0..-150, 0..-50px) apply to every item with no breakpoint or reduced-motion gate (the md:-mt-32 layout offsets ARE gated, the motion values are not). Measured at 375x812 deep-scrolled: 7 consecutive look pairs overlap by 72.7-103.2px — images ride over the 'Commission / Look N' captions above them. The pull quotes — the only typographic interruptions — are hidden lg:block (line 98), so phones (the stated in-town browsing context, PRODUCT.md:9) see an unbroken column of same-ratio portraits: feature and standard items are both aspect-[2/3] (line 106; the isFeature branch changes only shadow depth) and every look carries the identical caption 'Commission / Look NN' (lines 127-128, 162) with no material or price.

**Verifier corrections:** Measured at 375x812 on /lookbook/men (32 items, 24,709px page): framer-motion parallax is active on mobile (e.g. feature item at translateY(+100), following right-aligned item at translateY(-150)). 5 of the 7 feature→right adjacent pairs overlap — 11.2px (pair 10-11), 50.6px (15-16), 90.1px (20-21), 116.3px (25-26), 154.0px (30-31) — growing with scroll depth because all items share one container-scroll progress; the first two pairs near the top do not overlap. Deep-scrolled (past ~60% of the page) overlaps are 90-154px, and in every case the rising image covers the full 'Commission / Look N' caption of the item above (caption overlap equals item overlap). The claimed '7 consecutive pairs at 72.7-103.2px' overstates the count and understates the worst overlap; the mechanism, location, and magnitude class are correct.

**Recommendation:** Gate parallaxStyle to window.innerWidth >= 768 exactly as the house already does in ParallaxImage.tsx:46 ('Disable parallax on mobile') and skip it under useReducedMotion(). Render the quotes as in-flow typographic breaks on mobile instead of deleting them, let isFeature looks break full-bleed (w-screen, occasional 16:9 or square crop) with the look number at display scale, and replace the generic 'Commission' eyebrow with each piece's material line from the archive.

---

## 20. The $185,000 landing page opens as a generic luxury-ecommerce PDP whose gallery controls are also invisible on touch — the homepage teaser out-dresses the ad destination

**Visual / Editorial · impact: high · effort: large**

**Evidence:** src/components/CrocJacketLanding.tsx:336-405 — thumbnail strip (12 ring-highlighted 64x80 thumbs, lines 386-405) + boxed aspect-[3/4] main image + sticky right buy column + accordions inside a px-4->xl:px-24 container (line 323); the H1 renders at text-4xl->6xl (line 423) versus the homepage hero's measured 128px display type — PRODUCT.md anti-reference #1 ('interchangeable hero-grid-footer pages') describes this fold exactly. On touch: prev/next buttons (lines 373, 379) use 'opacity-0 group-hover:opacity-100' with no md: gating — measured computed opacity '0' on touch emulation, invisible but tappable, and only 40x40px (brief requires >=44px); zoom is mouse-only (onMouseEnter/onMouseMove, 344-346). Phone visitors can only navigate 100+ hours of craft via 64px thumbnails.

**Verifier corrections:** Two small precision fixes, neither weakening the claim: (1) only the selected thumbnail is ring-highlighted (ring-2 ring-matteo-orange, lines 391-395); the other 11 render at opacity-50 — 'ring-highlighted' describes the selection mechanic, not all 12 at once. (2) The 128px measurement belongs to the DualHero homepage hero (text-9xl at lg, DualHero.tsx:161); the croc homepage teaser section itself (CrocJacketHero.tsx:174) peaks at 2xl:text-7xl (72px) in an editorial 7/5 full-width grid — still larger and more editorially composed than the landing page's 60px boxed-PDP H1, so 'the teaser out-dresses the destination' stands.

**Recommendation:** Open full-bleed: matteo_croc_new_1 edge-to-edge at 100svh, title at the DualHero's text-8xl/9xl scale, the existing four-line Ledger (Hide/Patina/Bench/Edition, lines 519-531) overlaid as the scarcity device; let the sticky buy rail arrive on first scroll and restage the thumbnails as a numbered contact-sheet band (01-12), keeping the deposit CTA inside the full-bleed frame. For touch, copy the pattern already solved in HiddenInventoryTest.tsx:270 ('opacity-100 md:opacity-0 md:group-hover/card:opacity-100'), bump arrows to w-11 h-11, and add horizontal swipe on the main image.

---

## 21. 'SERIOUS INQUIRIES ONLY' greets the buyer who just clicked a $185,000 CTA — all-caps gatekeeping the brief explicitly prohibits

**Copy / Credibility · impact: medium · effort: small**

**Evidence:** src/components/InquiryModal.tsx:152 (verified): the modal heading renders 'SERIOUS INQUIRIES ONLY' in Playfair at text-4xl whenever selectedProduct.title === 'Bespoke Crocodile Jacket' — i.e., precisely for users who clicked 'Request a Commission Conversation' on the croc landing page (CrocJacketLanding.tsx:483). PRODUCT.md:19-24 forbids 'loud fashion-hype … all-caps shouting'; DESIGN.md:170 repeats it. Tonally inverted: the CTA promised a 'conversation' and the modal answers with a bouncer's sign.

**Verifier corrections:** src/components/InquiryModal.tsx:151-152: h2 className 'font-serif text-2xl md:text-4xl' renders 'SERIOUS INQUIRIES ONLY' whenever selectedProduct?.title === 'Bespoke Crocodile Jacket' (Playfair at text-4xl on md+ screens, text-2xl on mobile). Triggered by CrocJacketLanding.tsx:479-488 — the 'Request a Commission Conversation' button (label at line 487) calls openInquiry(crocJacket) at line 483, where crocJacket = PRODUCTS.find(p => p.id === 14) (line 103) with title 'Bespoke Crocodile Jacket' (src/constants.ts:304-305). PRODUCT.md:22 (anti-references block, lines 19-24) prohibits 'Loud fashion-hype / streetwear energy (drops, countdowns, neon, all-caps shouting)'; DESIGN.md:170 says 'no all-caps body copy' (technically body copy, but PRODUCT.md's prohibition is unqualified). The quiet scarcity qualifier 'Three commissions accepted per year' already renders croc-only at InquiryModal.tsx:177-181, and 'senior client advisor' process copy exists at InquiryModal.tsx:170 and CrocJacketLanding.tsx:494, so replacing the shout with the existing house voice requires no new elements.

**Recommendation:** Replace with the house voice already used in the same modal: serif 'The Commission Conversation' with the existing quiet qualifier below (lines 178-180, 'Three commissions accepted per year' already does the scarcity work correctly). Qualification for a bespoke house is expressed through process ('a senior advisor will call you'), never through shouting at the patron at the exact moment they raise their hand.

---

## 22. The homepage's one dark cinematic act plays a video file that does not exist — 'The Core' renders as a dead black band on every visit

**Visual / Editorial · impact: medium · effort: small**

**Evidence:** src/components/Interlude.tsx:22 (verified) sources /assets/videos/core_background.mp4; public/assets/videos does not exist (only casa-hero-latest.mp4 and house-hero-latest.mp4 exist under public/assets; the dev server returns the SPA HTML fallback for the URL; dist/assets/videos is absent from the production build — in production the vercel.json rewrite excludes /assets/ so it 404s). With preload="none" and no poster, the section is a flat #050505 rectangle with the 'You do not wear it for the room' quote — the comment 'Cinematic Video Background' (line 9) has never been true in any build.

**Verifier corrections:** Two trivial imprecisions, neither weakening the claim: (1) "Generated Video April 11, 2026 - 8_00PM (2).mp4" is 3,598,646 bytes (3.6 MB, not 3.5 MB) and lives at public/ root (shipping to dist/ root), not under public/assets — so "only casa-hero and house-hero exist under public/assets" remains exactly true. (2) The title's "dead black band" is slightly overstated: the white quote text and "The Core" label still render over the flat #050505 background — the evidence body already describes this correctly; only the failed cinematic video layer is invisible.

**Recommendation:** Point the source at an asset that exists — public/assets/casa-hero-latest.mp4 (4.3MB) is on disk and unused by Home — with a poster frame; or drop the video entirely and restage the quote over a full-bleed grayscale crocodile-texture macro so the dark act reads deliberate rather than broken. While in there: FurnitureCollection.tsx:343-357 preloads that same 4.3MB video with preload="auto" despite having a poster — set preload="metadata" — and house-hero-latest.mp4 (3.9MB) plus 'Generated Video April 11, 2026 - 8_00PM (2).mp4' (3.5MB) ship in every deploy while referenced nowhere.

---

## 23. Browser back navigation resets scroll to the top of every page, breaking the browse-compare loop on 14-screen editorial pages

**UX · impact: medium · effort: small**

**Evidence:** src/App.tsx:213-240 — ScrollToTop's effect fires on every pathname change with no navigationType check and calls window.scrollTo(0,0) at STITCH_COVER_MS+30ms, defeating native scroll restoration. Measured on mobile viewport: scrolled to y=2500 on the homepage, navigated to /press, pressed back — landed on '/' at y=0.

**Verifier corrections:** Core evidence accurate. Precision fixes: (1) the forced resets are specifically App.tsx:219 (first navigation) and App.tsx:224 (the setTimeout(() => window.scrollTo(0,0), STITCH_COVER_MS + 30) that fires on every subsequent pathname change, POP included); STITCH_COVER_MS = 420ms per src/components/StitchTransition.tsx:16, so the reset lands ~450ms after back-navigation. (2) The '~14 screens' homepage figure is not re-measurable locally because the inline shop ledger (HiddenInventoryTest, Home.tsx:24) loads inventory from an API that returns 500 without secrets; however Home stacks six full-bleed editorial sections (DualHero, HiddenInventoryTest, Collection, CrocJacketHero, Interlude, Contact — Home.tsx:23-28), so the long-page premise stands even if the exact screen count is unverified. (3) One implementation caveat to carry into the fix: with AnimatePresence mode="wait" (App.tsx:290) plus lazy routes, native restoration on POP may settle progressively as the restored page lays out, but the 420ms stitch cover hides that jump — which the recommendation already anticipates ('under the stitch panels'). Also verified feasibility: react-router-dom 6.22.3 (package.json:25) provides useNavigationType.

**Recommendation:** HNW visitors browsing long editorial pages (the homepage is ~14 screens; the shop ledger similar) lose their place every time they peek at a piece and come back — the exact browse-compare loop a one-of-one inventory invites. Use useNavigationType() from react-router-dom in ScrollToTop and skip the scrollTo(0,0) (and the stitch-timed reset) when the type is POP, letting the browser restore position under the stitch panels.

---

## 24. The published shipping/returns policy is an unconfirmed draft, and it contradicts the one-atelier story by claiming pieces are 'packed by hand at our Jackson Hole atelier'

**Copy / Credibility · impact: medium · effort: small**

**Evidence:** ClientServices.tsx:9-10 code comment: 'NOTE FOR THE HOUSE: the return window and terms below are a sensible draft — confirm them with Matteo before treating them as policy.' The live page nonetheless commits to binding terms: 14-day returns with insured collection (:63-66), $120 priority express (:52), 5-7 day worldwide delivery (:51). Line :55 says 'packed by hand at our Jackson Hole atelier' while :77 says 'handcrafted in Italy' and TheHouse.tsx:207-209 defines Jackson as 'The Showroom — our only physical retail outpost.'

**Verifier corrections:** ClientServices.tsx:9-10 draft comment verified verbatim; binding terms at :51 (5-7 business days worldwide), :52 ($120 priority express), :55 ('packed by hand at our Jackson Hole atelier'), :63-66 (14-day returns, insured collection), :77 ('handcrafted in Italy') all confirmed and all present in production bundle dist/assets/ClientServices-iqja15Mg.js. Correction 1: the warning comment itself is build-stripped (grep count 0 in dist) — the unconfirmed draft TERMS shipped to production, not the flag. Correction 2: the contradiction runs the other way from the finding's framing. TheHouse.tsx:197-198/206-209 is the ONLY page defining Verona as 'The Atelier' and Jackson as 'The Showroom — our only physical retail outpost'; at least six other locations plus PRODUCT.md:13 call Jackson Hole the atelier (index.html:59; Archive.tsx:158,161; DualHero.tsx:190; Home.tsx:19; HiddenInventoryTest.tsx:106; InventoryProductPage.tsx:194). The house-level fix is to pick one taxonomy — either align TheHouse.tsx with the sitewide 'Jackson Hole atelier' voice, or sweep all seven Jackson-atelier references (including ClientServices:55) to 'showroom' — not the single-line edit the finding proposes. The Matteo sign-off recommendation on the 14-day/$120/5-7-day terms stands unchanged.

**Recommendation:** These are consumer-contract statements a buyer's assistant will hold the house to; shipping a guessed 14-day window on five-figure pieces is legal and credibility exposure — the draft flag has already shipped to production. Get Matteo's sign-off on the numbers now, and change 'Jackson Hole atelier' to 'Jackson Hole showroom' to preserve the atelier-in-Verona story the rest of the site tells.

---

## 25. The homepage opening act shows no garment and speaks in self-praise: landscape-only 200vh hero, 'BORN IN EXCELLENCE', 14px CTAs, then 5.8 screens of anonymous carousel with a SaaS percentage counter

**Visual / Editorial · impact: medium · effort: medium**

**Evidence:** src/components/DualHero.tsx:56-65 — both hero layers are landscapes (hero_grand_estate, hero_teton_buffalo_v2); no clothing, leather, or hands appear in the 200vh scroll-jack; headlines are abstract nouns ('The Provenance'/'The Resilience', 161-178) under the subtitle 'BORN IN EXCELLENCE' (:58) — the house's own voice line is 'True luxury whispers' (constants.ts:449). The only commerce CTAs are 12-14px underline links (194-228, measured 14px) with 'Shop One-of-One' given identical weight to 'Man'/'Woman'. Collection.tsx:293-313 then renders 4158px (5.8 screens at 720px) of cards showing only image + hover tint — names, prices ($4,200) and material copy exist in constants.ts:156-213 but appear nowhere outside the Quick View modal — decorated with a 'NN%' scroll-progress readout (264-268) and perspective tilt-on-hover (48-54), the exact effects DESIGN.md bans ('drama comes from scale, contrast, and rhythm, not effects').

**Verifier corrections:** Three corrections: (1) The banned-effects quote 'drama comes from scale, contrast, and rhythm, not effects' is PRODUCT.md line 30 (Design Principle 3), not DESIGN.md; DESIGN.md's motion rules (700-1400ms ease-out reveals, honor prefers-reduced-motion, lines 79/165) still condemn the 0.15s tilt at Collection.tsx:52, which has no reduced-motion guard. (2) The homepage sequence is hero → embedded 'Current Edit' (Home.tsx:24) → Collection carousel: the Current Edit already shows named, priced, №-numbered garments (HiddenInventoryTest.tsx:205-218), so the carousel is act 3, not act 2 — however this section is fetched from the live inventory API and renders null during loading and on error (lines 146-166), so the hero itself remains garment-free and the 4158px carousel remains fully anonymous regardless. (3) The finding understates the price problem: prices never render even inside the Quick View modal (Collection.tsx:392-419 shows only category, title, description) — the $4,200 at constants.ts:162 appears nowhere in the entire Collection section. Minor nuance: 'Shop One-of-One' is not pixel-identical to 'Man'/'Woman' (it carries a persistent terracotta underline at DualHero.tsx:226 and full-opacity white), but it is the same 12-14px tracked-uppercase text link with no primary-button weight.

**Recommendation:** Violates principle 2 ('the garment is the hero'). Make one hero layer a material frame — a crocodile-scale or stitch macro crossfading into the Teton landscape so provenance-to-product is told in the crossfade — and swap the eyebrows for concrete geography: 'MADE IN VERONA' / 'PROVEN IN THE TETONS'. Give 'Shop One-of-One' primary weight (the ghost-button treatment from HiddenInventoryTest.tsx:138). In the Collection, caption each panel as a ledger plate (№ 01, Playfair title, price), replace the percentage with plate numerals, and delete TiltCard — five screens of scroll must buy identification and desire, not an anonymous carousel.

---

## 26. The /bespoke funnel hides its CTA for ~7 screens, then speaks spy-thriller and issues a phantom reference number the house cannot look up

**Conversion · impact: medium · effort: medium**

**Evidence:** src/components/Bespoke.tsx:146-175: the full-viewport hero has zero CTA; the single 'Request Consultation' button lives at 298-307, after four process sections and the materials lab — roughly 6-7 viewports deep — then opens a modal whose step 0 is a second intro requiring another click ('Begin Interview →', 345-361) before Name, Vision, and email (step 3, 421-458). Microcopy: 'Transmit Dossier' (:470), 'End Session' (:335), 'Close Line' (:497), 'This secure channel connects directly to our atelier in Italy' (:356 — it posts to a HubSpot endpoint). Line :73 generates `REQ-${Math.floor(Math.random()*10000)}` client-side; the success screen says 'We have secured your request REQ-XXXX' (:490) but handleSubmit (:100-113) never sends refNo to the API — the number exists nowhere but that screen. Step 02 copy repeats itself ('A second skin, drafted from zero. This is the blueprint of your second skin', :27) and the only number on the page is '50+ hours' (:41) — versus the croc page's 40 measurements, 1-in-100 hides, 8-12 weeks (CrocJacketLanding.tsx:543-622).

**Verifier corrections:** Two small precision fixes: (1) handleSubmit spans Bespoke.tsx:89-131; lines 100-114 are the fetch call within it whose JSON body omits refNo (the finding cited ":100-113"). (2) DigitalConcierge.tsx:240 reads "Pieces generally begin at $15,000, with exotic outerwear starting at $185,000" — "Pieces," not "commissions." Also, "8-12 weeks" on the croc page is at CrocJacketLanding.tsx:574 (within the cited 543-622 range) and repeated at :627. Core claims all hold as stated.

**Recommendation:** Add a quiet ghost button in the hero jumping straight to step 1 (setStep(1) on open, as location.state?.inquire already does at :57) and delete the redundant step-0 intro. Either include refNo in the API payload and HubSpot note or drop it for a real promise ('Expect a personal note from the atelier within 24 hours'). Rename spy verbs to house language ('Begin' / 'Send to the Atelier'), fix the doubled sentence, and give each phase one verifiable fact (measurements, fittings, weeks) plus the concierge's own price anchor ('commissions generally begin at $15,000', DigitalConcierge.tsx:240) so qualified buyers self-select.

---

## 27. Checkout integrity at the price point: $25k-$65k is card-only with no wire path, and one-of-one pieces can be double-charged via Add-to-Bag then Buy-Now

**Conversion · impact: medium · effort: medium**

**Evidence:** api/create-checkout-session.js:138 (verified): payment_method_types: ['card'] for both the fixed $25,000 deposit (lines 6-8) and physical orders up to $65,000 (constants.ts:321-349); Checkout.tsx:215-218 promises only 'Apple Pay, Google Pay, and all major cards' — most card limits decline at this level and no alternative rail is mentioned anywhere. Separately, src/components/InventoryProductPage.tsx:111: variationToProduct() assigns id: Date.now(), so CartContext's duplicate check (CartContext.tsx:49) never matches; handleBuyNow (136-143) calls addToCart again, so Add-to-Bag → Buy-Now produces two line items of the same stock-1 piece, and create-checkout-session.js:108-109 caps quantity per line item only — two lines pass through and Stripe charges twice.

**Verifier corrections:** Two corrections, neither fatal: (1) 'physical orders up to $65,000 (constants.ts:321-349)' is wrong as exposure evidence — those lines are VAULT_ITEMS, which are inquiry-only (Vault.tsx:266 'Inquire About Piece' is the only CTA; grep shows addToCart is used solely in InventoryProductPage.tsx). The $65k Himalayan Weekender never reaches Stripe checkout. The verified card-only exposure is the fixed $25,000 deposit (create-checkout-session.js:6-8, 138) plus live Google-Sheets inventory pieces whose prices are server-resolved and not in constants.ts. (2) 'Stripe charges twice' overstates the mechanics: Add-to-Bag then Buy-Now yields two line items of the same one-of-one piece inside ONE checkout session, so the collector is charged once at double the price for a single physical unit — same business outcome (phantom second unit sold, refund required), different mechanism. All other citations verified exact: payment_method_types ['card'] at line 138; per-line quantity cap at lines 107-109 with no aggregation; id: Date.now() at InventoryProductPage.tsx:111; dedupe check at CartContext.tsx:49; handleBuyNow at 136-143; 'Apple Pay, Google Pay, and all major cards accepted.' at Checkout.tsx:215-218; zero matches for wire/bank-transfer/us_bank_account/customer_balance across src/ and api/.

**Recommendation:** (1) Add a quiet line under the deposit CTA and on /checkout: 'Prefer to reserve by bank transfer? Write to concierge@matteoperin.com or call 307.264.9655', and enable Stripe customer_balance/us_bank_account for the deposit session. (2) Derive a stable id from the variation (slugify(parentName + styleName)) so CartContext dedupes, make handleBuyNow skip addToCart when already in the bag, and aggregate quantities per variation server-side before the stock cap. Refunding a collector because the house sold them a phantom second unit of a one-of-one is a brand wound, not just a bug.

---

## 28. PRODUCT.md's two explicit accessibility mandates are unmet: prefers-reduced-motion covers only 2 components, and core touch targets measure 40x24, 36x36, and 10x10px

**Accessibility · impact: medium · effort: medium**

**Evidence:** Reduced motion: useReducedMotion appears only in App.tsx:254 and StitchTransition.tsx:26; index.css:109-129 covers only .reveal-hidden and animate-* utilities. Measured with prefers-reduced-motion: reduce emulated: TextReveal word spans still carry translateY(39.6px) with 1s transitions (TextReveal.tsx:47-55); DualHero's 200vh scrollytelling (DualHero.tsx:13-37) and LookbookPage's useSpring parallax have no guard. Touch targets (PRODUCT.md:36 requires >=44px): hamburger 40x24px (Navigation.tsx:172-181), bag 36x36px (Navigation.tsx:157-170) — the two most-tapped mobile controls — and furniture lightbox dots 10x10px (FurnitureCollection.tsx:1040-1049). The mobile menu overlay (Navigation.tsx:188-215) has no role/aria-modal/focus management — measured with menu open: role=null, activeElement stays BODY — although the codebase already ships src/lib/useModalA11y.ts, used in InquiryModal.tsx:68; Collection's quick-view drawer (:360-424) has the same gap.

**Verifier corrections:** Three details need correction, all in the direction of the claim holding or being understated: (1) Furniture lightbox dots (FurnitureCollection.tsx:1041-1048) are w-2 h-2 = 8x8px layout boxes, not 10x10px — 10px is only the active dot's scale-125 visual size; the tap target is even smaller than claimed. (2) The mobile menu is not entirely unmanaged: Escape-to-close is wired at Navigation.tsx:67-73; the missing pieces are exactly role/aria-modal/focus-trap/focus-return as stated. (3) The DualHero 200vh figure lives at DualHero.tsx:77 (h-[200vh]) rather than lines 13-37 (which hold the useScroll/useSpring hooks); an in-code comment wrongly says 300vh, but 200vh is correct. Fix caveat: MotionConfig reducedMotion="user" will not neutralize DualHero's useScroll/useTransform style bindings — DualHero needs the same matchMedia/useReducedMotion hand-guard the recommendation already prescribes for TextReveal and LookbookPage.

**Recommendation:** Wrap the app in framer's <MotionConfig reducedMotion="user"> in App.tsx to neutralize every motion.* animation in one line, then fix TextReveal and LookbookPage by hand via matchMedia. Add min-w-[44px] min-h-[44px] with flex centering to the hamburger and bag (visual weight unchanged), wrap each furniture dot in a p-[17px] button, and apply the house's own useModalA11y hook plus role="dialog" aria-modal="true" to the mobile menu and Collection quick-view. PRODUCT.md:36 mandates all of this explicitly.

---

## 29. Off-system tokens leak into the commission funnel: a third typeface (system monospace), terminal red/green, 36 cool grays, 23 type sizes, and 14 eyebrow permutations

**Visual / Editorial · impact: medium · effort: medium**

**Evidence:** font-mono x20 across Bespoke.tsx (158, 210, 253, 373, 402, 430 — the commission form's step labels '01 / The Patron'), TheHouse.tsx (197, 206, 249), PrivateAccess.tsx (149, 165-175 with text-red-500/text-green-500 status colors), ClientPortal.tsx x5 — font-mono is not in tailwind.config.js fontFamily, so Windows renders Consolas. 36 text-gray-* occurrences across 13 files violate DESIGN.md:98 ('never cool gray'). The signature eyebrow renders in 14 distinct size×tracking permutations; the most common tracking (tracking-widest = 0.1em, 115 occurrences) is half DESIGN.md's 0.2-0.4em spec minimum, and labels render at Montserrat 400 where DESIGN.json specifies 500 (font-medium appears only 5x against ~230 text-[10px] labels). 23 distinct text-size classes exist — 11 in the display register alone — against DESIGN.json's 4; zero clamp() font-sizes despite the spec's fluid display, and leading-relaxed-luxury (tailwind.config.js:29) is used 0 times.

**Verifier corrections:** Three imprecisions, none material: (1) text-gray-* is 36 occurrences across 11 files, not 13 (ArticleDetail 6, CartSidebar 5, ClientPortal 7, Collection 3, InventoryProductPage 7, HiddenInventoryTest 2, InquiryModal 2, Contact/Lifestyle/PrivateAccess/ProductDetail 1 each). (2) tracking-widest is 117 occurrences in src/, not 115. (3) 'leading-relaxed-luxury used 0 times' is wrong — it is used exactly once, on the <body> tag at index.html:153, and index.html is in the tailwind content globs so it is active globally as the default body line-height; the tailwind.config.js:29 token reference is correct. (4) The Montserrat-500 label weight and 4-register type scale live in DESIGN.md's YAML frontmatter (lines 12-33, label fontWeight: 500 at line 31) and DESIGN.md:112 — not in DESIGN.json, whose typographyMeta only carries the '10px Montserrat, 0.2-0.4em tracking' purpose string. (5) Size×tracking permutations number 20+, not 14 — the claim understates the sprawl.

**Recommendation:** Micro-typography is the product here ('craft in the details'), and the house whisper currently has 14 accents plus a Consolas dossier voice. Replace every font-mono with the house label register (font-sans text-[10px] tracking-[0.2em] tabular-nums — the 'ledger aesthetic' PRODUCT.md asks for should come from tabular Montserrat, not a terminal). Swap red/green states for terracotta-family per DESIGN.md:150, map text-gray-* to the warm tokens, create .label and .label-eyebrow component classes in index.css (Montserrat 500, 0.25em/0.4em), and define three fluid clamp() display tokens to collapse the 11 display sizes and remove the visible md/lg jump cuts in DualHero.

---

