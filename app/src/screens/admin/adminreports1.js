import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
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
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import styles from "./adminreports1.style";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useLocalSearchParams } from "expo-router";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function adminReports1() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    // Kategori sayaçları için state'ler
    const [toplantiCount, setToplantiCount] = useState(0);
    const [etkinlikCount, setEtkinlikCount] = useState(0);
    const [egitimCount, setEgitimCount] = useState(0);
    const [workshopCount, setWorkshopCount] = useState(0);

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

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const year = selectedDate.getFullYear().toString();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            // Sadece events koleksiyonundan veri çek
            const eventsRef = collection(db, "events", year, month);
            const eventsSnapshot = await getDocs(eventsRef);
            
            let allEvents = [];
            let toplanti = 0;
            let etkinlik = 0;
            let egitim = 0;
            let workshop = 0;
    
            // Events koleksiyonundan verileri işle
            eventsSnapshot.forEach((doc) => {
                const eventData = doc.data();
                
                if (eventData.eventCategory === "Toplantı") toplanti++;
                else if (eventData.eventCategory === "Etkinlik") etkinlik++;
                else if (eventData.eventCategory === "Eğitim") egitim++;
                else if (eventData.eventCategory === "Workshop") workshop++;
    
                allEvents.push({
                    id: doc.id,
                    title: eventData.eventTittle,
                    date: eventData.eventDate,
                    applyCount: eventData.eventApplyCounter || "0",
                    applyLimit: eventData.eventLimit || "0",
                });
            });
    
            const totalEvents = toplanti + etkinlik + egitim + workshop || 1;
    
            setToplantiCount((toplanti / totalEvents) * 100);
            setEtkinlikCount((etkinlik / totalEvents) * 100);
            setEgitimCount((egitim / totalEvents) * 100);
            setWorkshopCount((workshop / totalEvents) * 100);
    
            setEvents(allEvents);
            setFilteredEvents(allEvents);
        } catch (error) {
            console.error("Etkinlikler alınırken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [selectedDate]);

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all events
        if (!text.trim()) {
            setFilteredEvents(events);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter events based on title
        const filtered = events.filter((event) => {
            if (!event.title || typeof event.title !== "string") {
                return false;
            }
            const eventTitle = event.title.toLowerCase();
            // Check if all search terms are found in the event title
            return searchTerms.every(term => eventTitle.includes(term));
        });

        setFilteredEvents(filtered);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const year = selectedDate.getFullYear().toString();
            const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            const eventDocRef = doc(db, "pastEvents", year, month, eventId);
    
            // 1️⃣ Alt koleksiyonları sil
            const subCollections = ["Particant", "NonParticant"];  // Buraya alt koleksiyon isimlerini ekle
            for (const subColName of subCollections) {
                const subColRef = collection(db, "pastEvents", year, month, eventId, subColName);
                const subDocsSnap = await getDocs(subColRef);
    
                for (const subDoc of subDocsSnap.docs) {
                    await deleteDoc(subDoc.ref);
                }
            }
    
            // 2️⃣ Ana dokümanı sil
            await deleteDoc(eventDocRef);
    
            showMessage({
                title: "Başarılı",
                message: "Etkinlik ve alt koleksiyonları silindi.",
                type: "success"
            }); 
            setEvents(events.filter((event) => event.id !== eventId));
            setFilteredEvents(filteredEvents.filter((event) => event.id !== eventId));
    
        } catch (error) {
            console.error("Etkinlik silinirken hata oluştu:", error);
            showMessage({
                title: "Hata",
                message: "Etkinlik silinirken bir hata oluştu.",
                type: "error"
            });
        }
    };
    

    const handleEditEvent = (event) => {
        router.push({
            pathname: "./adminreports11",
            params: {
                id: event.id,
                applycount: event.applyCount,
                limitcount: event.applyLimit,
                year: selectedDate.getFullYear().toString(),
                month: (selectedDate.getMonth() + 1).toString().padStart(2, "0"),
                from: "reports1"
            },
        });
    };
    

    const renderCategoryLegend = () => {
        return (
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#1E90FF" }]} />
                    <Text style={styles.legendText}>Toplantı</Text>
                    <Text style={styles.legendPercentage}>{Math.round(toplantiCount)}%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#FFA500" }]} />
                    <Text style={styles.legendText}>Etkinlik</Text>
                    <Text style={styles.legendPercentage}>{Math.round(etkinlikCount)}%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#32CD32" }]} />
                    <Text style={styles.legendText}>Eğitim</Text>
                    <Text style={styles.legendPercentage}>{Math.round(egitimCount)}%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#FF4500" }]} />
                    <Text style={styles.legendText}>Workshop</Text>
                    <Text style={styles.legendPercentage}>{Math.round(workshopCount)}%</Text>
                </View>
            </View>
        );
    };
    

    const renderCategoryBar = () => {
        return (
            <View style={styles.categoryBarContainer}>
                <View style={[styles.categoryBar, { width: `${toplantiCount}%`, backgroundColor: "#1E90FF" }]} />
                <View style={[styles.categoryBar, { width: `${etkinlikCount}%`, backgroundColor: "#FFA500" }]} />
                <View style={[styles.categoryBar, { width: `${egitimCount}%`, backgroundColor: "#32CD32" }]} />
                <View style={[styles.categoryBar, { width: `${workshopCount}%`, backgroundColor: "#FF4500" }]} />
            </View>
        );
    };
    
    
    
    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchEvents();
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
                        <Text style={styles.headerText}>Etkinlik Raporları</Text>
                    </View>

                    <View style={styles.graphsContainer}>
                        {renderCategoryLegend()}
                        {renderCategoryBar()}
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
                                            fetchEvents();
                                        }}
                                    />
                                }
                            >
                                {filteredEvents.map((event) => (
                                    <TouchableOpacity
                                        key={event.id}
                                        style={styles.eventCard}
                                        onPress={() => handleEditEvent(event)}
                                    >
                                        <View style={styles.eventDetails}>
                                            <Text style={styles.eventName}>{event.title}</Text>
                                            <Text style={styles.eventDate}>Tarih: {event.date}</Text>
                                            <Text style={styles.eventDate}>
                                                Başvuru Sayısı: {event.applyCount} / {event.applyLimit}
                                            </Text>
                                        </View>
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
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}