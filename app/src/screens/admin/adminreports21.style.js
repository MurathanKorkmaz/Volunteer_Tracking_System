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
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
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
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    tabButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 10,
        alignItems: "center",
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
    scrollableList: {
        flex: 1,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
        height: 400,
        overflow: "hidden",
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
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#333", // Açık gri renk
        fontWeight: "bold",
        marginTop: 20, // Üst boşluk
    },
    actionButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 20,
        marginBottom: 20,
    },
    publishButton: {
        flex: 1,
        backgroundColor: "#4CAF50",
        paddingVertical: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: "center",
    },
    publishButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    unpublishButton: {
        flex: 1,
        backgroundColor: "#FF5733",
        paddingVertical: 15,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: "center",
    },
    unpublishButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },

    counterContainer: {
        alignItems: "center",
        marginTop: 0,
        paddingVertical: 10,
        backgroundColor: "#FFF",
        borderRadius: 10,
        marginHorizontal: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    counterText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },

    progressBarContainer: {
        height: 20,
        width: "90%",
        backgroundColor: "#ddd",
        borderRadius: 10,
        marginHorizontal: 20,
        marginTop: 55,
        overflow: "hidden",
    },
    
    progressBar: {
        height: "100%",
        backgroundColor: "#4CAF50",
    },
    
    progressTextContainer: {
        marginTop: 10,
        alignItems: "center",
    },
    
    progressText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
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
        marginTop: 25,
        marginBottom: 0, // Alt boşluk
    },

    datePickerText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    
});