import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
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
    scrollContainer: {
        alignItems: "center",
        paddingHorizontal: screenWidth * 0.05,
        paddingTop: screenHeight * 0.025,
    },
    card: {
        width: "90%",
        padding: screenWidth * 0.05,
        backgroundColor: "#E6E6FA",
        borderRadius: 15,
        marginBottom: screenHeight * 0.025,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        alignItems: "center",
    },
    cardTitle: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.012,
    },
    cardDescription: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#666",
        textAlign: "center",
    },
});
