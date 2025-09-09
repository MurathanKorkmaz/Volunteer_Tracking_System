import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import styles from './DatabaseError.style';

const DatabaseError = ({ onRetry }) => {
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
            <Text style={styles.icon}>⚠️</Text>
          </View>
          <Text style={styles.errorText}>
            Veritabanı hatası oluştu. Lütfen daha sonra tekrar deneyiniz.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DatabaseError;