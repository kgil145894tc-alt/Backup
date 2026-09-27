import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import RoomDetailsBackground from "../../assets/design/backgrounds/elevenBg.svg";
import CloseIcon from "../../assets/design/icons/close.svg";
import type { BuildingRoom } from "../data/campusData";

type RoomDetailsModalProps = {
  onClose: () => void;
  room: BuildingRoom;
};

export default function RoomDetailsModal({
  onClose,
  room,
}: RoomDetailsModalProps) {
  return (
    <Modal
      transparent
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close room details"
          onPress={onClose}
          style={styles.backdrop}
        />
        <ScrollView
          style={styles.viewport}
          contentContainerStyle={styles.viewportContent}
          pointerEvents="box-none"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <View style={styles.background} pointerEvents="none">
              <RoomDetailsBackground
                width="100%"
                height="100%"
                preserveAspectRatio="none"
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close room details"
              onPress={onClose}
              style={styles.close}
            >
              <CloseIcon width={36} height={36} accessible={false} />
            </Pressable>
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.content}
              contentContainerStyle={styles.contentScroll}
            >
              <Text style={styles.name}>{room.name}</Text>
              <View style={styles.badge}>
                <Text numberOfLines={1} adjustsFontSizeToFit style={styles.type}>
                  {room.category}
                </Text>
              </View>
              <Text style={styles.floor}>Floor: {room.floorNumber}</Text>
              <View style={styles.detailsGrid}>
                <DetailItem label="Type" value={room.type} />
                <DetailItem label="Floor" value={room.floor} />
                <DetailItem label="Category" value={room.category} />
              </View>
              <Text style={styles.description}>
                {room.description || "No description available yet."}
              </Text>
              {room.directions ? (
                <View style={styles.directionsBlock}>
                  <Text style={styles.directionsLabel}>Directions</Text>
                  <Text style={styles.directions}>{room.directions}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value?: number | string }) {
  if (value === undefined || value === "") {
    return null;
  }

  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  viewport: {
    flexGrow: 0,
    maxHeight: "92%",
  },

  viewportContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  panel: {
    aspectRatio: 349 / 386,
    maxWidth: 349,
    width: "100%",
  },

  background: {
    ...StyleSheet.absoluteFill,
  },

  close: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 44,
    zIndex: 2,
  },

  content: {
    bottom: 72,
    left: 32,
    position: "absolute",
    right: 24,
    top: 86,
  },

  contentScroll: {
    paddingBottom: 18,
  },

  name: {
    color: "#000000",
    fontFamily: "DetailSemiBold",
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 4,
  },

  badge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FA5D0E",
    borderRadius: 50,
    justifyContent: "center",
    minHeight: 24,
    minWidth: 117,
    paddingHorizontal: 12,
  },

  type: {
    color: "#FFFFFF",
    fontFamily: "DetailSemiBold",
    fontSize: 15,
    textTransform: "capitalize",
  },

  floor: {
    color: "#000000",
    fontFamily: "DetailSemiBold",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 10,
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  detailItem: {
    backgroundColor: "rgba(255,255,255,0.86)",
    borderColor: "#E8DDDE",
    borderRadius: 8,
    borderWidth: 1,
    minWidth: "46%",
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  detailLabel: {
    color: "#6C757D",
    fontFamily: "DetailSemiBold",
    fontSize: 10,
    letterSpacing: 0,
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#23272B",
    fontFamily: "DetailSemiBold",
    fontSize: 13,
    marginTop: 2,
    textTransform: "capitalize",
  },

  description: {
    color: "#3C4147",
    fontFamily: "DetailRegular",
    fontSize: 16,
    lineHeight: 21,
  },

  directionsBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTopColor: "#E8DDDE",
    borderTopWidth: 1,
  },

  directionsLabel: {
    color: "#AF2532",
    fontFamily: "DetailSemiBold",
    fontSize: 14,
    marginBottom: 4,
  },

  directions: {
    color: "#6C757D",
    fontFamily: "DetailRegular",
    fontSize: 14,
    lineHeight: 19,
  },
});
