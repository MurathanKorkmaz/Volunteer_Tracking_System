import { useRouter } from "expo-router";
import React, { useRef, useEffect, useState } from "react";
import {
    View,
    Text,
    StatusBar,
    Image,
    TouchableOpacity,
    Animated,
    BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminanasayfa1.style";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";
import UpdateModal from "../../components/UpdateModal";

const LoginScreen = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const translateY = useRef(new Animated.Value(-1000)).current;
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [updateData, setUpdateData] = useState({
        visible: false,
        latest_version: "",
        update_required: false,
        update_url_apps: "",
        update_url_plays: "",
    });
    const [isConnected, setIsConnected] = useState(true);

    // Animasyon için useEffect
    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
        
        Animated.timing(translateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

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

    // Yazılım güncelleme kontrolü
    useEffect(() => {
        const docRef = doc(db, "appSettings", "globalSettings");

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUpdateData({
                    visible: data.maintenance_mode === true,
                    latest_version: data.latest_version || "",
                    update_required: data.update_required === true,
                    update_url_apps: data.update_url_apps || "",
                    update_url_plays: data.update_url_plays || "",
                });
            }
        }, (error) => {
            console.error("UpdateModal listener error:", error);
        });

        return () => unsubscribe();
    }, []);

    // Bağlantı kontrolü için useEffect
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable);
        });

        return () => unsubscribe();
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

    const checkConnection = async () => {
        try {
            const state = await NetInfo.fetch();
            setIsConnected(state.isConnected && state.isInternetReachable);
        } catch (error) {
            console.error("Connection check error:", error);
            setIsConnected(false);
        }
    };

    const handleExitApp = () => {
        // Uygulamayı direkt kapat
        BackHandler.exitApp();
    };

    return (
        <>
            <StatusBar hidden={true} />

            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />

            <UpdateModal
                visible={updateData.visible}
                latest_version={updateData.latest_version}
                update_required={updateData.update_required}
                update_url_apps={updateData.update_url_apps}
                update_url_plays={updateData.update_url_plays}
                onLater={() => setUpdateData(prev => ({ ...prev, visible: false }))}
            />
            
            {!isConnected && <NoInternet onRetry={checkConnection} />}

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