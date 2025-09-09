import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./adminreports21.style";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function adminReports11() {
    const router = useRouter();
    const { id, applycount, limitcount } = useLocalSearchParams(); // Router'dan sadece id, applycount, limitcount al
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    // Yıl ve ayı router'dan almak yerine, sayfa açıldığında otomatik olarak belirle
    const [year, setYear] = useState(new Date().getFullYear().toString());  // Bugünün yılı
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));  // Bugünün ayı

    const [totalEvents, setTotalEvents] = useState(0); // O ayki toplam etkinlik sayısı
    const [progress, setProgress] = useState(0); // Oran hesaplamak için state
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const [events, setEvents] = useState([]); // Etkinlikleri saklamak için state
    const [filteredEvents, setFilteredEvents] = useState([]); // Filtrelenmiş etkinlikler için state
    
    const fetchUserEvents = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const cleanYear = year.trim();
            const cleanMonth = month.trim();
            const routerId = id.trim();
            
            // 📌 Firestore'daki tüm etkinlikleri getir
            const eventsRef = collection(db, "pastEvents", cleanYear, cleanMonth);
            const eventsSnapshot = await getDocs(eventsRef);

            let matchedEvents = [];
            let totalEventCount = eventsSnapshot.docs.length;

            for (const eventDoc of eventsSnapshot.docs) {
                const eventId = eventDoc.id; // Etkinliğin ID'si
                
                // 📌 `Particant` koleksiyonunda kullanıcının olup olmadığını kontrol et
                const particantRef = doc(db, "pastEvents", cleanYear, cleanMonth, eventId, "Particant", routerId);
                const particantSnap = await getDoc(particantRef);

                
                if (particantSnap.exists()) {
                    const eventData = eventDoc.data();

                    matchedEvents.push({
                        id: eventDoc.id,
                        title: eventData.eventTittle || "Bilinmeyen Etkinlik",
                        date: eventData.eventDate || "Tarih Yok",
                        appliedAt: particantSnap.data().appliedAt || "Bilinmiyor",
                        name: particantSnap.data().Name || "Bilinmeyen Katılımcı",
                    });
                } 
            }

            if (matchedEvents.length === 0) {
                console.warn("⚠️ Hiçbir etkinlik bulunamadı.");
            }
            
            setTotalEvents(totalEventCount);
            setEvents(matchedEvents);
            setFilteredEvents(matchedEvents); // Initialize filtered events with all events

            // 📌 Katılım oranını hesapla
            if (totalEventCount > 0) {
                const participationRate = (matchedEvents.length / totalEventCount) * 100;
                setProgress(participationRate);
            } else {
                setProgress(0);
            }
        } catch (error) {
            console.error("🔥 Firestore'dan veri çekilirken hata oluştu:", error.message);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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

    useEffect(() => {
        if (!id || !year || !month) return;
        fetchUserEvents();
    }, [id, year, month, selectedDate]);
    
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
    
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all events
        if (!text.trim()) {
            setFilteredEvents(events);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter events based on participant name
        const filtered = events.filter((event) => {
            if (!event.name || typeof event.name !== "string") {
                return false;
            }
            const participantName = event.name.toLowerCase();
            // Check if all search terms are found in the participant name
            return searchTerms.every(term => participantName.includes(term));
        });

        setFilteredEvents(filtered);
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchUserEvents();
            }} />}
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
                        <Text style={styles.headerText}>Etkinlik Katılımcıları</Text>
                    </View>

                    {/* Başvuru Oranını Gösteren Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>

                    {/* Başvuru Bilgisi */}
                    <View style={styles.progressTextContainer}>
                        <Text style={styles.progressText}>
                            Katılım Oranı: {progress.toFixed(2)}% ({events.length}/{totalEvents})
                        </Text>
                    </View>

                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                        <Text style={styles.datePickerText}>
                            {selectedDate ? `${selectedDate.getFullYear()} - ${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}` : "Yıl ve Ay Seç"}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        display="spinner"
                        date={selectedDate} // Seçili tarihi göster
                        onConfirm={(date) => {
                            setSelectedDate(date);
                            setYear(date.getFullYear().toString()); // Yeni seçilen yıl
                            setMonth((date.getMonth() + 1).toString().padStart(2, "0")); // Yeni seçilen ay
                            hideDatePicker();
                        }}
                        onCancel={hideDatePicker}
                        minimumDate={new Date(2000, 0, 1)}
                        maximumDate={new Date(2030, 11, 31)}
                    />


                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="İsim ara..."
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
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setRefreshing(true);
                                            fetchUserEvents();
                                        }}
                                    />
                                }
                            >
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map(event => (
                                        <View key={event.id} style={styles.eventCard}>
                                            <View style={styles.eventDetails}>
                                                <Text style={styles.eventName}>{event.title}</Text>
                                                <Text style={styles.eventDate}>Tarih: {event.date}</Text>
                                                <Text style={styles.eventApplyCount}>Katılım Tarihi: {event.appliedAt}</Text>
                                                <Text style={styles.eventApplyCount}>Katılımcı: {event.name}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>Bu kullanıcıya ait etkinlik kaydı bulunmamaktadır.</Text>
                                )}
                            </ScrollView>
                        )}
                    </View>


                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}