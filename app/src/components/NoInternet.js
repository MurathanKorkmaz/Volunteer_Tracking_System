import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import styles from './NoInternet.style';

const NoInternet = ({ onRetry }) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📶</Text>
          </View>
          <Text style={styles.message}>
            İnternet bağlantısı yok.{'\n'}Lütfen bağlantınızı kontrol edin.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default NoInternet;