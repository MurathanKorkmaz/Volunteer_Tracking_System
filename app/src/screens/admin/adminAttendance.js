import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import { collection, getDocs} from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import styles from "./adminAttendance.style";
import { useNavigation } from "@react-navigation/native";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function AdminAttendance() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;
    const [events, setEvents] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

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

        // Filter events that match all search terms
        const filtered = events.filter((event) => {
            if (!event.eventTittle || typeof event.eventTittle !== "string") {
                return false;
            }
            const eventTitle = event.eventTittle.toLowerCase();
            return searchTerms.every(term => eventTitle.includes(term));
        });

        setFilteredEvents(filtered);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    const handleViewEvent = (event) => {
        const year = selectedDate.getFullYear().toString();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

        router.push({
            pathname: "./adminAttendanceEdit",
            params: {
                id: event.id,
                score: event.score,
                year: year,
                month: month,
                from: "attendance"
            },
        });
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const year = selectedDate.getFullYear().toString();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

            const path = `events/${year}/${month}`;
            const querySnapshot = await getDocs(collection(db, path));

            const eventsData = [];
            querySnapshot.forEach((doc) => {
                eventsData.push({ id: doc.id, ...doc.data() });
            });
            setEvents(eventsData);
            setFilteredEvents(eventsData); // Initialize filtered events with all events
        } catch (error) {
            console.error("Etkinlikleri çekerken hata oluştu: ", error);
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

        fetchEvents();

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

    const renderEvent = (event) => (
        <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleViewEvent(event)}
        >
            <Text style={styles.eventName}>{event.eventTittle || "Başlık Yok"}</Text>
            <Text style={styles.eventDate}>{event.eventDate}</Text>
            <Text style={styles.eventTime}>{event.eventTime}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchEvents();
            }} />}
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Yoklama Yönetimi</Text>
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
                        onConfirm={handleConfirm}
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
                                            fetchEvents();
                                        }}
                                    />
                                }
                            >
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map(renderEvent)
                                ) : (
                                    <Text style={styles.emptyText}>Gösterilecek etkinlik bulunamadı.</Text>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}