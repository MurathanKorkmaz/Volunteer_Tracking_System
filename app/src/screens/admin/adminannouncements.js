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
import styles from "./adminannouncements.style";
import { collection, doc, getDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminAnnouncements() {
    const [searchText, setSearchText] = useState("");
    const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
    const router = useRouter();

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("published"); // Varsayılan "Yayında"
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
                if (announcementData.eventStatus === eventStatus) { 
                    fetchedAnnouncements.push({
                        id: doc.id,
                        title: announcementData.Tittle || "Duyuru Başlığı Yok",
                        description: announcementData.description || "Açıklama Yok",
                        startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                        endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                        volunterCounter: announcementData.volunterCounter || "0",
                        eventStatus: announcementData.eventStatus || "1"
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
    }, [eventStatus]);
    

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
    
    const handleDelete = async (announcementId) => {
        try {
            // 🔍 Duyurunun verilerini getir
            const announcementRef = doc(db, "announcements", announcementId);
            const announcementSnap = await getDoc(announcementRef);
    
            if (!announcementSnap.exists()) {
                console.warn("❌ Silinecek duyuru bulunamadı!");
                return;
            }
    
            const announcementData = announcementSnap.data();
    
            // 📁 PastAnnouncements koleksiyonuna aynı verileri kaydet
            const pastAnnouncementRef = doc(db, "pastAnnouncements", announcementId);
            await setDoc(pastAnnouncementRef, {
                title: announcementData.Tittle || "Duyuru Başlığı Yok",
                description: announcementData.description || "Açıklama Yok",
                startDate: announcementData.startDate || "Başlangıç Tarihi Yok",
                endDate: announcementData.endDate || "Bitiş Tarihi Yok",
                volunterCounter: announcementData.volunterCounter || "0",
                eventStatus: announcementData.eventStatus || "0", // Varsayılan olarak "Yayın Dışı"
            });
    
            console.log("✅ Duyuru yedeklendi: ", announcementId);
    
            // 🗑️ `announcements` koleksiyonundan duyuruyu sil
            await deleteDoc(announcementRef);
            console.log("🗑️ Duyuru başarıyla silindi:", announcementId);
    
            // 🔄 Listeyi güncelle
            fetchAnnouncements();
        } catch (error) {
            console.error("❌ Duyuru silme hatası:", error);
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

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "published" && styles.tabButtonActive1]}
                        onPress={() => {
                            setActiveTab("published");
                            setEventStatus("1"); // Yayında olarak ayarla
                        }}
                    >
                        <Text style={[styles.tabButtonText, activeTab === "published" && styles.tabButtonTextActive]}>
                            Yayında
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "unpublished" && styles.tabButtonActive2]}
                        onPress={() => {
                            setActiveTab("unpublished");
                            setEventStatus("0"); // Yayından kaldır olarak ayarla
                        }}
                    >
                        <Text style={[styles.tabButtonText, activeTab === "unpublished" && styles.tabButtonTextActive]}>
                            Yayın Dışı
                        </Text>
                    </TouchableOpacity>
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
                                <TouchableOpacity 
                                    key={announcement.id} 
                                    style={styles.announcementCard} 
                                    onPress={() => handleEdit(announcement)}  // Tıklanınca düzenleme sayfasına gitsin
                                >
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
                                </TouchableOpacity>
                            ))
                        ) : (
                            /* 📌 Hiç Duyuru Yoksa Gösterilecek Mesaj */
                            <Text style={styles.emptyText}>Henüz duyuru yok.</Text>
                        )}
                    </ScrollView>
                </View>

                {/* Add Announcement Button */}
                <View style={styles.addButtonContainer}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push("./adminannouncementsEdit2")}
                    >
                        <Text style={styles.addButtonText}>Duyuru Ekle</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
