import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Circle, Svg } from "react-native-svg";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./guestProfil1.style";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function GuestProfil1() {
    const { userId, userName } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();

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

    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
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
    }, [userId]);

    const fetchUserData = async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const userRef = doc(db, "guests", userId);
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
            alert("Lütfen tüm alanları doldurun.");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Şifreler uyuşmuyor.");
            return;
        }

        try {
            const userRef = doc(db, "guests", userId);
            await updateDoc(userRef, { password: newPassword.trim() });
            alert("Şifre başarıyla güncellendi.");
            setModalVisible(false);
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            alert("Şifre güncellenirken hata oluştu.");
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
