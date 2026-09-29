import { StyleSheet, Text, View } from "react-native";

import type { BuildingRoom } from "@/data/campusData";

type FloorPlanProps = {
  rooms: BuildingRoom[];
  selectedRoomId: string;
};

function getRoomColor(room: BuildingRoom) {
  const name = room.name.toLowerCase();
  const category = room.category.toLowerCase();
  const type = room.type.toLowerCase();

  if (
    name.includes("restroom") ||
    name === "cr" ||
    name.includes("comfort room")
  ) {
    return "#67E8F9";
  }

  if (category === "laboratory" || type === "laboratory") {
    return "#5FD0B5";
  }

  if (
    category === "office" ||
    category === "faculty" ||
    type === "office" ||
    type === "faculty"
  ) {
    return "#F2B84B";
  }

  if (name.includes("library") || name.includes("learning and information")) {
    return "#A78BFA";
  }

  if (category === "food" || type === "food") {
    return "#F97373";
  }

  if (category === "facility" || type === "facility") {
    return "#22C55E";
  }

  return "#7CC7E8";
}

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
              <View
                key={room.id}
                style={[
                  styles.room,
                  { backgroundColor: getRoomColor(room) },
                  selected && styles.selectedRoom,
                ]}
              >
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
  roomName: {
    color: "#1f2937",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
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
