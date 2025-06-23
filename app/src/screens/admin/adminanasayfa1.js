import { useRouter } from "expo-router";
import React, { useRef, useEffect, useState } from "react";
import {
    View,
    Text,
    StatusBar,
    Image,
    TouchableOpacity,
    Animated,
    Modal,
    StyleSheet,
    Alert,
    NetInfo,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminanasayfa1.style";
import { getDoc, doc, onSnapshot, enableNetwork, getDocs, collection } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import * as Application from "expo-application";
import * as Network from 'expo-network';
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const translateY = useRef(new Animated.Value(-1000)).current;
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const unsubRef = useRef(null); // Firestore aboneliği referansı

    useEffect(() => {
        // Gesture'ı devre dışı bırak
        navigation.setOptions({
            gestureEnabled: false,
        });
        
        Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();

        const checkConnection = async () => {
            try {
                const networkState = await Network.getNetworkStateAsync();
                setIsConnected(networkState.isConnected && networkState.isInternetReachable);

                if (networkState.isConnected && networkState.isInternetReachable) {
                    await enableNetwork(db);
                    setConnectionError(false);
                } else {
                    setConnectionError(true);
                }
            } catch (error) {
                console.error("Network check error:", error);
                setConnectionError(true);
            }
        };

        checkConnection();
        const connectionTimer = setInterval(checkConnection, 10000);

        const testFirestore = async () => {
            try {
                const snapshot = await getDocs(collection(db, "admin"));
                snapshot.forEach((doc) => {
                    console.log("Firestore test verisi:", doc.id, doc.data());
                });
            } catch (error) {
                console.error("Firestore test hatası:", error);
            }
        };

        //testFirestore();

        try {
            if (!unsubRef.current) {
                /*const unsub = onSnapshot(
                    doc(db, "appSettings", "status"),
                    (snapshot) => {
                        const data = snapshot.data();
                        setConnectionError(false);

                        setMaintenanceMode(data?.maintenanceMode === true);

                        const currentVersion = Application.nativeApplicationVersion || "0.0.0";
                        const latestVersion = data?.latestVersion || "0.0.0";
                        if (compareVersions(latestVersion, currentVersion) > 0) {
                            console.log("Güncelleme mevcut");
                        }
                    },
                    (error) => {
                        console.error("Firestore error:", error);
                        setConnectionError(true);
                    }
                );
                unsubRef.current = unsub;*/
            }
        } catch (error) {
            console.error("Firestore subscription error:", error);
            setConnectionError(true);
        }

        return () => {
            clearInterval(connectionTimer);
            if (unsubRef.current) {
                unsubRef.current();
                unsubRef.current = null;
            }
        };
    }, []);

    const compareVersions = (v1, v2) => {
        const a = v1.split('.').map(Number);
        const b = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(a.length, b.length); i++) {
            const diff = (a[i] || 0) - (b[i] || 0);
            if (diff !== 0) return diff;
        }
        return 0;
    };

    const handleNavigateToLogin = () => {
        router.push("../../../src/screens/admin/adminlogin");
    };

    const retryConnection = async () => {
        try {
            setConnectionError(false);
            const networkState = await Network.getNetworkStateAsync();

            if (networkState.isConnected && networkState.isInternetReachable) {
                await enableNetwork(db);
                Alert.alert("Bağlantı", "Sunucuyla bağlantı yeniden kurulmaya çalışılıyor.");
            } else {
                setConnectionError(true);
                Alert.alert("Bağlantı Hatası", "İnternet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
        } catch (error) {
            console.error("Retry connection error:", error);
            setConnectionError(true);
        }
    };

    return (
        <>
            <StatusBar hidden={true} />

            <Modal transparent visible={maintenanceMode} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Bakım Modu</Text>
                        <Text style={styles.modalText}>
                            Uygulama şu anda bakımda. Lütfen daha sonra tekrar deneyiniz.
                        </Text>
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={connectionError} animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Bağlantı Hatası</Text>
                        <Text style={styles.modalText}>
                            Firebase Firestore sunucusuna bağlanılamıyor. İnternet bağlantınızı kontrol ediniz.
                        </Text>
                        <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
                            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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