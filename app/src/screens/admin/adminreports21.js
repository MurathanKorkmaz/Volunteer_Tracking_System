import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./adminreports21.style";
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports11() {
    const router = useRouter();
    const { id, applycount, limitcount } = useLocalSearchParams(); // Router'dan sadece id, applycount, limitcount al

    // Yıl ve ayı router'dan almak yerine, sayfa açıldığında otomatik olarak belirle
    const [year, setYear] = useState(new Date().getFullYear().toString());  // Bugünün yılı
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, "0"));  // Bugünün ayı

    const [totalEvents, setTotalEvents] = useState(0); // O ayki toplam etkinlik sayısı

    const [progress, setProgress] = useState(0); // Oran hesaplamak için state

    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const [events, setEvents] = useState([]); // Etkinlikleri saklamak için state
    
    useEffect(() => {


        if (!id || !year || !month) return;

        const fetchUserEvents = async () => {
            
            try {
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

                // 📌 Katılım oranını hesapla
                if (totalEventCount > 0) {
                    const participationRate = (matchedEvents.length / totalEventCount) * 100;
                    setProgress(participationRate);
                } else {
                    setProgress(0);
                }
            } catch (error) {
                console.error("🔥 Firestore'dan veri çekilirken hata oluştu:", error.message);
                Alert.alert("Hata", `Etkinlik verileri yüklenirken hata oluştu: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserEvents();
    }, [id, year, month, selectedDate]);
    
    
    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };
    
    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };


    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
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
                        onChangeText={setSearchText}
                    />
                </View>

                <View style={styles.scrollableList}>
                    <ScrollView>
                        {loading ? (
                            <Text style={styles.loadingText}>Yükleniyor...</Text>
                        ) : events.length > 0 ? (
                            events.map(event => (
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
                </View>


            </LinearGradient>
        </SafeAreaView>
    );
}