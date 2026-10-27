/**
 * Gradle speed settings for this PC (16 GB RAM): the default 2 GB build memory is
 * low and makes Kotlin compilation slow. Also turns on Gradle's build cache.
 * These go into android/gradle.properties every time the project is generated.
 */
const { withGradleProperties } = require('expo/config-plugins');

const SETTINGS = {
  // 3 GB: more than the default 2 GB, but not so much that the C++ compiler runs out of memory
  // on a 16 GB PC with other programs open.
  'org.gradle.jvmargs': '-Xmx3072m -XX:MaxMetaspaceSize=768m',
  'org.gradle.caching': 'true',
  // The build helper process stays alive after a build (3 hours by default, holding ~2.5 GB).
  // 10 minutes is enough to make back-to-back builds quick.
  'org.gradle.daemon.idletimeout': '600000',
  'kotlin.daemon.jvmargs': '-Xmx1536m',
};

module.exports = function withFasterGradle(config) {
  return withGradleProperties(config, (c) => {
    for (const [key, value] of Object.entries(SETTINGS)) {
      c.modResults = c.modResults.filter((item) => !(item.type === 'property' && item.key === key));
      c.modResults.push({ type: 'property', key, value });
    }
    return c;
  });
};
