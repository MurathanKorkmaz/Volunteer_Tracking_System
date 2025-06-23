import React, { useState, useEffect  } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./adminreports4.style";
import { collection, doc, getDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports4() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const announcementsRef = collection(db, "pastAnnouncements");
            const announcementsSnapshot = await getDocs(announcementsRef);
    
            let fetchedAnnouncements = [];
    
            announcementsSnapshot.forEach(doc => {
                const announcementData = doc.data();
                
                fetchedAnnouncements.push({
                    id: doc.id,
                    title: announcementData.Tittle || "Duyuru Başlığı Yok",
                    description: announcementData.description || "Açıklama Yok",
                    startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                    endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                    volunterCounter: announcementData.volunterCounter || "0",
                    eventStatus: announcementData.eventStatus || "1"
                });
            });
    
            setAnnouncements(fetchedAnnouncements);
            setFilteredAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error("❌ Duyurular çekilirken hata oluştu:", error);
            Alert.alert("Hata", "Duyurular yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    

    useEffect(() => {
        fetchAnnouncements();
    }, []);
    

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all announcements
        if (!text.trim()) {
            setFilteredAnnouncements(announcements);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter announcements based on title
        const filtered = announcements.filter((announcement) => {
            if (!announcement.title || typeof announcement.title !== "string") {
                return false;
            }
            const announcementTitle = announcement.title.toLowerCase();
            // Check if all search terms are found in the announcement title
            return searchTerms.every(term => announcementTitle.includes(term));
        });

        setFilteredAnnouncements(filtered);
    };
    
    const handleDelete = async (announcementId) => {
        try {
            // 🔹 `pastAnnouncements` içindeki duyuruyu sil
            const pastAnnouncementRef = doc(db, "pastAnnouncements", announcementId);
            await deleteDoc(pastAnnouncementRef);
            console.log(`✅ PastAnnouncements içindeki duyuru silindi: ${announcementId}`);
    
            // 🔹 Silme işleminden sonra duyuru listesini güncelle
            setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    
            Alert.alert("Başarılı", "Duyuru başarıyla silindi.");
        } catch (error) {
            console.error("❌ Duyuru silme hatası:", error);
            Alert.alert("Hata", "Duyuru silinirken bir hata oluştu.");
        }
    };
    
    

    
    return (
        <SafeAreaView style={styles.container}>
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

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Duyurular</Text>
                    </View>

                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Duyuru ara..."
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                    </View>

                    {/* Scrollable Announcements List */}
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
                                {filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements.map((announcement) => (
                                        <View key={announcement.id} style={styles.announcementCard}>
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
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Henüz duyuru yok.</Text>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
