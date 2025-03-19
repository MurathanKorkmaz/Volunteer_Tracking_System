import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        padding: 20,
    },
    header: {
        width: "110.5%", // Tam ekran genişliği
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
        marginTop: -20
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    backButton: {
        position: "absolute",
        top: 80,
        left: 23,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 48, // Geri simgesinin boyutu
        color: "#000", // Siyah renk
        fontWeight: "200",
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginTop: 20,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: "#FFD700",
    },
    changePhotoText: {
        color: "#007BFF",
        fontSize: 14,
        textDecorationLine: "underline",
        marginBottom: 20,
    },
    graphsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 70,
        marginVertical: 20,
        width: "90%",
    },
    circularGraphContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    circularGraphText: {
        position: "absolute",
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    circularGraphLabel: {
        marginTop: 5,
        fontSize: 12,
        color: "#333",
        fontWeight: "bold",
    },
    infoContainer: {
        width: "100%",
        marginTop: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    input: {
        width: "100%",
        height: 45,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: "#FFF",
        fontSize: 14,
    },
    badgesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    badge: {
        backgroundColor: "#1E90FF",
        color: "#FFF",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 10,
        marginBottom: 10,
        fontSize: 12,
    },
    resetPasswordButton: {
        backgroundColor: "#FF4500",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 0,
    },
    resetPasswordText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    scrollViewContent: {
        alignItems: "center",
        paddingBottom: 10, // İçerik altına boşluk ekler
    },
    participationCountContainer: {
        alignItems: "center",
        marginTop: 15,
    },
    
    participationCountText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1E90FF", // Canlı Turuncu (Alternatif: "#FFD700" Altın Rengi veya "#1E90FF" Parlak Mavi)
        textShadowColor: "rgba(0, 0, 0, 0.3)", // Hafif gölge
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Şeffaf siyah arka plan
        justifyContent: "center",
        alignItems: "center",
    },
    
    modalContent: {
        width: "80%", // Modal genişliği
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5, // Android için gölge efekti
    },
    
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    
    modalInput: {
        width: "100%",
        height: 45,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: "#FFF",
        fontSize: 14,
    },
    
    modalButton: {
        backgroundColor: "#FFD700", // Altın Sarısı
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 10,
    },

    resetButton: {
        backgroundColor: "#32CD32",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        width: "48%", // Butonları yan yana düzenlemek için
    },
    
    closeButton: {
        backgroundColor: "#FF4500",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        width: "48%", // Butonları yan yana düzenlemek için
    },
    
    modalButtonText: {
        color: "#333",
        fontWeight: "bold",
        fontSize: 14,
    },

    buttonContainer: {
        flexDirection: "row", // Butonları yan yana dizer
        justifyContent: "space-between", // Aralarına eşit boşluk bırakır
        marginTop: 20,
        width: "100%", // Tüm genişliği kaplasın
    },

    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    
});
