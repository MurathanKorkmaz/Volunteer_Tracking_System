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
        left: screenWidth * 0.06,
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
        marginBottom: screenHeight * 0.012,
    },
    headerText: {
        fontSize: Math.min(screenWidth * 0.06, 24),
        fontWeight: "bold",
        color: "#333",
    },
    searchContainer: {
        paddingHorizontal: screenWidth * 0.05,
        marginBottom: screenHeight * 0.012,
        marginTop: screenHeight * 0.075,
    },
    searchInput: {
        height: screenHeight * 0.065,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        fontSize: Math.min(screenWidth * 0.04, 16),
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        color: "#333",
    },
    scrollableList: {
        height: "64%",
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: screenHeight * 0.025,
        paddingVertical: screenHeight * 0.012,
        borderRadius: 10,
        borderWidth: 0,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: screenHeight * 0.012,
        paddingHorizontal: screenWidth * 0.05,
    },
    tabButton: {
        flex: 1,
        padding: screenHeight * 0.012,
        marginHorizontal: screenWidth * 0.012,
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabButtonActive: {
        backgroundColor: "#FFD701",
    },
    tabButtonText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#333",
    },
    tabButtonTextActive: {
        color: "#FFF",
    },
    userCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: screenWidth * 0.04,
        marginBottom: screenHeight * 0.018,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userName: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#333",
    },
    userRole: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#666",
    },
    editButton: {
        backgroundColor: "#FF5733",
        paddingVertical: screenHeight * 0.006,
        paddingHorizontal: screenWidth * 0.04,
        borderRadius: 5,
    },
    editButtonText: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#FFF",
        fontWeight: "bold",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    acceptButton: {
        backgroundColor: "#06a03e",
        padding: screenHeight * 0.012,
        borderRadius: 5,
        marginRight: screenWidth * 0.012,
    },
    acceptButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: Math.min(screenWidth * 0.035, 14),
    },
    rejectButton: {
        backgroundColor: "#FF5733",
        padding: screenHeight * 0.012,
        borderRadius: 5,
    },
    rejectButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: Math.min(screenWidth * 0.035, 14),
    },
});