# AdMob setup (what Tirth does, and what is already in the app)

Last updated: 2026-11-17

Placement plan: `improvement-plan.md` section 4. Open question 1n (ads change the privacy promise and need the Play Store) is still to be accepted.

## Your steps (on the AdMob website, about 20 minutes)
1. Sign in at https://admob.google.com with a Google account you want to own the ads income (use a normal personal or business account, not Drashti's).
2. Choose country India, time zone and currency, accept the terms.
3. **Apps, Add app**: platform Android. If it asks "is it published?", say **No** (add it now, link to the Play listing later). Name it "Cycle Saathi". Copy the **App ID** (looks like `ca-app-pub-1234567890123456~1234567890`).
4. In that app, **Ad units, Add ad unit**, make four and copy each **Ad unit ID** (`ca-app-pub-…/…`):
   - Banner, name "today-calendar-cycles-banner"
   - Native advanced, name "cycles-list-native"
   - Interstitial, name "after-report"
   - Rewarded, name "no-ads-3-days"
5. **Privacy & messaging**: create a **GDPR/consent message** (Google's consent form; also covers Indian users who choose to see it) and turn on the "US states" message only if needed later.
6. **Payments**: add your payment profile and tax details (India needs the PAN). Payout starts after the threshold.
7. **Blocking controls**: block categories (dating, gambling, alcohol) and decide on pregnancy and fertility products with Drashti. Set the maximum ad content rating to PG.
8. Send me the App ID and the four ad unit IDs (they are public identifiers, not secrets). Never send the AdMob password.

Later, once the app is on Google Play: add a developer website to the Play listing and host `app-ads.txt` there (AdMob gives you the line), so AdMob can verify the app.

## Already in the app (done 2026-11-17, ads OFF)
- Library `react-native-google-mobile-ads` installed; config plugin set in `app/app.json` with Google's public **test** app IDs.
- `app/src/config/ads.ts`: `ADS_ENABLED = false`, test ad unit IDs, a place for the real ones, and the rules (1 full-screen ad a day, none in the first 3 days, PG rating, non-personalised).
- `app/src/ads/init.ts`: starts consent and the SDK only when ads are on; skipped in the browser preview (`library.web.ts`).
- Nothing is shown anywhere yet. Placements get added later.

## When you send the real IDs I will
Put the App ID in `app.json`, the four unit IDs in `config/ads.ts`, update the privacy wording (two places in the app), and build ad components in the places listed in the plan. Tester builds for Drashti keep ads off or on test ads.
