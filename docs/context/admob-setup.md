# AdMob setup: complete guide, from the app to the ad units

Last updated: 2026-11-17

Decision (Tirth, 2026-11-17): ads are accepted, including the privacy wording change and the Play Store listing. He already has an AdMob account. **For now only Google's TEST ads are used.** Placement plan: `improvement-plan.md` section 4.

## Status (2026-11-17): IDs received and stored
Tirth created the app and all six units. The IDs are in `app/src/config/ads.ts` (`REAL_APP_ID`, `REAL_AD_UNITS`, `REAL_EXTRA_UNITS`). Ads are still OFF and every debug or tester build uses Google's test IDs. **To switch on later:** put `REAL_APP_ID` into `app/app.json` (`androidAppId`; it is still the test App ID so tester builds never touch real ads), set `ADS_ENABLED = true`, reword the privacy lines, build the placements. Still open: consent message, payments, blocking controls, Play listing and `app-ads.txt`.

## 0. The big picture (read once)
| Piece | Where | Status |
|---|---|---|
| Library and plugin | `app/package.json`, `app/app.json` (`androidAppId`) | Done, test App ID |
| On/off switch, ad unit ids, rules | `app/src/config/ads.ts` (`ADS_ENABLED`, `TEST_AD_UNITS`, `REAL_AD_UNITS`, `ADS_RULES`) | Done, ads OFF |
| Start-up and consent | `app/src/ads/init.ts` (runs after the welcome) | Done |
| Ad components and placements | `app/src/ads/` (to build) | Later, per the plan |
| AdMob account, app, ad units, consent, payments | admob.google.com | Tirth |
| Play Store listing, `app-ads.txt` | Play Console | Tirth, before real ads |

## 1. AdMob account (you have it)
Check: country India, currency, time zone, **payments profile and PAN/tax info** complete. Payout threshold is about 100 USD.

## 2. Add the app
**Apps, Add app**, platform Android, "Is the app listed on a supported app store?" answer **No** for now. App name "Cycle Saathi". Copy the **App ID** (`ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY`). It goes in `app/app.json`, plugin `react-native-google-mobile-ads`, key `androidAppId`. The `~` means app ID; `/` means ad unit. Mixing them up is the most common mistake.
After the Play listing exists: **Apps, Cycle Saathi, App settings, Link to a store**, then verify. Until then AdMob serves limited ads.

## 3. The ad units (create exactly these 6)
Give every unit the name in the table so reports are readable. IDs go in `REAL_AD_UNITS` in `app/src/config/ads.ts`.

| # | AdMob name | Format | Where in the app | Settings |
|---|---|---|---|---|
| 1 | `banner_main` | Banner (use **adaptive anchored** in code) | Strip above the tab bar on Today, Calendar, My cycles | Refresh: none in the console (the app refreshes about every 60 s) |
| 2 | `native_cycles_list` | Native advanced | My cycles list after the 3rd row (only with 4+ periods) | Styled as our card, labelled "Ad" |
| 3 | `native_calendar` | Native advanced | Calendar, under the Colours card (second slot, only if needed) | Same |
| 4 | `interstitial_after_report` | Interstitial | After the PDF report is shared | Frequency cap in code: 1 a day |
| 5 | `interstitial_after_history` | Interstitial | After saving earlier cycles | Shares the same daily cap |
| 6 | `rewarded_no_ads` | Rewarded | "Watch a short video: no ads for 3 days" (Settings and Saathi card) | Reward: 1 unit, name "NoAds3Days" (the app decides the 3 days) |

Two extra units are NOT created: app-open (decided against) and rewarded-interstitial.

## 4. eCPM floors, waterfall and mediation
Keep it simple for a new app:
- **Start with plain AdMob, no mediation.** Google's auto-optimised demand (open bidding by AdMob Network) is enough until the app has steady traffic.
- **Waterfall**: not needed now. Waterfall means manually ordering ad networks by price floors. Only consider it later (after about 3 months and 10k+ daily impressions) when adding mediation partners such as Meta Audience Network, AppLovin, Unity or InMobi. When that day comes, in AdMob choose **Mediation, Create mediation group**, one group per format, put AdMob Network on **Optimized** bidding and add partners on bidding first; only add waterfall rows for partners without bidding.
- **eCPM floors**: leave at default (no floor) for the first month; then raise the interstitial floor in small steps only if fill stays above 90%.
- **Adaptive banner size**: `BannerAdSize.ANCHORED_ADAPTIVE_BANNER`.

## 5. Privacy & messaging (consent)
- **Privacy & messaging, Consent**: create a **European regulations** message (Google CMP) and also **US states regulations** if you ever publish there. For India there is no mandatory form, but the app still calls `AdsConsent.gatherConsent()` so one covers every region.
- The app sends **non-personalised ads only** (`ADS_RULES.nonPersonalizedOnly`) and never passes anything about her cycle.
- In the Play Console Data safety form, declare: **Advertising ID** collected, shared with Google (AdMob), purpose "Advertising or marketing". Health data (periods, notes) **not** shared.
- Privacy policy page (required for Play): says cycle data stays on the phone, Google AdMob shows ads and uses the advertising ID, how to reset it, and a contact email.

## 6. Blocking controls (Blocking controls, Content and Sensitive categories)
Block: dating, gambling and betting, alcohol, weight-loss and diet supplements, political content, religion, adult-oriented. **Decide with Drashti** about pregnancy and fertility products (ovulation kits, baby products) and menstrual hygiene brands (these are probably welcome). Set max ad content rating **PG** (also set in code).

## 7. Play Store requirements for ads
- Play Console: **App content, Ads** declaration "Yes, contains ads".
- **Health apps declaration**; make sure ads are never shown in the Tell me forms or notification text.
- **app-ads.txt**: put `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` (AdMob shows your exact line in **Apps, View app-ads.txt**) at `https://<your-website>/app-ads.txt`, and set that website as the developer website in the Play listing. Needs a domain (a free GitHub Pages site is enough).
- One-time Play developer registration fee (about 25 USD). Closed testing track first, with ads OFF or test ads.

## 8. Test ads and test devices
- Debug and tester builds use Google's test IDs automatically (`adUnit()` in `config/ads.ts` returns the test ID unless this is a release build and a real ID was filled in).
- Clicking your own real ads gets the account banned. Put your phone's **test device ID** (shown in the Android log "Use RequestConfiguration.Builder().setTestDeviceIds…") in AdMob, **Settings, Test devices**, and in `ADS_RULES` later.
- Drashti's tester builds: `ADS_ENABLED = false` or test IDs.

## 9. Turning ads on later (checklist, in order)
1. IDs from step 3 into `REAL_AD_UNITS`; the App ID into `app.json`.
2. Reword the two privacy lines in the app (`welcome.privateBody`, `settings.privacy`): "Your cycle information stays on this phone. Ads come from Google and never get your cycle information."
3. Build the components from the placement table; check each on a screenshot and on the phone.
4. Set `ADS_ENABLED = true` in a build for yourself only; check consent, no ad on forms, frequency caps.
5. Play listing, Data safety, `app-ads.txt`, then closed test, then production.
