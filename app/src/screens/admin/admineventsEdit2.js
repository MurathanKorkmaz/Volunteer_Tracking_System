import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import styles from "./admineventsEdit2.style";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function admineventsEdit2() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const initialX = params.from === "events" ? screenWidth : 0;
    const translateX = useRef(new Animated.Value(initialX)).current;


    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleBack = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
    }, [navigation]);

    const [eventTittle, setEventTittle] = useState("");
    const [eventDate, setEventDate] = useState(new Date());
    const [eventTime, setEventTime] = useState(new Date());
    const [eventLimit, setEventLimit] = useState("");
    const [eventStatement, setEventStatement] = useState("");
    const [eventType, setEventType] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventPublish, setEventPublish] = useState("1");
    const [eventScore, setEventScore] = useState("");

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const eventTypes = ["Toplantı", "Etkinlik", "Eğitim", "Workshop"];
    const publishTypes = ["Yayında", "Yayında Değil"];

    const formatDateTime = (date) => {
        return date.getFullYear() + "-" +
            (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
            date.getDate().toString().padStart(2, "0") + "-" +
            date.getHours().toString().padStart(2, "0") + "-" +
            date.getMinutes().toString().padStart(2, "0") + "-" +
            date.getSeconds().toString().padStart(2, "0");
    };

    const eventCreatedAt = formatDateTime(new Date());

    const handleSave = async () => {
        if (!eventTittle || !eventLimit || !eventStatement || !eventType || !eventLocation || eventPublish === "" || !eventScore) {
            Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
            return;
        }

        try {
            const eventYear = eventDate.getFullYear().toString();
            const eventMonth = (eventDate.getMonth() + 1).toString().padStart(2, "0");

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

            const eventsRef = collection(db, "events", eventYear, eventMonth);
            const newDocRef = await addDoc(eventsRef, newEvent);

            const pastEventsRef = collection(db, "pastEvents", eventYear, eventMonth);
            await setDoc(doc(pastEventsRef, newDocRef.id), newEvent);

            Alert.alert("Başarılı", "Etkinlik başarıyla oluşturuldu ve geçmiş etkinliklere eklendi.");
            router.replace("./adminevents");
        } catch (error) {
            console.error("Etkinlik kaydedilirken hata oluştu:", error);
            Alert.alert("Hata", "Etkinlik kaydedilirken bir hata oluştu.");
        }
    };

    const onChangeTime = (event, selectedTime) => {
        if (selectedTime) {
            setEventTime(selectedTime);
        }
        setShowTimePicker(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{ flex: 1, transform: [{ translateX }] }}
                >
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                    >

                        <View style={styles.fixedHeader}>
                            <Text style={styles.headerText}>Etkinlik Oluştur</Text>
                        </View>

                        <ScrollView 
                            style={styles.scrollableContent}
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                        >
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
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
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
                                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                                    <Text style={styles.dateText}>
                                        {eventTime instanceof Date && !isNaN(eventTime) ?
                                            eventTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) :
                                            "Saat Seç"}
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
                                <TextInput style={styles.input} value={eventScore} onChangeText={setEventScore} keyboardType="numeric" placeholder="Etkinlik puanı" />

                                <Text style={styles.label}>Etkinlik Açıklaması</Text>
                                <TextInput style={styles.textArea} value={eventStatement} onChangeText={text => setEventStatement(text.slice(0, 150))} placeholder="Açıklama girin (max 150 karakter)" maxLength={150} multiline={true} />

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
                                
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                        <Text style={styles.saveButtonText}>Etkinlik Oluştur</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
