import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Switch,
    Pressable,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./guestSettings.style";
import { useNavigation } from "@react-navigation/native";

export default function GuestSettings() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName, from } = useLocalSearchParams();
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;

    // Modal state
    const [modalVisible, setModalVisible] = useState(null); // 'notification', 'language', 'about', or null
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("Türkçe");

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior
            e.preventDefault();

            // Run our custom animation
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                // After animation complete, continue with navigation
                navigation.dispatch(e.data.action);
            });
        });

        // Initial animation when screen mounts
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // Enable gesture navigation
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
        });

        return unsubscribe;
    }, [navigation]);

    // Only the required three options
    const settingsOptions = [
        { id: "2", key: "notification", title: "Bildirim Ayarları", description: "Bildirim tercihlerinizi düzenleyin." },
        { id: "4", key: "language", title: "Dil ve Bölge", description: "Dil ve bölge ayarlarını değiştirin." },
        { id: "5", key: "about", title: "Hakkında", description: "Uygulama bilgilerini görüntüleyin." },
    ];

    const handleBack = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    // Modal content renderers
    const renderModalContent = () => {
        if (modalVisible === "notification") {
            return (
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
                    <View style={styles.modalRowBetween}>
                        <Text style={styles.modalLabel}>Bildirimlere izin ver</Text>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            thumbColor={notificationsEnabled ? "#FFD701" : "#ccc"}
                            trackColor={{ false: "#eee", true: "#FFFACD" }}
                        />
                    </View>
                </View>
            );
        }
        if (modalVisible === "language") {
            return (
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Dil ve Bölge</Text>
                    <Text style={styles.modalSectionLabel}>Dil</Text>
                    <View style={styles.modalLanguageList}>
                        {["Türkçe", "İngilizce"].map((lang) => (
                            <Pressable
                                key={lang}
                                style={styles.modalLanguageOption}
                                onPress={() => setSelectedLanguage(lang)}
                            >
                                <View style={styles.modalRadioOuter}>
                                    {selectedLanguage === lang && <View style={styles.modalRadioInner} />}
                                </View>
                                <Text style={styles.modalLanguageText}>{lang}</Text>
                            </Pressable>
                        ))}
                    </View>
                    <Text style={styles.modalSectionLabel}>Bölge</Text>
                    <View style={styles.modalRegionBox}>
                        <Text style={styles.modalRegionText}>Türkiye</Text>
                    </View>
                </View>
            );
        }
        if (modalVisible === "about") {
            return (
                <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Hakkında</Text>
                    <View style={styles.modalAboutBox}>
                        <Text style={styles.modalAboutTitle}>Uygulama Hakkında</Text>
                        <Text style={styles.modalAboutText}>
                            Bu uygulama gönüllü takip ve yardım sistemini dijital ortama taşıyan bir platformdur. Amacımız, ihtiyaç anında gönüllülerle destek arayanları güvenli ve hızlı bir şekilde buluşturmaktır.{"\n"}
                            Bu uygulama tamamen ücretsiz ve topluluk odaklıdır.
                        </Text>
                    </View>
                </View>
            );
        }
        return null;
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Ayarlar</Text>
                    </View>

                    {/* Scrollable Settings List */}
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {settingsOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.optionCard}
                                onPress={() => setModalVisible(option.key)}
                            >
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionDescription}>{option.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Modal */}
                    <Modal
                        visible={!!modalVisible}
                        animationType="slide"
                        transparent
                        onRequestClose={() => setModalVisible(null)}
                    >
                        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(null)} />
                        {renderModalContent()}
                    </Modal>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
