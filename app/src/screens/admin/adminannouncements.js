import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./adminannouncements.style";
import { collection, doc, getDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminAnnouncements() {
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("published");
    const [eventStatus, setEventStatus] = useState("1");
    const [refreshing, setRefreshing] = useState(false);

    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "announcements"));
            const announcementsData = [];
            querySnapshot.forEach((doc) => {
                announcementsData.push({ id: doc.id, ...doc.data() });
            });
            setAnnouncements(announcementsData);
            setFilteredAnnouncements(announcementsData);
        } catch (error) {
            console.error("Duyurular alınırken hata oluştu:", error);
            Alert.alert("Hata", "Duyurular yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Gesture'ı etkinleştir ama kendi animasyonunu devre dışı bırak
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        // Gesture handler'ı ekle
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior
            e.preventDefault();

            // Animasyonlu geri dönüş
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                navigation.dispatch(e.data.action);
            });
        });

        // Animasyonu başlat
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchAnnouncements();

        return unsubscribe;
    }, [navigation]);

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

    const handleSearch = (text) => {
        setSearchText(text);
        
        // Boş arama metni kontrolü
        if (!text.trim()) {
            setFilteredAnnouncements(announcements);
            return;
        }

        // Case-insensitive arama için text'i küçük harfe çevir
        const searchTerm = text.toLowerCase().trim();

        // Duyuruları filtrele
        const filtered = announcements.filter((announcement) => {
            if (!announcement.title) return false;
            return announcement.title.toLowerCase().includes(searchTerm);
        });

        setFilteredAnnouncements(filtered);
    };

    const handleEdit = (announcement) => {
        router.push({
            pathname: "./adminannouncementsEdit1",
            params: {
                id: announcement.id,
                title: announcement.title,
                description: announcement.description,
                startDate: announcement.startDate,
                endDate: announcement.endDate,
                volunterCounter: announcement.volunterCounter,
                eventStatus: announcement.eventStatus || "1",
                from: "announcements"
            }
        });
    };

    const handleDelete = async (announcementId) => {
        try {
            const announcementRef = doc(db, "announcements", announcementId);
            const announcementSnap = await getDoc(announcementRef);

            if (!announcementSnap.exists()) {
                console.warn("❌ Silinecek duyuru bulunamadı!");
                return;
            }

            const announcementData = announcementSnap.data();

            const pastAnnouncementRef = doc(db, "pastAnnouncements", announcementId);
            await setDoc(pastAnnouncementRef, {
                title: announcementData.Tittle || "Duyuru Başlığı Yok",
                description: announcementData.description || "Açıklama Yok",
                startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                volunterCounter: announcementData.volunterCounter || "0",
                eventStatus: announcementData.eventStatus || "0",
            });

            await deleteDoc(announcementRef);
            fetchAnnouncements();
        } catch (error) {
            console.error("❌ Duyuru silme hatası:", error);
        }
    };

    return (
        <SafeAreaView edges={['left', 'right']} style={styles.container}>
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
                        <Text style={styles.headerText}>Duyurular</Text>
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "published" && styles.tabButtonActive1]}
                            onPress={() => {
                                setActiveTab("published");
                                setEventStatus("1");
                            }}
                        >
                            <Text style={[styles.tabButtonText, activeTab === "published" && styles.tabButtonTextActive]}>
                                Yayında
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "unpublished" && styles.tabButtonActive2]}
                            onPress={() => {
                                setActiveTab("unpublished");
                                setEventStatus("0");
                            }}
                        >
                            <Text style={[styles.tabButtonText, activeTab === "unpublished" && styles.tabButtonTextActive]}>
                                Yayın Dışı
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Duyuru ara..."
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                    </View>

                    <View style={styles.scrollableList}>
                        {loading ? (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                    <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                </View>
                            </View>
                        ) : (
                            <ScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setRefreshing(true);
                                            fetchAnnouncements();
                                        }}
                                    />
                                }
                            >
                                {/* Katılım Puanları kartı - her zaman görünür */}
                                <TouchableOpacity
                                    style={styles.announcementCard}
                                    onPress={() => router.push({
                                        pathname: "./adminAnnouncements3",
                                        params: { from: "announcements" }
                                    })}
                                >
                                    <View style={styles.announcementDetails}>
                                        <Text style={styles.announcementTitle}>Katılım Puanları</Text>
                                        <Text style={styles.announcementDate}>Her ay güncellenir</Text>
                                        <Text style={styles.announcementDescription}>
                                            Katılım puanlarınız her ay düzenli olarak burada açıklanacaktır.
                                        </Text>
                                        <Text style={styles.announcementVolunterCounter}>
                                            Bilgilendirme
                                        </Text>
                                        <Text style={styles.infoText}>
                                            Puanlar her ayın 1'i ile 5'i arasında saat 15:00'ten sonra açıklanır.
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {loading ? (
                                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                                ) : filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements
                                        .filter(announcement => announcement.eventStatus === eventStatus) // Tab'a göre filtrele
                                        .map((announcement) => (
                                        <TouchableOpacity
                                            key={announcement.id}
                                            style={styles.announcementCard}
                                            onPress={() => handleEdit(announcement)}
                                        >
                                            <View style={styles.announcementDetails}>
                                                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                                                <Text style={styles.announcementDate}>
                                                    {announcement.startDate} - {announcement.endDate}
                                                </Text>
                                                <Text style={styles.announcementDescription}>
                                                    {announcement.description}
                                                </Text>
                                                <Text style={styles.announcementVolunterCounter}>
                                                    Gönüllü Sayısı: {announcement.volunterCounter}
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => handleDelete(announcement.id)}
                                            >
                                                <Text style={styles.buttonText}>Sil</Text>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Henüz duyuru yok.</Text>
                                )}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.addButtonContainer}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push({
                                pathname: "./adminannouncementsEdit2",
                                params: { from: "announcements" }
                            })}
                        >
                            <Text style={styles.addButtonText}>Duyuru Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
