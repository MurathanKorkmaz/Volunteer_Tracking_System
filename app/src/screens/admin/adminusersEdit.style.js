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
    inputContainer1: {
        marginTop: 0,
        width: "100%",
        marginHorizontal: "%25",
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputContainer2: {
        marginTop: 30,
        width: "100%",
        marginHorizontal: "%20",
        padding: 15,
        backgroundColor: "#F7F9FC",
        borderRadius: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    
    userNameText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
        textAlign: "center",
    },
    roleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#FFD700",
        borderRadius: 5,
        alignItems: "center",
    },
    roleButtonActive: {
        backgroundColor: "#FFD700",
    },
    roleButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFD700",
    },
    roleButtonTextActive: {
        color: "#FFF",
    },
    blockButton: {
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#FF5733",
        borderRadius: 5,
        alignItems: "center",
    },
    blockButtonActive: {
        backgroundColor: "#FF5733",
    },
    blockButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333333",
    },
    saveButton: {
        marginTop: 20,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        marginBottom: 30, // Alt boşluk eklendi
    },
    saveButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFF",
    },
    deleteButton: {
        marginTop: 20,
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: "#FF5733",
        alignItems: "center",
    },
    deleteButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    slider: {
        width: "100%",
        height: 40,
    },

    scrollContainer: {
        height: "60%", // Scroll alanının yüksekliği
        marginTop: 40,
        marginHorizontal: 20,
        borderRadius: 10,
        padding: 10,
    
        // 📌 Gölge ve kenarlıkları kaldır
        elevation: 0, // Android için gölgeyi kaldır
        shadowColor: "transparent", // iOS için gölgeyi kaldır
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        borderWidth: 0, // Kenarlıkları kaldır
        backgroundColor: "transparent", // Arka planı şeffaf yap
    },
    
    scrollWrapper: {
        flexGrow: 1,
        paddingVertical: 10,
        //alignItems: "center", // Kartların hizalanmasını sağlar
        width: "100%"
    },
    

///////
    numberInput: {
        height: 40,
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        textAlign: 'center',
        backgroundColor: '#FFF'
    },
    
});
