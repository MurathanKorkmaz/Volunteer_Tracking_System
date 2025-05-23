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
        marginBottom: screenHeight * 0.006,
        marginTop: screenHeight * 0.075,
    },
    searchInput: {
        height: screenHeight * 0.065,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        fontSize: Math.min(screenWidth * 0.04, 16),
        elevation: 3,
        color: "#333",
    },
    scrollableList: {
        height: "73%",
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: screenHeight * 0.025,
        paddingVertical: screenHeight * 0.012,
        borderRadius: 10,
    },
    eventCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: screenWidth * 0.04,
        marginBottom: screenHeight * 0.018,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    eventDetails: {
        flex: 1,
    },
    eventName: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#333",
    },
    eventDate: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#666",
    },
    buttonText: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#FFF",
        fontWeight: "bold",
    },
    eventDetail: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#333",
        marginTop: screenHeight * 0.005,
    },
});