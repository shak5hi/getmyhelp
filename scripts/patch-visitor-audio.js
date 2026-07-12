const fs = require('fs');
let file = fs.readFileSync('components/visitor/VisitorApprovalModal.tsx', 'utf8');

file = file.replace(
  `  // Sound ref — loaded dynamically so missing expo-av doesn't crash\n  const soundRef = useRef<any>(null);`,
  `  // expo-audio player\n  const player = useAudioPlayer(require("../../assets/sounds/dorbell.wav"));\n  player.loop = true;`
);

const oldAudioLoad = `    // Load and play alarm sound (requires expo-av + assets/sounds/doorbell.mp3)
    let mounted = true;
    (async () => {
      try {
        const { Audio } = require("expo-av");
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/sounds/dorbell.wav"),
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        if (mounted) soundRef.current = sound;
      } catch {
        // expo-av not installed or sound file missing — silent fallback
      }
    })();`;

file = file.replace(oldAudioLoad, `    // Play alarm sound
    try {
      player.play();
    } catch {}`);

file = file.replace(
  `      soundRef.current?.unloadAsync().catch(() => {});\n      soundRef.current = null;`,
  `      try { player.pause(); } catch {}`
);

file = file.replace(
  `    soundRef.current?.stopAsync().catch(() => {});`,
  `    try { player.pause(); } catch {}`
);

fs.writeFileSync('components/visitor/VisitorApprovalModal.tsx', file, 'utf8');
console.log("VisitorApprovalModal updated");
