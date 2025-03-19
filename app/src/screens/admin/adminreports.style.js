import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    backButton: {
        position: "absolute",
        top: 70,
        left: 23,
        zIndex: 10,
    },
    backIcon: {
        fontSize: 48,
        color: "#000",
        fontWeight: "200",
    },
    header: {
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    scrollContainer: {
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    card1: {
        width: "90%",
        padding: 20,
        backgroundColor: "#E6E6FA",
        borderRadius: 15,
        marginTop:30,
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        alignItems: "center",
    },
    card2: {
        width: "90%",
        padding: 20,
        backgroundColor: "#E6E6FA",
        borderRadius: 15,
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    cardDescription: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
    },
});
