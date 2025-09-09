import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    background: {
        flex: 1,
        backgroundColor: "#FFF",
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
        marginBottom: screenHeight * 0.01,
        marginTop: screenHeight * 0.068,
    },
    searchInput: {
        height: screenHeight * 0.06,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        fontSize: Math.min(screenWidth * 0.04, 16),
        elevation: 3,
        color: "#333",
    },
    scrollableList: {
        flex: 1,
        width: "100%",
        paddingTop: screenHeight * 0.01,
        paddingHorizontal: screenWidth * 0.05,
        paddingBottom: screenHeight * 0.02,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingContainer: {
        backgroundColor: "#FFFFFF",
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
        fontSize: 16,
        color: "#333",
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 15,
        padding: screenWidth * 0.04,
        marginBottom: screenHeight * 0.015,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardName: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        color: "#333",
        fontWeight: "500",
    },
    cardScore: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "600",
    },
    rankNumber: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        marginRight: screenWidth * 0.02,
        fontWeight: "600",
    },
});