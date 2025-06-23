import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: screenHeight * 0.025,
    },
    backButton: {
        position: "absolute",
        top: screenHeight * 0.025,
        left: screenWidth * 0.04,
        zIndex: 10,
    },
    backIcon: {
        fontSize: Math.min(screenWidth * 0.12, 48),
        color: "#000",
        fontWeight: "200",
    },
    logoContainer: {
        marginTop: screenHeight * -0.05,
        marginBottom: screenHeight * 0.025,
        alignItems: "center",
    },
    logo: {
        width: Math.min(screenWidth * 0.4, 150),
        height: Math.min(screenWidth * 0.4, 150),
    },
    appName: {
        fontSize: Math.min(screenWidth * 0.055, 22),
        fontWeight: "bold",
        color: "#003366",
        marginTop: screenHeight * 0.012,
        textTransform: "uppercase",
        letterSpacing: 2,
        textAlign: "center",
    },
    formContainer: {
        width: "85%",
        padding: screenWidth * 0.08,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        alignItems: "center",
        marginTop: screenHeight * 0.018,
    },
    title: {
        fontSize: Math.min(screenWidth * 0.07, 28),
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.03,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: screenHeight * 0.065,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: screenWidth * 0.025,
        marginBottom: screenHeight * 0.018,
        fontSize: Math.min(screenWidth * 0.04, 16),
        backgroundColor: "#fafafa",
    },
    button: {
        backgroundColor: "#FF5733",
        borderRadius: 8,
        paddingVertical: screenHeight * 0.018,
        paddingHorizontal: screenWidth * 0.05,
        width: "100%",
        alignItems: "center",
        marginBottom: screenHeight * 0.025,
    },
    buttonText: {
        color: "#fff",
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
    },
    registerContainer: {
        flexDirection: "row",
        marginTop: screenHeight * 0.006,
    },
    registerText1: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#888",
    },
    registerText2: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        color: "#007BFF",
    },
    // Loading overlay styles
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    loadingText: {
        color: '#3B82F6',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
    },
});