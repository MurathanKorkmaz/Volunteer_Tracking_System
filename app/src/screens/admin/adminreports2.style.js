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
        marginBottom: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 5,
        marginTop: 60,
    },
    searchInput: {
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        elevation: 3,
        color: "#333",
    },
    scrollableList: {
        height: "73%",
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    eventCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    eventDetails: {
        flex: 1,
    },
    eventName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    eventDate: {
        fontSize: 14,
        color: "#666",
    },
    buttonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "bold",
    },

    eventDetail: {
        fontSize: 14,
        color: "#333",
        marginTop: 4,
    },
    
});
