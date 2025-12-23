import { View, Text, TouchableOpacity, Pressable, Animated } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { towerStyles as styles } from "../styles/tower.styles";

export default function TowerScreen() {
  const router = useRouter();
  const [selectedTower, setSelectedTower] = useState("");
  const [showAll, setShowAll] = useState(false);

  // 🔹 25 dummy towers
  const allTowers = [
    "A1","A2","A3","A4","A5",
    "B1","B2","B3","B4","B5",
    "C1","C2","C3","C4","C5",
    "D1","D2","D3","D4","D5",
    "E1","E2","E3","E4","E5",
  ];

  const visibleTowers = showAll
    ? allTowers
    : allTowers.slice(0, 6);

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 2 of 2</Text>

      <Text style={styles.title}>Which tower or wing?</Text>
      <Text style={styles.subtitle}>
        Select your exact building in your society.
      </Text>

      {/* GRID */}
      <View style={styles.grid}>
        {visibleTowers.map((tower) => {
          const isSelected = selectedTower === tower;

          return (
            <Animated.View
              key={tower}
              style={[
                styles.bubbleWrapper,
                {
                  transform: [{ scale: isSelected ? 1.05 : 1 }],
                },
              ]}
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

      {/* SEE MORE / LESS */}
      <Pressable onPress={() => setShowAll(!showAll)}>
        <Text style={styles.seeMore}>
          {showAll ? "Show less" : "See more"}
        </Text>
      </Pressable>

      {/* CONTINUE */}
      <TouchableOpacity
        style={[
          styles.button,
          !selectedTower && styles.buttonDisabled,
        ]}
        disabled={!selectedTower}
        onPress={() => {
          console.log("Selected tower:", selectedTower);
        }}
      >
        <Text
          style={[
            styles.buttonText,
            !selectedTower && styles.buttonTextDisabled,
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

