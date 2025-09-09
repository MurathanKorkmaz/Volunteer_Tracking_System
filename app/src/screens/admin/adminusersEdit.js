import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import styles from "./adminusersEdit.style";
import { collection, doc, getDocs, updateDoc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function adminusersEdit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    // from parametresine göre giriş yönü
    const initialX = params.from === "users" ? screenWidth : 0;
    const translateX = useRef(new Animated.Value(initialX)).current;
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

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

    useEffect(() => {
        // Giriş animasyonu
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);


    // Router ile gelen başlangıç değerleri
    const [userId] = useState(params.id || "");
    const [userName, setUserName] = useState(params.name || "");
    const [initialRole] = useState(params.role || "Guest");
    const [initialIsBlocked] = useState(params.blocked === "1");
    const [initialParticipationRate] = useState(parseInt(params.turnout) || 0);
    const [initialRating] = useState(parseInt(params.rating) || 0);

    // Kullanıcı değişikliklerini tutan state
    const [userRole, setUserRole] = useState(initialRole);
    const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
    const [participationRate, setParticipationRate] = useState(initialParticipationRate);
    const [rating, setRating] = useState(initialRating);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const collection = 
                initialRole === "Admin" ? "admin" :
                initialRole === "Personal" ? "personal" : "guests";
            const userDoc = await getDoc(doc(db, collection, userId));
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                setUserName(data.name || "");
                setUserRole(
                    data.authority === "2" ? "Admin" :
                    data.authority === "1" ? "Guest" :
                    data.authority === "3" ? "Personal" : "Guest"
                );
                setIsBlocked(data.block === "1");
                setParticipationRate(parseInt(data.turnout) || 0);
                setRating(parseInt(data.rating) || 0);
            }
        } catch (error) {
            console.error("Veri yüklenirken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

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

    const handleSave = async () => {
        try {
            // Kullanıcının mevcut ve yeni koleksiyonunu belirle
            let currentCollection =
                initialRole === "Admin"
                    ? "admin"
                    : initialRole === "Guest"
                    ? "guests"
                    : "personal";

            let newCollection =
                userRole === "Admin"
                    ? "admin"
                    : userRole === "Guest"
                    ? "guests"
                    : "personal";

            let docRef = doc(db, currentCollection, userId);
            let newDocRef = doc(db, newCollection, userId);
            let updates = {};

            // **Rol değiştiyse kullanıcıyı yeni koleksiyona taşı**
            if (userRole !== initialRole) {
                const userDoc = await getDoc(docRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();

                    // **Tüm değişiklikleri yeni koleksiyona aktar**
                    await setDoc(newDocRef, {
                        ...userData,
                        authority:
                            userRole === "Admin"
                                ? "2"
                                : userRole === "Personal"
                                ? "3"
                                : "1",
                        block: isBlocked ? "1" : "0",
                        turnout: participationRate.toString(),
                        rating: rating.toString(),
                    });

                    // **Eski koleksiyondaki veriyi sil**
                    await deleteDoc(docRef);
                    showMessage({
                        title: "Başarılı",
                        message: "Sadece değişen veriler güncellendi.",
                        type: "success",
                    });
                } else {
                    showMessage({
                        title: "Hata",
                        message: "Kullanıcı kaydı bulunamadı.",
                        type: "error",
                    });
                    return;
                }
            } else {
                // **Rol aynıysa güncellemeleri yap**
                const userDoc = await getDoc(docRef);

                if (!userDoc.exists()) {
                    // **Eğer belge yoksa, oluştur ve veriyi ekle**
                    await setDoc(docRef, {
                        authority:
                            userRole === "Admin"
                                ? "2"
                                : userRole === "Personal"
                                ? "3"
                                : "1",
                        block: isBlocked ? "1" : "0",
                        turnout: participationRate.toString(),
                        rating: rating.toString(),
                    });

                    showMessage({
                        title: "Başarılı",
                        message: "Kullanıcı kaydı oluşturuldu.",
                        type: "success",
                    });
                } else {
                    // **Tüm değişiklikleri tek seferde güncelle**
                    if (isBlocked !== initialIsBlocked) {
                        updates.block = isBlocked ? "1" : "0";
                    }
                    if (participationRate !== initialParticipationRate) {
                        updates.turnout = participationRate.toString();

                        // **Veritabanındaki `eventPublish: 1` olan etkinlikleri say**
                        const eventsSnapshot = await getDocs(collection(db, "events"));
                        let totalPublishedEvents = 0;

                        eventsSnapshot.forEach(doc => {
                            const data = doc.data();
                            if (parseInt(data.eventPublish) === 1) {
                                totalPublishedEvents++;
                            }
                        });

                        console.log(`Katılım Oranı: ${participationRate}`);
                        console.log(`Toplam Yayınlanan Etkinlik: ${totalPublishedEvents}`);

                        // **ratingCounter Hesaplaması**
                        if (totalPublishedEvents > 0) {
                            let newRatingCounter = Math.round(
                                (participationRate * totalPublishedEvents) / 100
                            );
                            updates.ratingCounter = newRatingCounter.toString();
                            console.log(
                                `Yeni Rating Counter (Yuvarlanmış): ${updates.ratingCounter}`
                            );
                        } else {
                            console.warn(
                                "Hata: Yayınlanan etkinlik sayısı 0, ratingCounter hesaplanamıyor."
                            );
                        }
                    }

                    if (rating !== initialRating) {
                        updates.rating = rating.toString();
                    }

                    if (Object.keys(updates).length > 0) {
                        await updateDoc(docRef, updates);
                        showMessage({
                            title: "Başarılı",
                            message: "Sadece değişen veriler güncellendi.",
                            type: "success",
                        });
                    } else {
                        showMessage({
                            title: "Bilgi",
                            message: "Herhangi bir değişiklik yapılmadı.",
                            type: "info",
                        });
                    }
                }
            }
            router.back();
        } catch (error) {
            console.error("Hata:", error);
            showMessage({
                title: "Hata",
                message: "Değişiklikler kaydedilirken bir hata oluştu.",
                type: "error",
            });
        }
    };

    const handleBack = () => {
        // Animasyonlu geri dönüş
        router.back();
    };
    
    const handleDelete = async () => {
        try {
            // Kullanıcının rolüne göre koleksiyonu belirle
            let collectionToCheck =
                initialRole === "Admin"
                    ? "admin"
                    : initialRole === "Guest"
                    ? "guests"
                    : "personal";

            const userDocRef = doc(db, collectionToCheck, userId);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                showMessage({
                    title: "Hata",
                    message: "Kullanıcı bulunamadı.",
                    type: "error",
                });
                return;
            }

            // Kullanıcının mevcut tüm verilerini al
            const userData = userDoc.data();

            // **ratingCounter değerini Firestore'dan oku**
            let ratingCounter = "0"; // Varsayılan değer
            if (userData.ratingCounter) {
                ratingCounter = userData.ratingCounter.toString();
            }

            // Güncellenmesi gereken tüm alanlar
            const pastRequestData = {
                authority:
                    initialRole === "Admin"
                        ? "2"
                        : initialRole === "Personal"
                        ? "3"
                        : "1",
                block: initialIsBlocked ? "1" : "0",
                email: userData.email || "",
                name: userData.name || "",
                password: userData.password || "",
                phoneNumber: userData.phoneNumber || "",
                rating: initialRating.toString(),
                turnout: initialParticipationRate.toString(),
                ratingCounter: ratingCounter,
                registerAt: userData.registerAt
                    ? typeof userData.registerAt === "string"
                        ? userData.registerAt
                        : userData.registerAt.toDate().toISOString()
                    : "",
                deletedAt: new Date().toISOString(),
            };

            const pastRequestDocRef = doc(db, "pastrequest", userId);
            const pastRequestDoc = await getDoc(pastRequestDocRef);

            if (pastRequestDoc.exists()) {
                // Eğer geçmişte bir kayıt varsa güncelle
                await updateDoc(pastRequestDocRef, pastRequestData);
            } else {
                // Eğer geçmişte kayıt yoksa, yeni bir belge oluştur
                await setDoc(pastRequestDocRef, pastRequestData);
            }

            // Kullanıcıyı ilgili koleksiyondan sil (admin, guests, personal)
            await deleteDoc(userDocRef);

            showMessage({
                title: "Başarılı",
                message: "Kullanıcı başarıyla silindi ve geçmiş veri güncellendi.",
                type: "success",
            });
            router.back();
        } catch (error) {
            console.error("Hata:", error);
            showMessage({
                title: "Hata",
                message:
                    "Kullanıcı silinirken veya geçmiş veri güncellenirken bir hata oluştu.",
                type: "error",
            });
        }
    };
    

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchUserData();
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

            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>
                                        
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Kullanıcı Düzenle</Text>
                    </View>

                    {/* ScrollView ile tüm kartları kaydırılabilir hale getiriyoruz */}
                    <View style={styles.scrollContainer}>
                        {loading ? (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                    <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                </View>
                            </View>
                        ) : (
                            <ScrollView 
                                contentContainerStyle={styles.scrollWrapper}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setRefreshing(true);
                                            fetchUserData();
                                        }}
                                    />
                                }
                            >
                            
                            {/* İsim-Soyisim Kartı */}
                            <View style={styles.inputContainer1}>
                                <Text style={styles.userNameText}>{userName}</Text>
    
                                {/* Rol Seçimi (Admin / Guest) */}
                                <View style={styles.roleContainer}>
                                    <TouchableOpacity
                                        style={[styles.roleButton, userRole === "Admin" && styles.roleButtonActive]}
                                        onPress={() => setUserRole("Admin")}
                                    >
                                        <Text style={[styles.roleButtonText, userRole === "Admin" && styles.roleButtonTextActive]}>
                                            Admin
                                        </Text>
                                    </TouchableOpacity>
    
                                    <TouchableOpacity
                                        style={[styles.roleButton, userRole === "Guest" && styles.roleButtonActive]}
                                        onPress={() => setUserRole("Guest")}
                                    >
                                        <Text style={[styles.roleButtonText, userRole === "Guest" && styles.roleButtonTextActive]}>
                                            Guest
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.roleButton, userRole === "Personal" && styles.roleButtonActive]}
                                        onPress={() => setUserRole("Personal")}
                                    >
                                        <Text style={[styles.roleButtonText, userRole === "Personal" && styles.roleButtonTextActive]}>
                                            Personal
                                        </Text>
                                    </TouchableOpacity>
                                </View>
    
                                {/* Bloke Et / Kaldır Butonu */}
                                <TouchableOpacity
                                    style={[styles.blockButton, isBlocked && styles.blockButtonActive]}
                                    onPress={() => setIsBlocked(!isBlocked)}
                                >
                                    <Text style={styles.blockButtonText}>
                                        {isBlocked ? "Blokeyi Kaldır" : "Bloke Et"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
    
                            {/* Katılım Oranı Kartı */}
                            <View style={styles.inputContainer2}>
                                <Text style={styles.userNameText}>Katılım Oranı: {participationRate}%</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={1}
                                    value={participationRate}
                                    onValueChange={(value) => setParticipationRate(value)}
                                    minimumTrackTintColor="#4CAF50"
                                    maximumTrackTintColor="#FF5733"
                                    thumbTintColor="#FFD700"
                                />
                            </View>
    
                            {/* Katılım Puanı Kartı */}
                            <View style={styles.inputContainer2}>
                                <Text style={styles.userNameText}>Katılım Puanı: {rating}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={1}
                                    value={rating}
                                    onValueChange={(value) => setRating(value)}
                                    minimumTrackTintColor="#4CAF50"
                                    maximumTrackTintColor="#FF5733"
                                    thumbTintColor="#FFD700"
                                />
                            </View>

                            {/* Sil ve Kaydet Butonları (Scroll'un dışında) */}
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.deleteButtonText}>Kullanıcıyı Sil</Text>
                            </TouchableOpacity>
            
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </ScrollView>
                        )}
                    </View>
    

    
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
    
}