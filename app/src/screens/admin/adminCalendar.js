import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
    Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminCalendar.style";
import { useNavigation } from "@react-navigation/native";

export default function AdminCalendar() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;
    const [markedDates, setMarkedDates] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    );
    const [loading, setLoading] = useState(true);
    const [isCalendarReady, setIsCalendarReady] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                navigation.dispatch(e.data.action);
            });
        });

        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // Delay calendar initialization
        setTimeout(() => {
            setIsCalendarReady(true);
            fetchEvents();
        }, 100);

        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (isCalendarReady) {
            setMarkedDates({});
            fetchEvents();
        }
    }, [selectedYear, selectedMonth, isCalendarReady]);

    const handleBack = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const fetchEvents = async () => {
        if (!isCalendarReady) return;

        try {
            setLoading(true);
            const year = selectedYear.toString();
            const month = selectedMonth.toString().padStart(2, "0");

            const eventsRef = collection(db, "events", year, month);
            const eventsSnapshot = await getDocs(eventsRef);

            let eventMarkers = {};

            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                const eventDate = eventData.eventDate;
                const eventTime = eventData.eventTime || "Saat Belirtilmedi";
                const eventCategory = eventData.eventCategory;
                const eventTitle = eventData.eventTittle;
                const eventLocation = eventData.eventLocation || "Konum Belirtilmedi";

                let eventColor = "#D3D3D3";
                if (eventCategory === "Toplantı") eventColor = "#1E90FF";
                else if (eventCategory === "Etkinlik") eventColor = "#FFA500";
                else if (eventCategory === "Eğitim") eventColor = "#32CD32";
                else if (eventCategory === "Workshop") eventColor = "#FF4500";
    
                if (eventDate) {
                    eventMarkers[eventDate] = {
                        selected: true,
                        selectedColor: eventColor,
                        title: eventTitle,
                        category: eventCategory,
                        location: eventLocation,
                        time: eventTime,
                    };
                }
            });
    
            setMarkedDates(eventMarkers);
            setLoading(false);
        } catch (error) {
            console.error("Etkinlikler yüklenirken hata oluştu:", error);
            setLoading(false);
        }
    };

    const onMonthChange = (monthData) => {
        setSelectedYear(monthData.year);
        setSelectedMonth(monthData.month.toString().padStart(2, "0"));
    };

    const onDayPress = (day) => {
        const selectedDate = day.dateString;

        if (markedDates[selectedDate]) {
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

    return (
        <SafeAreaView style={styles.container}>
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
                        <Text style={styles.headerText}>Takvim</Text>
                    </View>

                    <View style={styles.calendarContainer}>
                        {isCalendarReady ? (
                            <>
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
                                {loading && (
                                    <View style={styles.loadingOverlay}>
                                        <ActivityIndicator size="large" color="#3B82F6" />
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.calendarPlaceholder}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                            </View>
                        )}

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

                    <Modal transparent={true} visible={isModalVisible} animationType="slide">
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Etkinlik Detayı</Text>

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
