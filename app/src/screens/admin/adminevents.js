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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DatePicker from 'react-native-date-picker';
import styles from "./adminevents.style";
import { collection, doc, setDoc, deleteDoc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminEvents() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState("published");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [open, setOpen] = useState(false);
    

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ayı 01-12 formatına getiriyoruz
        setSelectedDate(new Date(year, date.getMonth())); // Gün sıfırlandı
        hideDatePicker();
    };

    useEffect(() => {
        const fetchCurrentMonthEvents = async () => {
            try {
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
            }
        };

        fetchCurrentMonthEvents();
    }, [selectedDate, activeTab]);

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    //  Etkinlik kartına basıldığında admineventsEdit3.js'ye yönlendir
    const handleViewEvent = (event) => {
        router.push({
            pathname: "./admineventsEdit3",
            params: {
                id: event.id, //  Sadece etkinliğin ID'sini iletiyoruz
                year: selectedDate.getFullYear().toString(),
                month: (selectedDate.getMonth() + 1).toString().padStart(2, "0"),
            },
        });
    };

    const handleEditEvent = (event) => {
        router.push({
            pathname: "./admineventsEdit1",
            params: {
                id: event.id,
                year: selectedDate.getFullYear().toString(),
                month: (selectedDate.getMonth() + 1).toString().padStart(2, "0"),
            },
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
      
          // 1. pastEvents'e yedekle
          const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, eventId);
          const pastEventSnap = await getDoc(pastEventRef);
      
          if (pastEventSnap.exists()) {
            await updateDoc(pastEventRef, eventData);
          } else {
            await setDoc(pastEventRef, eventData);
          }
      
          // 2. Alt koleksiyonlardaki belgeleri sil
          const subCollections = ["Particant", "NonParticant"];
      
          for (const subColName of subCollections) {
            const subColRef = collection(db, "events", selectedYear, selectedMonth, eventId, subColName);
            const subDocsSnap = await getDocs(subColRef);
      
            for (const subDoc of subDocsSnap.docs) {
              await deleteDoc(subDoc.ref);
            }
          }
      
          // 3. Ana belgeyi sil
          await deleteDoc(eventDocRef);
      
          Alert.alert("Başarılı", "Etkinlik ve alt koleksiyonları silindi.");
      
          // 4. UI'dan kaldır
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("./adminPanel1")}
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
                        {selectedDate ? `${selectedDate.getFullYear()} - ${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}` : "Yıl ve Ay Seç"}
                    </Text>
                </TouchableOpacity>

                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date" // Sadece yıl ve ay için tarih modunu kullanıyoruz
                    display="spinner" // iOS ve Android'de kaydırmalı görünüm
                    onConfirm={(date) => {
                        setSelectedDate(date);
                        hideDatePicker();
                    }}
                    onCancel={hideDatePicker}
                    minimumDate={new Date(2000, 0, 1)} // Minimum yıl (Opsiyonel)
                    maximumDate={new Date(2030, 11, 31)} // Maksimum yıl (Opsiyonel)
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

                {/*  AdminReports Çerçeve Tasarımıyla Güncellenmiş Listeleme Alanı */}
                <View style={styles.scrollableList}>
                    <ScrollView>
                        {filteredEvents.map((event) => (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => handleViewEvent(event)} //  Etkinlik kartına basıldığında admineventsEdit3.js'ye yönlendir
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
                </View>

                <View style={styles.addButtonContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push("./admineventsEdit2")}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.addButtonText}>Etkinlik Ekle</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}