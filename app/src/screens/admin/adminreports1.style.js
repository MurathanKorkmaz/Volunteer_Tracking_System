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
        marginTop: 20,
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
        height: "48%",
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
        marginTop: 25,
        marginBottom: 0, // Alt boşluk
    },

    datePickerText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },

    categoryBarContainer: {
        flexDirection: "row",
        height: 20,
        width: "80%",
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        overflow: "hidden",
        alignSelf: "center",
        marginTop: 15,
    },
    
    categoryBar: {
        height: "100%",
        borderRadius: 3,
    },


    legendContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 0,
        marginTop: 60,
    },
    
    legendItem: {
        alignItems: "center", // Kategori ve oranı dikey hizalamak için
        justifyContent: "center",
        marginHorizontal: 10,
    },
    
    legendColor: {
        width: 15,
        height: 15,
        borderRadius: 5,
        marginBottom: 2, // Alttaki yazıyla boşluk bırak
    },
    
    legendText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
    },
    
    legendPercentage: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#666",
        marginTop: 2, // Üstteki kategori ismiyle boşluk bırak
    },
});
