import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Animated,
    Dimensions,
    BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./guestPanel1.style";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function GuestPanel1() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName } = useLocalSearchParams();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const slideAnim = useRef(new Animated.Value(500)).current;

    // Yeni: Sayfa geçiş animasyonu için translateX
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (!isModalVisible && !isLoggingOut) {
                    showConfirmationDialog();
                    return true;
                }
                return false;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [isModalVisible, isLoggingOut])
    );

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            gestureResponseDistance: 50,
        });

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (isModalVisible) return;
            e.preventDefault();
            showConfirmationDialog();
        });

        return unsubscribe;
    }, [navigation, isModalVisible]);

    const showConfirmationDialog = () => {
        if (!isLoggingOut) {
            setIsModalVisible(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
            }).start();
        }
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

    const confirmLogout = () => {
        if (!isLoggingOut) {
            setIsLoggingOut(true);
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                setIsModalVisible(false);
                router.replace("../admin/adminlogin");
            });
        }
    };

    // ✅ PROFİL SAYFASINA ANİMASYONLU GEÇİŞ
    const handleProfile = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestProfil1",
                params: { userId, userName, from: "guestPanel1" }
            });
        });
    };

    const handleVolunteerEvents = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestEvents",
                params: { userId, userName, from: "guestPanel1" },
            });
        });
    };

    const handleTimeline = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestCalendar",
                params: { userId, userName, from: "guestPanel1" },
            });
        });
    };

    const handleAnnouncements = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestAnnouncements",
                params: { userId, userName, from: "guestPanel1" },
            });
        });
    };

    const handleSettings = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestSettings",
                params: { userId, userName, from: "guestPanel1" },
            });
        });
    };

    const handleLogout = () => {
        if (!isLoggingOut) {
            showConfirmationDialog();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                {/* ✅ Sayfa geçiş animasyonu için Animated.View */}
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Gönüllü Paneli</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <TouchableOpacity style={styles.card} onPress={handleProfile}>
                            <Text style={styles.cardTitle}>Profil</Text>
                            <Text style={styles.cardDescription}>
                                Profil bilgilerinizi görüntüleyin ve düzenleyin.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleVolunteerEvents}>
                            <Text style={styles.cardTitle}>Gönüllü Etkinlikleri</Text>
                            <Text style={styles.cardDescription}>
                                Katıldığınız etkinlikleri görüntüleyin ve takip edin.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleTimeline}>
                            <Text style={styles.cardTitle}>Takvim</Text>
                            <Text style={styles.cardDescription}>
                                Yıllık hedeflerinizi planlayın ve izleyin.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleAnnouncements}>
                            <Text style={styles.cardTitle}>Duyurular</Text>
                            <Text style={styles.cardDescription}>
                                Sisteme ait duyuruları görüntüleyin.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleSettings}>
                            <Text style={styles.cardTitle}>Ayarlar</Text>
                            <Text style={styles.cardDescription}>
                                Hesap ayarlarınızı düzenleyin.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card} onPress={handleLogout}>
                            <Text style={styles.cardTitle}>Çıkış Yap</Text>
                            <Text style={styles.cardDescription}>
                                Hesabınızdan çıkış yapın.
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>

                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="none"
                    onRequestClose={hideConfirmationDialog}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View style={[
                            styles.modalContainer,
                            { transform: [{ translateY: slideAnim }] }
                        ]}>
                            <View style={styles.exclamationCircle}>
                                <Text style={styles.exclamationText}>!</Text>
                            </View>
                            <Text style={styles.modalTitle}>Çıkış yapmak istediğinize emin misiniz?</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    onPress={confirmLogout}
                                    style={styles.confirmButton}
                                >
                                    <Text style={styles.confirmButtonText}>Evet</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={hideConfirmationDialog}
                                    style={styles.cancelButton}
                                >
                                    <Text style={styles.cancelButtonText}>Hayır</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </LinearGradient>
        </SafeAreaView>
    );
}
