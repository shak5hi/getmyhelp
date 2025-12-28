import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { towerStyles as styles } from "../styles/tower.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

export default function TowerScreen() {
  useLanguage(); // 🔁 re-render on language change
  const router = useRouter();

  const [selectedTower, setSelectedTower] = useState("");
  const [showAll, setShowAll] = useState(false);

  const allTowers = [
    "A1","A2","A3","A4","A5",
    "B1","B2","B3","B4","B5",
    "C1","C2","C3","C4","C5",
    "D1","D2","D3","D4","D5",
    "E1","E2","E3","E4","E5",
  ];

  const visibleTowers = showAll ? allTowers : allTowers.slice(0, 6);

  return (
    <View style={styles.container}>
      <Text style={styles.step}>{i18n.t("step2")}</Text>

      <Text style={styles.title}>{i18n.t("selectTower")}</Text>
      <Text style={styles.subtitle}>{i18n.t("towerSubtitle")}</Text>

      <View style={styles.grid}>
        {visibleTowers.map((tower) => {
          const isSelected = selectedTower === tower;

          return (
            <Animated.View
              key={tower}
              style={{ transform: [{ scale: isSelected ? 1.05 : 1 }] }}
            >
              <Pressable
                onPress={() => setSelectedTower(tower)}
                style={[
                  styles.bubble,
                  isSelected && styles.bubbleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    isSelected && styles.bubbleTextSelected,
                  ]}
                >
                  {tower}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <Pressable onPress={() => setShowAll(!showAll)}>
        <Text style={styles.seeMore}>
          {showAll ? i18n.t("showLess") : i18n.t("seeMore")}
        </Text>
      </Pressable>

      <TouchableOpacity
        style={[
          styles.button,
          !selectedTower && styles.buttonDisabled,
        ]}
        disabled={!selectedTower}
        onPress={() => router.push("/house")}
      >
        <Text
          style={[
            styles.buttonText,
            !selectedTower && styles.buttonTextDisabled,
          ]}
        >
          {i18n.t("continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
