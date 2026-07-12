import React, { useState } from "react";
import { fonts } from "../../constants/tokens";
import { View, Image, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions } from "react-native";
import { Text } from "../ui/Text";
import { Ionicons } from "@expo/vector-icons";
import config from "../../src/config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ImageItem = { uri?: string; url?: string; file_url?: string };

type Props = {
  images: ImageItem[];
};

const resolveUri = (img: ImageItem) => {
  const raw = img?.uri || img?.url || img?.file_url || "";
  return raw.startsWith("http") ? raw : `${config.fileBaseUrl}${raw}`;
};

export function ImageGallery({ images }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const thumbs = images.slice(0, 5);
  const extraCount = images.length - 5;

  return (
    <>
      <View style={styles.row}>
        {thumbs.map((img, i) => (
          <TouchableOpacity
            key={i}
            style={styles.thumb}
            onPress={() => setLightboxIndex(i)}
          >
            <Image source={{ uri: resolveUri(img) }} style={styles.thumbImage} />
            {i === 4 && extraCount > 0 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{extraCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setLightboxIndex(null)}
      >
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setLightboxIndex(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {lightboxIndex !== null && (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              initialScrollIndex={lightboxIndex}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <View style={styles.lightboxPage}>
                  <Image
                    source={{ uri: resolveUri(item) }}
                    style={styles.lightboxImage}
                    resizeMode="contain"
                  />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#fff",
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  lightbox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  lightboxPage: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
});
