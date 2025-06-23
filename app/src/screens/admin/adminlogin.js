import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Animated,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminlogin.style";
import { db } from "../../../../configs/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function adminlogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();
    const screenWidth = Dimensions.get('window').width;

    const translateX = useRef(new Animated.Value(screenWidth)).current;

    useEffect(() => {
        // Gesture'ı devre dışı bırak
        navigation.setOptions({
            gestureEnabled: false,
        });
        
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [navigation]);

    const validateEmail = (email) => {
        const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
        return emailPattern.test(email);
    };

    const validatePassword = (password) => {
        const passwordPattern = /^[a-zA-Z0-9_]*$/;
        return passwordPattern.test(password);
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Hata", "Geçerli bir e-posta adresi giriniz!");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Hata", "Geçerli bir şifre giriniz! (sadece harf, rakam ve alt çizgi karakteri) ");
            return;
        }

        setIsLoading(true);

        try {
            const adminSnapshot = await getDocs(collection(db, "admin"));
            const guestSnapshot = await getDocs(collection(db, "guests"));
            let userFound = false;

            adminSnapshot.forEach((doc) => {
                const data = doc.data();
                if (String(data.email) === String(email) && String(data.password) === String(password)) {
                    userFound = true;
                    if (data.block === "1") {
                        Alert.alert("Hata", "Hesabınızın erişimi engellenmiştir.");
                    } else {
                        // Animasyonlu geçiş
                        Animated.timing(translateX, {
                            toValue: -screenWidth,
                            duration: 100,
                            useNativeDriver: true,
                        }).start(() => {
                            router.push({ 
                                pathname: "./adminPanel1", 
                                params: { 
                                    userId: doc.id, 
                                    userName: data.name,
                                    from: "login"
                                } 
                            });
                        });
                    }
                }
            });

            if (!userFound) {
                guestSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (String(data.email) === String(email) && String(data.password) === String(password)) {
                        userFound = true;
                        if (data.block === "1") {
                            Alert.alert("Hata", "Hesabınızın erişimi engellenmiştir.");
                        } else {
                            // Animasyonlu geçiş
                            Animated.timing(translateX, {
                                toValue: -screenWidth,
                                duration: 100,
                                useNativeDriver: true,
                            }).start(() => {
                                router.push({ pathname: "./../guest/guestPanel1", params: { userId: doc.id, userName: data.name } });
                            });
                        }
                    }
                });
            }

            if (!userFound) {
                Alert.alert("Hata", "Geçersiz e-posta veya şifre!");
            }
        } catch (error) {
            Alert.alert("Hata", "Giriş yapılırken bir hata meydana geldi!");
            console.error("Login error: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        // Animasyonlu geçiş
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push("./adminregister");
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FDFD96", "#FFEA00"]}
                style={styles.background}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => {
                    // Animasyonlu geçiş
                    Animated.timing(translateX, {
                        toValue: screenWidth,
                        duration: 100,
                        useNativeDriver: true,
                    }).start(() => {
                        router.back();
                    });
                }}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>
                <Animated.View
                    style={{
                        transform: [{ translateX }],
                        flex: 1,
                    }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../../assets/logos/logo8.png")}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                            <Text style={styles.appName}>Gönüllü Platformu</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <Text style={styles.title}>Hoş Geldiniz</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="E-posta adresiniz"
                                placeholderTextColor="#888"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!isLoading}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifreniz"
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!isLoading}
                            />
                            <TouchableOpacity 
                                style={styles.button} 
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.buttonText}>Giriş Yap</Text>
                            </TouchableOpacity>

                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText1}>
                                    Henüz gönüllümüz olmadın mı?
                                </Text>
                                <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                                    <Text style={styles.registerText2}> Kayıt Ol</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text style={styles.loadingText}>Giriş yapılıyor...</Text>
                        </View>
                    </View>
                )}
            </LinearGradient>
        </SafeAreaView>
    );
}
