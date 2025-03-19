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
        left: 20,
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
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 50
    },
    searchInput: {
        height: 50,
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: "#333",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    scrollableList: {
        height: 550,
        width: "90%",
        marginHorizontal: "5%",
        marginBottom: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 0,
    },
    announcementCard: {
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    announcementDetails: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    announcementDate: {
        fontSize: 14,
        color: "#666",
        marginTop: 5,
    },
    announcementActions: {
        flexDirection: "row",
        alignItems: "center",
    },

    announcementDescription: {
        fontSize: 14,
        color: "#555",
        marginTop: 5,
    },

    announcementVolunterCounter: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#007BFF",
        marginTop: 5,
    },

    editButton: {
        backgroundColor: "#FFD700",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "bold",
    },
    addButtonContainer: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    addButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    addButtonText: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "bold",
    },

    loadingText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
        color: "#FF6347",
    },

    emptyText: {
        fontSize: 16,
        textAlign: "center",
        color: "#999",
        marginTop: 20,
    },

    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 0,
        marginTop: 50,
        marginHorizontal: 20, // 🔥 Sağ ve sol kenarlardan uzaklaştırır
    },

    tabButton: {
        flex: 1, //  Butonların eşit genişlikte olmasını sağlar
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 10,
        alignItems: "center", //  Metnin ortalanmasını sağlar
        marginHorizontal: 5, //  Butonlar arasında boşluk bırakır
    },
    tabButtonActive1: {
        backgroundColor: "#4CAF50",
    },
    tabButtonActive2: {
        backgroundColor: "#FF5733",
    },

    tabButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFD700",
    },
    tabButtonTextActive: {
        color: "#FFF",
    },

});
