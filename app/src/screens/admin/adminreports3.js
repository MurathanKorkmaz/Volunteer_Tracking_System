import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    Alert,
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminreports3.style";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useLocalSearchParams } from "expo-router";

export default function adminReports3() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
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

    const fetchGuests = async () => {
        try {
            setLoading(true);
            const guestsRef = collection(db, "pastrequest");
            const guestsSnapshot = await getDocs(guestsRef);
            let allGuests = [];

            guestsSnapshot.forEach((docSnapshot) => {
                const guestData = docSnapshot.data();
            
                const registerAtFull = guestData.registerAt || "";
            
                let datePart = "Tarih Yok";
                let timePart = "Saat Yok";
            
                if (registerAtFull && registerAtFull.includes("-")) {
                    datePart = registerAtFull.split("-").slice(0, 3).join("-");
                    timePart = registerAtFull.split("-").slice(3).join(":");
                } else {
                    console.warn(`❌ registerAt eksik veya hatalı: ${docSnapshot.id}`);
                }
            
                allGuests.push({
                    id: docSnapshot.id,
                    name: guestData.name || "Bilinmiyor",
                    registerDate: datePart,
                    registerTime: timePart,
                });
            });
            
            setEvents(allGuests);
            setFilteredEvents(allGuests);
        } catch (error) {
            console.error("Misafirler alınırken hata oluştu:", error);
            Alert.alert("Hata", "Misafirler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchGuests();
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all guests
        if (!text.trim()) {
            setFilteredEvents(events);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter guests based on name
        const filtered = events.filter((guest) => {
            if (!guest.name || typeof guest.name !== "string") {
                return false;
            }
            const guestName = guest.name.toLowerCase();
            // Check if all search terms are found in the guest name
            return searchTerms.every(term => guestName.includes(term));
        });

        setFilteredEvents(filtered);
    };

    const handleEditEvent = (guest) => {
        router.push({
            pathname: "./adminreports21",
            params: {
                id: guest.id, // Kişinin Firestore'daki benzersiz ID'si
                turnout: guest.turnout, // Katılım Oranı
                ratingCounter: guest.ratingCounter, // Katılım Sayısı
                rating: guest.rating, // Kullanıcı Puanı
            },
        });
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

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Kayıt Raporları</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Kişi ara..."
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
                                            fetchGuests();
                                        }}
                                    />
                                }
                            >
                                {filteredEvents.map((guest) => (
                                    <View key={guest.id} style={styles.eventCard}>
                                        <View style={styles.eventDetails}>
                                            {/* 🏷️ Kullanıcı Adı */}
                                            <Text style={styles.eventName}>{guest.name}</Text>
                                            
                                            {/* 📅 Kayıt Tarihi */}
                                            <Text style={styles.eventDetail}>Kayıt Tarihi: {guest.registerDate}</Text>
                                            
                                            {/* ⏰ Kayıt Saati */}
                                            <Text style={styles.eventDetail}>Kayıt Saati: {guest.registerTime}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
