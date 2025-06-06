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
        marginTop: screenHeight * 0.025,
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
        height: "48%",
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
    datePickerContainer: {
        alignItems: "center",
        marginVertical: screenHeight * 0.012,
    },
    datePickerButton: {
        width: "88%",
        backgroundColor: "#FFD700",
        paddingVertical: screenHeight * 0.012,
        paddingHorizontal: screenWidth * 0.05,
        borderRadius: 8,
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        alignItems: "center",
        alignSelf: "center",
        marginTop: screenHeight * 0.031,
        marginBottom: 0,
    },
    datePickerText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#000",
        fontWeight: "bold",
    },
    categoryBarContainer: {
        flexDirection: "row",
        height: screenHeight * 0.025,
        width: "80%",
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: screenHeight * 0.018,
    },
    categoryBar: {
        height: "100%",
        borderRadius: 3,
    },
    legendContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 0,
        marginTop: screenHeight * 0.075,
    },
    legendItem: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: screenWidth * 0.025,
    },
    legendColor: {
        width: screenWidth * 0.04,
        height: screenWidth * 0.04,
        borderRadius: 5,
        marginBottom: screenHeight * 0.003,
    },
    legendText: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        fontWeight: "bold",
        color: "#333",
    },
    legendPercentage: {
        fontSize: Math.min(screenWidth * 0.03, 12),
        fontWeight: "bold",
        color: "#666",
        marginTop: screenHeight * 0.003,
    },
});
