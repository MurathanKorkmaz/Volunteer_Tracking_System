import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  BackHandler,
  Linking,
  Platform,
  StatusBar,
} from "react-native";
import styles from "./UpdateModal.style";

const UpdateModal = ({
  visible = false,

  // Firestore alan adları birebir:
  latest_version = "",            // "1.0.0"
  update_required = false,        // true ⇒ zorunlu
  update_url_apps,                // iOS App Store url
  update_url_plays,               // Android Play Store url

  // İsteğe bağlı güncellemede kullanacağın handler (modalı kapatıp devam ettireceksin)
  onLater,
  // Başlık override etmek istersen
  title = "Güncelleme Mevcut",
  // İstersen dışarıdan tek bir url da verebil (öncelik bu url'de)
  update_url,
}) => {
  // Android geri tuşunu tamamen kilitle
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [visible]);

  // Cihaz tipine göre url seçimi (dışarıdan update_url verilirse onu kullanır)
  const storeUrl =
    update_url ??
    (Platform.OS === "ios" ? update_url_apps : update_url_plays);

  const handleUpdate = async () => {
    if (!storeUrl) return;
    try {
      // Modal kapanmasın, app akışı sürmesin — sadece mağaza aç
      await Linking.openURL(storeUrl);
    } catch (e) {
      console.log("Update URL open error:", e);
    }
  };

  const handleLater = () => {
    if (!update_required && onLater) onLater();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      hardwareAccelerated
      statusBarTranslucent
      presentationStyle="overFullScreen"
      onRequestClose={() => {}} // kapatmayı engelle
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalBox,
            update_required ? styles.boxRequired : styles.boxOptional,
          ]}
        >
          <View
            style={[
              styles.badge,
              update_required ? styles.badgeRequired : styles.badgeOptional,
            ]}
          >
            <Text style={styles.badgeEmoji}>
              {update_required ? "⚠️" : "⬆️"}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.subtitle}>
            {update_required
              ? "Uygulamayı kullanmaya devam etmek için güncelleme zorunludur."
              : "Yeni özellikler ve iyileştirmeler hazır."}
          </Text>

          {!!latest_version && (
            <View style={styles.versionPill}>
              <Text style={styles.versionPillText}>
                En son sürüm: {latest_version}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            {!update_required && (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={handleLater}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryBtnText}>Daha Sonra</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleUpdate}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryBtnText}>
                {Platform.OS === "ios" ? "App Store’a Git" : "Play Store’a Git"}
              </Text>
            </TouchableOpacity>
          </View>

          {update_required && (
            <Text style={styles.note}>
              * Geri tuşu devre dışıdır. Güncelleme yapmadan devam edemezsiniz.
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default UpdateModal;
