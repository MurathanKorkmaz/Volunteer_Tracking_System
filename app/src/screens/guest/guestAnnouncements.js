import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "./guestAnnouncements.style";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function guestAnnouncements() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName, from } = useLocalSearchParams();
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 📌 Tarih ve saat bilgisi
    const now = new Date();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const isPointsAnnouncementActive = currentDay >= 1 && currentDay <= 5 && currentHour >= 15;

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const announcementsRef = collection(db, "announcements");
            const announcementsSnapshot = await getDocs(announcementsRef);

            let fetchedAnnouncements = [];

            announcementsSnapshot.forEach(doc => {
                const announcementData = doc.data();
                if (announcementData.eventStatus === "1") {
                    fetchedAnnouncements.push({
                        id: doc.id,
                        title: announcementData.Tittle || "Duyuru Başlığı Yok",
                        description: announcementData.description || "Açıklama Yok",
                        startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                        endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                        volunterCounter: announcementData.volunterCounter || "0"
                    });
                }
            });

            setAnnouncements(fetchedAnnouncements);
            setFilteredAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error("❌ Duyurular çekilirken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnnouncements();
        setRefreshing(false);
    };

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
        
        fetchAnnouncements();

        return unsubscribe;
    }, [navigation]);

    const handleSearch = (text) => {
        setSearchText(text);
        if (!text.trim()) {
            setFilteredAnnouncements(announcements); // Show all announcements when search is empty
            return;
        }
        const searchTerm = text.toLowerCase().trim();
        const filtered = announcements.filter((announcement) =>
            announcement.title.toLowerCase().includes(searchTerm)
        );
        setFilteredAnnouncements(filtered);
    };

    const handleBack = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Duyurular</Text>
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
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                        >
                            {/* 📌 Katılım Puanları Kutusu */}
                            <TouchableOpacity
                                style={[
                                    styles.announcementCard,
                                    !isPointsAnnouncementActive && styles.inactiveCard
                                ]}
                                onPress={() => {
                                    if (isPointsAnnouncementActive) {
                                        router.push("./guestAnnouncements3");
                                    }
                                }}
                                disabled={!isPointsAnnouncementActive}
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
                                    {!isPointsAnnouncementActive && (
                                        <Text style={styles.infoText}>
                                            Puanlar her ayın 1'i ile 5'i arasında saat 15:00'ten sonra açıklanır.
                                        </Text>
                                    )}
                                </View>
                            </TouchableOpacity>

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
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>Henüz duyuru yok.</Text>
                            )}
                        </ScrollView>

                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                    <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
