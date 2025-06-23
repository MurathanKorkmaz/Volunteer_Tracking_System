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
import styles from "./adminregister.style";
import { db } from "../../../../configs/FirebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

function validateName(name) {
    const namePattern = /^[a-zA-ZçÇğĞıİöÖşŞüÜ ]+$/;
    return namePattern.test(name);
}

function validateEmail(email) {
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/;
    const localPart = email.split("@")[0];
    const domain = email.split("@")[1];
    const localPartPattern = /^[A-Za-z][A-Za-z0-9._%+-]*$/;

    const allowedDomains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "icloud.com",
        "aol.com",
        "mail.com",
        "yandex.com",
        "protonmail.com",
        "edu.tr",
        "k12.tr",
        "edu",
        "gov",
        "org",
        "com",
        "me.com",
        "zoho.com",
        "gmx.com",
    ];

    return (
        emailPattern.test(email) &&
        localPartPattern.test(localPart) &&
        allowedDomains.includes(domain)
    );
}

function validatePhoneNumber(phone) {
    return phone.length === 11 && /^[0-9]+$/.test(phone) && phone.startsWith("0");
}

function validatePassword(password) {
    const regex = /^[a-zA-Z0-9_]*$/;
    return regex.test(password);
}

export default function adminregister() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();
    const navigation = useNavigation();

    // 📌 Mevcut zamanı al ve istenen formata çevir
    const now = new Date();
    const registerAt = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-${now
    .getHours()
    .toString()
    .padStart(2, "0")}-${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}-${now
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;

    const translateY = useRef(new Animated.Value(1000)).current;

    useEffect(() => {
        // Gesture'ı devre dışı bırak
        navigation.setOptions({
            gestureEnabled: false,
        });
        
        Animated.timing(translateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [navigation]);

    const handleBack = () => {
        router.back();
    };

    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
            return;
        }

        if (!validateName(name)) {
            Alert.alert("Hata", "Geçersiz isim formatı!");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Hata", "Geçersiz e-posta formatı!");
            return;
        }

        if (!validatePhoneNumber(phone)) {
            Alert.alert("Hata", "Geçersiz telefon numarası formatı!");
            return;
        }

        if (!validatePassword(password)) {
            Alert.alert("Hata", "Geçersiz şifre formatı!");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Hata", "Şifreler uyuşmuyor!");
            return;
        }

        try {
            // `request` koleksiyonuna veri ekle
            const newDocRef = await addDoc(collection(db, "request"), {
                email: email,
                name: name,
                password: password,
                phoneNumber: phone,
                authority: "0",
                block: "0",
                turnout: "0",
                rating: "0",
                ratingCounter: "0",
                registerAt: registerAt,
            });

            // Aynı veriyi `pastrequest` koleksiyonuna ekle
            await setDoc(doc(db, "pastrequest", newDocRef.id), {
                email: email,
                name: name,
                password: password,
                phoneNumber: phone,
                authority: "0",
                block: "0",
                turnout: "0",
                rating: "0",
                ratingCounter: "0",
                registerAt: registerAt,
            });

            Alert.alert("Başarılı", "Kayıt işleminiz tamamlandı!");
            router.back();
        } catch (error) {
            console.error("Error saving user data: ", error);
            Alert.alert("Hata", "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FDFD96", "#FFEA00"]}
                style={styles.background}
            >
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
                            <Text style={styles.title}>Kayıt Ol</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Adınız"
                                placeholderTextColor="#888"
                                value={name}
                                onChangeText={setName}
                            />
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
                                placeholder="Telefon Numaranız"
                                placeholderTextColor="#888"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifre"
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Şifreyi Onayla"
                                placeholderTextColor="#888"
                                secureTextEntry
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                                <Text style={styles.buttonText}>Kayıt Ol</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
