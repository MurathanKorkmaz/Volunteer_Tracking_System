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
import styles from "./adminreports4.style";
import { collection, doc, getDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports4() {
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const announcementsRef = collection(db, "pastAnnouncements");
            const announcementsSnapshot = await getDocs(announcementsRef);
    
            let fetchedAnnouncements = [];
    
            announcementsSnapshot.forEach(doc => {
                const announcementData = doc.data();
                
                fetchedAnnouncements.push({
                    id: doc.id,
                    title: announcementData.Tittle || "Duyuru Başlığı Yok",
                    description: announcementData.description || "Açıklama Yok",
                    startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                    endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                    volunterCounter: announcementData.volunterCounter || "0",
                    eventStatus: announcementData.eventStatus || "1"
                });
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
    
    const handleDelete = async (announcementId) => {
        try {
            // 🔹 `pastAnnouncements` içindeki duyuruyu sil
            const pastAnnouncementRef = doc(db, "pastAnnouncements", announcementId);
            await deleteDoc(pastAnnouncementRef);
            console.log(`✅ PastAnnouncements içindeki duyuru silindi: ${announcementId}`);
    
            // 🔹 Silme işleminden sonra duyuru listesini güncelle
            setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    
            Alert.alert("Başarılı", "Duyuru başarıyla silindi.");
        } catch (error) {
            console.error("❌ Duyuru silme hatası:", error);
            Alert.alert("Hata", "Duyuru silinirken bir hata oluştu.");
        }
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

                                    {/* 🗑️ Sil Butonu */}
                                    <TouchableOpacity 
                                        style={styles.deleteButton} 
                                        onPress={() => handleDelete(announcement.id)} // Silme fonksiyonunu çağır
                                    >
                                        <Text style={styles.buttonText}>Sil</Text>
                                    </TouchableOpacity>
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
