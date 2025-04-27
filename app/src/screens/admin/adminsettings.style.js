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
        marginBottom: screenHeight * 0.025,
    },
    headerText: {
        fontSize: Math.min(screenWidth * 0.06, 24),
        fontWeight: "bold",
        color: "#333",
    },
    optionsContainer: {
        paddingHorizontal: screenWidth * 0.05,
        paddingBottom: screenHeight * 0.025,
        marginTop: screenHeight * 0.065,
    },
    optionCard: {
        backgroundColor: "#E6E6FA",
        borderRadius: 15,
        padding: screenWidth * 0.05,
        marginBottom: screenHeight * 0.018,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionTitle: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.006,
        textAlign: "center",
    },
    optionDescription: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#666",
        textAlign: "center",
    },
});