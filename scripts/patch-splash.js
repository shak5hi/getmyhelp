const fs = require('fs');
let file = fs.readFileSync('app/_layout.tsx', 'utf8');

if (!file.includes('SplashScreen.preventAutoHideAsync')) {
  file = file.replace(
    'import { ForceUpdate } from "../components/ui/ForceUpdate";',
    'import { ForceUpdate } from "../components/ui/ForceUpdate";\nimport * as SplashScreen from "expo-splash-screen";'
  );

  file = file.replace(
    'initSentry();',
    'initSentry();\nSplashScreen.preventAutoHideAsync();'
  );

  file = file.replace(
    'if (!fontsLoaded) return null;',
    'useEffect(() => {\n    if (fontsLoaded) SplashScreen.hideAsync();\n  }, [fontsLoaded]);\n\n  if (!fontsLoaded) return null;'
  );

  fs.writeFileSync('app/_layout.tsx', file, 'utf8');
}
console.log('Done');
