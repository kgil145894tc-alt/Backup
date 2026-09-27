import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  webOnlyContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  webOnlyTitle: {
    color: "#111827",
    fontFamily: "DashboardMedium",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },

  webOnlyText: {
    color: "#4b5563",
    fontFamily: "DashboardRegular",
    fontSize: 15,
    textAlign: "center",
  },

  loginScrollContent: {
    backgroundColor: "#991F2B",
    flexGrow: 1,
  },

  loginScrollContentCompact: {
    backgroundColor: "#FFFCFA",
  },

  loginContainer: {
    alignItems: "stretch",
    backgroundColor: "#991F2B",
    flex: 1,
    flexDirection: "row",
    minHeight: 680,
  },

  loginContainerCompact: {
    flexDirection: "column",
    minHeight: 0,
  },

  loginContainerNarrow: {
    flexGrow: 1,
  },

  loginBrandPanel: {
    backgroundColor: "#991F2B",
    flex: 0.47,
    minHeight: 680,
    overflow: "hidden",
  },

  loginBrandPanelCompact: {
    flex: 0,
    minHeight: 320,
  },

  loginBrandPanelNarrow: {
    minHeight: 238,
  },

  loginCampusImage: {
    bottom: 0,
    height: "65%",
    left: 0,
    opacity: 0.2,
    position: "absolute",
    right: 0,
  },

  loginWatermark: {
    height: 290,
    opacity: 0.1,
    position: "absolute",
    right: -40,
    top: -80,
    width: 290,
  },

  loginTopDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 18,
  },

  loginTopDividerNarrow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  loginDividerDot: {
    backgroundColor: "#FEBF1F",
    borderRadius: 3,
    height: 6,
    width: 6,
  },

  loginDividerLine: {
    backgroundColor: "#CA8A70",
    flex: 1,
    height: 1,
  },

  loginPlane: {
    height: 30,
    width: 30,
  },

  loginBrandContent: {
    padding: 26,
    zIndex: 1,
  },

  loginBrandContentCompact: {
    padding: 22,
  },

  loginBrandContentNarrow: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },

  loginBrandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },

  loginLogoImage: {
    height: 116,
    width: 116,
  },

  loginLogoImageNarrow: {
    height: 84,
    width: 84,
  },

  loginBrandTitle: {
    color: "white",
    fontFamily: "AdminBrand",
    fontSize: 46,
    fontWeight: "normal",
    letterSpacing: 0,
    lineHeight: 48,
    textAlign: "center",
    textShadowColor: "#64131C",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 3,
  },

  loginBrandTitleNarrow: {
    fontSize: 34,
    lineHeight: 36,
  },

  loginBrandGold: {
    color: "#FFC928",
  },

  loginTaglineDivider: {
    backgroundColor: "#C78835",
    height: 1,
    marginBottom: 10,
    marginTop: 12,
    width: "70%",
  },

  loginTaglineDividerNarrow: {
    alignSelf: "center",
    marginBottom: 8,
    marginTop: 8,
    width: "58%",
  },

  loginTaglineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
  },

  loginTaglineRowNarrow: {
    gap: 10,
  },

  loginTagline: {
    color: "white",
    fontFamily: "AdminMedium",
    fontSize: 20,
    fontWeight: "800",
  },

  loginTaglineNarrow: {
    fontSize: 13,
  },

  loginWaves: {
    bottom: 0,
    height: "32%",
    left: 0,
    position: "absolute",
    right: 0,
  },

  loginPanel: {
    alignItems: "stretch",
    backgroundColor: "#FFFCFA",
    flex: 0.53,
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 48,
    paddingVertical: 70,
  },

  loginPanelCompact: {
    flex: 0,
    paddingHorizontal: 28,
    paddingVertical: 42,
  },

  loginPanelNarrow: {
    paddingHorizontal: 18,
    paddingVertical: 28,
  },

  loginFormBackground: {
    ...StyleSheet.absoluteFill,
    opacity: 0.5,
  },

  loginForm: {
    alignSelf: "center",
    maxWidth: 710,
    width: "100%",
  },

  loginFormNarrow: {
    maxWidth: 430,
  },

  adminAvatarImage: {
    alignSelf: "center",
    height: 104,
    width: 110,
  },

  adminAvatarImageNarrow: {
    height: 74,
    width: 78,
  },

  loginTitle: {
    color: "#741324",
    fontFamily: "AdminMedium",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  loginTitleNarrow: {
    fontSize: 24,
  },

  loginSubtitle: {
    color: "#3C4147",
    fontFamily: "AdminRegular",
    fontSize: 20,
    marginBottom: 24,
    textAlign: "center",
  },

  loginSubtitleNarrow: {
    fontSize: 14,
    marginBottom: 16,
  },

  prototypeCredentials: {
    color: "#6b7280",
    fontFamily: "AdminRegular",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 22,
    textAlign: "center",
  },

  loginError: {
    color: "#A42330",
    fontFamily: "AdminRegular",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },

  loginErrorNarrow: {
    fontSize: 12,
    marginBottom: 8,
    marginTop: 8,
  },

  inputLabel: {
    color: "#3C4147",
    fontFamily: "AdminRegular",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 14,
  },

  inputLabelNarrow: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "white",
    borderColor: "#E4C6CB",
    borderRadius: 10,
    borderWidth: 1,
    color: "#2A2D31",
    fontSize: 14,
    marginBottom: 14,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  loginInputRow: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#ADB1B4",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 60,
    paddingLeft: 16,
    paddingRight: 8,
  },

  loginInputRowNarrow: {
    borderRadius: 12,
    gap: 8,
    minHeight: 48,
    paddingLeft: 12,
    paddingRight: 4,
  },

  loginInput: {
    color: "#3C4147",
    flex: 1,
    fontFamily: "AdminRegular",
    fontSize: 18,
    height: 58,
    minWidth: 0,
    outlineStyle: "none" as never,
  },

  loginInputNarrow: {
    fontSize: 14,
    height: 46,
  },

  eyeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
    width: 44,
  },

  eyeButtonNarrow: {
    height: 38,
    width: 38,
  },

  iconButtonHover: {
    backgroundColor: "#FFF5F6",
    borderRadius: 999,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#AF2532",
    borderRadius: 24,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 60,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  primaryButtonNarrow: {
    borderRadius: 16,
    marginTop: 18,
    minHeight: 48,
  },

  primaryButtonHover: {
    backgroundColor: "#971F2A",
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  buttonPressed: {
    opacity: 0.78,
  },

  primaryButtonText: {
    color: "white",
    fontFamily: "AdminBold",
    fontSize: 24,
    fontWeight: "900",
  },

  primaryButtonTextNarrow: {
    fontSize: 16,
  },

  adminShell: {
    backgroundColor: "#F4EFE4",
    flex: 1,
    flexDirection: "row",
  },

  adminShellCompact: {
    flexDirection: "column",
  },

  sidebar: {
    backgroundColor: "#991F2B",
    minHeight: "100%",
    overflow: "hidden",
    padding: 28,
    width: 286,
  },

  sidebarCompact: {
    minHeight: 128,
    padding: 18,
    width: "100%",
  },

  sidebarCampusImage: {
    ...StyleSheet.absoluteFill,
    opacity: 0.17,
  },

  sidebarOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(153, 31, 43, 0.78)",
  },

  sidebarLogoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  sidebarLogoImage: {
    height: 68,
    width: 68,
  },

  sidebarBrand: {
    color: "white",
    fontFamily: "DashboardBrand",
    fontSize: 24,
    fontWeight: "normal",
    lineHeight: 26,
  },

  sidebarBrandGold: {
    color: "#FFC928",
  },

  sidebarLabel: {
    color: "rgba(255, 255, 255, 0.72)",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  sidebarItem: {
    color: "rgba(255, 255, 255, 0.82)",
    fontFamily: "DashboardMedium",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  sidebarItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 12,
    color: "white",
  },

  sidebarWaves: {
    bottom: -10,
    height: 120,
    left: 0,
    opacity: 0.92,
    position: "absolute",
    right: 0,
  },

  adminContent: {
    flexGrow: 1,
    padding: 28,
  },

  adminContentNarrow: {
    padding: 14,
  },

  adminHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
    marginBottom: 22,
  },

  adminHeaderNarrow: {
    alignItems: "stretch",
    gap: 12,
  },

  headingGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },

  headingGroupNarrow: {
    alignItems: "flex-start",
  },

  headingIconCircle: {
    alignItems: "center",
    backgroundColor: "#FFD044",
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  pageTitle: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 32,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 14,
    marginTop: 4,
  },

  saveMessage: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },

  adminUserCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 12,
    shadowColor: "#6E1C28",
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },

  adminUserCardNarrow: {
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },

  userAvatar: {
    height: 36,
    width: 36,
  },

  userAvatarText: {
    color: "#111827",
    fontWeight: "900",
  },

  userName: {
    color: "#2A2D31",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  userRole: {
    color: "#7C848B",
    fontFamily: "DashboardRegular",
    fontSize: 11,
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: "#BA2634",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  logoutButtonHover: {
    backgroundColor: "#971F2A",
  },

  resetButton: {
    backgroundColor: "#FFF5F6",
    borderColor: "#E4C6CB",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  outlineButtonHover: {
    backgroundColor: "#FDE8EB",
    borderColor: "#BA2634",
  },

  resetButtonText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
  },

  logoutButtonText: {
    color: "white",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#D6D2CA",
    borderWidth: 1,
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 14,
    minWidth: 190,
    padding: 18,
  },

  statIconWrap: {
    alignItems: "center",
    backgroundColor: "#FFD044",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },

  statValue: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 28,
    fontWeight: "900",
  },

  statLabel: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },

  toolbar: {
    backgroundColor: "white",
    borderRadius: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#6E1C28",
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },

  searchBox: {
    alignItems: "center",
    backgroundColor: "#F8F1F2",
    borderColor: "#E4C6CB",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minWidth: 260,
    paddingHorizontal: 14,
  },

  searchInput: {
    color: "#2A2D31",
    flex: 1,
    fontFamily: "DashboardRegular",
    fontSize: 14,
    fontWeight: "700",
    outlineStyle: "none" as never,
    paddingVertical: 10,
  },

  filterList: {
    gap: 8,
    paddingVertical: 2,
  },

  filterChip: {
    alignItems: "center",
    borderColor: "#E4C6CB",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  filterChipHover: {
    backgroundColor: "#FFF5F6",
    borderColor: "#BA2634",
  },

  filterChipActive: {
    backgroundColor: "#BA2634",
    borderColor: "#BA2634",
  },

  filterChipActiveHover: {
    backgroundColor: "#971F2A",
    borderColor: "#971F2A",
  },

  filterChipText: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 12,
    fontWeight: "800",
  },

  filterChipTextActive: {
    color: "white",
  },

  tableCard: {
    backgroundColor: "white",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#6E1C28",
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },

  tableInner: {
    minWidth: 760,
    width: "100%",
  },

  tableRow: {
    alignItems: "center",
    borderBottomColor: "#F0DEE1",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 18,
  },

  tableHeader: {
    backgroundColor: "#F8F1F2",
    minHeight: 48,
  },

  loadingRow: {
    alignItems: "center",
    minHeight: 90,
    justifyContent: "center",
  },

  loadingText: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 14,
    fontWeight: "800",
  },

  tableCell: {
    color: "#5C646B",
    flex: 1,
    fontFamily: "DashboardRegular",
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
    justifyContent: "center",
    textAlign: "center",
  },

  locationName: {
    color: "#2A2D31",
    fontFamily: "DashboardMedium",
    fontSize: 14,
    fontWeight: "900",
  },

  locationDescription: {
    color: "#7C848B",
    fontFamily: "DashboardRegular",
    fontSize: 12,
    marginTop: 3,
  },

  secondaryActionButton: {
    backgroundColor: "#FFF5F6",
    borderColor: "#E4C6CB",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  secondaryActionText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
  },

  editButton: {
    alignItems: "center",
    backgroundColor: "#FEBF1F",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
    width: 34,
  },

  editButtonHover: {
    backgroundColor: "#FFD044",
  },

  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(35, 20, 22, 0.58)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  modalOverlayNarrow: {
    padding: 12,
  },

  modalNarrow: {
    borderRadius: 20,
    padding: 16,
  },

  editModal: {
    backgroundColor: "white",
    borderRadius: 28,
    maxHeight: "88%",
    maxWidth: 820,
    padding: 24,
    shadowColor: "#321014",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: "100%",
  },

  roomsModal: {
    backgroundColor: "white",
    borderRadius: 28,
    maxHeight: "88%",
    maxWidth: 700,
    padding: 24,
    shadowColor: "#321014",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: "100%",
  },

  roomsScroll: {
    flexGrow: 0,
    maxHeight: 520,
  },

  roomsScrollContent: {
    paddingBottom: 4,
  },

  roomEditModal: {
    backgroundColor: "white",
    borderRadius: 28,
    maxWidth: 620,
    padding: 24,
    shadowColor: "#321014",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: "100%",
  },

  notificationComposerModal: {
    backgroundColor: "white",
    borderRadius: 28,
    maxHeight: "88%",
    maxWidth: 620,
    padding: 24,
    shadowColor: "#321014",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: "100%",
  },

  notificationComposerScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },

  notificationComposerContent: {
    flexGrow: 0,
    paddingBottom: 4,
  },

  notificationField: {
    width: "100%",
  },

  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  modalTitle: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 24,
    fontWeight: "900",
  },

  modalSubtitle: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 13,
    marginTop: 3,
  },

  modalClose: {
    color: "#B7B0AA",
    fontFamily: "DashboardMedium",
    fontSize: 28,
    fontWeight: "900",
    paddingHorizontal: 8,
  },

  modalCloseButton: {
    alignItems: "center",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
    width: 36,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  editContent: {
    flexDirection: "row",
    gap: 22,
  },

  editScroll: {
    flexGrow: 0,
    maxHeight: 520,
  },

  editScrollContent: {
    paddingBottom: 8,
  },

  editPreviewColumn: {
    width: 250,
  },

  editImagePreview: {
    alignItems: "center",
    backgroundColor: "#F8F1F2",
    borderColor: "#E4C6CB",
    borderRadius: 18,
    borderWidth: 1,
    height: 168,
    justifyContent: "center",
    marginBottom: 12,
  },

  editImageText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 14,
    fontWeight: "900",
  },

  changePhotoButton: {
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    borderColor: "#E4C6CB",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  changePhotoText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  photoHint: {
    color: "#7C848B",
    fontFamily: "DashboardRegular",
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
    gap: 12,
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
    borderColor: "#E4C6CB",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  statusButtonHover: {
    backgroundColor: "#FFF5F6",
    borderColor: "#BA2634",
  },

  statusButtonActive: {
    backgroundColor: "#BA2634",
    borderColor: "#BA2634",
  },

  statusButtonActiveHover: {
    backgroundColor: "#971F2A",
    borderColor: "#971F2A",
  },

  statusButtonText: {
    color: "#6F7478",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
  },

  statusButtonTextActive: {
    color: "white",
  },

  notificationCategoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  relatedLocationList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  notificationMessageInput: {
    minHeight: 120,
    textAlignVertical: "top",
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
    backgroundColor: "#F8F1F2",
    borderColor: "#E4C6CB",
    borderRadius: 18,
    borderWidth: 1,
    height: 150,
    justifyContent: "center",
    marginBottom: 12,
  },

  roomEditForm: {
    minWidth: 0,
  },

  roomEditFieldRow: {
    flexDirection: "row",
    gap: 12,
  },

  roomDescriptionInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },

  manageRoomsRow: {
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    borderColor: "#E4C6CB",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  manageRoomsText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  manageRoomsArrow: {
    color: "#4b5563",
    fontFamily: "DashboardMedium",
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
    borderColor: "#E4C6CB",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 11,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  cancelButtonHover: {
    backgroundColor: "#FFF5F6",
    borderColor: "#BA2634",
  },

  cancelButtonText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  saveButton: {
    alignItems: "center",
    backgroundColor: "#BA2634",
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 11,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  saveButtonHover: {
    backgroundColor: "#971F2A",
  },

  saveButtonText: {
    color: "white",
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  floorGroup: {
    borderColor: "#F0DEE1",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },

  floorTitle: {
    backgroundColor: "#F8F1F2",
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 14,
    fontWeight: "900",
    padding: 12,
  },

  roomRow: {
    alignItems: "center",
    borderTopColor: "#F0DEE1",
    borderTopWidth: 1,
    flexDirection: "row",
    padding: 12,
  },

  roomNumber: {
    color: "#2A2D31",
    flex: 1,
    fontFamily: "DashboardMedium",
    fontSize: 13,
    fontWeight: "900",
  },

  roomType: {
    color: "#6F7478",
    flex: 1,
    fontFamily: "DashboardRegular",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  smallEditButton: {
    backgroundColor: "#FFF5F6",
    borderColor: "#E4C6CB",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  smallEditText: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyRooms: {
    backgroundColor: "#F8F1F2",
    borderRadius: 16,
    padding: 18,
  },

  emptyRoomsTitle: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 16,
    fontWeight: "900",
  },

  emptyRoomsText: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  successDialog: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 28,
    maxWidth: 390,
    padding: 28,
    shadowColor: "#321014",
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: "100%",
  },

  successIcon: {
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    borderRadius: 999,
    height: 72,
    justifyContent: "center",
    marginBottom: 14,
    width: 72,
  },

  successIconText: {
    color: "#BA2634",
    fontFamily: "DashboardMedium",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
  },

  successTitle: {
    color: "#A42330",
    fontFamily: "DashboardMedium",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },

  successMessage: {
    color: "#6F7478",
    fontFamily: "DashboardRegular",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },

  successButton: {
    alignItems: "center",
    backgroundColor: "#BA2634",
    borderRadius: 14,
    marginTop: 22,
    paddingHorizontal: 34,
    paddingVertical: 12,
    transitionDuration: "180ms" as never,
    transitionProperty: "background-color, border-color, opacity, transform" as never,
    transitionTimingFunction: "ease" as never,
  },

  successButtonText: {
    color: "white",
    fontFamily: "DashboardMedium",
    fontSize: 14,
    fontWeight: "900",
  },
});
