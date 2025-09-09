import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    BackHandler,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from '../../components/MessageModal';
import { useNavigation } from "@react-navigation/native";
import styles from "./admineventsEdit1.style";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function admineventsEdit1() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const initialX = params.from === "events" ? screenWidth : 0;
    const translateX = useRef(new Animated.Value(initialX)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

    const handleBack = () => {
        router.back();
    };

    const { id, year, month } = params;

    const [eventTittle, setEventTittle] = useState("");
    const [eventDate, setEventDate] = useState(new Date());
    const [eventTime, setEventTime] = useState(new Date());
    const [eventLimit, setEventLimit] = useState("");
    const [eventStatement, setEventStatement] = useState("");
    const [eventType, setEventType] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [eventPublish, setEventPublish] = useState("");
    const [eventScore, setEventScore] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    const [msgVisible, setMsgVisible] = useState(false);
    const [msgProps, setMsgProps] = useState({
        title: "",
        message: "",
        type: "info",          // 'info' | 'success' | 'error' | 'warning'
        primaryText: "Tamam",
        secondaryText: undefined,
        onPrimary: () => setMsgVisible(false),
        onSecondary: undefined,
        dismissable: true,
    });

    const showMessage = ({
        title = "",
        message = "",
        type = "info",
        primaryText = "Tamam",
        onPrimary = () => setMsgVisible(false),
        secondaryText,
        onSecondary,
        dismissable = true,
    }) => {
        setMsgProps({
            title,
            message,
            type,
            primaryText,
            secondaryText,
            onPrimary,
            onSecondary,
            dismissable,
        });
        setMsgVisible(true);
    };

    const eventTypes = ["Toplantı", "Etkinlik", "Eğitim", "Workshop"];
    const publishTypes = ["Yayında", "Yayında Değil"];

    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: false,
        });
    }, [navigation]);

    const fetchEventData = async () => {
        if (!id || !year || !month) return;

        try {
            setLoading(true);
            setHasDbError(false);
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
                setEventPublish(eventData.eventPublish || "0");
                setEventScore(eventData.eventScore || "0");
            } else {
                router.back();
            }
        } catch (error) {
            console.error("Etkinlik verileri alınırken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchEventData();
    }, []);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable);
        });

        return () => unsubscribe();
    }, []);

    const checkConnection = async () => {
        try {
            const state = await NetInfo.fetch();
            setIsConnected(state.isConnected && state.isInternetReachable);
        } catch (error) {
            console.error("Connection check error:", error);
            setIsConnected(false);
        }
    };

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
        if (eventPublish !== originalData.eventPublish) updates.eventPublish = eventPublish;
        if (eventScore.trim() !== originalData.eventScore) updates.eventScore = eventScore.trim();

        if (Object.keys(updates).length === 0) {
            showMessage({
                title: "Bilgi",
                message: "Herhangi bir değişiklik yapılmadı.",
                type: "info",
            });
            return;
        }

        try {
            // **1️⃣ Mevcut "events" koleksiyonundaki veriyi güncelle**
            const eventRef = doc(db, "events", year, month, id);
            await updateDoc(eventRef, updates);

            // **2️⃣ "pastEvents" koleksiyonundaki veriyi de güncelle**
            const pastEventRef = doc(db, "pastEvents", year, month, id);
            await updateDoc(pastEventRef, updates);

            showMessage({
                title: "Başarılı",
                message: "Etkinlik başarıyla güncellendi.",
                type: "success",
            });
            router.back();
        } catch (error) {
            console.error("Etkinlik güncellenirken hata oluştu:", error);
            showMessage({
                title: "Hata",
                message: "Etkinlik güncellenirken bir hata oluştu.",
                type: "error",
            });
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
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchEventData();
            }} />}

            <MessageModal
                visible={msgVisible}
                title={msgProps.title}
                message={msgProps.message}
                type={msgProps.type}
                primaryText={msgProps.primaryText}
                secondaryText={msgProps.secondaryText}
                onPrimary={msgProps.onPrimary}
                onSecondary={msgProps.onSecondary}
                onRequestClose={() => setMsgVisible(false)}
                dismissable={msgProps.dismissable}
            />

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
                            <Text style={styles.headerText}>Etkinlik Düzenle</Text>
                        </View>

                        <ScrollView 
                            style={styles.scrollableContent}
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => {
                                        setRefreshing(true);
                                        fetchEventData();
                                    }}
                                />
                            }
                        >
                            {loading ? (
                                <View style={styles.loadingOverlay}>
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#3B82F6" />
                                        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.inputContainer}>
                                    <Text style={styles.label}>Etkinlik İsmi</Text>
                                    <TextInput style={styles.input} value={eventTittle} onChangeText={setEventTittle} placeholder="Etkinlik ismini girin" editable={!loading}/>

                                    <Text style={styles.label}>Etkinlik Türü</Text>
                                    <View style={styles.dropdownContainer}>
                                        {eventTypes.map((type) => (
                                            <TouchableOpacity key={type} style={[styles.dropdownItem, eventType === type && styles.dropdownItemSelected]} onPress={() => setEventType(type)} disabled={loading}>
                                                <Text style={[styles.dropdownText, eventType === type && styles.dropdownTextSelected]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    
                                    <Text style={styles.label}>Etkinlik Konumu</Text>
                                    <TextInput style={styles.input} value={eventLocation} onChangeText={setEventLocation} placeholder="Konum girin" editable={!loading}/>

                                    <Text style={styles.label}>Etkinlik Tarihi</Text>
                                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput} disabled={loading}>
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
                                    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput} disabled={loading}>
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
                                    <TextInput style={styles.input} value={eventLimit} onChangeText={setEventLimit} keyboardType="numeric" placeholder="Sınır girin" editable={!loading}/>

                                    <Text style={styles.label}>Etkinlik Puanı</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={eventScore}
                                        onChangeText={setEventScore} 
                                        placeholder="Etkinlik puanı"
                                        editable={!loading}
                                    />

                                    <Text style={styles.label}>Etkinlik Açıklaması</Text>
                                    <TextInput style={styles.textArea} value={eventStatement} onChangeText={setEventStatement} placeholder="Açıklama girin" multiline={true} editable={!loading}/>

                                    <Text style={styles.label}>Yayın Türü</Text>
                                    <View style={styles.dropdownContainer}>
                                        {publishTypes.map((type) => (
                                            <TouchableOpacity key={type} style={[styles.dropdownItem, eventPublish === (type === "Yayında" ? "1" : "0") && styles.dropdownItemSelected]} onPress={() => setEventPublish(type === "Yayında" ? "1" : "0")} disabled={loading}>
                                                <Text style={[styles.dropdownText, eventPublish === (type === "Yayında" ? "1" : "0") && styles.dropdownTextSelected]}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                                        <Text style={styles.saveButtonText}>Kaydet</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                        
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backIcon}>{"<"}</Text>
                        </TouchableOpacity>

                    </KeyboardAvoidingView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}