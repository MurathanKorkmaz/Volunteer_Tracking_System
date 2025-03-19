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
import styles from "./admineventsEdit2.style";
import { collection, doc, setDoc, addDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function admineventsEdit2() {
    const router = useRouter();

    const [eventTittle, setEventTittle] = useState("");
    const [eventDate, setEventDate] = useState(new Date());
    const [eventTime, setEventTime] = useState(new Date());
    const [eventLimit, setEventLimit] = useState("");
    const [eventStatement, setEventStatement] = useState("");
    const [eventType, setEventType] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventPublish, setEventPublish] = useState("1"); // Varsayılan olarak Yayınla seçili
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [eventScore, setEventScore] = useState(""); // Etkinlik puanı
    
    const formatDateTime = (date) => {
        return date.getFullYear() + "-" +
            (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
            date.getDate().toString().padStart(2, "0") + "-" +
            date.getHours().toString().padStart(2, "0") + "-" +
            date.getMinutes().toString().padStart(2, "0") + "-" +
            date.getSeconds().toString().padStart(2, "0");
    };
    
    const eventCreatedAt = formatDateTime(new Date()); // Etkinliğin oluşturulma tarihi

    const eventTypes = ["Spor", "Kahvaltı", "Eğitim", "Workshop"];
    const publishTypes = ["Yayınla", "Yayından Kaldır"]; // Yayın türü seçenekleri

    const handleSave = async () => {
        if (!eventTittle || !eventLimit || !eventStatement || !eventType || !eventLocation || eventPublish === "" || !eventScore) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }
    
        try {
            const eventYear = eventDate.getFullYear().toString();
            const eventMonth = (eventDate.getMonth() + 1).toString().padStart(2, "0");

            // `events` koleksiyonuna yeni belge ekle ve Firestore tarafından atanan ID'yi al
            const newEvent = {
                eventCategory: eventType,
                eventDate: eventDate.toISOString().split("T")[0],
                eventTime: eventTime.toTimeString().split(" ")[0],
                eventLimit: eventLimit,
                eventApplyCounter: "0",
                eventNonApplyCounter: "0",
                eventPublish: eventPublish,
                eventStatement: eventStatement,
                eventTittle: eventTittle,
                eventLocation: eventLocation,
                eventScore: eventScore,
                eventCreatedAt: eventCreatedAt,
            };

            // `events` koleksiyonuna yıl > ay > etkinlik bazında ekle
            const eventsRef = collection(db, "events", eventYear, eventMonth);
            const newDocRef = await addDoc(eventsRef, newEvent);
    
            // `pastEvents` koleksiyonuna yıl > ay > etkinlik bazında ekle
            const pastEventsRef = collection(db, "pastEvents", eventYear, eventMonth);
            await setDoc(doc(pastEventsRef, newDocRef.id), newEvent);
    
            Alert.alert("Başarılı", "Etkinlik başarıyla oluşturuldu ve geçmiş etkinliklere eklendi.");
            router.back();
        } catch (error) {
            console.error("Etkinlik kaydedilirken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlik kaydedilirken bir hata oluştu.");
        }
    };
    

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) setEventDate(selectedDate);
    };

    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) setEventTime(selectedTime);
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FDFD96", "#FFEA00"]} style={styles.background}>
                <View style={styles.fixedHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Etkinlik Ekle</Text>
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
                            <TextInput style={styles.input} value={eventLocation} onChangeText={setEventLocation} placeholder="Etkinlik konumunu girin" />

                            <Text style={styles.label}>Etkinlik Tarihi</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                                <Text style={styles.dateText}>{eventDate.toISOString().split("T")[0]}</Text>
                            </TouchableOpacity>
                            {showDatePicker && <DateTimePicker value={eventDate} mode="date" display="default" onChange={onChangeDate} />}

                            <Text style={styles.label}>Etkinlik Saati</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
                                <Text style={styles.dateText}>{eventTime.toTimeString().split(" ")[0]}</Text>
                            </TouchableOpacity>
                            {showTimePicker && <DateTimePicker value={eventTime} mode="time" display="default" onChange={onChangeTime} />}

                            <Text style={styles.label}>Katılımcı Sınırı</Text>
                            <TextInput style={styles.input} value={eventLimit} onChangeText={setEventLimit} keyboardType="numeric" placeholder="Katılımcı sınırını girin" />

                            <Text style={styles.label}>Etkinlik Puanı</Text>
                            <TextInput 
                                style={styles.input} 
                                value={eventScore} 
                                onChangeText={setEventScore} 
                                keyboardType="numeric" 
                                placeholder="Etkinlik puanını girin" 
                            />

                            <Text style={styles.label}>Etkinlik Açıklaması</Text>
                            <TextInput style={styles.textArea} value={eventStatement} onChangeText={text => setEventStatement(text.slice(0, 150))} placeholder="Etkinlik açıklamasını girin (max 150 karakter)" maxLength={150} />

                            <Text style={styles.label}>Yayın Türü</Text>
                            <View style={styles.dropdownContainer}>
                                {publishTypes.map((type, index) => (
                                    <TouchableOpacity 
                                        key={type} 
                                        style={[styles.dropdownItem, eventPublish === (index === 0 ? "1" : "0") && styles.dropdownItemSelected]} 
                                        onPress={() => {
                                            if (type === "Yayınla") {
                                                setEventPublish("1"); // Yayınla seçiliyse 1 yap
                                            } else if (type === "Yayından Kaldır") {
                                                setEventPublish("0"); // Yayından kaldır seçiliyse 0 yap
                                            }
                                        }} 
                                    >
                                        <Text style={[styles.dropdownText, eventPublish === (index === 0 ? "1" : "0") && styles.dropdownTextSelected]}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Etkinlik  Ekle</Text>
                </TouchableOpacity>
            </LinearGradient>
        </SafeAreaView>
    );
}