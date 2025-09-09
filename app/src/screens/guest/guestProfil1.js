import { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    BackHandler,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Circle, Svg } from "react-native-svg";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./guestProfil1.style";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function GuestProfil1() {
    const { userId, userName, userAuthority } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const userCollection = userAuthority === "3" ? "personal" : "guests";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [ratingCounter, setRatingCounter] = useState(0);
    const [participationRate, setParticipationRate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [hasDbError, setHasDbError] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;

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

    // Block durumu kontrolü için useEffect
    useEffect(() => {
        if (!userId) return;

        const userDocRef = doc(db, userCollection, userId);
        
        const unsubscribeBlock = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const isUserBlocked = userData.block === "1";
                setIsBlocked(isUserBlocked);
            }
        }, (error) => {
            console.error("Block status listener error:", error);
        });

        return () => unsubscribeBlock();
    }, [userId]);

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

    // Block durumunda çıkış işlemi
    const handleBlockExit = () => {
        // Navigation stack'i tamamen temizle ve ana sayfaya git
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }], // Ana route'a dön
        });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Eğer kullanıcı bloklu ise navigation'ı engelle
            if (isBlocked) return;
            
            // Prevent default behavior
            e.preventDefault();

            // Run our custom animation
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                // After animation complete, continue with navigation
                navigation.dispatch(e.data.action);
            });
        });

        // Initial animation when screen mounts
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // Enable gesture navigation
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
        });

        fetchUserData();

        return unsubscribe;
    }, [userId, isBlocked]);

    const fetchUserData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            setHasDbError(false);
            const userRef = doc(db, userCollection, userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                setName(userData.name || "");
                setEmail(userData.email || "");
                setPhone(userData.phoneNumber || "");
                setParticipationRate(userData.turnout ? parseInt(userData.turnout) : 0);
                setRatingCounter(userData.ratingCounter ? parseInt(userData.ratingCounter) : 0);
            }
        } catch (error) {
            console.error("Kullanıcı verileri alınırken hata:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserData();
        setRefreshing(false);
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            showMessage({
                title: "Hata",
                message: "Lütfen tüm alanları doldurun.",
                type: "error",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage({
                title: "Hata",
                message: "Şifreler uyuşmuyor.",
                type: "error",
            });
            return;
        }

        try {
            setHasDbError(false);
            const userRef = doc(db, userCollection, userId);
            await updateDoc(userRef, { password: newPassword.trim() });
            showMessage({
                title: "Başarılı",
                message: "Şifre başarıyla güncellendi.",
                type: "success",
            });
            setModalVisible(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Şifre güncellenirken hata:", error);
            setHasDbError(true);
        }
    };

    const renderCircularGraph = (percentage, color, label) => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const progress = (percentage / 100) * circumference;

        return (
            <View style={styles.circularGraphContainer}>
                <Svg width={100} height={100}>
                    <Circle cx="50" cy="50" r={radius} stroke="#E0E0E0" strokeWidth="10" fill="none" />
                    <Circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={color}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="50,50"
                    />
                </Svg>
                <Text style={styles.circularGraphText}>{`${percentage}%`}</Text>
                <Text style={styles.circularGraphLabel}>{label}</Text>
            </View>
        );
    };

    const handleBack = () => {
        // Eğer kullanıcı bloklu ise geri dönüşü engelle
        if (isBlocked) {
            handleBlockExit();
            return;
        }
        
        // Animasyonlu geri dönüş
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchUserData();
            }} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal visible={isBlocked} onClose={handleBlockExit} />

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

            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={{ flex: 1 }}>
                {/* ✅ Animated içerik */}
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Profil</Text>
                    </View>

                    <TouchableOpacity style={styles.backButton} onPress={() => handleBack()}>
                        <Text style={styles.backButtonText}>{"<"}</Text>
                    </TouchableOpacity>

                    <ScrollView 
                        contentContainerStyle={styles.scrollViewContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                            />
                        }
                    >
                        <View style={styles.graphsContainer}>
                            {renderCircularGraph(participationRate, "#1E90FF", "Katılım Oranı")}
                        </View>

                        <View style={styles.participationCountContainer}>
                            <Text style={styles.participationCountText}>
                                Katıldığı Etkinlik Sayısı: {ratingCounter}
                            </Text>
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Ad Soyad</Text>
                            <TextInput style={styles.input} value={name} editable={false} />

                            <Text style={styles.label}>E-posta</Text>
                            <TextInput style={styles.input} value={email} editable={false} />

                            <Text style={styles.label}>Telefon Numarası</Text>
                            <TextInput style={styles.input} value={phone} editable={false} />

                            <Text style={styles.label}>Rozetler</Text>
                            <View style={styles.badgesContainer}>
                                <Text style={styles.badge}>Gönüllülük Rozeti</Text>
                                <Text style={styles.badge}>Katılım Rozeti</Text>
                            </View>

                            <TouchableOpacity
                                style={styles.resetPasswordButton}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={styles.resetPasswordText}>Şifreyi Sıfırla</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </LinearGradient>

            {/* Şifre Sıfırlama Modalı */}
            <Modal transparent={true} visible={modalVisible} animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Şifreyi Sıfırla</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Yeni Parola"
                            secureTextEntry={true}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Yeni Parola Tekrar"
                            secureTextEntry={true}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                                <Text style={styles.buttonText}>Sıfırla</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}