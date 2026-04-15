import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { towerStyles as styles } from "../styles/tower.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import config from "../src/config";
import { apiFetch } from "../src/api";

type Tower = {
  id: string;
  name: string;
};

export default function TowerScreen() {
  useLanguage();
  const router = useRouter();

  const [towers, setTowers] = useState<Tower[]>([]);
  const [selectedTower, setSelectedTower] = useState<string>("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------------------------------
     FETCH TOWERS USING society_id
  --------------------------------------- */
  useEffect(() => {
  const fetchTowers = async () => {
    try {
      const societyId = await AsyncStorage.getItem("selected_society_id");
      if (!societyId) {
        setError("Missing society information");
        return;
      }

      const response = await apiFetch(`/customer/societies/${societyId}/towers`);

      const result = await response.json();

      // 🔥 THIS IS THE IMPORTANT LINE
      setTowers(result?.data || []);
    } catch (err) {
      setError("Failed to load towers");
    } finally {
      setLoading(false);
    }
  };

  fetchTowers();
}, []);


  const visibleTowers = showAll ? towers : towers.slice(0, 6);

  /* ---------------------------------------
     UI STATES
  --------------------------------------- */
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>{i18n.t("loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.step}>{i18n.t("step2")}</Text>

      <Text style={styles.title}>{i18n.t("selectTower")}</Text>
      <Text style={styles.subtitle}>{i18n.t("towerSubtitle")}</Text>

      {/* TOWERS GRID */}
      <View style={styles.grid}>
        {visibleTowers.map((tower) => {
          const isSelected = selectedTower === tower.id;

          return (
            <Animated.View
              key={tower.id}
              style={{ transform: [{ scale: isSelected ? 1.05 : 1 }] }}
            >
              <Pressable
                onPress={() => setSelectedTower(tower.id)}
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
                  {tower.name}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* SEE MORE */}
      {towers.length > 6 && (
        <Pressable onPress={() => setShowAll(!showAll)}>
          <Text style={styles.seeMore}>
            {showAll ? i18n.t("showLess") : i18n.t("seeMore")}
          </Text>
        </Pressable>
      )}

      {/* CONTINUE */}
      <TouchableOpacity
        style={[
          styles.button,
          !selectedTower && styles.buttonDisabled,
        ]}
        disabled={!selectedTower}
        onPress={async () => {
          await AsyncStorage.setItem("selected_tower_id", selectedTower);
          router.push("/house");
        }}
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
