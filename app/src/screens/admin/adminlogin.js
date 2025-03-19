import { useRouter } from "expo-router";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminlogin.style";
import { db } from "../../../../configs/FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function adminlogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const translateY = useRef(new Animated.Value(1000)).current;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

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
                        router.push({ pathname: "./adminPanel1", params: { userId: doc.id, userName: data.name } });
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
                            router.push({ pathname: "./../guest/guestPanel1", params: { userId: doc.id, userName: data.name } });
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
        }
    };

    const handleRegister = () => {
        router.push("./adminregister");
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FDFD96", "#FFEA00"]}
                style={styles.background}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.push("./adminanasayfa1") }>
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>
                <Animated.View
                    style={{
                        transform: [{ translateY }],
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
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifreniz"
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                <Text style={styles.buttonText}>Giriş Yap</Text>
                            </TouchableOpacity>

                            {/* Yeni Kayıt Ol Bölümü */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText1}>
                                    Henüz gönüllümüz olmadın mı?
                                </Text>
                                <TouchableOpacity onPress={handleRegister}>
                                    <Text style={styles.registerText2}> Kayıt Ol</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
