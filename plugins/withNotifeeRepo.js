const { withProjectBuildGradle } = require("expo/config-plugins");

/**
 * Register notifee's bundled Maven repository.
 *
 * `app.notifee:core` is not published to Maven Central or Google — it ships as a
 * local Maven repo inside node_modules/@notifee/react-native/android/libs. Bare
 * React Native projects add this repo to android/build.gradle by hand, but Expo
 * regenerates that file on every prebuild, so it has to be injected here or the
 * build fails with:
 *
 *   Could not find any matches for app.notifee:core:+
 *
 * The path is resolved via Node rather than hard-coded, so it survives hoisting
 * and monorepo layouts where the package isn't at ./node_modules.
 */
const MARKER = "notifee-local-maven";

const REPO_BLOCK = `
        // ${MARKER}
        maven {
            url new File(
                ['node', '--print', "require.resolve('@notifee/react-native/package.json')"]
                    .execute(null, rootDir).text.trim(),
                '../android/libs'
            )
        }`;

module.exports = function withNotifeeRepo(config) {
  return withProjectBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error("withNotifeeRepo: expected a groovy build.gradle");
    }
    if (cfg.modResults.contents.includes(MARKER)) return cfg;

    // Inject into the `allprojects { repositories { ... } }` block so every
    // subproject (including :notifee_react-native) can resolve the artifact.
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /allprojects\s*\{\s*repositories\s*\{/,
      (match) => `${match}${REPO_BLOCK}`
    );

    return cfg;
  });
};
