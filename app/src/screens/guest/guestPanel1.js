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
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import styles from "./guestPanel1.style";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";

export default function GuestPanel1() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName, userAuthority } = useLocalSearchParams();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isBlockedExit, setIsBlockedExit] = useState(false);

    const slideAnim = useRef(new Animated.Value(500)).current;
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(0)).current;

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
        if (!userId) {
            console.log("userId bulunamadı");
            return;
        }

        console.log("Block kontrolü başlatılıyor. userId:", userId);
        const userDocRef = doc(db, "guests", userId);
        
        const unsubscribeBlock = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log("Kullanıcı verisi:", userData);
                console.log("Block durumu:", userData.block);
                
                const isUserBlocked = userData.block === "1";
                console.log("Kullanıcı bloklu mu?", isUserBlocked);
                
                setIsBlocked(isUserBlocked);
                
                if (isUserBlocked) {
                    console.log("Kullanıcı bloklu, modal gösterilecek");
                    setIsBlockedExit(false); // Modal'ın görünmesi için false yapıyoruz
                }
            } else {
                console.log("Kullanıcı dokümanı bulunamadı");
            }
        }, (error) => {
            console.error("Block status listener error:", error);
        });

        return () => {
            console.log("Block listener temizleniyor");
            unsubscribeBlock();
        };
    }, [userId]);

    // isBlocked değişimini izle
    useEffect(() => {
        console.log("isBlocked değişti:", isBlocked);
        console.log("isBlockedExit durumu:", isBlockedExit);
    }, [isBlocked, isBlockedExit]);

    // Normal çıkış işlemi
    const handleNormalLogout = () => {
        if (!isLoggingOut && !isBlocked) {
            showConfirmationDialog();
        } else if (isBlocked) {
            handleBlockExit();
        }
    };

    // Block durumunda çıkış işlemi
    const handleBlockExit = () => {
        // Tüm modalları kapat ve çıkış durumunu aktifleştir
        setIsModalVisible(false);
        setIsLoggingOut(true);
        setIsBlocked(false); // BlockModal'ı da kapat
        
        // Navigation stack'i tamamen temizle ve ana sayfaya git
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }], // Ana route'a dön
        });
    };

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                if (isBlocked) {
                    handleBlockExit();
                    return true;
                }
                
                if (!isModalVisible && !isLoggingOut) {
                    showConfirmationDialog();
                    return true;
                }
                return false;
            };

            const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => backHandler.remove();
        }, [isModalVisible, isLoggingOut, isBlocked])
    );

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            gestureResponseDistance: 50,
        });

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Eğer kullanıcı bloklu ise veya modal görünürse, önleme
            if (isModalVisible || isBlocked) return;
            e.preventDefault();
            showConfirmationDialog();
        });

        return unsubscribe;
    }, [navigation, isModalVisible, isBlocked]);

    // Çıkış onay modalını göster
    const showConfirmationDialog = () => {
        // Eğer kullanıcı bloklu ise modalı gösterme
        if (isBlocked) return;

        if (!isLoggingOut) {
            setIsModalVisible(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 0,
            }).start();
        }
    };

    // Çıkış onayı
    const confirmLogout = () => {
        // Eğer kullanıcı bloklu ise normal çıkışı engelle
        if (isBlocked) return;

        if (!isLoggingOut) {
            setIsLoggingOut(true);
            Animated.timing(slideAnim, {
                toValue: Dimensions.get('window').height,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                setIsModalVisible(false);
                router.back();
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
                params: { userId, userName, userAuthority, from: "guestPanel1" }
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
                params: { userId, userName, userAuthority, from: "guestPanel1" },
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
                params: { userId, userName, userAuthority, from: "guestPanel1" },
            });
        });
    };

    const handleAttendance = () => {
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./guestAttendance",
                params: { userId, userName, userAuthority,from: "guestPanel1" },
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
                params: { userId, userName, userAuthority, from: "guestPanel1" },
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
                params: { userId, userName, userAuthority, from: "guestPanel1" },
            });
        });
    };

    // Bakım modunda çıkış işlemi
    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal 
                visible={isBlocked} 
                onClose={handleBlockExit} 
            />

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

                        {userAuthority === "3" && (
                          <>
                            {/* Yoklama Yönetimi */}
                            <TouchableOpacity style={styles.card} onPress={handleAttendance}>
                              <Text style={styles.cardTitle}>Yoklama Yönetimi</Text>
                              <Text style={styles.cardDescription}>
                                Etkinliklere katılanları onaylama/reddetme.
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}

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

                        <TouchableOpacity style={styles.card} onPress={handleNormalLogout}>
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
                    onRequestClose={() => {
                        // Çıkış onayı modalını kapat
                        setIsModalVisible(false);
                    }}
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
                                    onPress={() => {
                                        // Çıkış onayı modalını kapat
                                        setIsModalVisible(false);
                                    }}
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
