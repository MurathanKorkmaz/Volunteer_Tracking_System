import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { useLocalSearchParams } from "expo-router"; // 📌 Router'dan parametre almak için
import styles from "./guestCalendar.style";

export default function guestCalendar() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId;
    const [markedDates, setMarkedDates] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [selectedYear, selectedMonth]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
    
            const year = selectedYear.toString();
            const month = selectedMonth.toString().padStart(2, "0");
    
            const eventsRef = collection(db, "events", year, month);
            const eventsSnapshot = await getDocs(eventsRef);
    
            let eventMarkers = {}; // Takvim işaretleyicileri için boş nesne
    
    
            for (const eventDoc of eventsSnapshot.docs) {
                const eventData = eventDoc.data();
                const eventDate = eventData.eventDate; // YYYY-MM-DD formatında tarih
                const eventCategory = eventData.eventCategory;
                const eventTitle = eventData.eventTittle || "Bilinmeyen Etkinlik";
                const eventLocation = eventData.eventLocation || "Konum Belirtilmedi";
                const eventTime = eventData.eventTime || "Saat Belirtilmedi";

    
                const eventId = eventDoc.id; // Etkinlik benzersiz ID'si
    
                // Kullanıcının Particant listesinde olup olmadığını kontrol et
                const particantRef = collection(db, "events", year, month, eventId, "Particant");
                const particantSnap = await getDocs(particantRef);
    
                const isUserParticipating = particantSnap.docs.some(doc => doc.id === userId);
    
                if (isUserParticipating) {
    
                    let eventColor = "#D3D3D3";
                    if (eventCategory === "Spor") eventColor = "#1E90FF";
                    else if (eventCategory === "Kahvaltı") eventColor = "#FFA500";
                    else if (eventCategory === "Eğitim") eventColor = "#32CD32";
                    else if (eventCategory === "Workshop") eventColor = "#FF4500";
    
                    // Kullanıcı katıldıysa takvime ekle
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
                } 
            }
    
            setMarkedDates(eventMarkers);
        } catch (error) {
            console.error("❌ Etkinlikler yüklenirken hata oluştu:", error);
        }
    };
    

    const onMonthChange = (monthData) => {
        setSelectedYear(monthData.year);
        setSelectedMonth(monthData.month.toString().padStart(2, "0"));
        fetchEvents(); // Yeni seçilen ay ve yıl için etkinlikleri tekrar çek
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

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Yıllık Zaman Çizelgesi</Text>
                </View>
                {/* Geri Butonu */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                
                {/* Takvim ve Kategori Tanıtımı Container */}
                <View style={styles.calendarContainer}>
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

                    {/* Kategori Renk Tanıtımı */}
                    <View style={styles.categoryLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: "#1E90FF" }]} />
                            <Text style={styles.legendText}>Spor</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendColor, { backgroundColor: "#FFA500" }]} />
                            <Text style={styles.legendText}>Kahvaltı</Text>
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

            </LinearGradient>
        </SafeAreaView>
    );
}
