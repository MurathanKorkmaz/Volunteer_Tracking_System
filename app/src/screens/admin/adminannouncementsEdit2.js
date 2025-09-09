import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    BackHandler,
    LogBox,
} from "react-native";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig"; 
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import styles from "./adminannouncementsEdit2.style";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    // MessageModal state + tek noktadan çağırma helper'ı
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

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            // Başlangıç değerlerini ayarla
            setTitle("");
            setVolunteerCount("");
            setStartDate(null);
            setEndDate(null);
            setDescription("");
            setEventStatus("1");
        } catch (error) {
            console.error("Veriler yüklenirken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    React.useEffect(() => {
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

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchInitialData();
    }, []);

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

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
            showMessage({
                title: "Geçersiz Tarih",
                message: "Başlangıç tarihi bugünden önce olamaz!",
                type: "warning",
            });
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
            showMessage({
                title: "Geçersiz Tarih",
                message: "Bitiş tarihi, başlangıç tarihinden en az 1 gün sonra olmalıdır!",
                type: "warning",
            });
            return;
        }
    
        setShowEndDatePicker(false);
        setEndDate(chosenDate);
    };
    

    const handleSave = async () => {
        // 1. Boş alan kontrolü
        if (!title || !volunteerCount || !startDate || !endDate || !description || !eventStatus) {
            showMessage({
                title: "Hata",
                message: "Lütfen tüm alanları doldurunuz!",
                type: "error",
            });
            return;
        }
    
        // 2. Tarih doğrulaması (Bitiş tarihi, başlangıç tarihinden önce olamaz)
        if (new Date(endDate) <= new Date(startDate)) {
            showMessage({
                title: "Hata",
                message: "Bitiş tarihi, başlangıç tarihinden en az 1 gün sonra olmalıdır!",
                type: "error",
            });
            return;
        }
    
        try {
            setHasDbError(false);
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
    
            showMessage({
                title: "Başarılı",
                message: "Duyuru başarıyla eklendi ve geçmiş duyurulara kaydedildi!",
                type: "success",
                onPrimary: () => {
                    setMsgVisible(false);
                    router.back();
                },
            });
        } catch (error) {
            console.error("Duyuru ekleme hatası:", error);
            setHasDbError(true);
        }
    };
    

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                handleSave();
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
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => {
                                        setRefreshing(true);
                                        fetchInitialData();
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
                            )}
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