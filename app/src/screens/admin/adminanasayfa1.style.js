import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    topSection: {
        flex: 0.8,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        paddingTop: 10,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: "contain",
        marginTop: 30,
    },
    textGradient: {
        marginTop: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    gradientText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "white",
    },
    rowImagesContainer: {
        marginTop: 75, // Üst yazı ile görseller arasında boşluk
        alignItems: "center", // Dikey olarak ortalama
    },
    imageRow1: {
        flexDirection: "row",
        justifyContent: "flex-start", // Görselleri sola hizalama
        alignItems: "center",
        width: "100%",
        marginTop: -30, // Satırlar arasındaki boşluk
        paddingLeft: 20, // Görselleri biraz daha sola çekmek için
        gap: 30,
    },
    imageRow2: {
        flexDirection: "row",
        justifyContent: "flex-start", // Görselleri sola hizalama
        alignItems: "center",
        width: "100%",
        marginTop: 15, // İkinci satır üstündeki boşluk
        marginBottom: 40,
        paddingLeft: 20, // Görselleri biraz daha sola çekmek için
        gap: 30,
    },
    largeImage: {
        width: 70,
        height: 70,
        resizeMode: "contain",
        marginRight: 15, // Görseller arasındaki boşluk
    },
    bottomSection: {
        flex: 0.5,
        backgroundColor: "white",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginTop: -20,
        alignItems: "center",
    },
    imagesContainer: {
        flexDirection: "row",
        justifyContent: "space-between", // Görselleri eşit boşlukla yay
        alignItems: "center",
        marginBottom: 20, // Görsellerin altındaki boşluk
    },
    image: {
        width: 80, // Alt görsellerin genişliği
        height: 80, // Alt görsellerin yüksekliği
        resizeMode: "contain",
        marginHorizontal: 15, // Her görsel arasında 15 piksel boşluk
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginBottom: 10,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
        marginBottom: 20,
    },
    buttonCentered: {
        backgroundColor: "#FF5733",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
});
