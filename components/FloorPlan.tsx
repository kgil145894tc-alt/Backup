import { StyleSheet, Text, View } from "react-native";

import type { BuildingRoom } from "../src/data/campusData";

type FloorPlanProps = {
  rooms: BuildingRoom[];
  selectedRoomId: string;
};

export default function FloorPlan({ rooms, selectedRoomId }: FloorPlanProps) {
  const middle = Math.ceil(rooms.length / 2);
  const rows = [rooms.slice(0, middle), rooms.slice(middle)];

  return (
    <View style={styles.plan}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((room) => {
            const selected = room.id === selectedRoomId;

            return (
              <View key={room.id} style={[styles.room, selected && styles.selectedRoom]}>
                {selected ? <View style={styles.marker} /> : null}
                <Text numberOfLines={2} style={[styles.roomName, selected && styles.selectedRoomName]}>
                  {room.name}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  plan: { borderColor: "#6b7280", borderWidth: 1, gap: 0, padding: 8 },
  row: { flexDirection: "row", minHeight: 82 },
  room: {
    alignItems: "center",
    borderColor: "#9ca3af",
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
    padding: 6,
  },
  selectedRoom: { backgroundColor: "#fecaca", borderColor: "#b91c1c" },
  roomName: { color: "#374151", fontSize: 11, textAlign: "center" },
  selectedRoomName: { color: "#991b1b", fontWeight: "700" },
  marker: {
    backgroundColor: "#dc2626",
    borderColor: "#ffffff",
    borderRadius: 7,
    borderWidth: 2,
    height: 14,
    marginBottom: 5,
    width: 14,
  },
});
