import { StyleSheet, Dimensions, Platform } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    fixedHeader: {
        alignItems: "center",
        paddingVertical: screenHeight * 0.025,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: screenHeight * 0.012,
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
    headerText: {
        fontSize: Math.min(screenWidth * 0.06, 24),
        fontWeight: "bold",
        color: "#333",
    },
    scrollableContent: {
        flex: 1,
        marginTop: screenHeight * 0.025,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: Platform.OS === 'ios' ? screenHeight * 0.1 : screenHeight * 0.05,
    },
    inputContainer: {
        marginHorizontal: screenWidth * 0.05,
        padding: screenWidth * 0.05,
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#333",
        marginBottom: screenHeight * 0.012,
    },
    input: {
        height: screenHeight * 0.065,
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        marginBottom: screenHeight * 0.025,
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#333",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        justifyContent: "center",
    },
    dateText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#333",
    },
    textArea: {
        height: screenHeight * 0.13,
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: screenWidth * 0.04,
        paddingVertical: screenHeight * 0.012,
        fontSize: Math.min(screenWidth * 0.04, 16),
        color: "#333",
        textAlignVertical: "top",
    },
    buttonContainer: {
        marginHorizontal: screenWidth * 0.05,
        marginTop: screenHeight * 0.025,
        marginBottom: Platform.OS === 'ios' ? screenHeight * 0.05 : screenHeight * 0.03,
    },
    saveButton: {
        paddingVertical: screenHeight * 0.02,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        color: "#FFF",
    },
    dropdownContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: screenHeight * 0.025,
    },
    dropdownItem: {
        width: "48%",
        paddingVertical: screenHeight * 0.012,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 5,
        alignItems: "center",
        marginBottom: screenHeight * 0.012,
    },
    dropdownItemSelected: {
        backgroundColor: "#FFD700",
    },
    dropdownText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        fontWeight: "bold",
        color: "#FFD700",
    },
    dropdownTextSelected: {
        color: "#FFF",
    },
});
