import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    modalBox: {
        backgroundColor: "#FFFFFF",
        margin: 20,
        borderRadius: 24,
        padding: 35,
        alignItems: "center",
        maxWidth: 340,
        width: "90%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
    },
    emojiContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF9500',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    emoji: {
        fontSize: 28,
        color: 'white'
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1C1C1E",
        marginBottom: 12,
        textAlign: "center",
    },
    modalText: {
        fontSize: 16,
        color: "#8E8E93",
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "400",
        marginBottom: 20,
    },
    exitButton: {
        backgroundColor: "#FF3B30",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 12,
        marginTop: 10,
        minWidth: 120,
        shadowColor: "#FF3B30",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    exitButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
        textAlign: "center",
    },
}); 