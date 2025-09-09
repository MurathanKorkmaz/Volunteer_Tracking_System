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
    BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import styles from "./guestSettings.style";
import { useNavigation } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";

export default function GuestSettings() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName, from } = useLocalSearchParams();
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    // Modal state
    const [modalVisible, setModalVisible] = useState(null); // 'notification', 'language', 'about', or null
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("Türkçe");

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable);
        });

        return () => unsubscribe();
    }, []);

    const checkConnection = async () => {
        try {
            const state = await NetInfo.fetch();
            setIsConnected(state.isConnected && state.isInternetReachable);
        } catch (error) {
            console.error("Connection check error:", error);
            setIsConnected(false);
        }
    };

    // Bakım modu kontrolü için useEffect
    useEffect(() => {
        const docRef = doc(db, "appSettings", "status");
        
        // Firestore'dan gerçek zamanlı dinleme başlat
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                console.log("Bakım modu değişikliği algılandı:", docSnap.data());
                setMaintenanceMode(docSnap.data().maintenanceMode === true);
            }
        }, (error) => {
            console.error("Maintenance mode listener error:", error);
        });

        // Cleanup: listener'ı kapat
        return () => unsubscribe();
    }, []);

    // maintenanceMode state'ini izle
    useEffect(() => {
        console.log("maintenanceMode state değişti:", maintenanceMode);
    }, [maintenanceMode]);

    // Block durumu kontrolü için useEffect
    useEffect(() => {
        if (!userId) return;

        const userDocRef = doc(db, "guests", userId);
        
        const unsubscribeBlock = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const isUserBlocked = userData.block === "1";
                setIsBlocked(isUserBlocked);
            }
        }, (error) => {
            console.error("Block status listener error:", error);
        });

        return () => unsubscribeBlock();
    }, [userId]);

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

    // Block durumunda çıkış işlemi
    const handleBlockExit = () => {
        // Navigation stack'i tamamen temizle ve ana sayfaya git
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }], // Ana route'a dön
        });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Eğer kullanıcı bloklu ise navigation'ı engelle
            if (isBlocked) return;
            
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
    }, [navigation, isBlocked]);

    // Only the required three options
    const settingsOptions = [
        { id: "2", key: "notification", title: "Bildirim Ayarları", description: "Bildirim tercihlerinizi düzenleyin." },
        { id: "4", key: "language", title: "Dil ve Bölge", description: "Dil ve bölge ayarlarını değiştirin." },
        { id: "5", key: "about", title: "Hakkında", description: "Uygulama bilgilerini görüntüleyin." },
    ];

    const handleBack = () => {
        // Eğer kullanıcı bloklu ise geri dönüşü engelle
        if (isBlocked) {
            handleBlockExit();
            return;
        }
        
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
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal visible={isBlocked} onClose={handleBlockExit} />

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
