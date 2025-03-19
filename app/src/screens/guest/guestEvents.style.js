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
        marginTop: 25,
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
        paddingBottom: 20,
    },
    eventCard: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: "column",
        alignItems: "center",
        marginHorizontal: 20,
    },
    eventDetails: {
        flex: 1,
        alignItems: "center",
    },
    eventName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    eventDate: {
        fontSize: 16,
        color: "#666",
        marginBottom: 5,
    },
    eventQuota: {
        fontSize: 16,
        color: "#444",
        fontWeight: "bold",
        marginBottom: 10,
    },
    eventPoint: {
        fontSize: 16,
        color: "#08d3d3",
        fontWeight: "bold",
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 20,
    },
    applyButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: "#D32F2F",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 14,
        color: "#FFF",
        fontWeight: "bold",
    },
    warningContainer: {
        padding: 15,
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 20,
    },
    warningText: {
        color: "#D32F2F",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "bold",
    },

    datePickerContainer: {
        alignItems: "center",
        marginVertical: 10, // Üst ve alt boşluk
    },

    datePickerButton: {
        width: "88%",
        backgroundColor: "#FFD700", // Altın sarısı buton rengi
        paddingVertical: 10, // Dikey iç boşluk
        paddingHorizontal: 20, // Yatay iç boşluk
        borderRadius: 8, // Köşeleri yumuşatma
        shadowColor: "transparent", // Hafif gölge efekti
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0, // Android için gölge efekti
        alignItems: "center",
        alignSelf: "center",
        marginTop:60,
        marginBottom: 0, // Alt boşluk
    },

    datePickerText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },
});