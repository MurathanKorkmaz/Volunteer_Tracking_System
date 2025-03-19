import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 20,
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 15,
        zIndex: 10,
    },
    backIcon: {
        fontSize: 48,
        color: "#000",
        fontWeight: "200",
    },
    logoContainer: {
        marginTop: 65, // Daha az yukarı çekildi
        marginBottom: 20,
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 150,
    },
    appName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#003366",
        marginTop: 5,
        textTransform: "uppercase",
        letterSpacing: 2,
        textAlign: "center",
    },
    formContainer: {
        width: "85%",
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10, // Çerçeve aşağı kaydırıldı
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 25,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        fontSize: 16,
        backgroundColor: "#fafafa",
    },
    button: {
        backgroundColor: "#FF5733",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: "100%",
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
