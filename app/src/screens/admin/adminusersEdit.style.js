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
    inputContainer1: {
        marginTop: 0,
        width: "100%",
        marginHorizontal: "%25",
        padding: screenWidth * 0.05,
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputContainer2: {
        marginTop: screenHeight * 0.037,
        width: "100%",
        marginHorizontal: "%20",
        padding: screenWidth * 0.04,
        backgroundColor: "#F7F9FC",
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    userNameText: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.025,
        textAlign: "center",
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: screenHeight * 0.025,
    },
    roleButton: {
        flex: 1,
        marginHorizontal: screenWidth * 0.012,
        paddingVertical: screenHeight * 0.012,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 5,
        alignItems: "center",
    },
    roleButtonActive: {
        backgroundColor: "#FFD700",
    },
    roleButtonText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#FFD700",
    },
    roleButtonTextActive: {
        color: "#FFF",
    },
    blockButton: {
        paddingVertical: screenHeight * 0.012,
        borderWidth: 2,
        borderColor: "#FF5733",
        borderRadius: 5,
        alignItems: "center",
    },
    blockButtonActive: {
        backgroundColor: "#FF5733",
    },
    blockButtonText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#333333",
    },
    saveButton: {
        marginTop: screenHeight * 0.025,
        marginHorizontal: screenWidth * 0.05,
        paddingVertical: screenHeight * 0.02,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        marginBottom: screenHeight * 0.037,
    },
    saveButtonText: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#FFF",
    },
    deleteButton: {
        marginTop: screenHeight * 0.025,
        marginHorizontal: screenWidth * 0.05,
        paddingVertical: screenHeight * 0.02,
        borderRadius: 10,
        backgroundColor: "#FF5733",
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#333",
    },
    slider: {
        width: "100%",
        height: screenHeight * 0.05,
    },
    scrollContainer: {
        height: "60%",
        marginTop: screenHeight * 0.05,
        marginHorizontal: screenWidth * 0.05,
        borderRadius: 10,
        padding: screenHeight * 0.012,
        elevation: 0,
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        borderWidth: 0,
        backgroundColor: "transparent",
    },
    scrollWrapper: {
        flexGrow: 1,
        paddingVertical: screenHeight * 0.012,
        width: "100%"
    },
    numberInput: {
        height: screenHeight * 0.05,
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: screenWidth * 0.025,
        fontSize: Math.min(screenWidth * 0.04, 16),
        textAlign: 'center',
        backgroundColor: '#FFF'
    },
});
