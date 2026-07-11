import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fonts } from "../constants/tokens";

/**
 * App-wide render-error catch.
 *
 * Without this, a single thrown exception during render unmounts the whole tree
 * and leaves a permanent blank screen — there is no browser to reload in a native
 * app. This turns that into a recoverable state: an apology and a "Try again"
 * that remounts the subtree.
 *
 * Class component on purpose: `getDerivedStateFromError` / `componentDidCatch`
 * have no hook equivalent.
 *
 * Theme note: this can render when providers themselves have failed, so it uses
 * fixed neutral colours rather than `useTheme()` — a boundary that depends on the
 * thing it's protecting against is no boundary at all.
 */
interface Props {
  children: React.ReactNode;
  /** Hook for a crash reporter (Sentry/Crashlytics) once one is wired in. */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Kept as console.error, not console.log: the release console-strip excludes
    // error/warn, so this survives to logcat and to a future crash reporter.
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <View style={styles.icon}>
          <Ionicons name="alert-circle-outline" size={30} color="#7C2AE8" />
        </View>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.body}>
          The app hit an unexpected error. You can try again — your data is safe.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={this.reset}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#0E0A14",
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(124,42,232,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: "#F3ECFA",
    letterSpacing: -0.4,
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.displayMedium,
    fontSize: 14,
    lineHeight: 21,
    color: "#B6A6C8",
    textAlign: "center",
    marginBottom: 28,
  },
  button: {
    height: 50,
    paddingHorizontal: 32,
    borderRadius: 25,
    backgroundColor: "#7C2AE8",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: fonts.displayBold,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
});
