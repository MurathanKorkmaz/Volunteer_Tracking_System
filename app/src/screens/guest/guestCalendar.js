import React, { useState, useEffect, useRef } from "react";
import { 
    SafeAreaView, 
    View, 
    Text, 
    TouchableOpacity, 
    Modal,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./guestCalendar.style";
import { useNavigation } from "@react-navigation/native";

export default function GuestCalendar() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, from } = useLocalSearchParams();
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [markedDates, setMarkedDates] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    );
    const [loading, setLoading] = useState(true);
    const [isCalendarReady, setIsCalendarReady] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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

        // Delay calendar initialization
        setTimeout(() => {
            setIsCalendarReady(true);
            fetchEvents();
        }, 100);

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (isCalendarReady) {
            // Her ay/yıl değişiminde önce işaretleri temizle
            setMarkedDates({});
            fetchEvents();
        }
    }, [selectedYear, selectedMonth, isCalendarReady]);

    const fetchEvents = async () => {
        if (!isCalendarReady) return;
        
        try {
            setLoading(true);
            setMarkedDates({}); // Mevcut işaretleri temizle
    
            const year = selectedYear.toString();
            const month = selectedMonth.toString().padStart(2, "0");
    
            const eventsRef = collection(db, "events", year, month);
            const eventsSnapshot = await getDocs(eventsRef);
    
            let eventMarkers = {};
    
            for (const eventDoc of eventsSnapshot.docs) {
                const eventData = eventDoc.data();
                const eventDate = eventData.eventDate;
                const eventCategory = eventData.eventCategory;
                const eventTitle = eventData.eventTittle || "Bilinmeyen Etkinlik";
                const eventLocation = eventData.eventLocation || "Konum Belirtilmedi";
                const eventTime = eventData.eventTime || "Saat Belirtilmedi";
                const eventId = eventDoc.id;
    
                // Kullanıcının Particant listesinde olup olmadığını kontrol et
                const particantRef = collection(db, "events", year, month, eventId, "Particant");
                const particantSnap = await getDocs(particantRef);
    
                const isUserParticipating = particantSnap.docs.some(doc => doc.id === userId);
    
                if (isUserParticipating) {
                    let eventColor = "#D3D3D3";
                    if (eventCategory === "Toplantı") eventColor = "#1E90FF";
                    else if (eventCategory === "Etkinlik") eventColor = "#FFA500";
                    else if (eventCategory === "Eğitim") eventColor = "#32CD32";
                    else if (eventCategory === "Workshop") eventColor = "#FF4500";
    
                    if (eventDate) {
                        eventMarkers[eventDate] = {
                            selected: true,
                            marked: true,
                            selectedColor: eventColor,
                            title: eventTitle,
                            category: eventCategory,
                            location: eventLocation,
                            time: eventTime,
                        };
                    }
                } 
            }
    
            setMarkedDates(eventMarkers);
            setLoading(false);
        } catch (error) {
            console.error("❌ Etkinlikler yüklenirken hata oluştu:", error);
            setLoading(false);
        }
    };
    

    const onMonthChange = (monthData) => {
        // Önce işaretleri temizle
        setMarkedDates({});
        setSelectedYear(monthData.year);
        setSelectedMonth(monthData.month.toString().padStart(2, "0"));
        // fetchEvents'i buradan kaldırdık çünkü useEffect ile otomatik tetiklenecek
    };    

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    };

    const onDayPress = (day) => {
        const selectedDate = day.dateString;

        if (markedDates[selectedDate]) {
            // Seçili tarihteki etkinliği al
            const eventData = markedDates[selectedDate];
    
            setSelectedEvent({
                title: eventData.title || "Bilinmeyen Etkinlik",
                date: selectedDate,
                category: eventData.category || "Bilinmeyen Kategori",
                location: eventData.location || "Konum Belirtilmedi", 
                time: eventData.time || "Saat Belirtilmedi",
            });
    
            setModalVisible(true);
        }
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
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Yıllık Zaman Çizelgesi</Text>
                    </View>
                    {/* Geri Butonu */}
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    
                    {/* Takvim ve Kategori Tanıtımı Container */}
                    <View style={styles.calendarContainer}>
                        {isCalendarReady ? (
                            <>
                                <ScrollView
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                        />
                                    }
                                >
                                    <Calendar
                                        onDayPress={onDayPress}
                                        onMonthChange={onMonthChange}
                                        markedDates={markedDates}
                                        theme={{
                                            selectedDayBackgroundColor: "#FFD701",
                                            todayTextColor: "#FF6347",
                                            arrowColor: "#FFD701",
                                            textSectionTitleColor: "#000",
                                        }}
                                    />
                                </ScrollView>
                                {loading && (
                                    <View style={styles.loadingOverlay}>
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="large" color="#3B82F6" />
                                            <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.calendarPlaceholder}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                            </View>
                        )}

                        {/* Kategori Renk Tanıtımı */}
                        <View style={styles.categoryLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: "#1E90FF" }]} />
                                <Text style={styles.legendText}>Toplantı</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: "#FFA500" }]} />
                                <Text style={styles.legendText}>Etkinlik</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: "#32CD32" }]} />
                                <Text style={styles.legendText}>Eğitim</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: "#FF4500" }]} />
                                <Text style={styles.legendText}>Workshop</Text>
                            </View>
                        </View>
                    </View>

                    {/* Modal: Seçili Tarihin Etkinlik Detayları */}
                    <Modal transparent={true} visible={isModalVisible} animationType="slide">
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Etkinlik Detayı</Text>

                                {/*  Etkinlik bilgilerini ayrı ayrı göster */}
                                <Text style={styles.modalText}>Etkinlik İsmi: {selectedEvent?.title || "Bilinmeyen Etkinlik"}</Text>
                                <Text style={styles.modalText}>Tarih: {selectedEvent?.date || "Tarih Yok"}</Text>
                                <Text style={styles.modalText}>Saat: {selectedEvent?.time}</Text>
                                <Text style={styles.modalText}>Konum: {selectedEvent?.location || "Konum Yok"}</Text> 
                                <Text style={styles.modalText}>Etkinlik Türü: {selectedEvent?.category || "Kategori Yok"}</Text>

                                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Kapat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
