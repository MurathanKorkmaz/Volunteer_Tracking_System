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
        marginTop: 30,
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
        height: "44%", // Sabit yükseklik
        width: "90%", // Çerçevenin genişliği ekranın %90'ı kadar olacak
        marginHorizontal: "5%", // Çerçeve, ekranın ortasında konumlanacak
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 0,
        overflow: "hidden",
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
    eventActions: {
        flexDirection: "row",
        alignItems: "center",
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
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: "center",
        zIndex: 10,
        elevation: 5,
    },
    addButton: {
        backgroundColor: "#4CAF50",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        width: "90%",
    },
    addButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 0,
        marginTop: 60,
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
    listSafeArea: {
    maxHeight: 480,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },

    scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
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
        marginTop:20,
        marginBottom: 0, // Alt boşluk
    },

    datePickerText: {
        fontSize: 16,
        color: "#000",
        fontWeight: "bold",
    },
    
});
