import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "./admineventsEdit1.style";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function admineventsEdit1() {
    const router = useRouter();
    const { id, year, month } = useLocalSearchParams();

    const [eventTittle, setEventTittle] = useState("");
    const [eventDate, setEventDate] = useState(new Date());
    const [eventTime, setEventTime] = useState(new Date());
    const [eventLimit, setEventLimit] = useState("");
    const [eventStatement, setEventStatement] = useState("");
    const [eventType, setEventType] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventPublish, setEventPublish] = useState("");
    const [eventScore, setEventScore] = useState(""); // Etkinlik puanı
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [originalData, setOriginalData] = useState(null);

    const eventTypes = ["Spor", "Kahvaltı", "Eğitim", "Workshop"];
    const publishTypes = ["Yayında", "Yayında Değil"];

    useEffect(() => {
        const fetchEventData = async () => {
            if (!id || !year || !month) return;

            try {
                const eventRef = doc(db, "events", year, month, id);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    const eventData = eventSnap.data();
                    setOriginalData(eventData);
                    setEventTittle(eventData.eventTittle || "");
                    setEventDate(eventData.eventDate ? new Date(eventData.eventDate) : new Date());
                    if (eventData.eventTime) {
                        try {
                            const [hours, minutes, seconds] = eventData.eventTime.split(":");
                            setEventTime(new Date(1970, 0, 1, Number(hours) + 1, Number(minutes), Number(seconds))); 
                        } catch (error) {
                            console.error("Saat dönüşüm hatası:", error);
                            setEventTime(null);
                        }
                    } else {
                        setEventTime(null);
                    }                    
                    setEventLimit(eventData.eventLimit || "");
                    setEventStatement(eventData.eventStatement || "");
                    setEventType(eventData.eventCategory || "");
                    setEventLocation(eventData.eventLocation || "");
                    setEventPublish(eventData.eventPublish || "0"); // Firestore'daki değeri al, yoksa varsayılan "0" yap
                    setEventScore(eventData.eventScore || "0"); // Etkinlik puanını al
                } else {
                    Alert.alert("Hata", "Etkinlik bulunamadı.");
                    router.back();
                }
            } catch (error) {
                console.error("Etkinlik verileri alınırken hata oluştu:", error);
                Alert.alert("Hata", "Veriler alınırken bir hata oluştu.");
            }
        };

        fetchEventData();
    }, [id, year, month]);

    const handleSave = async () => {
        if (!originalData) return;

        const updates = {};

        // Eğer değerler değişmişse güncellenecek alanlara ekleyelim
        if (eventTittle.trim() !== originalData.eventTittle) updates.eventTittle = eventTittle.trim();
        if (eventDate.toISOString().split("T")[0] !== originalData.eventDate) updates.eventDate = eventDate.toISOString().split("T")[0];
        if (eventTime instanceof Date && !isNaN(eventTime)) {
            const formattedTime = eventTime
                .toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
            updates.eventTime = formattedTime;
        }
        if (eventLimit.trim() !== originalData.eventLimit) updates.eventLimit = eventLimit.trim();
        if (eventStatement.trim() !== originalData.eventStatement) updates.eventStatement = eventStatement.trim();
        if (eventType.trim() !== originalData.eventCategory) updates.eventCategory = eventType.trim();
        if (eventLocation.trim() !== originalData.eventLocation) updates.eventLocation = eventLocation.trim();
        if (eventPublish !== originalData.eventPublish) updates.eventPublish = eventPublish; // Doğrudan "1" veya "0" olarak kaydet
        if (eventScore.trim() !== originalData.eventScore) updates.eventScore = eventScore.trim(); // Puan değişmişse ekle

        if (Object.keys(updates).length === 0) {
            Alert.alert("Bilgi", "Herhangi bir değişiklik yapılmadı.");
            return;
        }

        try {
            // **1️⃣ Mevcut "events" koleksiyonundaki veriyi güncelle**
            const eventRef = doc(db, "events", year, month, id);
            await updateDoc(eventRef, updates);

            // **2️⃣ "pastEvents" koleksiyonundaki veriyi de güncelle**
            const pastEventRef = doc(db, "pastEvents", year, month, id);
            await updateDoc(pastEventRef, updates);

            Alert.alert("Başarılı", "Etkinlik başarıyla güncellendi.");
            router.back();
        } catch (error) {
            console.error("Etkinlik güncellenirken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlik güncellenirken bir hata oluştu.");
        }
    };

    const onChangeTime = (event, selectedTime) => {
        if (selectedTime) {
            setEventTime(selectedTime);
        }
        setShowTimePicker(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FDFD96", "#FFEA00"]} style={styles.background}>
                <View style={styles.fixedHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Etkinlik Düzenle</Text>
                </View>

                <View style={styles.scrollableContent}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Etkinlik İsmi</Text>
                            <TextInput style={styles.input} value={eventTittle} onChangeText={setEventTittle} placeholder="Etkinlik ismini girin" />

                            <Text style={styles.label}>Etkinlik Türü</Text>
                            <View style={styles.dropdownContainer}>
                                {eventTypes.map((type) => (
                                    <TouchableOpacity key={type} style={[styles.dropdownItem, eventType === type && styles.dropdownItemSelected]} onPress={() => setEventType(type)}>
                                        <Text style={[styles.dropdownText, eventType === type && styles.dropdownTextSelected]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            
                            <Text style={styles.label}>Etkinlik Konumu</Text>
                            <TextInput style={styles.input} value={eventLocation} onChangeText={setEventLocation} placeholder="Konum girin" />

                            <Text style={styles.label}>Etkinlik Tarihi</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                                <Text style={styles.dateText}>{eventDate.toISOString().split("T")[0]}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={eventDate}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) setEventDate(selectedDate);
                                    }}
                                />
                            )}

                            <Text style={styles.label}>Etkinlik Saati</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
                                <Text style={styles.dateText}>
                                    {eventTime instanceof Date && !isNaN(eventTime) 
                                        ? eventTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) 
                                        : "Saat Seç"}
                                </Text>
                            </TouchableOpacity>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={eventTime instanceof Date && !isNaN(eventTime) ? eventTime : new Date(1970, 0, 1, 12, 0, 0)} 
                                    mode="time"
                                    display="default"
                                    onChange={onChangeTime}
                                />
                            )}

                            <Text style={styles.label}>Katılımcı Sınırı</Text>
                            <TextInput style={styles.input} value={eventLimit} onChangeText={setEventLimit} keyboardType="numeric" placeholder="Sınır girin" />

                            <Text style={styles.label}>Etkinlik Puanı</Text>
                            <TextInput
                                style={styles.input}
                                value={eventScore}
                                onChangeText={setEventScore} 
                                placeholder="Etkinlik puanı"
                            />

                            <Text style={styles.label}>Etkinlik Açıklaması</Text>
                            <TextInput style={styles.textArea} value={eventStatement} onChangeText={setEventStatement} placeholder="Açıklama girin" />

                            <Text style={styles.label}>Yayın Türü</Text>
                            <View style={styles.dropdownContainer}>
                                {publishTypes.map((type, index) => (
                                    <TouchableOpacity 
                                        key={type} 
                                        style={[styles.dropdownItem, eventPublish === (index === 0 ? "1" : "0") && styles.dropdownItemSelected]} 
                                        onPress={() => setEventPublish(index === 0 ? "1" : "0")}
                                    >
                                        <Text style={[styles.dropdownText, eventPublish === (index === 0 ? "1" : "0") && styles.dropdownTextSelected]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                        </View>
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}