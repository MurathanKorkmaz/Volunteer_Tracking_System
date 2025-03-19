import React, { useState, useEffect  } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import styles from "./guestAnnouncements.style";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function guestAnnouncements() {
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventStatus, setEventStatus] = useState("1"); // Varsayılan olarak "1" yani Yayında


    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const announcementsRef = collection(db, "announcements");
            const announcementsSnapshot = await getDocs(announcementsRef);
    
            let fetchedAnnouncements = [];
    
            announcementsSnapshot.forEach(doc => {
                const announcementData = doc.data();
                
                // 🔹 Yalnızca aktif sekmeye göre duyuruları filtrele
                if (announcementData.eventStatus === "1") { 
                    fetchedAnnouncements.push({
                        id: doc.id,
                        title: announcementData.Tittle || "Duyuru Başlığı Yok",
                        description: announcementData.description || "Açıklama Yok",
                        startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                        endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                        volunterCounter: announcementData.volunterCounter || "0"
                    });
                }
            });
    
            setAnnouncements(fetchedAnnouncements);
            setFilteredAnnouncements(fetchedAnnouncements);
        } catch (error) {
            console.error("❌ Duyurular çekilirken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchAnnouncements();
    }, []);
    

    const handleSearch = (text) => {
        setSearchText(text);
        const filtered = announcements.filter((announcement) =>
            announcement.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredAnnouncements(filtered);
    };

    const handleEdit = (announcement) => {
        console.log("📡 Gidiyor → adminannouncementsEdit1.js: ", announcement);
    
        router.push({
            pathname: "./adminannouncementsEdit1",
            params: {
                id: announcement.id,
                title: announcement.title,
                description: announcement.description,
                startDate: announcement.startDate,
                endDate: announcement.endDate,
                volunterCounter: announcement.volunterCounter,
                eventStatus: announcement.eventStatus || "1" // Varsayılan olarak "1" ata
            }
        });
    };
    
    
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>
    
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Duyurular</Text>
                </View>
    
                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Duyuru ara..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                </View>
    
                {/* Scrollable Announcements List */}
                <View style={styles.scrollableList}>
                    <ScrollView>
                        {/* 🔄 Yükleme Durumu */}
                        {loading ? (
                            <Text style={styles.loadingText}>Yükleniyor...</Text>
                        ) : filteredAnnouncements.length > 0 ? (
                            /* 📌 Firestore'dan Gelen Duyuruları Listele */
                            filteredAnnouncements.map((announcement) => (
                                <View key={announcement.id} style={styles.announcementCard}>
                                    <View style={styles.announcementDetails}>
                                        {/* 🏷️ Duyuru Başlığı */}
                                        <Text style={styles.announcementTitle}>{announcement.title}</Text>
                                        {/* 📅 Duyuru Tarihleri */}
                                        <Text style={styles.announcementDate}>
                                            {announcement.startDate} - {announcement.endDate}
                                        </Text>
                                        {/* 📝 Duyuru Açıklaması */}
                                        <Text style={styles.announcementDescription}>
                                            {announcement.description}
                                        </Text>
                                        {/* 👥 Gönüllü Sayısı */}
                                        <Text style={styles.announcementVolunterCounter}>
                                            Gönüllü Sayısı: {announcement.volunterCounter}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            /* 📌 Hiç Duyuru Yoksa Gösterilecek Mesaj */
                            <Text style={styles.emptyText}>Henüz duyuru yok.</Text>
                        )}
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}    
