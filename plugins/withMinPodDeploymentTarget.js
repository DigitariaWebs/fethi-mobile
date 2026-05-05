// Config plugin that splices a deployment-target bump into the iOS
// Podfile's existing `post_install` block. Silences Xcode 26's
// "Pods/SDWebImage iOS@9.0 deployment version mismatch" warning, which
// fires whenever a transitive pod's podspec declares an iOS minimum well
// below the current Xcode SDK's accepted range.
//
// CocoaPods rejects multiple top-level `post_install` blocks, so we can't
// append our own — we splice into the one Expo already generates, right
// after the `react_native_post_install(...)` call.

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const HOOK_MARKER = '# === withMinPodDeploymentTarget ===';

function buildSnippet(deploymentTarget) {
  return `    ${HOOK_MARKER}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < ${deploymentTarget}.to_f
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'
        end
      end
    end
    ${HOOK_MARKER}`;
}

function findProjectDeploymentTarget(config) {
  for (const p of config.plugins || []) {
    if (Array.isArray(p) && p[0] === 'expo-build-properties') {
      const target = p[1]?.ios?.deploymentTarget;
      if (target) return String(target);
    }
  }
  return '15.1';
}

// Find the index of the matching `)` for the `(` at openIdx.
function matchingParen(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '(') depth++;
    else if (src[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const withMinPodDeploymentTarget = (config) => {
  const deploymentTarget = findProjectDeploymentTarget(config);

  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfilePath)) return cfg;

      let contents = fs.readFileSync(podfilePath, 'utf8');

      // Idempotent: drop any prior block we wrote, including the leading
      // newline that preceded it.
      const stripRe = new RegExp(
        `\\n?\\s*${HOOK_MARKER}[\\s\\S]*?${HOOK_MARKER}\\n?`,
        'g',
      );
      contents = contents.replace(stripRe, '\n');

      // Locate `react_native_post_install(` and skip past its matching `)`.
      const callIdx = contents.indexOf('react_native_post_install(');
      if (callIdx === -1) {
        // Template changed — bail without touching the Podfile rather than
        // breaking the build with a malformed Ruby file.
        fs.writeFileSync(podfilePath, contents);
        return cfg;
      }
      const openParen = contents.indexOf('(', callIdx);
      const closeParen = matchingParen(contents, openParen);
      if (closeParen === -1) {
        fs.writeFileSync(podfilePath, contents);
        return cfg;
      }

      // After the close paren, find the next `end` (which closes the
      // `post_install do |installer|` block).
      const endRe = /\n([ \t]*)end\b/;
      const tail = contents.slice(closeParen + 1);
      const m = endRe.exec(tail);
      if (!m) {
        fs.writeFileSync(podfilePath, contents);
        return cfg;
      }
      const insertAt = closeParen + 1 + m.index; // points at the `\n` before `end`

      const before = contents.slice(0, insertAt);
      const after = contents.slice(insertAt);
      contents = before + '\n' + buildSnippet(deploymentTarget) + after;

      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
};

module.exports = withMinPodDeploymentTarget;
