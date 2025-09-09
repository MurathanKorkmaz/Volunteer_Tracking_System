import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, Animated, Easing } from 'react-native';
import { styles, getTypeColors, Icon } from './MessageModal.style';

/**
 * Props:
 *  - visible: boolean
 *  - title?: string
 *  - message: string
 *  - type?: 'info' | 'success' | 'warning' | 'error'
 *  - primaryText?: string
 *  - secondaryText?: string
 *  - onPrimary?: () => void
 *  - onSecondary?: () => void
 *  - onRequestClose?: () => void      // dışa tıklandığında/geri tuşunda
 *  - dismissable?: boolean            // dışa tıklayınca kapanabilir mi
 */
const MessageModal = ({
  visible,
  title = '',
  message,
  type = 'info',
  primaryText = 'Tamam',
  secondaryText,
  onPrimary,
  onSecondary,
  onRequestClose,
  dismissable = true,
}) => {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  const colors = getTypeColors(type);

  const handleBackdropPress = () => {
    if (dismissable && onRequestClose) onRequestClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale }], opacity },
          ]}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.bg }]}>
            <Icon type={type} color={colors.fg} />
          </View>

          {!!title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          {/* Tek buton olduğunda ortala */}
          <View style={[styles.actions, !secondaryText && { justifyContent: 'center' }]}>
            {secondaryText ? (
              <TouchableOpacity
                onPress={onSecondary}
                style={[styles.button, styles.secondaryBtn]}
              >
                <Text style={[styles.buttonText, styles.secondaryText]}>{secondaryText}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={onPrimary}
              style={[styles.button, { backgroundColor: colors.fg }]}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>{primaryText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default MessageModal;
