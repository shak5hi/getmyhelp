import { useEventListener } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

// Native splash screens can only show a static image, so the splash.mp4 is
// played here as an in-app full-screen video that covers everything on launch
// and then calls onDone (when the clip finishes, or after a safety timeout).
const MAX_DURATION_MS = 6000;
const source = require("../assets/images/splash.mp4");

export default function VideoSplash({ onDone }: { onDone: () => void }) {
  const finished = useRef(false);
  const [hidden, setHidden] = useState(false);

  const player = useVideoPlayer(source, (p) => {
    p.muted = true;
    p.play();
  });

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setHidden(true);
    onDone();
  };

  useEventListener(player, "playToEnd", finish);

  // Safety net: never let a stuck/failed video trap the user on the splash.
  useEffect(() => {
    const t = setTimeout(finish, MAX_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    zIndex: 9999,
    elevation: 9999,
  },
});
