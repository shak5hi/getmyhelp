import React, { useState } from "react";
import { fonts } from "../../constants/tokens";
import { View, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native";
import { Text } from "../ui/Text";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉"];

export type Reaction = {
  emoji: string;
  count: number;
  reacted: boolean;
};

type Props = {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  containerStyle?: any;
};

export function EmojiReactionBar({ reactions, onReact, containerStyle }: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const visible = reactions.filter((r) => r.count > 0);

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {visible.map((r) => (
          <TouchableOpacity
            key={r.emoji}
            style={[styles.pill, r.reacted && styles.pillActive]}
            onPress={() => onReact(r.emoji)}
          >
            <Text style={styles.emoji}>{r.emoji}</Text>
            <Text style={[styles.count, r.reacted && styles.countActive]}>
              {r.count}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.addIcon}>😊+</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.picker}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.emojiOption}
                onPress={() => {
                  onReact(emoji);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.emojiOptionText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  pillActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  emoji: {
    fontSize: 15,
  },
  count: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: "#6B7280",
    marginLeft: 4,
  },
  countActive: {
    color: "#6366F1",
  },
  addButton: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  addIcon: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  picker: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  emojiOption: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
  },
  emojiOptionText: {
    fontSize: 24,
  },
});
