import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router"; 
import { doc, updateDoc , collection, addDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminannouncementsEdit1.style";


export default function adminAnnouncementsEdit1() {

    const router = useRouter();
    const params = useLocalSearchParams() || {};

    const [title, setTitle] = useState(params.title || "");
    const [volunteerCount, setVolunteerCount] = useState(params.volunterCounter || "");
    const [startDate, setStartDate] = useState(params.startDate ? new Date(params.startDate) : null);
    const [endDate, setEndDate] = useState(params.endDate ? new Date(params.endDate) : null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [description, setDescription] = useState(params.description || "");
    const [eventStatus, setEventStatus] = useState(params.eventStatus || "1");

    useEffect(() => {
        if (!params) return;
    
        setTitle(params.title || "");
        setVolunteerCount(params.volunterCounter || "");
        setStartDate(params.startDate ? new Date(params.startDate) : null);
        setEndDate(params.endDate ? new Date(params.endDate) : null);
        setDescription(params.description || "");
        setEventStatus(params.eventStatus || "1");
    
    }, []); 
    

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
        if (!params.id) {
            Alert.alert("Hata", "Duyuru güncellenirken hata oluştu! Eksik ID.");
            return;
        }
    
        // Güncellenen alanları takip et
        const updates = {};
    
        if (title.trim() !== params.title.trim()) updates.Tittle = title.trim();
        if (description.trim() !== params.description.trim()) updates.description = description.trim();
        if (volunteerCount.trim() !== params.volunterCounter.trim()) updates.volunterCounter = volunteerCount.trim();
    
        // 📌 Tarih karşılaştırması (formatı koruyarak)
        if (startDate && startDate.toISOString().split("T")[0] !== params.startDate) {
            updates.startDate = startDate.toISOString().split("T")[0];
        }
        if (endDate && endDate.toISOString().split("T")[0] !== params.endDate) {
            updates.endDate = endDate.toISOString().split("T")[0];
        }
    
        // 📌 Event Status Karşılaştırması
        if (eventStatus.trim() !== params.eventStatus.trim()) {
            updates.eventStatus = eventStatus.trim();  // "1" veya "0" olarak güncellenecek
        }
    
        // Eğer hiç değişiklik yoksa uyarı göster
        if (Object.keys(updates).length === 0) {
            Alert.alert("Bilgi", "Herhangi bir değişiklik yapılmadı.");
            return;
        }
    
        try {
            // **Announcements Güncelleme**
            const announcementRef = doc(db, "announcements", params.id);
            await updateDoc(announcementRef, updates);
    
            // **PastAnnouncements Güncelleme**
            const pastAnnouncementRef = doc(db, "pastAnnouncements", params.id);
            await updateDoc(pastAnnouncementRef, updates);
    
            Alert.alert("Başarılı", "Duyuru başarıyla güncellendi.");
            router.back();
        } catch (error) {
            console.error("❌ Güncelleme hatası:", error);
            Alert.alert("Hata", "Duyuru güncellenirken bir hata oluştu!");
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
                    <Text style={styles.headerText}>Duyuru Güncelle</Text>
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
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}
