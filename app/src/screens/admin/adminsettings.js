import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import Constants from "expo-constants";
import styles from "./adminsettings.style";
import { useNavigation } from "@react-navigation/native";

export default function AdminSettings() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;

    const options = [
        { id: "1", title: "Erişimi Engelle", description: "Tüm Guest Kullanıcıların erişimlerini engelleyin." },
        { id: "4", title: "Erişime İzin Ver", description: "Tüm Guest kullanıcıların erişimlerini tekrar açın." },
        { id: "2", title: "Bakım Arası", description: "Bakım modu başlatmak için dokunun." },
        { id: "3", title: "Yazılım Güncelle", description: "Yazılım güncellemelerini kontrol edin." },
    ];

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
                await toggleMaintenanceMode();
                break;
            case "3":
                await checkAppVersion();
                break;
            default:
                Alert.alert("Bilinmeyen Seçenek", `${option.title} tıklaması algılandı.`);
        }
    };

    // 🔒 Guest erişimini engelle
    const blockAllGuests = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "guests"));
            for (const docSnap of querySnapshot.docs) {
                await updateDoc(docSnap.ref, { block: "1" });
            }
            Alert.alert("Başarılı", "Tüm guest kullanıcıların erişimi engellendi.");
        } catch (error) {
            console.error("Guest engelleme hatası:", error);
            Alert.alert("Hata", "Guest kullanıcıları engelleme başarısız oldu.");
        }
    };

    // ✅ Guest erişimini aç
    const allowAllGuests = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "guests"));
            for (const docSnap of querySnapshot.docs) {
                await updateDoc(docSnap.ref, { block: "0" });
            }
            Alert.alert("Başarılı", "Tüm guest kullanıcıların erişimi yeniden açıldı.");
        } catch (error) {
            console.error("Guest izin verme hatası:", error);
            Alert.alert("Hata", "Guest kullanıcılarına erişim izni verilemedi.");
        }
    };

    // 🛠️ Bakım modunu aktif et
    const toggleMaintenanceMode = async () => {
        try {
            await setDoc(doc(db, "appSettings", "status"), {
                maintenanceMode: true
            }, { merge: true });
            Alert.alert("Bakım Modu", "Bakım modu etkinleştirildi.");
        } catch (error) {
            console.error("Bakım modu hatası:", error);
            Alert.alert("Hata", "Bakım modunu ayarlarken bir sorun oluştu.");
        }
    };

    // ⬇️ Güncelleme kontrolü
    const checkAppVersion = async () => {
        try {
            const docSnap = await getDoc(doc(db, "appSettings", "status"));
            if (docSnap.exists()) {
                const latest = docSnap.data().latestVersion;
                const current = Constants.manifest.version;

                if (current !== latest) {
                    Alert.alert("Güncelleme Mevcut", `Yüklü: ${current}, Son: ${latest}. Lütfen güncelleyin.`);
                } else {
                    Alert.alert("Güncel", "Uygulamanız güncel.");
                }
            } else {
                Alert.alert("Uyarı", "Sürüm bilgisi bulunamadı.");
            }
        } catch (error) {
            console.error("Güncelleme kontrol hatası:", error);
            Alert.alert("Hata", "Sürüm kontrolünde bir hata oluştu.");
        }
    };

    // Add this function to fix the error
    const fetchSettings = async () => {
        // You can implement fetching logic here if needed in the future
    };

    return (
        <SafeAreaView style={styles.container}>
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
