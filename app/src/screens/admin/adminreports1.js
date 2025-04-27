import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import {
    Alert,
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import styles from "./adminreports1.style";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports1() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const [sporCount, setSporCount] = useState(0);
    const [kahvaltiCount, setKahvaltiCount] = useState(0);
    const [egitimCount, setEgitimCount] = useState(0);
    const [workshopCount, setWorkshopCount] = useState(0);


    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const year = selectedDate.getFullYear().toString();
                const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
        
                const eventsRef = collection(db, "pastEvents", year, month);
                const eventsSnapshot = await getDocs(eventsRef);
                let allEvents = [];
        
                let spor = 0;
                let kahvalti = 0;
                let egitim = 0;
                let workshop = 0;
        
                eventsSnapshot.forEach((doc) => {
                    const eventData = doc.data();
        
                    // Kategori sayacını artır
                    if (eventData.eventCategory === "Spor") {
                        spor++;
                    } else if (eventData.eventCategory === "Kahvaltı") {
                        kahvalti++;
                    } else if (eventData.eventCategory === "Eğitim") {
                        egitim++;
                    } else if (eventData.eventCategory === "Workshop") {
                        workshop++;
                    }
        
                    allEvents.push({
                        id: doc.id,
                        title: eventData.eventTittle,
                        date: eventData.eventDate,
                        applyCount: eventData.eventApplyCounter || "0",
                        applyLimit: eventData.eventLimit || "0",
                    });
                });
        
                const totalEvents = spor + kahvalti + egitim + workshop || 1; // 0'a bölme hatasını önlemek için
        
                // Yüzdelik oranları hesapla
                setSporCount((spor / totalEvents) * 100);
                setKahvaltiCount((kahvalti / totalEvents) * 100);
                setEgitimCount((egitim / totalEvents) * 100);
                setWorkshopCount((workshop / totalEvents) * 100);
        
                setEvents(allEvents);
                setFilteredEvents(allEvents);
            } catch (error) {
                console.error("Etkinlikler alınırken hata oluştu:", error);
                Alert.alert("Hata", "Etkinlikler yüklenirken bir hata oluştu.");
            }
        };
                

        fetchEvents();
    }, [selectedDate]);

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(text.toLowerCase())
        );
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
    
            Alert.alert("Başarılı", "Etkinlik ve alt koleksiyonları silindi.");
            setEvents(events.filter((event) => event.id !== eventId));
            setFilteredEvents(filteredEvents.filter((event) => event.id !== eventId));
    
        } catch (error) {
            console.error("Etkinlik silinirken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlik silinirken bir hata oluştu.");
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
            },
        });
    };
    

    const renderCategoryLegend = () => {
        return (
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#1E90FF" }]} />
                    <Text style={styles.legendText}>Spor</Text>
                    <Text style={styles.legendPercentage}>{Math.round(sporCount)}%</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: "#FFA500" }]} />
                    <Text style={styles.legendText}>Kahvaltı</Text>
                    <Text style={styles.legendPercentage}>{Math.round(kahvaltiCount)}%</Text>
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
                <View style={[styles.categoryBar, { width: `${sporCount}%`, backgroundColor: "#1E90FF" }]} />
                <View style={[styles.categoryBar, { width: `${kahvaltiCount}%`, backgroundColor: "#FFA500" }]} />
                <View style={[styles.categoryBar, { width: `${egitimCount}%`, backgroundColor: "#32CD32" }]} />
                <View style={[styles.categoryBar, { width: `${workshopCount}%`, backgroundColor: "#FF4500" }]} />
            </View>
        );
    };
    
    
    
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("./adminreports")}
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
                    <ScrollView>
                        {filteredEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => handleEditEvent(event)} // Beyaz çerçeveye tıklandığında yönlendirme yap
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
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
