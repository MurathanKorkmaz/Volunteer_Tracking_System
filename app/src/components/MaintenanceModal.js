import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import styles from "./MaintenanceModal.style";

const MaintenanceModal = ({ visible, onExit }) => {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>🔧</Text>
                    </View>
                    <Text style={styles.modalTitle}>Bakım Modu</Text>
                    <Text style={styles.modalText}>
                        Uygulama şu anda bakım aşamasındadır. Daha iyi hizmet sunabilmek için çalışıyoruz.
                    </Text>
                    <TouchableOpacity style={styles.exitButton} onPress={onExit}>
                        <Text style={styles.exitButtonText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default MaintenanceModal; 