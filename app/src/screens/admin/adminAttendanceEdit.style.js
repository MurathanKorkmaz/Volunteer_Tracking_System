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
    scrollableList: {
        flexGrow: 1,
        marginHorizontal: screenWidth * 0.05,
        marginBottom: screenHeight * 0.025,
        paddingTop: screenHeight * 0.060,
    },
    eventCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: screenWidth * 0.04,
        marginBottom: screenHeight * 0.018,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventName: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        textAlign: "center",
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.012,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        textAlign: "center",
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#999",
        marginTop: screenHeight * 0.02,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
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

    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    acceptButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        marginRight: 5,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#FF5733",
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: "center",
        marginLeft: 5,
    },
    buttonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    
});