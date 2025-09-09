import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import styles from './BlockModal.style';

const BlockModal = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.icon}>🚫</Text>
          <Text style={styles.title}>Erişim Engellendi</Text>
          <Text style={styles.description}>
            Hesabınıza erişiminiz engellenmiştir. Daha fazla bilgi için destek ile iletişime geçin.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

BlockModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BlockModal; 