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
    scrollableList: {
        height: "60%",
        width: "90%",
        marginHorizontal: "5%",
        marginTop: screenHeight * 0.02,
        marginBottom: screenHeight * 0.025,
        paddingVertical: screenHeight * 0.012,
        borderRadius: 10,
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
        marginTop: screenHeight * 0.065,
        marginBottom: 0,
    },
    datePickerText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#000",
        fontWeight: "bold",
    },
    emptyContainer: {
        alignItems: "center",
        marginTop: 30,
    },
    emptyText: {
        fontSize: 16,
        color: "#555",
        fontStyle: "italic",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginBottom: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },

    cardMonth: {
        fontSize: 20,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },

    cardYear: {
        fontSize: 16,
        fontWeight: "400",
        color: "#777",
    },

    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingText: {
        marginTop: 10,
        color: "#3B82F6",
        fontSize: 16,
        fontWeight: "bold",
    },
});
