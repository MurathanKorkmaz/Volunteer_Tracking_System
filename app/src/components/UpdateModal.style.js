import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  overlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modalBox: {
    width: Math.min(width * 0.9, 360),
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },

  boxRequired: {
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.35)",
  },
  boxOptional: {
    borderWidth: 1,
    borderColor: "rgba(10,132,255,0.25)",
  },

  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  badgeRequired: {
    backgroundColor: "#FF453A",
  },
  badgeOptional: {
    backgroundColor: "#0A84FF",
  },
  badgeEmoji: {
    fontSize: 34,
    color: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1C1C1E",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15.5,
    lineHeight: 22,
    color: "#6E6E73",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  versionPill: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  versionPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    width: "100%",
    justifyContent: "center",
  },

  primaryBtn: {
    minWidth: 170,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#0A84FF",
    ...(Platform.OS === "android"
      ? { elevation: 6 }
      : { shadowColor: "#0A84FF", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }),
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  secondaryBtn: {
    minWidth: 130,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  secondaryBtnText: {
    color: "#1C1C1E",
    fontSize: 15.5,
    fontWeight: "600",
    textAlign: "center",
  },

  note: {
    marginTop: 12,
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
});
