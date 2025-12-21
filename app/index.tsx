import { Image, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import { homeStyles as styles } from "../styles/home.styles";
import { router } from "expo-router";


export default function HomeScreen() {
  return (
    <View style={styles.container}>

      <View style={styles.textBlock}>
        <Text style={styles.title}>GetMyHelp</Text>
        <Text style={styles.subtitle}>
          Make home help easy & stress-free!
        </Text>
      </View>

      <Image
        source={require("../assets/home.png")}
        style={styles.image}
      />

      <View style={styles.buttonBlock}>
        <PrimaryButton title="Get Started" />
      </View>

    </View>
  );
}
