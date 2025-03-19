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
    inputContainer: {
        marginHorizontal: 20,
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    input: {
        height: 50,
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        color: "#333",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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

    textArea: {
        height: 100,
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: "#333",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 20,
        textAlignVertical: "top",
    },
    dateInput: {
        height: 50,
        backgroundColor: "#F7F7F7",
        borderRadius: 10,
        paddingHorizontal: 15,
        justifyContent: "center",
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    dateText: {
        fontSize: 16,
        color: "#333",
    },
    filePickerContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    filePickerButton: {
        backgroundColor: "#FF5733",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
    },
    filePickerButtonText: {
        fontSize: 16,
        color: "#FFF",
        fontWeight: "bold",
    },
    selectedFileText: {
        fontSize: 14,
        color: "#333",
        marginTop: 10,
    },
    saveButton: {
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },

    /** Etkinlik Türü ve Yayın Türü İçin Stiller **/
    dropdownContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    dropdownItem: {
        width: "48%",
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
        },
    dropdownItemSelected: {
        backgroundColor: "#FFD700",
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFD700",
    },
    dropdownTextSelected: {
        color: "#FFF",
    },

    scrollableContainer: {
        flex: 1,
        paddingTop: 40,
        width: "100%", // Tam genişlik kullan
    },
        
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 0,
        paddingHorizontal: 0, // Kenarlardan boşluk ver
    },
        
});
