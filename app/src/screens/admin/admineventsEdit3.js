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
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./admineventsEdit3.style";
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminEventsEdit3() {
    const router = useRouter();
    const { id, year, month } = useLocalSearchParams(); // Etkinlik ID

    const [applicants, setApplicants] = useState([]);
    const [nonApplicants, setNonApplicants] = useState([]);
    const [activeTab, setActiveTab] = useState("applicants");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !year || !month) return;

        const fetchParticipants = async () => {
            try {
                const particantRef = collection(db, "events", year, month, id, "Particant");
                const nonParticantRef = collection(db, "events", year, month, id, "NonParticant");

                const particantSnap = await getDocs(particantRef);
                const nonParticantSnap = await getDocs(nonParticantRef);

                const applicantsList = particantSnap.docs.map(doc => {
                    const appliedAt = doc.data().appliedAt || "Bilinmiyor";
                    const [date, time] = appliedAt.includes("--") ? appliedAt.split("--") : [appliedAt, ""];
                    return {
                        id: doc.id,
                        name: doc.data().Name || "Bilinmeyen",
                        appliedDate: date,
                        appliedTime: time
                    };
                });

                const nonApplicantsList = nonParticantSnap.docs.map(doc => {
                    const appliedAt = doc.data().appliedAt || "Bilinmiyor";
                    const [date, time] = appliedAt.includes("--") ? appliedAt.split("--") : [appliedAt, ""];
                    return {
                        id: doc.id,
                        name: doc.data().Name || "Bilinmeyen",
                        appliedDate: date,
                        appliedTime: time
                    };
                });

                setApplicants(applicantsList);
                setNonApplicants(nonApplicantsList);
            } catch (error) {
                console.error("Başvuru verileri çekilirken hata oluştu:", error);
                Alert.alert("Hata", "Veriler çekilirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [id, year, month]);

    const handleDelete = async (personId) => {
        try {
            const isApplicant = activeTab === "applicants"; // **Başvuranlar (Particant) kısmında mı kontrol et**
            const collectionName = isApplicant ? "Particant" : "NonParticant";
            const counterField = isApplicant ? "eventApplyCounter" : "eventNonApplyCounter";
    
            // **events koleksiyonundan sil**
            await deleteDoc(doc(db, "events", year, month, id, collectionName, personId));
            // **pastEvents koleksiyonundan da sil**
            await deleteDoc(doc(db, "pastEvents", year, month, id, collectionName, personId));
    
            if (isApplicant) {
                setApplicants((prev) => prev.filter(person => person.id !== personId));
            } else {
                setNonApplicants((prev) => prev.filter(person => person.id !== personId));
    
                console.log(`Kullanıcı ${personId} Başvurmayanlar kısmında olduğu için sadece silindi, eventNonApplyCounter azaltılıyor...`);
    
                // **Başvurmayanlar sekmesindeyse eventNonApplyCounter'ı azalt (events)**
                const eventRef = doc(db, "events", year, month, id);
                const eventDoc = await getDoc(eventRef);
    
                if (eventDoc.exists()) {
                    const eventData = eventDoc.data();
                    if (eventData.eventNonApplyCounter > 0) {
                        await updateDoc(eventRef, {
                            eventNonApplyCounter: eventData.eventNonApplyCounter - 1
                        });
                        console.log(`eventNonApplyCounter 1 azaltıldı. Yeni değer: ${eventData.eventNonApplyCounter - 1}`);
                    }
                }
    
                // **Başvurmayanlar sekmesindeyse eventNonApplyCounter'ı azalt (pastEvents)**
                const pastEventRef = doc(db, "pastEvents", year, month, id);
                const pastEventDoc = await getDoc(pastEventRef);
    
                if (pastEventDoc.exists()) {
                    const pastEventData = pastEventDoc.data();
                    if (pastEventData.eventNonApplyCounter > 0) {
                        await updateDoc(pastEventRef, {
                            eventNonApplyCounter: pastEventData.eventNonApplyCounter - 1
                        });
                        console.log(`pastEvents - eventNonApplyCounter 1 azaltıldı. Yeni değer: ${pastEventData.eventNonApplyCounter - 1}`);
                    }
                }
    
                Alert.alert("Başarılı", "Kullanıcı başarıyla silindi.");
                return;
            }
    
            // **Başvuranlar kısmından silindiği için değerleri güncelle (events)**
            const eventRef = doc(db, "events", year, month, id);
            const eventDoc = await getDoc(eventRef);
    
            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                if (eventData[counterField] > 0) {
                    await updateDoc(eventRef, {
                        [counterField]: eventData[counterField] - 1
                    });
                }
            }
    
            // **Başvuranlar kısmından silindiği için değerleri güncelle (pastEvents)**
            const pastEventRef = doc(db, "pastEvents", year, month, id);
            const pastEventDoc = await getDoc(pastEventRef);
    
            if (pastEventDoc.exists()) {
                const pastEventData = pastEventDoc.data();
                if (pastEventData[counterField] > 0) {
                    await updateDoc(pastEventRef, {
                        [counterField]: pastEventData[counterField] - 1
                    });
                }
            }
    
            // **Silinen kişinin Firestore'daki koleksiyonunu belirle**
            let userCollection = "guests"; // Varsayılan olarak guests koleksiyonunu kontrol et
            let userDocRef = doc(db, "guests", personId);
            let userDoc = await getDoc(userDocRef);
    
            console.log(`Kullanıcı ${personId} için Guests koleksiyonunda arama yapılıyor...`);
    
            // Eğer Guests koleksiyonunda bulunamazsa Admin koleksiyonunda arama yap
            if (!userDoc.exists()) {
                console.log(`Kullanıcı ${personId} Guests koleksiyonunda bulunamadı. Admin koleksiyonunda aranıyor...`);
                userCollection = "admin";
                userDocRef = doc(db, "admin", personId);
                userDoc = await getDoc(userDocRef);
            }
    
            if (!userDoc.exists()) {
                console.error(`Hata: Kullanıcı ${personId} veritabanında bulunamadı.`);
                Alert.alert("Hata", "Kullanıcı bulunamadı.");
                return;
            } else {
                console.log(`Kullanıcı ${personId} bulundu. Koleksiyon: ${userCollection}`);
            }
    
            // **Mevcut Kullanıcı Değerlerini Al**
            const userData = userDoc.data();
            const currentRating = userData.rating ? parseInt(userData.rating) : 0;
            const currentRatingCounter = userData.ratingCounter ? parseInt(userData.ratingCounter) : 0;
    
            console.log(`Mevcut Rating: ${currentRating}`);
            console.log(`Mevcut Rating Counter: ${currentRatingCounter}`);
    
            // **Etkinlik Score değerini çek (events)**
            const eventDocRef = doc(db, "events", year, month, id);
            const eventDocSnap = await getDoc(eventDocRef);
            const eventScore = eventDocSnap.exists() ? parseInt(eventDocSnap.data().eventScore) : 0;
    
            // **Etkinlik Score değerini çek (pastEvents)**
            const pastEventDocRef = doc(db, "pastEvents", year, month, id);
            const pastEventDocSnap = await getDoc(pastEventDocRef);
            const pastEventScore = pastEventDocSnap.exists() ? parseInt(pastEventDocSnap.data().eventScore) : 0;
    
            // **Total etkinlik sayısını hesapla (`eventPublish: 1` olanları say)**
            const eventsSnapshot = await getDocs(collection(db, "events", year, month));
            let totalPublishedEvents = 0;
    
            eventsSnapshot.forEach(eventDoc => {
                const eventData = eventDoc.data();
                if (parseInt(eventData.eventPublish) === 1) {
                    totalPublishedEvents++;
                }
            });
    
            console.log(`Event Score: ${eventScore}`);
            console.log(`Total Published Events: ${totalPublishedEvents}`);
    
            // **Yeni Değerleri Hesapla**
            const newRating = Math.max(0, currentRating - eventScore);
            const newRatingCounter = Math.max(0, currentRatingCounter - 1);
            const newTurnout = totalPublishedEvents > 0 ? parseInt((newRatingCounter / totalPublishedEvents) * 100) : 0;
    
            console.log(`Yeni Rating: ${newRating}`);
            console.log(`Yeni Rating Counter: ${newRatingCounter}`);
            console.log(`Yeni Turnout: ${newTurnout}`);
    
            // **Firestore'a Güncellenmiş Değerleri Kaydet**
            try {
                await updateDoc(userDocRef, {
                    rating: newRating.toString(),
                    ratingCounter: newRatingCounter.toString(),
                    turnout: newTurnout.toString()
                });
                console.log(`Firestore Güncellemesi Başarılı: Kullanıcı ID: ${personId}`);
            } catch (error) {
                console.error("Firestore Güncelleme Hatası:", error);
            }
    
            Alert.alert("Başarılı", "Kullanıcı başarıyla silindi ve başvuru bilgileri güncellendi.");
        } catch (error) {
            console.error("Silme işlemi başarısız:", error);
            Alert.alert("Hata", "Silme işlemi başarısız oldu.");
        }
    };
    
    

    const filteredList =
        activeTab === "applicants"
            ? applicants.filter(person => person.name.toLowerCase().includes(searchText.toLowerCase()))
            : nonApplicants.filter(person => person.name.toLowerCase().includes(searchText.toLowerCase()));

    const renderPerson = (person) => (
        <View key={person.id} style={styles.personCard}>
            <View style={styles.personDetails}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personDate}>{person.appliedDate !== "Bilinmiyor" ? `Tarih: ${person.appliedDate}` : ""}</Text>
                <Text style={styles.personTime}>{person.appliedTime !== "Bilinmiyor" ? `Saat: ${person.appliedTime}` : ""}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(person.id)}>
                <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
        </View>
    );

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

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="İsim ara..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "applicants" && styles.tabButtonActive1]}
                        onPress={() => setActiveTab("applicants")}
                    >
                        <Text style={[styles.tabButtonText, activeTab === "applicants" && styles.tabButtonTextActive]}>
                            Başvuranlar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "nonApplicants" && styles.tabButtonActive2]}
                        onPress={() => setActiveTab("nonApplicants")}
                    >
                        <Text style={[styles.tabButtonText, activeTab === "nonApplicants" && styles.tabButtonTextActive]}>
                            Başvurmayanlar
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.scrollableList}>
                    <ScrollView>
                        {filteredList.length > 0 ? (
                            filteredList.map(renderPerson)
                        ) : (
                            <Text style={styles.emptyText}>
                                {activeTab === "applicants" ? "Başvuran bulunmamaktadır." : "Başvurmayan bulunmamaktadır."}
                            </Text>
                        )}
                    </ScrollView>
                </View>

                {/* Başvuru Sayısını Gösteren Bilgilendirme Alanı */}
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {activeTab === "applicants"
                            ? `Başvuran sayısı: ${applicants.length} kişi`
                            : `Başvurmayan sayısı: ${nonApplicants.length} kişi`}
                    </Text>
                </View>

            </LinearGradient>
        </SafeAreaView>
    );
}