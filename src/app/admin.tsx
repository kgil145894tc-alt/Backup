import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  campusCategories,
  getBuildingRooms,
  type BuildingRoom,
} from "../data/campusData";
import {
  loginAdmin,
  logoutAdmin,
  PROTOTYPE_ADMIN_EMAIL,
  PROTOTYPE_ADMIN_PASSWORD,
  watchFirebaseAdminSession,
  type AdminSession,
} from "../services/adminAuth";
import { loadCampusData } from "../services/campusDataStore";
import {
  adminLocationToFirestore,
  buildingRoomToFirestore,
  canUseFirestore,
  updateLocation,
  updateRoom,
} from "../services/firestoreData";
import {
  clearAdminLocations,
  getAdminLocationKey,
  initialAdminLocations,
  saveAdminLocations,
  type AdminLocation,
} from "../utils/adminLocations";
import {
  applyAdminRoomEdits,
  clearAdminRoomEdits,
  getAdminRoomKey,
  saveAdminRoomEdits,
} from "../utils/adminRooms";

const categoryOptions = ["All Categories", ...campusCategories];
const PROTOTYPE_ADMIN_ID = "prototype-admin";

function getAdminStats(locations: AdminLocation[]) {
  return {
    totalBuildings: locations.filter((location) => location.type === "building")
      .length,
    academicBuildings: locations.filter(
      (location) =>
        location.type === "building" || location.category === "Laboratory",
    ).length,
    adminBuildings: locations.filter(
      (location) => location.category === "Office",
    ).length,
    facilities: locations.filter(
      (location) =>
        location.category === "Facility" || location.category === "Food",
    ).length,
  };
}

function toEditableText(value: string | number | undefined) {
  return value === undefined ? "" : String(value);
}

export default function AdminScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [locations, setLocations] = useState(initialAdminLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingLocation, setEditingLocation] =
    useState<AdminLocation | null>(null);
  const [roomLocation, setRoomLocation] = useState<AdminLocation | null>(null);
  const [editingRoom, setEditingRoom] = useState<BuildingRoom | null>(null);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>(
    {},
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadAdminData = async () => {
      const campusData = await loadCampusData();

      if (isActive) {
        setLocations(campusData.locations);
        setRoomEdits(campusData.roomEdits);
        setSaveMessage(
          campusData.source === "firestore"
            ? "Loaded admin data from Firestore."
            : campusData.source === "firestore-empty"
              ? "Firestore is empty. Loaded local prototype data."
              : campusData.source === "firestore-fallback"
                ? "Firestore load failed. Loaded local prototype data."
                : "",
        );
        setIsLoadingData(false);
      }
    };

    void loadAdminData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    return watchFirebaseAdminSession((session) => {
      setAdminSession(session);
      setIsLoggedIn(Boolean(session));
    });
  }, []);

  const stats = useMemo(() => getAdminStats(locations), [locations]);

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !query ||
        location.name.toLowerCase().includes(query) ||
        location.category.toLowerCase().includes(query) ||
        location.type.toLowerCase().includes(query) ||
        location.aliases?.some((alias) =>
          alias.toLowerCase().includes(query),
        );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        location.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const syncLocationToFirestore = async (location: AdminLocation) => {
    if (!canUseFirestore()) {
      setSaveMessage("Saved locally. Firestore is not configured yet.");
      return;
    }

    try {
      await updateLocation(
        adminLocationToFirestore(location),
        PROTOTYPE_ADMIN_ID,
      );
      setSaveMessage("Saved locally and synced to Firestore.");
    } catch (error) {
      console.warn("Failed to sync location to Firestore", error);
      setSaveMessage("Saved locally, but Firestore sync failed.");
    }
  };

  const saveEditedLocation = () => {
    if (!editingLocation) {
      return;
    }

    const nextLocations = locations.map((location) =>
      getAdminLocationKey(location) ===
      getAdminLocationKey(editingLocation)
        ? editingLocation
        : location,
    );

    setLocations(nextLocations);
    setEditingLocation(null);
    setSaveMessage("Saving locally and syncing to Firestore...");
    void saveAdminLocations(nextLocations);
    void syncLocationToFirestore(editingLocation);
  };

  const resetLocalChanges = () => {
    setLocations(initialAdminLocations);
    setEditingLocation(null);
    setRoomLocation(null);
    setEditingRoom(null);
    setRoomEdits({});
    setSaveMessage("Local admin changes reset.");
    void clearAdminLocations();
    void clearAdminRoomEdits();
  };

  const syncRoomToFirestore = async (room: BuildingRoom) => {
    if (!canUseFirestore()) {
      setSaveMessage("Room saved locally. Firestore is not configured yet.");
      return;
    }

    try {
      await updateRoom(buildingRoomToFirestore(room), PROTOTYPE_ADMIN_ID);
      setSaveMessage("Room saved locally and synced to Firestore.");
    } catch (error) {
      console.warn("Failed to sync room to Firestore", error);
      setSaveMessage("Room saved locally, but Firestore sync failed.");
    }
  };

  const saveEditedRoom = () => {
    if (!editingRoom) {
      return;
    }

    const nextRoomEdits = {
      ...roomEdits,
      [getAdminRoomKey(editingRoom)]: editingRoom,
    };

    setRoomEdits(nextRoomEdits);
    void saveAdminRoomEdits(nextRoomEdits);
    setEditingRoom(null);
    setSaveMessage("Saving room locally and syncing to Firestore...");
    void syncRoomToFirestore(editingRoom);
  };

  const handleAdminLogin = async () => {
    setIsLoginLoading(true);
    setLoginError("");

    const result = await loginAdmin(email, password);

    if (result.ok) {
      setAdminSession(result.session);
      setIsLoggedIn(true);
      setPassword("");
    } else {
      setLoginError(result.message);
    }

    setIsLoginLoading(false);
  };

  const handleAdminLogout = async () => {
    await logoutAdmin();
    setAdminSession(null);
    setIsLoggedIn(false);
  };

  if (Platform.OS !== "web") {
    return (
      <View style={styles.webOnlyContainer}>
        <Text style={styles.webOnlyTitle}>Admin is web only</Text>
        <Text style={styles.webOnlyText}>
          Open /admin in the web app to manage campus locations.
        </Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginBrandPanel}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>UM</Text>
          </View>
          <Text style={styles.loginBrandTitle}>UMVC FIND</Text>
          <Text style={styles.loginBrandSubtitle}>
            Manage campus data and location information.
          </Text>
        </View>

        <View style={styles.loginPanel}>
          <View style={styles.adminIcon}>
            <Text style={styles.adminIconText}>A</Text>
          </View>
          <Text style={styles.loginTitle}>Admin Login</Text>
          <Text style={styles.loginSubtitle}>
            Access the administration panel
          </Text>
          <Text style={styles.prototypeCredentials}>
            Firebase admin login is used when configured. Prototype fallback:{" "}
            {PROTOTYPE_ADMIN_EMAIL} / {PROTOTYPE_ADMIN_PASSWORD}
          </Text>

          <Text style={styles.inputLabel}>Email / Admin</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setEmail}
            placeholder="Email / Admin Username"
            style={styles.input}
            value={email}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          {loginError ? (
            <Text style={styles.loginError}>{loginError}</Text>
          ) : null}

          <Pressable
            disabled={isLoginLoading}
            style={[
              styles.primaryButton,
              isLoginLoading && styles.primaryButtonDisabled,
            ]}
            onPress={handleAdminLogin}
          >
            <Text style={styles.primaryButtonText}>
              {isLoginLoading ? "Logging in..." : "Login"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.adminShell}>
      <View style={styles.sidebar}>
        <View style={styles.sidebarLogoRow}>
          <View style={styles.sidebarLogo}>
            <Text style={styles.sidebarLogoText}>UM</Text>
          </View>
          <Text style={styles.sidebarBrand}>UMVC FIND</Text>
        </View>

        <Text style={styles.sidebarLabel}>Admin</Text>
        <Text style={styles.sidebarItem}>Building Management</Text>
        <Text style={styles.sidebarItem}>Locations</Text>
        <Text style={styles.sidebarItem}>Rooms</Text>
      </View>

      <ScrollView contentContainerStyle={styles.adminContent}>
        <View style={styles.adminHeader}>
          <View>
            <Text style={styles.pageTitle}>Building Management</Text>
            <Text style={styles.pageSubtitle}>
              Manage campus buildings, rooms, and location details.
            </Text>
            {saveMessage ? (
              <Text style={styles.saveMessage}>{saveMessage}</Text>
            ) : null}
          </View>

          <View style={styles.adminUserCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>A</Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {adminSession?.email ?? "Admin User"}
              </Text>
              <Text style={styles.userRole}>
                {adminSession?.source === "firebase"
                  ? "Firebase Administrator"
                  : "Prototype Administrator"}
              </Text>
            </View>
            <Pressable
              style={styles.resetButton}
              onPress={resetLocalChanges}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </Pressable>
            <Pressable
              style={styles.logoutButton}
              onPress={handleAdminLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Total Buildings" value={stats.totalBuildings} />
          <StatCard
            label="Academic Buildings"
            value={stats.academicBuildings}
          />
          <StatCard label="Admin Buildings" value={stats.adminBuildings} />
          <StatCard label="Facilities and Others" value={stats.facilities} />
        </View>

        <View style={styles.toolbar}>
          <TextInput
            autoCapitalize="none"
            onChangeText={setSearchQuery}
            placeholder="Search building or room..."
            style={styles.searchInput}
            value={searchQuery}
          />

          <ScrollView
            contentContainerStyle={styles.filterList}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categoryOptions.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.tableCard}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.nameCell]}>
              Building Name
            </Text>
            <Text style={styles.tableCell}>Category</Text>
            <Text style={styles.tableCell}>Floors</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.actionsCell}>Actions</Text>
          </View>

          {isLoadingData ? (
            <View style={styles.loadingRow}>
              <Text style={styles.loadingText}>Loading admin data...</Text>
            </View>
          ) : (
            filteredLocations.map((location) => (
              <View
                key={`${location.type}-${location.id}`}
                style={styles.tableRow}
              >
                <View style={styles.nameCell}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationDescription} numberOfLines={1}>
                    {location.description ?? location.nearby ?? location.type}
                  </Text>
                </View>
                <Text style={styles.tableCell}>{location.category}</Text>
                <Text style={styles.tableCell}>
                  {toEditableText(location.floors || location.floor) || "-"}
                </Text>
                <Text style={styles.tableCell}>{location.status}</Text>
                <View style={styles.actionsCell}>
                  {location.type === "building" ? (
                    <Pressable
                      style={styles.secondaryActionButton}
                      onPress={() => setRoomLocation(location)}
                    >
                      <Text style={styles.secondaryActionText}>Rooms</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={styles.editButton}
                    onPress={() => setEditingLocation(location)}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <EditLocationModal
        location={editingLocation}
        onChange={setEditingLocation}
        onClose={() => setEditingLocation(null)}
        onOpenRooms={(location) => {
          setEditingLocation(null);
          setRoomLocation(location);
        }}
        onSave={saveEditedLocation}
      />

      <RoomsModal
        location={roomLocation}
        onEditRoom={setEditingRoom}
        roomEdits={roomEdits}
        onClose={() => setRoomLocation(null)}
      />

      <EditRoomModal
        room={editingRoom}
        onChange={setEditingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={saveEditedRoom}
      />
    </View>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EditLocationModal({
  location,
  onChange,
  onClose,
  onOpenRooms,
  onSave,
}: {
  location: AdminLocation | null;
  onChange: (location: AdminLocation | null) => void;
  onClose: () => void;
  onOpenRooms: (location: AdminLocation) => void;
  onSave: () => void;
}) {
  return (
    <Modal transparent visible={Boolean(location)} animationType="fade">
      <View style={styles.modalOverlay}>
        {location ? (
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Location</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            <View style={styles.editContent}>
              <View style={styles.editPreviewColumn}>
                <View style={styles.editImagePreview}>
                  <Text style={styles.editImageText}>Photo</Text>
                </View>

                <Pressable style={styles.changePhotoButton}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </Pressable>

                <Text style={styles.photoHint}>PNG, JPG, max 5MB</Text>
              </View>

              <View style={styles.editFormColumn}>
                <View style={styles.compactFormGrid}>
                  <AdminTextField
                    compact
                    label="Building Name"
                    value={location.name}
                    onChangeText={(name) => onChange({ ...location, name })}
                  />
                  <AdminTextField
                    compact
                    label="Category"
                    value={location.category}
                    onChangeText={(category) =>
                      onChange({
                        ...location,
                        category: category as never,
                      })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Type"
                    value={location.type}
                    onChangeText={(type) =>
                      onChange({ ...location, type: type as never })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Floors / Floor"
                    value={toEditableText(location.floors || location.floor)}
                    onChangeText={(value) =>
                      onChange({
                        ...location,
                        floor: value,
                        floors:
                          location.type === "building" && Number(value)
                            ? Number(value)
                            : location.floors,
                      })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Status"
                    value={location.status}
                    onChangeText={(status) =>
                      onChange({
                        ...location,
                        status: status as AdminLocation["status"],
                      })
                    }
                  />
                  <View style={styles.statusButtonGroup}>
                    {(["Active", "Maintenance", "Hidden"] as const).map(
                      (status) => (
                        <Pressable
                          key={status}
                          style={[
                            styles.statusButton,
                            location.status === status &&
                              styles.statusButtonActive,
                          ]}
                          onPress={() =>
                            onChange({ ...location, status })
                          }
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              location.status === status &&
                                styles.statusButtonTextActive,
                            ]}
                          >
                            {status}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                  <AdminTextField
                    compact
                    label="Nearby / Landmark"
                    value={location.nearby ?? ""}
                    onChangeText={(nearby) =>
                      onChange({ ...location, nearby })
                    }
                  />
                </View>

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  multiline
                  onChangeText={(description) =>
                    onChange({ ...location, description })
                  }
                  placeholder="Location description"
                  style={[styles.input, styles.compactTextArea]}
                  value={location.description ?? ""}
                />

                <Text style={styles.inputLabel}>Directions</Text>
                <TextInput
                  multiline
                  onChangeText={(directions) =>
                    onChange({ ...location, directions })
                  }
                  placeholder="Directions shown to users"
                  style={[styles.input, styles.compactTextArea]}
                  value={location.directions ?? ""}
                />

                <AdminTextField
                  compact
                  label="Aliases / Search Keywords"
                  value={location.aliases?.join(", ") ?? ""}
                  onChangeText={(aliases) =>
                    onChange({
                      ...location,
                      aliases: aliases
                        .split(",")
                        .map((alias) => alias.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </View>
            </View>

            {location.type === "building" ? (
              <Pressable
                style={styles.manageRoomsRow}
                onPress={() => onOpenRooms(location)}
              >
                <Text style={styles.manageRoomsText}>
                  Manage Floors and Rooms
                </Text>
                <Text style={styles.manageRoomsArrow}>{">"}</Text>
              </Pressable>
            ) : null}

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function AdminTextField({
  compact = false,
  label,
  value,
  onChangeText,
}: {
  compact?: boolean;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={compact ? styles.compactField : styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={label}
        style={[styles.input, compact && styles.compactInput]}
        value={value}
      />
    </View>
  );
}

function RoomsModal({
  location,
  onEditRoom,
  roomEdits,
  onClose,
}: {
  location: AdminLocation | null;
  onEditRoom: (room: BuildingRoom) => void;
  roomEdits: Record<string, BuildingRoom>;
  onClose: () => void;
}) {
  const rooms = location
    ? applyAdminRoomEdits(getBuildingRooms(location.id), roomEdits)
    : [];
  const floors = Array.from(new Set(rooms.map((room) => room.floorNumber)));

  return (
    <Modal transparent visible={Boolean(location)} animationType="fade">
      <View style={styles.modalOverlay}>
        {location ? (
          <View style={styles.roomsModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Floors and Rooms</Text>
                <Text style={styles.modalSubtitle}>{location.name}</Text>
              </View>
              <Pressable onPress={onClose}>
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            {floors.length ? (
              floors.map((floor) => (
                <View key={floor} style={styles.floorGroup}>
                  <Text style={styles.floorTitle}>Floor {floor}</Text>
                  {rooms
                    .filter((room) => room.floorNumber === floor)
                    .map((room) => (
                      <View key={room.id} style={styles.roomRow}>
                        <Text style={styles.roomNumber}>{room.name}</Text>
                        <Text style={styles.roomType}>{room.type}</Text>
                        <Pressable
                          style={styles.smallEditButton}
                          onPress={() => onEditRoom(room)}
                        >
                          <Text style={styles.smallEditText}>Edit</Text>
                        </Pressable>
                      </View>
                    ))}
                </View>
              ))
            ) : (
              <View style={styles.emptyRooms}>
                <Text style={styles.emptyRoomsTitle}>No rooms added yet</Text>
                <Text style={styles.emptyRoomsText}>
                  Room editing can be connected here after the admin data model
                  is finalized.
                </Text>
              </View>
            )}

            <Pressable style={styles.saveButton} onPress={onClose}>
              <Text style={styles.saveButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function EditRoomModal({
  room,
  onChange,
  onClose,
  onSave,
}: {
  room: BuildingRoom | null;
  onChange: (room: BuildingRoom | null) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <Modal transparent visible={Boolean(room)} animationType="fade">
      <View style={styles.modalOverlay}>
        {room ? (
          <View style={styles.roomEditModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Room</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            <View style={styles.roomEditContent}>
              <View style={styles.roomPhotoColumn}>
                <View style={styles.roomImagePreview}>
                  <Text style={styles.editImageText}>Photo</Text>
                </View>

                <Pressable style={styles.changePhotoButton}>
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </Pressable>

                <Text style={styles.photoHint}>JPG, PNG, max 10MB</Text>
              </View>

              <View style={styles.roomEditForm}>
                <AdminTextField
                  compact
                  label="Room Name"
                  value={room.name}
                  onChangeText={(name) => onChange({ ...room, name })}
                />

                <AdminTextField
                  compact
                  label="Room Type"
                  value={room.type}
                  onChangeText={(type) =>
                    onChange({ ...room, type: type as never })
                  }
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  multiline
                  onChangeText={(description) =>
                    onChange({ ...room, description })
                  }
                  placeholder="Room description"
                  style={[styles.input, styles.roomDescriptionInput]}
                  value={room.description ?? ""}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={onSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  webOnlyContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  webOnlyTitle: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },

  webOnlyText: {
    color: "#4b5563",
    fontSize: 15,
    textAlign: "center",
  },

  loginContainer: {
    alignItems: "stretch",
    backgroundColor: "#f3f4f6",
    flex: 1,
    flexDirection: "row",
    minHeight: 560,
  },

  loginBrandPanel: {
    backgroundColor: "#111827",
    flex: 1,
    justifyContent: "center",
    padding: 48,
  },

  logoBox: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    height: 84,
    justifyContent: "center",
    marginBottom: 24,
    width: 84,
  },

  logoText: {
    color: "#111827",
    fontSize: 27,
    fontWeight: "900",
  },

  loginBrandTitle: {
    color: "white",
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 48,
    maxWidth: 320,
  },

  loginBrandSubtitle: {
    color: "#d1d5db",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 14,
  },

  loginPanel: {
    alignItems: "stretch",
    backgroundColor: "white",
    flex: 1.1,
    justifyContent: "center",
    paddingHorizontal: 72,
  },

  adminIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: 12,
    width: 56,
  },

  adminIconText: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
  },

  loginTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },

  loginSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 6,
    textAlign: "center",
  },

  prototypeCredentials: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 22,
    textAlign: "center",
  },

  loginError: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  inputLabel: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },

  input: {
    backgroundColor: "white",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 14,
    marginBottom: 14,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 6,
    paddingVertical: 13,
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },

  adminShell: {
    backgroundColor: "#f3f4f6",
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    backgroundColor: "#111827",
    padding: 24,
    width: 260,
  },

  sidebarLogoRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 28,
  },

  sidebarLogo: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    marginRight: 12,
    width: 46,
  },

  sidebarLogoText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  sidebarBrand: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  sidebarLabel: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  sidebarItem: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 16,
  },

  adminContent: {
    flexGrow: 1,
    padding: 24,
  },

  adminHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  pageTitle: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 4,
  },

  saveMessage: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },

  adminUserCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 10,
  },

  userAvatar: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  userAvatarText: {
    color: "#111827",
    fontWeight: "900",
  },

  userName: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },

  userRole: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  resetButton: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  resetButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  logoutButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
  },

  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  statCard: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },

  statValue: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },

  statLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },

  toolbar: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },

  searchInput: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  filterList: {
    gap: 8,
  },

  filterChip: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  filterChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  filterChipText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: "white",
  },

  tableCard: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },

  tableRow: {
    alignItems: "center",
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 58,
    paddingHorizontal: 14,
  },

  tableHeader: {
    backgroundColor: "#f9fafb",
    minHeight: 44,
  },

  loadingRow: {
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },

  loadingText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "800",
  },

  tableCell: {
    color: "#374151",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },

  nameCell: {
    flex: 2,
  },

  actionsCell: {
    alignItems: "center",
    flex: 1.2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },

  locationName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
  },

  locationDescription: {
    color: "#6b7280",
    fontSize: 12,
    marginTop: 3,
  },

  secondaryActionButton: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  secondaryActionText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  editButton: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  editButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900",
  },

  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.62)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  editModal: {
    backgroundColor: "white",
    borderRadius: 8,
    maxWidth: 700,
    padding: 16,
    width: "100%",
  },

  roomsModal: {
    backgroundColor: "white",
    borderRadius: 8,
    maxWidth: 640,
    padding: 20,
    width: "100%",
  },

  roomEditModal: {
    backgroundColor: "white",
    borderRadius: 8,
    maxWidth: 640,
    padding: 16,
    width: "100%",
  },

  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "900",
  },

  modalSubtitle: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 3,
  },

  modalClose: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    paddingHorizontal: 8,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  editContent: {
    flexDirection: "row",
    gap: 18,
  },

  editPreviewColumn: {
    width: 230,
  },

  editImagePreview: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    height: 152,
    justifyContent: "center",
    marginBottom: 12,
  },

  editImageText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "900",
  },

  changePhotoButton: {
    alignItems: "center",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  changePhotoText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },

  photoHint: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },

  editFormColumn: {
    flex: 1,
    minWidth: 0,
  },

  compactFormGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  field: {
    flexBasis: "48%",
    flexGrow: 1,
  },

  compactField: {
    flexBasis: "47%",
    flexGrow: 1,
  },

  compactInput: {
    marginBottom: 10,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  statusButtonGroup: {
    flexBasis: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  statusButton: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  statusButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  statusButtonText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  statusButtonTextActive: {
    color: "white",
  },

  textArea: {
    minHeight: 82,
    textAlignVertical: "top",
  },

  compactTextArea: {
    marginBottom: 10,
    minHeight: 62,
    textAlignVertical: "top",
  },

  roomEditContent: {
    flexDirection: "row",
    gap: 18,
  },

  roomPhotoColumn: {
    width: 280,
  },

  roomImagePreview: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    height: 150,
    justifyContent: "center",
    marginBottom: 12,
  },

  roomEditForm: {
    flex: 1,
    minWidth: 0,
  },

  roomDescriptionInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },

  manageRoomsRow: {
    alignItems: "center",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  manageRoomsText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },

  manageRoomsArrow: {
    color: "#4b5563",
    fontSize: 16,
    fontWeight: "900",
  },

  modalFooter: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 8,
  },

  cancelButton: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },

  cancelButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "900",
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },

  saveButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },

  floorGroup: {
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },

  floorTitle: {
    backgroundColor: "#f9fafb",
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    padding: 12,
  },

  roomRow: {
    alignItems: "center",
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
    flexDirection: "row",
    padding: 12,
  },

  roomNumber: {
    color: "#111827",
    flex: 1,
    fontSize: 13,
    fontWeight: "900",
  },

  roomType: {
    color: "#6b7280",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  smallEditButton: {
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  smallEditText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyRooms: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 18,
  },

  emptyRoomsTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  emptyRoomsText: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
