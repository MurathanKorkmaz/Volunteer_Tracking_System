import { useRouter } from "expo-router"; // useRouter import edildi
import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    BackHandler,
    Modal,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminPanel1.style"; // Stil dosyasını import et
import { useNavigation } from "@react-navigation/native";

export default function adminPanel1() {
    const router = useRouter(); // Router oluşturuldu
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
    const translateX = React.useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        // Gesture'ı devre dışı bırak
        navigation.setOptions({
            gestureEnabled: false
        });

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            showConfirmationDialog();
            return true;
        });

        return () => backHandler.remove();
    }, [navigation]);

    const showConfirmationDialog = () => {
        setIsModalVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    };

    const hideConfirmationDialog = () => {
        Animated.timing(slideAnim, {
            toValue: 500,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
        });
    };

    const handleUsers = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminusers", params: { from: "panel1" } });
        });
    };

    const handleEvents = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminevents", params: { from: "panel1" } });
        });
    };

    const handleAttendance = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminAttendance", params: { from: "panel1" } });
        });
    };

    const handleReports = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminreports", params: { from: "panel1" } });
        });
    };

    const handleCalendar = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminCalendar", params: { from: "panel1" } });
        });
    };

    const handleAnnouncements = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminannouncements", params: { from: "panel1" } });
        });
    };
    
    const handleSettings = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({ pathname: "./adminsettings", params: { from: "panel1" } });
        });
    };

    const handleLogout = () => {
        showConfirmationDialog();
    };

    const confirmLogout = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
            // Kısa bir gecikme ile yönlendirmeyi gerçekleştir
            setTimeout(() => {
                router.back();
            }, 50);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Yönetici Paneli</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Kullanıcı Yönetimi */}
                    <TouchableOpacity style={styles.card} onPress={handleUsers}>
                        <Text style={styles.cardTitle}>Kullanıcı Yönetimi</Text>
                        <Text style={styles.cardDescription}>
                            Kullanıcıları görüntüleyin ve yönetin.
                        </Text>
                    </TouchableOpacity>

                    {/* Etkinlik Yönetimi */}
                    <TouchableOpacity style={styles.card} onPress={handleEvents}>
                        <Text style={styles.cardTitle}>Etkinlik Yönetimi</Text>
                        <Text style={styles.cardDescription}>
                            Etkinlikleri düzenleyin ve yönetin.
                        </Text>
                    </TouchableOpacity>

                    {/* Yoklama Yönetimi */}
                    <TouchableOpacity style={styles.card} onPress={handleAttendance}>
                        <Text style={styles.cardTitle}>Yoklama Yönetimi</Text>
                        <Text style={styles.cardDescription}>
                            Etkinliklere katılanları onaylama/reddetme.
                        </Text>
                    </TouchableOpacity>

                    {/* Raporlar */}
                    <TouchableOpacity style={styles.card} onPress={handleReports}>
                        <Text style={styles.cardTitle}>Raporlar</Text>
                        <Text style={styles.cardDescription}>
                            Sisteme dair raporları görüntüleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Yıllık Zaman Çizelgesi */}
                    <TouchableOpacity style={styles.card} onPress={handleCalendar}>
                        <Text style={styles.cardTitle}>Yıllık Zaman Çizelgesi</Text>
                        <Text style={styles.cardDescription}>
                            Yıllık hedeflerinizi planlayın ve izleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Duyurular */}
                    <TouchableOpacity style={styles.card} onPress={handleAnnouncements}>
                        <Text style={styles.cardTitle}>Duyurular</Text>
                        <Text style={styles.cardDescription}>
                            Duyuru yayınlayın ve izleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Ayarlar */}
                    <TouchableOpacity style={styles.card} onPress={handleSettings}>
                        <Text style={styles.cardTitle}>Ayarlar</Text>
                        <Text style={styles.cardDescription}>
                            Panel ayarlarını düzenleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Çıkış Yap */}
                    <TouchableOpacity style={styles.card} onPress={handleLogout}>
                        <Text style={styles.cardTitle}>Çıkış Yap</Text>
                        <Text style={styles.cardDescription}>
                            Hesabınızdan çıkış yapın.
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="none"
                    onRequestClose={hideConfirmationDialog}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View style={[
                            styles.modalContainer,
                            {
                                transform: [{ translateY: slideAnim }],
                            }
                        ]}>
                            <View style={styles.exclamationCircle}>
                                <Text style={styles.exclamationText}>!</Text>
                            </View>
                            <Text style={styles.modalTitle}>
                                Çıkış yapmak istediğinize emin misiniz?
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    onPress={confirmLogout}
                                    style={styles.confirmButton}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        Evet
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={hideConfirmationDialog}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Hayır
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </LinearGradient>
        </SafeAreaView>
    );
}
