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
        marginBottom: 10,
        marginTop: 60,
    },
    searchInput: {
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        color: "#333",
    },
    scrollableList: {
        height: "64%",
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 0,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginVertical: 10,
        paddingHorizontal: 20,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabButtonActive: {
        backgroundColor: "#FFD701",
    },
    tabButtonText: {
        fontSize: 16,
        color: "#333",
    },
    tabButtonTextActive: {
        color: "#FFF",
    },
    userCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    userRole: {
        fontSize: 14,
        color: "#666",
    },
    editButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    editButtonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "bold",
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    acceptButton: {
        backgroundColor: "#06a03e",
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
    },
    acceptButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    rejectButton: {
        backgroundColor: "#FF5733",
        padding: 10,
        borderRadius: 5,
    },
    rejectButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
});
