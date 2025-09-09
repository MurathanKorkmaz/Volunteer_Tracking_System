import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
    ActivityIndicator,
    Dimensions,
    BackHandler,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminlogin.style";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import { db } from "../../../../configs/FirebaseConfig";
import { collection, getDocs, onSnapshot, doc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";

// Firebase ve diğer tüm hata mesajlarını gizle
LogBox.ignoreAllLogs();
// Alternatif olarak sadece belirli hataları gizlemek için:
// LogBox.ignoreLogs([
//     'Possible Unhandled Promise Rejection',
//     'FirebaseError:',
//     'Maintenance mode listener error:',
//     'Error: Veritabanına erişilemiyor',
//     'Login error',
//     'Error: Firebase',
//     '[firebase]',
//     'firebase',
//     'Error: [auth]',
//     'auth/invalid-login',
// ]);

export default function adminlogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [showDbError, setShowDbError] = useState(false);
    const router = useRouter();
    const navigation = useNavigation();
    const [msgVisible, setMsgVisible] = useState(false);
    const [msgProps, setMsgProps] = useState({
        title: "",
        message: "",
        type: "info",          // 'info' | 'success' | 'warning' | 'error'
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

    const screenWidth = Dimensions.get('window').width;

    const translateX = useRef(new Animated.Value(screenWidth)).current;

    const handleBlockModalClose = () => {
        setIsBlocked(false);
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
            // Hata durumunda sadece konsola yaz
            console.error("Maintenance mode listener error:", error);
        });

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
        navigation.setOptions({
            gestureEnabled: false,
        });
        
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable);
        });

        return () => unsubscribe();
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
            showMessage({
                title: "Hata",
                message: "Lütfen tüm alanları doldurun!",
                type: "error",
            });
            return;
        }

        if (!validateEmail(email)) {
            showMessage({
                title: "Hata",
                message: "Geçerli bir e-posta adresi giriniz!",
                type: "error",
            });
            return;
        }

        if (!validatePassword(password)) {
            showMessage({
                title: "Hata",
                message: "Geçerli bir şifre giriniz! (sadece harf, rakam ve alt çizgi)",
                type: "error",
            });
            return;
        }

        setIsLoading(true);
        setShowDbError(false);

        try {
            // Önce veritabanına erişilebilirliği kontrol et
            const testDoc = await getDocs(collection(db, "admin")).catch(() => null);
            if (!testDoc) {
                throw new Error("Veritabanına erişilemiyor");
            }

            const adminSnapshot = await getDocs(collection(db, "admin"));
            const guestSnapshot = await getDocs(collection(db, "guests"));
            const personalSnapshot = await getDocs(collection(db, "personal"));
            let userFound = false;

            // Admin kontrolü
            adminSnapshot.forEach((doc) => {
                const data = doc.data();
                if (String(data.email) === String(email) && String(data.password) === String(password)) {
                    userFound = true;
                    // Admin için block kontrolü yapılmıyor
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
            });

            // Guest kontrolü
            if (!userFound) {
                guestSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (String(data.email) === String(email) && String(data.password) === String(password)) {
                        userFound = true;
                        if (data.block === "1") {
                            setIsBlocked(true);
                        } else {
                            Animated.timing(translateX, {
                                toValue: -screenWidth,
                                duration: 100,
                                useNativeDriver: true,
                            }).start(() => {
                                router.push({ pathname: "./../guest/guestPanel1", params: { userId: doc.id, userName: data.name, userAuthority: data.authority } });
                            });
                        }
                    }
                });
            }

            // Personal kontrolü
            if (!userFound) {
                personalSnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (String(data.email) === String(email) && String(data.password) === String(password)) {
                        userFound = true;
                        if (data.block === "1") {
                            setIsBlocked(true);
                        } else {
                            Animated.timing(translateX, {
                                toValue: -screenWidth,
                                duration: 100,
                                useNativeDriver: true,
                            }).start(() => {
                                router.push({ pathname: "./../guest/guestPanel1", params: { userId: doc.id, userName: data.name, userAuthority: data.authority } });
                            });
                        }
                    }
                });
            }

            if (!userFound) {
                showMessage({
                    title: "Hata",
                    message: "Geçersiz e-posta veya şifre!",
                    type: "error",
                });
            }
        } catch (error) {
            // Hata konsola yazdırılır ama kullanıcıya sadece DatabaseError gösterilir
            console.error("Login error: ", error);
            setShowDbError(true);
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
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal visible={isBlocked} onClose={handleBlockModalClose} />
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {showDbError && <DatabaseError onRetry={() => {
                setShowDbError(false);
                handleLogin();
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
            </LinearGradient>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.loadingText}>Giriş yapılıyor...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}