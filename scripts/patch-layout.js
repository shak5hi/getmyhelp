const fs = require('fs');
let file = fs.readFileSync('app/_layout.tsx', 'utf8');

if (!file.includes('ForceUpdate')) {
  file = file.replace(
    'import { initSentry, reportError, wrapRoot } from "../src/sentry";',
    'import { initSentry, reportError, wrapRoot } from "../src/sentry";\nimport { ForceUpdate } from "../components/ui/ForceUpdate";'
  );

  file = file.replace(
    '<VisitorApprovalModal />\n            <RootNavigator />\n            <OfflineBanner />',
    '<ForceUpdate>\n              <VisitorApprovalModal />\n              <RootNavigator />\n              <OfflineBanner />\n            </ForceUpdate>'
  );

  fs.writeFileSync('app/_layout.tsx', file, 'utf8');
}
console.log("Patched _layout.tsx successfully");
