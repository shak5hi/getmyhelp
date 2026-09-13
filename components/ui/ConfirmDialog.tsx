import { useEffect, useMemo } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

/**
 * Centered rounded dialog shell (reference: "Sheet" panel's pill-shaped
 * action rows, adapted to a centered confirm/small-form dialog). Replaces
 * the near-identical hand-rolled centered `Modal`s used for the two
 * delete-account confirmations and the subscriptions absence-report form —
 * callers keep their own fields/handlers as children, this just owns the
 * backdrop + card shell + enter/exit animation.
 */
export default function ConfirmDialog({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: withSpring(visible ? 1 : 0.92, { damping: 18, stiffness: 220 }) },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.root}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, s.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>

        <Animated.View style={[s.card, cardStyle]}>{children}</Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
    backdrop: { backgroundColor: t.overlay },
    card: {
      width: "100%",
      backgroundColor: t.card,
      borderRadius: radii.xl,
      padding: spacing.xl,
      borderWidth: 1,
      borderColor: t.border,
    },
  });
