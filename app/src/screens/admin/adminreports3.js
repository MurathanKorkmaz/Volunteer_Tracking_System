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
import styles from "./adminreports3.style";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports3() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const guestsRef = collection(db, "pastrequest"); // ✅ pastrequest koleksiyonundan veri alıyoruz
                const guestsSnapshot = await getDocs(guestsRef);
                let allGuests = [];
    
                guestsSnapshot.forEach((docSnapshot) => {
                    const guestData = docSnapshot.data();
                
                    // 🔹 Eğer registerAt verisi boşsa, varsayılan bir değer atayalım
                    const registerAtFull = guestData.registerAt || "";
                
                    // 🔹 Eğer registerAt boşsa hata vermemesi için kontrol edelim
                    let datePart = "Tarih Yok";
                    let timePart = "Saat Yok";
                
                    if (registerAtFull && registerAtFull.includes("-")) {
                        datePart = registerAtFull.split("-").slice(0, 3).join("-");
                        timePart = registerAtFull.split("-").slice(3).join(":");
                    } else {
                        console.warn(`❌ registerAt eksik veya hatalı: ${docSnapshot.id}`);
                    }
                
                    allGuests.push({
                        id: docSnapshot.id,
                        name: guestData.name || "Bilinmiyor", // Kullanıcı adı
                        registerDate: datePart, // YYYY-MM-DD formatı
                        registerTime: timePart, // HH:mm:ss formatı
                    });
                });
                
    
                setEvents(allGuests);
                setFilteredEvents(allGuests);
            } catch (error) {
                console.error("Misafirler alınırken hata oluştu:", error);
                Alert.alert("Hata", "Misafirler yüklenirken bir hata oluştu.");
            }
        };
    
        fetchGuests();
    }, []);
    

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredEvents(filtered);
    };

    const handleEditEvent = (guest) => {
        router.push({
            pathname: "./adminreports21",
            params: {
                id: guest.id, // Kişinin Firestore'daki benzersiz ID'si
                turnout: guest.turnout, // Katılım Oranı
                ratingCounter: guest.ratingCounter, // Katılım Sayısı
                rating: guest.rating, // Kullanıcı Puanı
            },
        });
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
                    <Text style={styles.headerText}>Gönüllü Raporları</Text>
                </View>

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
                        {filteredEvents.map((guest) => (
                            <View key={guest.id} style={styles.eventCard}>
                                <View style={styles.eventDetails}>
                                    {/* 🏷️ Kullanıcı Adı */}
                                    <Text style={styles.eventName}>{guest.name}</Text>
                                    
                                    {/* 📅 Kayıt Tarihi */}
                                    <Text style={styles.eventDetail}>Kayıt Tarihi: {guest.registerDate}</Text>
                                    
                                    {/* ⏰ Kayıt Saati */}
                                    <Text style={styles.eventDetail}>Kayıt Saati: {guest.registerTime}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

            </LinearGradient>
        </SafeAreaView>
    );
}
