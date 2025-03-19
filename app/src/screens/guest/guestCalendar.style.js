import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFACD", // Arka plan rengi
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
        borderBottomLeftRadius: 30, // Sol alt köşe oval
        borderBottomRightRadius: 30, // Sağ alt köşe oval
        borderTopLeftRadius: 0, // Yukarıda oval olmaması için sıfırlandı
        borderTopRightRadius: 0, // Yukarıda oval olmaması için sıfırlandı
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    calendarContainer: {
        width: "100%", 
        borderRadius: 15, 
        overflow: "hidden",
        backgroundColor: "#FFF",
        padding: 15, 
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginTop: 100, // 📌 Takvimi aşağı çekmek için üst boşluk
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
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: "#FFD701",
        padding: 10,
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
        marginTop: 10, // Takvimle arasına boşluk koy
        paddingVertical: 10, // İçeriği sıkıştırma
        backgroundColor: "#FFF", // Takvimle uyumlu beyaz arka plan
        borderBottomLeftRadius: 15, // Takvim çerçevesiyle uyum sağla
        borderBottomRightRadius: 15,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendColor: {
        width: 15,
        height: 15,
        borderRadius: 7.5, // Yuvarlak ikon
        marginRight: 5,
    },
    legendText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333", // Okunaklı koyu gri renk
    },
    
});
