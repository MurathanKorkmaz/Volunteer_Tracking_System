import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
    BackHandler,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import styles from "./adminregister.style";
import { db } from "../../../../configs/FirebaseConfig";
import { collection, addDoc, doc, setDoc, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

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
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();

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

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

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
            showMessage({
                title: "Hata",
                message: "Lütfen tüm alanları doldurun!",
                type: "error",
            });
            return;
        }

        if (!validateName(name)) {
            showMessage({
                title: "Hata",
                message: "Geçersiz isim formatı!",
                type: "error",
            });
            return;
        }

        if (!validateEmail(email)) {
            showMessage({
                title: "Hata",
                message: "Geçersiz e-posta formatı!",
                type: "error",
            });
            return;
        }

        if (!validatePhoneNumber(phone)) {
            showMessage({
                title: "Hata",
                message: "Geçersiz telefon numarası formatı!",
                type: "error",
            });
            return;
        }

        if (!validatePassword(password)) {
            showMessage({
                title: "Hata",
                message: "Geçersiz şifre formatı!",
                type: "error",
            });
            return;
        }

        if (password !== confirmPassword) {
            showMessage({
                title: "Hata",
                message: "Şifreler uyuşmuyor!",
                type: "error",
            });
            return;
        }

        try {
            setHasDbError(false);
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

            showMessage({
                title: "Başarılı",
                message: "Kayıt işleminiz tamamlandı!",
                type: "success",
                onPrimary: () => {
                    setMsgVisible(false);
                    router.back();
                },
            });
        } catch (error) {
            console.error("Error saving user data: ", error);
            setHasDbError(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                handleRegister();
            }} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />

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