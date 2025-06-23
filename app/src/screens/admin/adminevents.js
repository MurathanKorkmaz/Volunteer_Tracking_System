import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import DateTimePickerModal from "react-native-modal-datetime-picker";
import styles from "./adminevents.style";
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useNavigation } from "@react-navigation/native";

export default function adminEvents() {
    const router = useRouter();
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState("published");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const fetchCurrentMonthEvents = async () => {
        try {
            setLoading(true);
            const currentYear = selectedDate.getFullYear().toString();
            const currentMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
            const eventsRef = collection(db, "events", currentYear, currentMonth);
            const eventsSnapshot = await getDocs(eventsRef);
            let allEvents = [];

            eventsSnapshot.forEach((doc) => {
                const eventData = doc.data();
                if (
                    (activeTab === "published" && eventData.eventPublish === "1") ||
                    (activeTab === "unpublished" && eventData.eventPublish === "0")
                ) {
                    allEvents.push({
                        id: doc.id,
                        title: eventData.eventTittle,
                        date: eventData.eventDate,
                        applyCount: eventData.eventApplyCounter || "0",
                        applyLimit: eventData.eventLimit || "0",
                    });
                }
            });

            setEvents(allEvents);
            setFilteredEvents(allEvents);
        } catch (error) {
            console.error("Etkinlikler alınırken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlikler yüklenirken bir hata oluştu.");
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

        fetchCurrentMonthEvents();

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        fetchCurrentMonthEvents();
    }, [selectedDate]);

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
        
        // If search text is empty, show all events
        if (!text.trim()) {
            setFilteredEvents(events);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter events that match all search terms
        const filtered = events.filter((event) => {
            const eventTitle = event.title.toLowerCase();
            // Check if all search terms are found in the event title
            return searchTerms.every(term => eventTitle.includes(term));
        });

        setFilteredEvents(filtered);
    };

    const handleViewEvent = (event) => {
        // Çıkış animasyonu başlat
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./admineventsEdit3",
                params: {
                    id: event.id,
                    year: selectedDate.getFullYear().toString(),
                    month: (selectedDate.getMonth() + 1).toString().padStart(2, "0"),
                    from: "events"
                },
            });
        });
    };

    const handleEditEvent = (event) => {
        // Çıkış animasyonu başlat
        Animated.timing(translateX, {
            toValue: -screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.push({
                pathname: "./admineventsEdit1",
                params: {
                    id: event.id,
                    year: selectedDate.getFullYear().toString(),
                    month: (selectedDate.getMonth() + 1).toString().padStart(2, "0"),
                    from: "events"
                },
            });
        });
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

            const eventDocRef = doc(db, "events", selectedYear, selectedMonth, eventId);
            const eventDocSnap = await getDoc(eventDocRef);

            if (!eventDocSnap.exists()) {
                Alert.alert("Hata", "Silinecek etkinlik bulunamadı!");
                return;
            }

            const eventData = eventDocSnap.data();

            const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, eventId);
            const pastEventSnap = await getDoc(pastEventRef);

            if (pastEventSnap.exists()) {
                await updateDoc(pastEventRef, eventData);
            } else {
                await setDoc(pastEventRef, eventData);
            }

            const subCollections = ["Particant", "NonParticant"];

            for (const subColName of subCollections) {
                const subColRef = collection(db, "events", selectedYear, selectedMonth, eventId, subColName);
                const subDocsSnap = await getDocs(subColRef);
                for (const subDoc of subDocsSnap.docs) {
                    await deleteDoc(subDoc.ref);
                }
            }

            await deleteDoc(eventDocRef);

            Alert.alert("Başarılı", "Etkinlik ve alt koleksiyonları silindi.");

            setEvents(events.filter((event) => event.id !== eventId));
            setFilteredEvents(filteredEvents.filter((event) => event.id !== eventId));
        } catch (error) {
            console.error("Etkinlik silinirken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlik silinirken bir hata oluştu.");
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

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Etkinlik Yönetimi</Text>
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "published" && styles.tabButtonActive1]}
                            onPress={() => setActiveTab("published")}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === "published" && styles.tabButtonTextActive,
                                ]}
                            >
                                Yayında
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "unpublished" && styles.tabButtonActive2]}
                            onPress={() => setActiveTab("unpublished")}
                        >
                            <Text
                                style={[
                                    styles.tabButtonText,
                                    activeTab === "unpublished" && styles.tabButtonTextActive,
                                ]}
                            >
                                Yayın Dışı
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                        <Text style={styles.datePickerText}>
                            {selectedDate
                                ? `${selectedDate.getFullYear()} - ${(selectedDate.getMonth() + 1)
                                      .toString()
                                      .padStart(2, "0")}`
                                : "Yıl ve Ay Seç"}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        display="spinner"
                        onConfirm={(date) => {
                            setSelectedDate(date);
                            hideDatePicker();
                        }}
                        onCancel={hideDatePicker}
                        minimumDate={new Date(2000, 0, 1)}
                        maximumDate={new Date(2030, 11, 31)}
                        date={selectedDate}
                    />

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Etkinlik ara..."
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
                                            fetchCurrentMonthEvents();
                                        }}
                                    />
                                }
                            >
                                {filteredEvents.map((event) => (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={styles.eventCard}
                                        onPress={() => handleViewEvent(event)}
                                    >
                                        <View style={styles.eventDetails}>
                                            <Text style={styles.eventName}>{event.title}</Text>
                                            <Text style={styles.eventDate}>Tarih: {event.date}</Text>
                                            <Text style={styles.eventDate}>
                                                Başvuru Sayısı: {event.applyCount} / {event.applyLimit}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => handleEditEvent(event)}
                                        >
                                            <Text style={styles.buttonText}>Düzenle</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDeleteEvent(event.id)}
                                        >
                                            <Text style={styles.buttonText}>Sil</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.addButtonContainer}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                Animated.timing(translateX, {
                                    toValue: -screenWidth,
                                    duration: 100,
                                    useNativeDriver: true,
                                }).start(() => {
                                    router.push({
                                        pathname: "./admineventsEdit2",
                                        params: { from: "events" },
                                    });
                                });
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.addButtonText}>Etkinlik Ekle</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
