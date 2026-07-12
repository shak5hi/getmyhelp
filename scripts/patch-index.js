const fs = require('fs');
let file = fs.readFileSync('app/index.tsx', 'utf8');

if (!file.includes('const [sessionChecking, setSessionChecking]')) {
  file = file.replace(
    'const [showLanguageModal, setShowLanguageModal] = useState(false);',
    'const [showLanguageModal, setShowLanguageModal] = useState(false);\n  const [sessionChecking, setSessionChecking] = useState(true);'
  );

  file = file.replace(
    '} catch (e) {\n        }',
    '} catch (e) {\n          console.warn("Session check failed", e);\n        }'
  );

  file = file.replace(
    'checkAuth();\n  }, []);',
    '  setSessionChecking(false);\n    };\n    checkAuth();\n  }, []);'
  );

  file = file.replace(
    'import { Image, View, Pressable, Modal } from "react-native";',
    'import { Image, View, Pressable, Modal, ActivityIndicator } from "react-native";'
  );

  file = file.replace(
    'return (\n    <View style={styles.container}>',
    'if (sessionChecking) {\n    return (\n      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>\n        <ActivityIndicator size="large" color={theme.accent} />\n      </View>\n    );\n  }\n\n  return (\n    <View style={styles.container}>'
  );

  // Fix early return for router.replace to avoid setSessionChecking(false) executing
  file = file.replace(
    'router.replace("/(tabs)/dashboard");\n            }',
    'router.replace("/(tabs)/dashboard");\n            }\n            return;'
  );

  fs.writeFileSync('app/index.tsx', file, 'utf8');
}
console.log('Done');
