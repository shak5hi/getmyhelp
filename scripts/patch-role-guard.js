const fs = require('fs');

// Patch tabs
let tabsFile = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
if (!tabsFile.includes('useRoleGuard')) {
  tabsFile = tabsFile.replace(
    'import { useFeature } from "../../src/FeatureContext";',
    'import { useFeature } from "../../src/FeatureContext";\nimport { useRoleGuard } from "../../src/useRoleGuard";'
  );
  tabsFile = tabsFile.replace(
    'export default function TabLayout() {\n',
    'export default function TabLayout() {\n  useRoleGuard("customer", "/(guard-tabs)/visitor-list");\n'
  );
  fs.writeFileSync('app/(tabs)/_layout.tsx', tabsFile, 'utf8');
}

// Patch guard-tabs
let guardFile = fs.readFileSync('app/(guard-tabs)/_layout.tsx', 'utf8');
if (!guardFile.includes('useRoleGuard')) {
  guardFile = guardFile.replace(
    'import { Tabs } from "expo-router";',
    'import { Tabs } from "expo-router";\nimport { useRoleGuard } from "../../src/useRoleGuard";'
  );
  guardFile = guardFile.replace(
    'export default function TabLayout() {\n',
    'export default function TabLayout() {\n  useRoleGuard("guard", "/(tabs)/dashboard");\n'
  );
  fs.writeFileSync('app/(guard-tabs)/_layout.tsx', guardFile, 'utf8');
}
console.log("Patched layouts");
