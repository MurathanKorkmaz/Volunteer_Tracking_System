import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backButton: {
        position: "absolute",
        top: screenHeight * 0.09,
        left: screenWidth * 0.05,
        zIndex: 10,
    },
    backIcon: {
        fontSize: Math.min(screenWidth * 0.12, 48),
        color: "#000",
        fontWeight: "200",
    },
    header: {
        alignItems: "center",
        paddingVertical: screenHeight * 0.025,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: screenHeight * 0.025,
    },
    headerText: {
        fontSize: Math.min(screenWidth * 0.06, 24),
        fontWeight: "bold",
        color: "#333",
    },
    searchContainer: {
        paddingHorizontal: screenWidth * 0.05,
        marginBottom: screenHeight * 0.012,
        marginTop: screenHeight * 0.068,
    },
    searchInput: {
        height: screenHeight * 0.065,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#333",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scrollableList: {
        height: screenHeight * 0.65,
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: screenHeight * 0.025,
        paddingVertical: screenHeight * 0.012,
        borderRadius: 10,
        borderWidth: 0,
    },
    announcementCard: {
        backgroundColor: "#FFF",
        padding: screenWidth * 0.04,
        borderRadius: 10,
        marginBottom: screenHeight * 0.018,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    announcementDetails: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#333",
    },
    announcementDate: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#666",
        marginTop: screenHeight * 0.006,
    },
    announcementActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    announcementDescription: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#555",
        marginTop: screenHeight * 0.006,
    },
    announcementVolunterCounter: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        fontWeight: "bold",
        color: "#007BFF",
        marginTop: screenHeight * 0.006,
    },
    editButton: {
        backgroundColor: "#FFD700",
        paddingVertical: screenHeight * 0.006,
        paddingHorizontal: screenWidth * 0.025,
        borderRadius: 5,
        marginRight: screenWidth * 0.025,
    },
    deleteButton: {
        backgroundColor: "#FF5733",
        paddingVertical: screenHeight * 0.006,
        paddingHorizontal: screenWidth * 0.025,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#FFF",
        fontWeight: "bold",
    },
    loadingText: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: screenHeight * 0.025,
        color: "#FF6347",
    },
    emptyText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        textAlign: "center",
        color: "#999",
        marginTop: screenHeight * 0.025,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 0,
        marginTop: screenHeight * 0.065,
        marginHorizontal: screenWidth * 0.05,
    },
    tabButton: {
        flex: 1,
        paddingVertical: screenHeight * 0.012,
        paddingHorizontal: screenWidth * 0.05,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: screenWidth * 0.012,
    },
    tabButtonActive1: {
        backgroundColor: "#4CAF50",
    },
    tabButtonActive2: {
        backgroundColor: "#FF5733",
    },
    tabButtonText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#FFD700",
    },
    tabButtonTextActive: {
        color: "#FFF",
    },
});