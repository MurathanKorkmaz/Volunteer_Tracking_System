import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    setDoc,
} from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminsettings.style";
import { useNavigation } from "@react-navigation/native";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function AdminSettings() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    // MessageModal state + tek noktadan çağırma helper'ı
    const [msgVisible, setMsgVisible] = useState(false);
    const [msgProps, setMsgProps] = useState({
        title: "",
        message: "",
        type: "info",          // 'info' | 'success' | 'error' | 'warning'
        primaryText: "Tamam",
        secondaryText: undefined,
        onPrimary: () => setMsgVisible(false),
        onSecondary: undefined,
        dismissable: true,
    });

    const showMessage = ({
        title = "",
        message = "",
        type = "info",
        primaryText = "Tamam",
        onPrimary = () => setMsgVisible(false),
        secondaryText,
        onSecondary,
        dismissable = true,
    }) => {
        setMsgProps({
            title,
            message,
            type,
            primaryText,
            secondaryText,
            onPrimary,
            onSecondary,
            dismissable,
        });
        setMsgVisible(true);
    };

    const options = [
        { id: "1", title: "Erişimi Engelle", description: "Tüm Guest Kullanıcıların erişimlerini engelleyin." },
        { id: "4", title: "Erişime İzin Ver", description: "Tüm Guest kullanıcıların erişimlerini tekrar açın." },
        { id: "2", title: "Bakım Arası Başla", description: "Bakım modu başlatmak için dokunun." },
        { id: "5", title: "Bakım Arası Bitir", description: "Bakım modunu sonlandırmak için dokunun." },
        { id: "3", title: "Yazılım Güncelleme Aktif", description: "Yazılım güncelleme modunu aktif edin." },
        { id: "6", title: "Yazılım Güncelleme Devre Dışı", description: "Yazılım güncelleme modunu devre dışı bırakın." },
    ];

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

    useEffect(() => {
        // Gesture'ı etkinleştir ama kendi animasyonunu devre dışı bırak
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        // Gesture handler'ı ekle
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior
            e.preventDefault();

            // Animasyonlu geri dönüş
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                navigation.dispatch(e.data.action);
            });
        });

        // Animasyonu başlat
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchSettings();

        return unsubscribe;
    }, [navigation]);

    const handleBack = () => {
        // Animasyonlu geri dönüş
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const handleOptionPress = async (option) => {
        switch (option.id) {
            case "1":
                await blockAllGuests();
                break;
            case "4":
                await allowAllGuests();
                break;
            case "2":
                await toggleMaintenanceMode(true);
                break;
            case "5":
                await toggleMaintenanceMode(false);
                break;
            case "3": // Yazılım Güncelleme Aktif
                await setUpdateMode(true);
                break;
            case "6": // Yazılım Güncelleme Devre Dışı
                await setUpdateMode(false);
                break;
            default:
                showMessage({
                    title: "Bilinmeyen Seçenek",
                    message: `${option.title} tıklaması algılandı.`,
                    type: "warning",
                });
        }
    };

    // 🔒 Guest erişimini engelle
    const blockAllGuests = async () => {
        try {
            setHasDbError(false);
            const querySnapshot = await getDocs(collection(db, "guests"));
            for (const docSnap of querySnapshot.docs) {
                await updateDoc(docSnap.ref, { block: "1" });
            }
            showMessage({
                title: "Başarılı",
                message: "Tüm guest kullanıcıların erişimi engellendi.",
                type: "success",
            });
        } catch (error) {
            console.error("Guest engelleme hatası:", error);
            setHasDbError(true);
        }
    };

    // ✅ Guest erişimini aç
    const allowAllGuests = async () => {
        try {
            setHasDbError(false);
            const querySnapshot = await getDocs(collection(db, "guests"));
            for (const docSnap of querySnapshot.docs) {
                await updateDoc(docSnap.ref, { block: "0" });
            }
            showMessage({
                title: "Başarılı",
                message: "Tüm guest kullanıcıların erişimi yeniden açıldı.",
                type: "success",
            });
        } catch (error) {
            console.error("Guest izin verme hatası:", error);
            setHasDbError(true);
        }
    };

    // 🛠️ Bakım modunu değiştir
    const toggleMaintenanceMode = async (isEnabled) => {
        try {
            setHasDbError(false);
            await setDoc(doc(db, "appSettings", "status"), {
                maintenanceMode: isEnabled
            }, { merge: true });
            showMessage({
                title: "Bakım Modu",
                message: isEnabled ? "Bakım modu etkinleştirildi." : "Bakım modu kapatıldı.",
                type: "info",
            });
        } catch (error) {
            console.error("Bakım modu hatası:", error);
            setHasDbError(true);
        }
    };

    // 🟡 Yazılım güncelleme (maintenance_mode) alanını aç/kapat
    const setUpdateMode = async (isActive) => {
        try {
            setHasDbError(false);
            const ref = doc(db, "appSettings", "globalSettings");
            // Belge varsa updateDoc, yoksa setDoc + merge güvenlidir:
            await updateDoc(ref, { maintenance_mode: isActive }).catch(async () => {
                await setDoc(ref, { maintenance_mode: isActive }, { merge: true });
            });
            showMessage({
                title: "Yazılım Güncelleme",
                message: isActive ? "Yazılım güncelleme modu AKTİF." : "Yazılım güncelleme modu DEVRE DIŞI.",
                type: "info",
            });
        } catch (error) {
            console.error("Yazılım güncelleme modu hatası:", error);
            setHasDbError(true);
        }
    };

    // Add this function to fix the error
    const fetchSettings = async () => {
        // You can implement fetching logic here if needed in the future
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                // Son başarısız işlemi tekrar dene
                const lastFailedOption = options.find(opt => opt.id === lastFailedOptionId);
                if (lastFailedOption) {
                    handleOptionPress(lastFailedOption);
                }
            }} />}

            <MessageModal
                visible={msgVisible}
                title={msgProps.title}
                message={msgProps.message}
                type={msgProps.type}
                primaryText={msgProps.primaryText}
                secondaryText={msgProps.secondaryText}
                onPrimary={msgProps.onPrimary}
                onSecondary={msgProps.onSecondary}
                onRequestClose={() => setMsgVisible(false)}
                dismissable={msgProps.dismissable}
            />

            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Ayarlar</Text>
                    </View>

                    {/* Seçenekler */}
                    <ScrollView contentContainerStyle={styles.optionsContainer}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={styles.optionCard}
                                onPress={() => handleOptionPress(option)}
                            >
                                <Text style={styles.optionTitle}>{option.title}</Text>
                                <Text style={styles.optionDescription}>{option.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}