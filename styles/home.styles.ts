import { Dimensions, StyleSheet } from "react-native";

const { height } = Dimensions.get("window");

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* TOP TEXT BLOCK */
  textBlock: {
    position: "absolute",
    top: height * 0.18,   // 🔑 KEY FIX
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontFamily: "Newsreader-SemiBold",
    fontSize: 48,
    color: "#384959",
    fontWeight: 500,
  },

  subtitle: {
    fontSize: 14,
    color: "#6A89A7",
    marginTop: 6,
  },

  /* IMAGE BLOCK */
  image: {
    position: "absolute",
    bottom: 150,  // 🔑 KEY FIX
    right: 0,
    width: 300,
    height: 450,
    resizeMode: "contain",
  },

  /* BUTTON BLOCK */
  buttonBlock: {
    position: "absolute",
    bottom: 50,  // 🔑 KEY FIX
    left: 24,
    right: 24,
  },
});

