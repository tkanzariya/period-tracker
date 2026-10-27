/**
 * Signs the release app file with our own key instead of the standard test key.
 *
 * Why it matters: Android only updates an installed app when the new file is signed with the
 * SAME key. Sign every release the same way, or Drashti would have to uninstall (and lose her
 * data) to update.
 *
 * The key never lives in the repo. When these environment variables are set (by
 * scripts/build-apk.ps1 on the PC, or by the GitHub workflow), the release is signed with it.
 * When they are not set, the build falls back to the test key so nothing breaks.
 *   CS_KEYSTORE_FILE, CS_KEYSTORE_PASSWORD, CS_KEY_ALIAS, CS_KEY_PASSWORD
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// cycle-saathi: release signing';

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (c) => {
    if (c.modResults.language !== 'groovy' || c.modResults.contents.includes(MARKER)) return c;
    c.modResults.contents += `
${MARKER}
if (System.getenv("CS_KEYSTORE_FILE")) {
  android {
    signingConfigs {
      release {
        storeFile file(System.getenv("CS_KEYSTORE_FILE"))
        storePassword System.getenv("CS_KEYSTORE_PASSWORD")
        keyAlias System.getenv("CS_KEY_ALIAS")
        keyPassword System.getenv("CS_KEY_PASSWORD")
      }
    }
    buildTypes {
      release {
        signingConfig signingConfigs.release
      }
    }
  }
}
`;
    return c;
  });
};
