import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminCalendar.style";

export default function adminCalendar() {
    const router = useRouter();
    const [markedDates, setMarkedDates] = useState({});
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(
        (new Date().getMonth() + 1).toString().padStart(2, "0")
    );

    useEffect(() => {
        fetchEvents();
    }, [selectedYear, selectedMonth]);

    const fetchEvents = async () => {
        try {

            // Seçili yıl ve ayı al (Kullanıcı hangi yılı ve ayı seçtiyse)
            const year = selectedYear.toString();
            const month = selectedMonth.toString().padStart(2, "0");

            // Firestore referansını oluştur
            const eventsRef = collection(db, "events", year, month);
            const eventsSnapshot = await getDocs(eventsRef);

            let eventMarkers = {}; // Takvim işaretleyicileri için boş nesne oluştur

            eventsSnapshot.forEach(doc => {
                const eventData = doc.data();
                const eventDate = eventData.eventDate; // YYYY-MM-DD formatında tarih
                const eventTime = eventData.eventTime || "Saat Belirtilmedi"; // hh:dd:ss formatında
                const eventCategory = eventData.eventCategory;
                const eventTitle = eventData.eventTittle; // Etkinlik ismini al
                const eventLocation = eventData.eventLocation || "Konum Belirtilmedi"; // Etkinlik Konumu

                // Kategoriye göre renk belirleme
                let eventColor = "#D3D3D3"; // Varsayılan gri renk
                if (eventCategory === "Spor") eventColor = "#1E90FF";
                else if (eventCategory === "Kahvaltı") eventColor = "#FFA500";
                else if (eventCategory === "Eğitim") eventColor = "#32CD32";
                else if (eventCategory === "Workshop") eventColor = "#FF4500";
    
                // Etkinliği takvime ekleme
                if (eventDate) {
                    eventMarkers[eventDate] = {
                        selected: true,
                        selectedColor: eventColor,
                        title: eventTitle, // Etkinlik ismi
                        category: eventCategory, // Etkinlik türü
                        location: eventLocation, // Etkinlik Konumu
                        time: eventTime,
                    };
                }
            });
    
            // Güncellenmiş etkinlikleri takvime işaretle
            setMarkedDates(eventMarkers);
        } catch (error) {
            console.error("Etkinlikler yüklenirken hata oluştu:", error);
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
