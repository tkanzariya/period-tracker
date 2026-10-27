# Constraints

Last updated: 2026-10-27

- **Budget**: zero or minimal. No paid services, no Play Store fee (Google's one-time developer fee is avoided by sideloading an APK).
- **Platform**: Android only. Distribution via APK installed directly on Drashti's phone.
- **Storage**: local on-device for now. Must be easy to export/import and later migrate to a cloud database.
- **Region**: India.
- **Privacy/legal**: deliberately deferred. Still follow sensible basics (no analytics SDKs, no data leaving the device).
- **Team**: Tirth solo, part-time. Drashti advises and tests.
- **Process**: Phase 0 (foundation) must be solid before development. Features, designs and logo get planned first.
- **Dev PC**: Windows 10, Intel i7-4770S (2013, 4 cores), 16 GB RAM, C: ~19 GB free (tight), D: ~127 GB. CPU virtualization is off in the BIOS (so no Android emulator). Builds are slow-ish by hardware; see `tech-decisions.md` for the one-click scripts.
- **APK size**: keep as small as possible wherever it costs nothing (decided 2026-10-27): 64-bit only, minify, shrink resources, no unused features/libraries. Optimization beyond that comes later.
- **Tooling**: Windows 10 dev machine; Node v26, Git installed. Android Studio presence: unconfirmed (see open-questions).
