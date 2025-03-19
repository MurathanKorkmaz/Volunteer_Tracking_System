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
import styles from "./adminreports2.style";
import { collection, doc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports2() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                const guestsRef = collection(db, "guests");
                const guestsSnapshot = await getDocs(guestsRef);
                let allGuests = [];
    
                guestsSnapshot.forEach((docSnapshot) => {
                    const guestData = docSnapshot.data();
                    allGuests.push({
                        id: docSnapshot.id,
                        name: guestData.name || "Bilinmiyor", // Kullanıcı adı
                        turnout: guestData.turnout || "0", // Katılım Oranı
                        ratingCounter: guestData.ratingCounter || "0", // Etkinlik Katılım Sayısı
                        rating: guestData.rating || "0", // Kullanıcı Puanı
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
                            <TouchableOpacity
                                key={guest.id}
                                style={styles.eventCard}
                                onPress={() => handleEditEvent(guest)} // Tıklanan kişinin ID'sini gönder
                            >
                                <View style={styles.eventDetails}>
                                    <Text style={styles.eventName}>{guest.name}</Text>
                                    <Text style={styles.eventDetail}>Katılım Oranı: %{guest.turnout}</Text>
                                    <Text style={styles.eventDetail}>Katılım Puan: {guest.rating}</Text>
                                    <Text style={styles.eventDetail}>Katılım Sayısı: {guest.ratingCounter}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
