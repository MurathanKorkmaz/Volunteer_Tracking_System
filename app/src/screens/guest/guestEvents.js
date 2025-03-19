import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./guestEvents.style";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function GuestEvents() {
    const router = useRouter();
    const { userId, userName } = useLocalSearchParams();
    const [searchText, setSearchText] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // 📌 Kullanıcının seçtiği tarih
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // 📌 Tarih seçici görünürlüğü

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {

                const selectedYear = selectedDate.getFullYear().toString();
                const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

                console.log(`Veri alınıyor: Yıl = ${selectedYear}, Ay = ${selectedMonth}`);

                const eventsRef = collection(db, "events", selectedYear, selectedMonth);
                const eventsSnapshot = await getDocs(eventsRef);

                if (eventsSnapshot.empty) {
                    console.log("Seçilen ayda etkinlik bulunamadı.");
                    setEvents([]); // 📌 Eğer etkinlik yoksa listeyi boşalt
                    setFilteredEvents([]);
                    return;
                }

                const eventsList = eventsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    title: doc.data().eventTittle,
                    date: doc.data().eventDate,
                    limit: doc.data().eventLimit,
                    applyCount: doc.data().eventApplyCounter,
                    score: doc.data().eventScore,
                }));
                
                setEvents(eventsList);
                setFilteredEvents(eventsList);
            } catch (error) {
                console.error("Etkinlik verileri alınırken hata oluştu:", error.message);
                Alert.alert("Hata", "Etkinlik verileri alınırken bir hata oluştu.");
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

    const handleApplyEvent = async (event) => {
        try {
            if (!event || !event.title) {
                Alert.alert("Hata", "Etkinlik bilgisi eksik. Lütfen tekrar deneyin.");
                return;
            }
            
            console.log(`Başvuru işlemi başlatıldı: Etkinlik ID: ${event.id}, Kullanıcı ID: ${userId}, Kullanıcı Adı: ${userName}`);
            
            if (!userId || !userName) {
                console.error("Başvuru başarısız: userId veya userName eksik!");
                Alert.alert("Hata", "Kullanıcı bilgileri eksik. Lütfen tekrar giriş yapın.");
                return;
            }
    
            // Eğer başvuru limiti dolmuşsa başvuruyu engelle
            if (parseInt(event.applyCount, 10) >= parseInt(event.limit, 10)) {
                Alert.alert("Kontenjan Doldu", "Etkinliğin kontenjan sayısı dolmuştur.");
                return;
            }
    
            // 📌 Kullanıcının seçtiği yıl ve ayı al
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            // 📌 Firestore'daki yolları belirle
            const participantRef = doc(db, "events", selectedYear, selectedMonth, event.id, "Particant", userId);
            const nonParticipantRef = doc(db, "events", selectedYear, selectedMonth, event.id, "NonParticant", userId);

            // 📌 Aynı işlemi "pastEvents" koleksiyonu için de yapalım
            const pastParticipantRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id, "Particant", userId);
            const pastNonParticipantRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id, "NonParticant", userId);

            // Kullanıcının zaten başvurduğunu kontrol et
            const participantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "Particant"));
            const nonParticipantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "NonParticant"));
    
            const isUserAlreadySelected =
                participantSnap.docs.some((doc) => doc.id === userId) ||
                nonParticipantSnap.docs.some((doc) => doc.id === userId);
    
            if (isUserAlreadySelected) {
                Alert.alert("Bilgilendirme", "Etkinlik için seçiminizi zaten yapmışsınız.");
                return;
            }
    
            // 📌 Başvuru tarih ve saatini oluştur
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}--${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    
            // 📌 Kullanıcıyı Firestore'a kaydet ve başvuru zamanını ekle
            await setDoc(participantRef, { 
                Name: userName,
                appliedAt: formattedDate // Başvuru tarih ve saat bilgisi
            });

            // 📌 Aynı işlemi "pastEvents" koleksiyonu için de yapalım
            await setDoc(pastParticipantRef, { 
                Name: userName,
                appliedAt: formattedDate // Başvuru tarih ve saat bilgisi
            });
    
            // eventApplyCounter'ı artır
            const eventRef = doc(db, "events", selectedYear, selectedMonth, event.id);
            const newApplyCount = (parseInt(event.applyCount, 10) + 1);
    
            await updateDoc(eventRef, {
                eventApplyCounter: newApplyCount
            });

            // eventApplyCounter'ı artır (pastEvents)
            const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id);
            await updateDoc(pastEventRef, {
                eventApplyCounter: newApplyCount
            });
    
            console.log(`Başvuru sayısı güncellendi: Yeni Değer = ${newApplyCount}`);
            
            setEvents((prevEvents) =>
                prevEvents.map((e) =>
                    e.id === event.id ? { ...e, applyCount: newApplyCount } : e
                )
            );
    
            // **Kullanıcının Admin mi Guest mi olduğunu belirle ve rating değerini güncelle**
            let userCollection = "guests"; // Varsayılan olarak guest
            let userDocRef = doc(db, "guests", userId);
            let userDoc = await getDoc(userDocRef);
    
            // Eğer Admin koleksiyonunda varsa onu kullan
            if (!userDoc.exists()) {
                userCollection = "admin";
                userDocRef = doc(db, "admin", userId);
                userDoc = await getDoc(userDocRef);
            }
    
            // Kullanıcı verisini kontrol et
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentRating = userData.rating ? parseInt(userData.rating) : 0;
                const currentRatingCounter = userData.ratingCounter ? parseInt(userData.ratingCounter) : 0;
    
                console.log(`Mevcut Rating: ${currentRating}`);
                console.log(`Mevcut Rating Counter: ${currentRatingCounter}`);
    
                // Etkinlik puanını kullanıcı ratingine ekle
                const eventScore = event.score ? parseInt(event.score) : 0;
                const newRating = currentRating + eventScore;
                const newRatingCounter = currentRatingCounter + 1; 
    
                console.log(`Yeni Rating: ${newRating}`);
                console.log(`Yeni Rating Counter: ${newRatingCounter}`);
    
                // **Veritabanındaki `eventPublish: 1` olan etkinlikleri say**
                const eventsSnapshot = await getDocs(collection(db, "events", selectedYear, selectedMonth));
                let totalPublishedEvents = 0;
    
                eventsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (parseInt(data.eventPublish) === 1) {
                        totalPublishedEvents++;
                    }
                });
    
                console.log(`Toplam Yayınlanan Etkinlik: ${totalPublishedEvents}`);
    
                // **Turnout Hesaplaması**
                let newTurnout = 0;
                if (totalPublishedEvents > 0) {
                    newTurnout = Math.round((newRatingCounter / totalPublishedEvents) * 100);
                }
    
                console.log(`Yeni Turnout: ${newTurnout}`);
    
                // Firestore'da güncelle
                await updateDoc(userDocRef, {
                    rating: newRating.toString(),
                    ratingCounter: newRatingCounter.toString(),
                    turnout: newTurnout.toString()
                });
    
                console.log(`Rating, Rating Counter ve Turnout Güncellendi.`);
            } else {
                console.warn("Hata: Kullanıcı bulunamadı.");
            }
    
            Alert.alert("Başarı", `${event?.title || "Etkinlik"} etkinliğine başarıyla katıldınız!`);
        } catch (error) {
            console.error("Başvuru yapılırken hata oluştu:", error.message);
            Alert.alert("Hata", "Başvuru yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
        }
    };
    
    const handleDeclineEvent = async (event) => {
        try {
            console.log(`Katılmama tercihi başlatıldı: Etkinlik ID: ${event.id}, Kullanıcı ID: ${userId}, Kullanıcı Adı: ${userName}`);
    
            if (!userId || !userName) {
                Alert.alert("Hata", "Kullanıcı bilgileri eksik. Lütfen tekrar giriş yapın.");
                return;
            }
    
            // 📌 Kullanıcının seçtiği yıl ve ayı al
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            // 📌 Kullanıcının Firestore'daki yolunu belirle
            const participantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "Particant"));
            const nonParticipantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "NonParticant"));
    
            console.log("Katılmama tercihi - ParticipantSnap:", participantSnap.docs.map(d => d.id));
            console.log("Katılmama tercihi - NonParticipantSnap:", nonParticipantSnap.docs.map(d => d.id));
    
            const isUserAlreadySelected =
                participantSnap.docs.some((doc) => doc.id === userId) ||
                nonParticipantSnap.docs.some((doc) => doc.id === userId);
    
            if (isUserAlreadySelected) {
                Alert.alert("Bilgilendirme", "Etkinlik için seçiminizi zaten yapmışsınız.");
                return;
            }
    
            // 📌 Katılmama tarih ve saatini oluştur
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}--${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    
            // 📌 Kullanıcıyı "NonParticant" olarak kaydet ve tarih bilgisini ekle
            const nonParticipantRef = doc(db, "events", selectedYear, selectedMonth, event.id, "NonParticant", userId);
            await setDoc(nonParticipantRef, { 
                Name: userName,
                appliedAt: formattedDate // Katılmama tarihi
            });

            // 📌 Aynı işlemi "pastEvents" koleksiyonu için de yapalım
            const pastNonParticipantRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id, "NonParticant", userId);
            await setDoc(pastNonParticipantRef, { 
                Name: userName,
                appliedAt: formattedDate // Katılmama tarihi
            });
    
            // 📌 eventNonApplyCounter'ı artır
            const eventRef = doc(db, "events", selectedYear, selectedMonth, event.id);
            const eventDoc = await getDoc(eventRef);
    
            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const currentNonApplyCount = parseInt(eventData.eventNonApplyCounter || 0, 10); // Sayıya çevir, yoksa 0 al
                const newNonApplyCount = currentNonApplyCount + 1;
    
                await updateDoc(eventRef, {
                    eventNonApplyCounter: newNonApplyCount
                });
    
                console.log(`NonParticant sayısı güncellendi: Yeni eventNonApplyCounter = ${newNonApplyCount}`);
    
                // **React state'ini güncelle**
                setEvents((prevEvents) =>
                    prevEvents.map((e) =>
                        e.id === event.id ? { ...e, eventNonApplyCounter: newNonApplyCount } : e
                    )
                );
            } else {
                console.warn("Hata: Güncellenmek istenen etkinlik bulunamadı.");
            }
    
            // 📌 eventNonApplyCounter'ı artır (pastEvents)
            const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id);
            const pastEventDoc = await getDoc(pastEventRef);

            if (pastEventDoc.exists()) {
                const pastEventData = pastEventDoc.data();
                const currentPastNonApplyCount = parseInt(pastEventData.eventNonApplyCounter || 0, 10);
                const newPastNonApplyCount = currentPastNonApplyCount + 1;

                await updateDoc(pastEventRef, {
                    eventNonApplyCounter: newPastNonApplyCount
                });

                console.log(`NonParticant sayısı güncellendi (pastEvents): Yeni eventNonApplyCounter = ${newPastNonApplyCount}`);
            } else {
                console.warn("Hata: Güncellenmek istenen etkinlik (pastEvents) bulunamadı.");
            }

            Alert.alert("Bilgilendirme", "Etkinliğe katılmama tercihiniz kaydedildi ve kontenjan güncellendi.");
            
        } catch (error) {
            console.error("Katılmama tercihi yapılırken hata oluştu:", error.message);
            Alert.alert("Hata", "Katılmama tercihiniz kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.");
        }
    };
    
    
    const renderEvent = (event) => (
        <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDetails}>
                <Text style={styles.eventName}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventQuota}>{event.applyCount} / {event.limit}</Text>
                <Text style={styles.eventPoint}>Etkinlik Puanı: {event.score} </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => handleApplyEvent(event)}
                >
                    <Text style={styles.buttonText}>Katıl</Text>
                </TouchableOpacity>
                <TouchableOpacity
                     style={styles.cancelButton}
                     onPress={() => handleDeclineEvent(event)}
                >
                    <Text style={styles.buttonText}>Katılma</Text>
                </TouchableOpacity>
            </View>
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
                    <Text style={styles.headerText}>Gönüllü Etkinlikleri</Text>
                </View>

                {/* 📌 Yıl ve Ay Seçme Butonu */}
                <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>
                        {selectedDate ? `${selectedDate.getFullYear()} - ${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}` : "Yıl ve Ay Seç"}
                    </Text>
                </TouchableOpacity>

                {/* 📌 Tarih Seçici Modal */}
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    display="spinner"
                    onConfirm={handleConfirm}
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

                <ScrollView contentContainerStyle={styles.scrollableList}>
                    {(searchText ? filteredEvents : events).map(renderEvent)}
                </ScrollView>

                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        Başvuru yaptıktan sonra hiçbir şekilde başvurunuzu geri çekemezsiniz, bu yüzden başvururken lütfen dikkat ediniz.
                    </Text>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}