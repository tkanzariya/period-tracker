/**
 * Gradle speed settings for this PC (16 GB RAM): the default 2 GB build memory is
 * low and makes Kotlin compilation slow. Also turns on Gradle's build cache.
 * These go into android/gradle.properties every time the project is generated.
 */
const { withGradleProperties } = require('expo/config-plugins');

const SETTINGS = {
  'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=768m',
  'org.gradle.caching': 'true',
  'kotlin.daemon.jvmargs': '-Xmx2048m',
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
