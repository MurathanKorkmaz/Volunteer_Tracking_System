import { useRouter } from "expo-router";
import React, { useRef, useEffect } from "react";
import {
    View,
    Text,
    StatusBar,
    Image,
    TouchableOpacity,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminanasayfa1.style";

const LoginScreen = () => {
    const router = useRouter(); // Router oluşturuldu
    const translateY = useRef(new Animated.Value(-1000)).current; // Animasyon başlangıç pozisyonu (yukarıda)

    useEffect(() => {
        // Sayfa açıldığında animasyonu tetikler
        Animated.timing(translateY, {
            toValue: 0, // Nihai pozisyon (ekranın görünür kısmı)
            duration: 500, // Animasyon süresi
            useNativeDriver: true, // Performans için native driver kullanılır
        }).start();
    }, []);

    const handleNavigateToLogin = () => {
        router.push("../../../src/screens/admin/adminlogin"); // Login sayfasına yönlendirme
    };

    return (
        <>
            <StatusBar hidden={true} />
            <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
                <LinearGradient
                    colors={["#FFFACD", "#FFD701"]}
                    style={styles.topSection}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Image source={require("../../assets/logos/logo8.png")} style={styles.logo} />
                    <LinearGradient
                        colors={["#8B0000", "#8B0000"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.textGradient}
                    >
                        <Text style={styles.gradientText}>Sivil Toplum Destekleme Derneği</Text>
                    </LinearGradient>

                    {/* İki Satırlı Görsel Alanı */}
                    <View style={styles.rowImagesContainer}>
                        <View style={styles.imageRow1}>
                            <Image source={require("../../assets/imgs/img4.png")} style={styles.largeImage} />
                            <Image source={require("../../assets/imgs/img5.png")} style={styles.largeImage} />
                        </View>
                        <View style={styles.imageRow2}>
                            <Image source={require("../../assets/imgs/img6.png")} style={styles.largeImage} />
                            <Image source={require("../../assets/imgs/img7.png")} style={styles.largeImage} />
                            <Image source={require("../../assets/imgs/img8.png")} style={styles.largeImage} />
                        </View>
                    </View>
                </LinearGradient>

                {/* Alt Bölüm */}
                <View style={styles.bottomSection}>
                    <View style={styles.imagesContainer}>
                        <Image source={require("../../assets/imgs/img1.png")} style={styles.image} />
                        <Image source={require("../../assets/imgs/img2.png")} style={styles.image} />
                        <Image source={require("../../assets/imgs/img3.png")} style={styles.image} />
                    </View>

                    <Text style={styles.title}>SİTODED</Text>
                    <Text style={styles.description}>Gönüllü Platformu</Text>

                    <TouchableOpacity style={styles.buttonCentered} onPress={handleNavigateToLogin}>
                        <Text style={styles.buttonText}>Giriş Yap</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </>
    );
};

export default LoginScreen;
