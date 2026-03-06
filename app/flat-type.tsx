import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Animated,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { towerStyles as styles } from "../styles/tower.styles";

const FLAT_TYPES = [
  { id: "1BHK", name: "1 BHK" },
  { id: "2BHK", name: "2 BHK" },
  { id: "3BHK", name: "3 BHK" },
  { id: "4BHK", name: "4 BHK" },
  { id: "PENTHOUSE", name: "Penthouse" },
  { id: "STUDIO", name: "Studio" },
  { id: "DUPLEX", name: "Duplex" },
  { id: "VILLA", name: "Villa" },
];

export default function FlatTypeScreen() {
  useLanguage();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.step}>Step 3 of 4</Text>
      <Text style={styles.title}>Select Flat Type</Text>
      <Text style={styles.subtitle}>What type of flat do you live in?</Text>

      {/* FLAT TYPES GRID */}
      <View style={styles.grid}>
        {FLAT_TYPES.map((type) => {
          const isSelected = selectedType === type.id;

          return (
            <Animated.View
              key={type.id}
              style={{ transform: [{ scale: isSelected ? 1.05 : 1 }] }}
            >
              <Pressable
                onPress={() => setSelectedType(type.id)}
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
                  {type.name}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* CONTINUE */}
      <TouchableOpacity
        style={[styles.button, !selectedType && styles.buttonDisabled]}
        disabled={!selectedType}
        onPress={async () => {
          await AsyncStorage.setItem("flat_type", selectedType);
          router.push("/house");
        }}
      >
        <Text
          style={[
            styles.buttonText,
            !selectedType && styles.buttonTextDisabled,
          ]}
        >
          {i18n.t("continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}