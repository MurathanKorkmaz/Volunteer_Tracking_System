import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFACD",
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
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        marginBottom: screenHeight * 0.025,
    },
    headerText: {
        fontSize: Math.min(screenWidth * 0.06, 24),
        fontWeight: "bold",
        color: "#333",
    },
    calendarContainer: {
        width: "90%",
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: "#FFF",
        padding: screenWidth * 0.04,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginTop: screenHeight * 0.12,
        alignSelf: "center",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "80%",
        backgroundColor: "#FFF",
        padding: screenWidth * 0.05,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: Math.min(screenWidth * 0.045, 18),
        fontWeight: "bold",
        marginBottom: screenHeight * 0.012,
    },
    modalText: {
        fontSize: Math.min(screenWidth * 0.04, 16),
        marginBottom: screenHeight * 0.012,
    },
    closeButton: {
        backgroundColor: "#FFD701",
        paddingVertical: screenHeight * 0.012,
        paddingHorizontal: screenWidth * 0.05,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#000",
        fontWeight: "bold",
    },
    categoryLegend: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: screenHeight * 0.012,
        paddingVertical: screenHeight * 0.012,
        backgroundColor: "#FFF",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendColor: {
        width: screenWidth * 0.04,
        height: screenWidth * 0.04,
        borderRadius: screenWidth * 0.02,
        marginRight: screenWidth * 0.012,
    },
    legendText: {
        fontSize: Math.min(screenWidth * 0.035, 14),
        fontWeight: "bold",
        color: "#333",
    },
});