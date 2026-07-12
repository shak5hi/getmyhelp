const fs = require('fs');
let file = fs.readFileSync('components/visitor/VisitorApprovalModal.tsx', 'utf8');

// Replace import and hook setup
if (!file.includes('useAudioPlayer')) {
  file = file.replace(
    'import { ActivityIndicator, Alert, Animated, Image, Modal, StyleSheet, TouchableOpacity, View, Vibration, Platform } from "react-native";',
    'import { ActivityIndicator, Alert, Animated, Image, Modal, StyleSheet, TouchableOpacity, View, Vibration, Platform } from "react-native";\nimport { useAudioPlayer } from "expo-audio";'
  );

  file = file.replace(
    'const flashAnim = useRef(new Animated.Value(0)).current;\n\n  // Sound ref — loaded dynamically so missing expo-av doesn\\'t crash\n  const soundRef = useRef<any>(null);',
    'const flashAnim = useRef(new Animated.Value(0)).current;\n\n  // expo-audio player\n  const player = useAudioPlayer(require("../../assets/sounds/dorbell.wav"));\n  player.loop = true;'
  );

  file = file.replace(
    '// Load and play alarm sound (requires expo-av + assets/sounds/doorbell.mp3)\n    let mounted = true;\n    (async () => {\n      try {\n        const { Audio } = require("expo-av");\n        const { sound } = await Audio.Sound.createAsync(\n          require("../../assets/sounds/dorbell.wav"),\n          { shouldPlay: true, isLooping: true, volume: 1.0 }\n        );\n        if (mounted) soundRef.current = sound;\n      } catch {\n        // expo-av not installed or sound file missing — silent fallback\n      }\n    })();',
    '// Play alarm sound\n    try {\n      player.play();\n    } catch {}'
  );

  file = file.replace(
    'soundRef.current?.unloadAsync().catch(() => {});\n      soundRef.current = null;',
    'try { player.pause(); } catch {}'
  );

  file = file.replace(
    'soundRef.current?.stopAsync().catch(() => {});',
    'try { player.pause(); } catch {}'
  );

  fs.writeFileSync('components/visitor/VisitorApprovalModal.tsx', file, 'utf8');
  console.log('VisitorApprovalModal.tsx patched successfully');
} else {
  console.log('Already patched');
}
