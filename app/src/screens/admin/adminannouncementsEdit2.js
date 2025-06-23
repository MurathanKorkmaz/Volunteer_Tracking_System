import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { doc, setDoc,collection, addDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig"; 
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import styles from "./adminannouncementsEdit2.style";

export default function adminAnnouncementsEdit2() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    const [title, setTitle] = useState("");
    const [volunteerCount, setVolunteerCount] = useState("");
    const [startDate, setStartDate] = useState(null); 
    const [endDate, setEndDate] = useState(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [eventStatus, setEventStatus] = useState("1"); // Varsayılan olarak yayınlanmış


    const [description, setDescription] = useState("");

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const onChangeStartDate = (event, selectedDate) => {
        if (event.type === "dismissed") {
            setShowStartDatePicker(false);
            return;
        }
    
        if (!selectedDate) return;
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chosenDate = new Date(selectedDate);
        chosenDate.setHours(12, 0, 0, 0); // 🕛 Saat farkını önlemek için öğlen 12:00 olarak ayarla
    
        if (chosenDate < today) {
            Alert.alert("Geçersiz Tarih", "Başlangıç tarihi bugünden önce olamaz!");
            return;
        }
    
        setShowStartDatePicker(false);
        setStartDate(chosenDate);
    
        if (endDate && endDate <= chosenDate) {
            const newEndDate = new Date(chosenDate);
            newEndDate.setDate(newEndDate.getDate() + 1);
            newEndDate.setHours(12, 0, 0, 0); // 🕛 Öğlen 12:00 olarak ayarla
            setEndDate(newEndDate);
        }
    };
    
    
    const onChangeEndDate = (event, selectedDate) => {
        if (event.type === "dismissed") {
            setShowEndDatePicker(false);
            return;
        }
    
        if (!selectedDate) return;
    
        const chosenDate = new Date(selectedDate);
        chosenDate.setHours(12, 0, 0, 0); // 🕛 Saat farkını önlemek için öğlen 12:00 olarak ayarla
    
        if (startDate && chosenDate <= startDate) {
            Alert.alert("Geçersiz Tarih", "Bitiş tarihi, başlangıç tarihinden en az 1 gün sonra olmalıdır!");
            return;
        }
    
        setShowEndDatePicker(false);
        setEndDate(chosenDate);
    };
    

    const handleSave = async () => {
        // 1. Boş alan kontrolü
        if (!title || !volunteerCount || !startDate || !endDate || !description || !eventStatus) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurunuz!");
            return;
        }
    
        // 2. Tarih doğrulaması (Bitiş tarihi, başlangıç tarihinden önce olamaz)
        if (new Date(endDate) <= new Date(startDate)) {
            Alert.alert("Hata", "Bitiş tarihi, başlangıç tarihinden en az 1 gün sonra olmalıdır!");
            return;
        }
    
        try {
            // 📌 Firestore'da **belirli bir doc.id** ile veri oluştur
            const newDocRef = doc(collection(db, "announcements")); // Benzersiz ID oluştur
            const announcementData = {
                Tittle: title.trim(),
                description: description.trim(),
                startDate: startDate.toISOString().split("T")[0], // YYYY-MM-DD formatına çevir
                endDate: endDate.toISOString().split("T")[0], // YYYY-MM-DD formatına çevir
                volunterCounter: volunteerCount.trim(),
                eventStatus: eventStatus.trim(),
            };
    
            // 📌 Aynı ID ile announcements içine ekle
            await setDoc(newDocRef, announcementData);
    
            // 📌 Aynı ID ile pastAnnouncements içine de ekle
            const pastDocRef = doc(db, "pastAnnouncements", newDocRef.id);
            await setDoc(pastDocRef, announcementData);
    
            Alert.alert("Başarılı", "Duyuru başarıyla eklendi ve geçmiş duyurulara kaydedildi!");
            router.back();
        } catch (error) {
            Alert.alert("Hata", "Duyuru eklenirken bir hata oluştu!");
            console.error("Duyuru ekleme hatası:", error);
        }
    };
    

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Duyuru Ekle</Text>
                    </View>
                    

                    <View style={styles.scrollableContainer}>
                        <ScrollView 
                            contentContainerStyle={styles.scrollContainer} 
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false} // Kaydırma çubuğunu gizler
                        >
                            {/* Duyuru Giriş Alanları */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Duyuru Başlığı</Text>
                                <TextInput
                                    style={styles.input}
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Başlık girin..."
                                    placeholderTextColor="#888"
                                />

                                {/* Başlangıç Tarihi */}
                                <Text style={styles.label}>Başlangıç Tarihi</Text>
                                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.dateInput}>
                                    <Text style={styles.dateText}>
                                        {startDate ? startDate.toISOString().split("T")[0] : "Tarih Seç"}
                                    </Text>
                                </TouchableOpacity>
                                {showStartDatePicker && (
                                    <DateTimePicker
                                        value={startDate || new Date()} 
                                        mode="date"
                                        display="default"
                                        minimumDate={new Date()} 
                                        onChange={onChangeStartDate}
                                    />
                                )}

                                {/* Bitiş Tarihi */}
                                <Text style={styles.label}>Bitiş Tarihi</Text>
                                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.dateInput}>
                                    <Text style={styles.dateText}>
                                        {endDate ? endDate.toISOString().split("T")[0] : "Tarih Seç"}
                                    </Text>
                                </TouchableOpacity>
                                {showEndDatePicker && (
                                    <DateTimePicker
                                        value={endDate || (startDate ? new Date(startDate.getTime() + 86400000) : new Date())} 
                                        mode="date"
                                        display="default"
                                        minimumDate={startDate ? new Date(startDate.getTime() + 86400000) : new Date()} 
                                        onChange={onChangeEndDate}
                                        onCancel={() => setShowEndDatePicker(false)} 
                                    />
                                )}

                                {/* Katılımcı Sayısı */}
                                <Text style={styles.label}>Katılımcı Sayısı</Text>
                                <TextInput
                                    style={styles.input}
                                    value={volunteerCount}
                                    onChangeText={setVolunteerCount}
                                    placeholder="Katılımcı sayısını girin..."
                                    placeholderTextColor="#888"
                                    keyboardType="numeric"
                                />

                                {/* Duyuru Açıklaması */}
                                <Text style={styles.label}>Duyuru Açıklaması</Text>
                                <TextInput
                                    style={styles.textArea}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="Açıklama girin (150 karakter)..."
                                    placeholderTextColor="#888"
                                    maxLength={150}
                                    multiline
                                />

                                {/* Yayın Durumu */}
                                <Text style={styles.label}>Yayın Durumu</Text>
                                <View style={styles.dropdownContainer}>
                                    {["Yayınla", "Yayından Kaldır"].map((type, index) => (
                                        <TouchableOpacity 
                                            key={type} 
                                            style={[
                                                styles.dropdownItem, 
                                                eventStatus === (index === 0 ? "1" : "0") && styles.dropdownItemSelected
                                            ]} 
                                            onPress={() => {
                                                setEventStatus(index === 0 ? "1" : "0");
                                            }} 
                                        >
                                            <Text style={[
                                                styles.dropdownText, 
                                                eventStatus === (index === 0 ? "1" : "0") && styles.dropdownTextSelected
                                            ]}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>


                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Ekle</Text>
                    </TouchableOpacity>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
