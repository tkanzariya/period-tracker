/**
 * Windows has a 260-character path limit and React Native's C++ build mirrors
 * the project's absolute path inside its build folder, so a long project path
 * breaks the build. When ANDROID_CXX_STAGING_DIR is set (scripts/android-run.ps1
 * sets it), the C++ build output goes there instead. Without the variable
 * this plugin changes nothing.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = '// cycle-saathi: short C++ build dir';

module.exports = function withShortCxxDir(config) {
  return withAppBuildGradle(config, (c) => {
    if (c.modResults.language !== 'groovy' || c.modResults.contents.includes(MARKER)) return c;
    c.modResults.contents += `
${MARKER}
if (System.getenv("ANDROID_CXX_STAGING_DIR")) {
  android {
    externalNativeBuild {
      cmake {
        buildStagingDirectory = file(System.getenv("ANDROID_CXX_STAGING_DIR"))
      }
    }
    // The release folder would otherwise be named "RelWithDebInfo" (14 characters). "Release" is 7,
    // which keeps the longest C++ build paths under Windows' 260-character limit.
    buildTypes {
      release {
        externalNativeBuild {
          cmake {
            arguments "-DCMAKE_BUILD_TYPE=Release"
          }
        }
      }
    }
  }
}
`;
    return c;
  });
};
