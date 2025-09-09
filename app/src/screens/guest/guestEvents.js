import { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
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
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import styles from "./guestEvents.style";
import { useRouter, useLocalSearchParams } from "expo-router";
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function GuestEvents() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId, userName, userAuthority } = useLocalSearchParams();
    const userCollection = userAuthority === "3" ? "personal" : "guests";
    const screenWidth = Dimensions.get("window").width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // 📌 Kullanıcının seçtiği tarih
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false); // 📌 Tarih seçici görünürlüğü
    const [registeredEvents, setRegisteredEvents] = useState([]); // Kullanıcının kayıtlı olduğu etkinlikler
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [reason, setReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        setSelectedDate(date);
        hideDatePicker();
        fetchEvents(); // Yeni tarih seçildiğinde etkinlikleri güncelle
    };

    // Bakım modu kontrolü için useEffect
    useEffect(() => {
        const docRef = doc(db, "appSettings", "status");
        
        // Firestore'dan gerçek zamanlı dinleme başlat
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                console.log("Bakım modu değişikliği algılandı:", docSnap.data());
                setMaintenanceMode(docSnap.data().maintenanceMode === true);
            }
        }, (error) => {
            console.error("Maintenance mode listener error:", error);
        });

        // Cleanup: listener'ı kapat
        return () => unsubscribe();
    }, []);

    // maintenanceMode state'ini izle
    useEffect(() => {
        console.log("maintenanceMode state değişti:", maintenanceMode);
    }, [maintenanceMode]);

    // Block durumu kontrolü için useEffect
    useEffect(() => {
        if (!userId) return;

        const userDocRef = doc(db, userCollection, userId);
        
        const unsubscribeBlock = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const isUserBlocked = userData.block === "1";
                setIsBlocked(isUserBlocked);
            }
        }, (error) => {
            console.error("Block status listener error:", error);
        });

        return () => unsubscribeBlock();
    }, [userId, userCollection]);

    const handleExitApp = () => {
        console.log("Çıkış yapılıyor...");
        BackHandler.exitApp();
    };

    // Block durumunda çıkış işlemi
    const handleBlockExit = () => {
        // Navigation stack'i tamamen temizle ve ana sayfaya git
        navigation.reset({
            index: 0,
            routes: [{ name: 'index' }], // Ana route'a dön
        });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Eğer kullanıcı bloklu ise navigation'ı engelle
            if (isBlocked) return;
            
            // Prevent default behavior
            e.preventDefault();

            // Run our custom animation
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                // After animation complete, continue with navigation
                navigation.dispatch(e.data.action);
            });
        });

        // Initial animation when screen mounts
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        // Enable gesture navigation
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
        });

        fetchEvents();
        fetchUserRegisteredEvents();

        return unsubscribe;
    }, [navigation, selectedDate, isBlocked]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

            console.log("Seçilen Tarih:", selectedDate);
            console.log("Yıl:", selectedYear);
            console.log("Ay:", selectedMonth);
            console.log("Tam Yol:", `events/${selectedYear}/${selectedMonth}`);

            const eventsRef = collection(db, "events", selectedYear, selectedMonth);
            const eventsSnapshot = await getDocs(eventsRef);

            console.log("Snapshot boş mu?", eventsSnapshot.empty);
            console.log("Bulunan döküman sayısı:", eventsSnapshot.size);

            if (eventsSnapshot.empty) {
                console.log("Seçilen ayda etkinlik bulunamadı.");
                setEvents([]); 
                setFilteredEvents([]);
                return;
            }

            // Tüm ham verileri göster
            eventsSnapshot.docs.forEach(doc => {
                console.log("Döküman ID:", doc.id);
                console.log("Tüm Veri:", JSON.stringify(doc.data(), null, 2));
            });

            const eventsList = eventsSnapshot.docs
                .filter(doc => {
                    const eventPublish = String(doc.data().eventPublish);
                    console.log("EventPublish değeri:", eventPublish);
                    return eventPublish === "1";
                })
                .map(doc => ({
                    id: doc.id,
                    title: doc.data().eventTittle,
                    date: doc.data().eventDate,
                    time: doc.data().eventTime,
                    limit: doc.data().eventLimit,
                    applyCount: doc.data().eventApplyCounter,
                }));
            
            console.log("Filtrelenmiş etkinlik listesi:", eventsList);
            
            setEvents(eventsList);
            setFilteredEvents(eventsList);
        } catch (error) {
            console.error("Etkinlik verileri alınırken hata oluştu:", error);
            console.error("Hata detayı:", error.message);
            setHasDbError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRegisteredEvents = async () => {
        try {
            setHasDbError(false);
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

            const eventsRef = collection(db, "events", selectedYear, selectedMonth);
            const eventsSnapshot = await getDocs(eventsRef);

            const registeredEvents = eventsSnapshot.docs
            .filter(doc => doc.data().eventApplyCounter > 0)
            .map(doc => ({
                id: doc.id,
                title: doc.data().eventTittle,
                date: doc.data().eventDate,
                time: doc.data().eventTime,
                limit: doc.data().eventLimit,
                applyCount: doc.data().eventApplyCounter,
            }));
            
            setRegisteredEvents(registeredEvents);
        } catch (error) {
            console.error("Kullanıcının kayıtlı olduğu etkinlikleri alınırken hata oluştu:", error.message);
            setHasDbError(true);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (!text.trim()) {
            setFilteredEvents(events); // Show all events when search is empty
            return;
        }
        const searchTerm = text.toLowerCase().trim();
        const filtered = events.filter((event) =>
            event.title.toLowerCase().includes(searchTerm)
        );
        setFilteredEvents(filtered);
    };

    const handleApplyEvent = async (event) => {
        try {
            setHasDbError(false);
            if (!event || !event.title) {
                showMessage({
                    title: "Hata",
                    message: "Etkinlik bilgisi eksik. Lütfen tekrar deneyin.",
                    type: "error",
                });
                return;
            }
            
            console.log(`Başvuru işlemi başlatıldı: Etkinlik ID: ${event.id}, Kullanıcı ID: ${userId}, Kullanıcı Adı: ${userName}`);
            
            if (!userId || !userName) {
                console.error("Başvuru başarısız: userId veya userName eksik!");
                showMessage({
                    title: "Hata",
                    message: "Kullanıcı bilgileri eksik. Lütfen tekrar giriş yapın.",
                    type: "error",
                });
                return;
            }
    
            if (parseInt(event.applyCount, 10) >= parseInt(event.limit, 10)) {
                showMessage({
                    title: "Kontenjan Doldu",
                    message: "Etkinliğin kontenjan sayısı dolmuştur.",
                    type: "warning",
                });
                return;
            }
    
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            const participantRef = doc(db, "events", selectedYear, selectedMonth, event.id, "Particant", userId);
            const pastParticipantRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id, "Particant", userId);
    
            const participantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "Particant"));
            const nonParticipantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "NonParticant"));
    
            const isUserAlreadySelected =
                participantSnap.docs.some((doc) => doc.id === userId) ||
                nonParticipantSnap.docs.some((doc) => doc.id === userId);
    
            if (isUserAlreadySelected) {
                showMessage({
                    title: "Bilgilendirme",
                    message: "Etkinlik için seçiminizi zaten yapmışsınız.",
                    type: "info",
                });
                return;
            }
    
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}--${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    
            await setDoc(participantRef, { 
                Name: userName,
                appliedAt: formattedDate,
                State: "0",
                authority: userAuthority,
            });
    
            await setDoc(pastParticipantRef, { 
                Name: userName,
                appliedAt: formattedDate,
                State: "0",
                authority: userAuthority,
            });
    
            const eventRef = doc(db, "events", selectedYear, selectedMonth, event.id);
            const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id);
    
            const newApplyCount = (parseInt(event.applyCount, 10) + 1);
    
            await updateDoc(eventRef, {
                eventApplyCounter: newApplyCount
            });
    
            await updateDoc(pastEventRef, {
                eventApplyCounter: newApplyCount
            });
    
            console.log(`Başvuru sayısı güncellendi: Yeni Değer = ${newApplyCount}`);
    
            setEvents((prevEvents) =>
                prevEvents.map((e) =>
                    e.id === event.id ? { ...e, applyCount: newApplyCount } : e
                )
            );
    
            showMessage({
                title: "Başarı",
                message: `${event?.title || "Etkinlik"} etkinliğine başarıyla katıldınız!`,
                type: "success",
            });
        } catch (error) {
            console.error("Başvuru yapılırken hata oluştu:", error.message);
            setHasDbError(true);
        }
    };
    
    const handleDeclineEvent = async (event) => {
        try {
            setHasDbError(false);
            console.log(`Katılmama tercihi başlatıldı: Etkinlik ID: ${event.id}, Kullanıcı ID: ${userId}, Kullanıcı Adı: ${userName}`);
    
            if (!userId || !userName) {
                showMessage({
                    title: "Hata",
                    message: "Kullanıcı bilgileri eksik. Lütfen tekrar giriş yapın.",
                    type: "error",
                });
                return;
            }
    
            const selectedYear = selectedDate.getFullYear().toString();
            const selectedMonth = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    
            const participantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "Particant"));
            const nonParticipantSnap = await getDocs(collection(db, "events", selectedYear, selectedMonth, event.id, "NonParticant"));
    
            const isUserAlreadySelected =
                participantSnap.docs.some((doc) => doc.id === userId) ||
                nonParticipantSnap.docs.some((doc) => doc.id === userId);
    
            if (isUserAlreadySelected) {
                showMessage({
                    title: "Bilgilendirme",
                    message: "Etkinlik için seçiminizi zaten yapmışsınız.",
                    type: "info",
                });
                return;
            }
    
            const now = new Date();
            const formattedDate = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}--${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    
            const nonParticipantRef = doc(db, "events", selectedYear, selectedMonth, event.id, "NonParticant", userId);
            const pastNonParticipantRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id, "NonParticant", userId);
    
            await setDoc(nonParticipantRef, {
                Name: userName,
                appliedAt: formattedDate,
                State: "0",
                authority: userAuthority,
            });
    
            await setDoc(pastNonParticipantRef, {
                Name: userName,
                appliedAt: formattedDate,
                State: "0",
                authority: userAuthority,
            });
    
            const eventRef = doc(db, "events", selectedYear, selectedMonth, event.id);
            const pastEventRef = doc(db, "pastEvents", selectedYear, selectedMonth, event.id);
    
            const eventDoc = await getDoc(eventRef);
            const pastEventDoc = await getDoc(pastEventRef);
    
            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const currentNonApplyCount = parseInt(eventData.eventNonApplyCounter || 0, 10);
                const newNonApplyCount = currentNonApplyCount + 1;
    
                await updateDoc(eventRef, {
                    eventNonApplyCounter: newNonApplyCount
                });
    
                console.log(`NonParticant sayısı güncellendi: Yeni eventNonApplyCounter = ${newNonApplyCount}`);
    
                setEvents((prevEvents) =>
                    prevEvents.map((e) =>
                        e.id === event.id ? { ...e, eventNonApplyCounter: newNonApplyCount } : e
                    )
                );
            } else {
                console.warn("Hata: Etkinlik bulunamadı (events).");
            }
    
            if (pastEventDoc.exists()) {
                const pastEventData = pastEventDoc.data();
                const currentPastNonApplyCount = parseInt(pastEventData.eventNonApplyCounter || 0, 10);
                const newPastNonApplyCount = currentPastNonApplyCount + 1;
    
                await updateDoc(pastEventRef, {
                    eventNonApplyCounter: newPastNonApplyCount
                });
    
                console.log(`NonParticant sayısı güncellendi (pastEvents): Yeni eventNonApplyCounter = ${newPastNonApplyCount}`);
            } else {
                console.warn("Hata: Etkinlik bulunamadı (pastEvents).");
            }
    
            showMessage({
                title: "Bilgilendirme",
                message: "Etkinliğe katılmama tercihiniz kaydedildi.",
                type: "info",
            });
        } catch (error) {
            console.error("Katılmama tercihi yapılırken hata oluştu:", error.message);
            setHasDbError(true);
        }
    };
    
    const handleBack = () => {
        // Eğer kullanıcı bloklu ise geri dönüşü engelle
        if (isBlocked) {
            handleBlockExit();
            return;
        }
        
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const renderEvent = (event) => (
        <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDetails}>
                <Text style={styles.eventName}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
                <Text style={styles.eventTime}>{event.time}</Text>
                <Text style={styles.eventQuota}>{event.applyCount} / {event.limit}</Text>
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

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEvents();
        await fetchUserRegisteredEvents();
        setRefreshing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchEvents();
                fetchUserRegisteredEvents();
            }} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal visible={isBlocked} onClose={handleBlockExit} />

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
                <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
                    <KeyboardAvoidingView 
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardAvoidingContainer}
                    >
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={handleBack}
                        >
                            <Text style={styles.backIcon}>{"<"}</Text>
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <Text style={styles.headerText}>Gönüllü Etkinlikleri</Text>
                        </View>

                        <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                            <Text style={styles.datePickerText}>
                                {selectedDate ? `${selectedDate.getFullYear()} - ${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}` : "Yıl ve Ay Seç"}
                            </Text>
                        </TouchableOpacity>

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

                        <ScrollView 
                            contentContainerStyle={styles.scrollableList}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                />
                            }
                        >
                            {(searchText ? filteredEvents : events).map(renderEvent)}
                        </ScrollView>

                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                    <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                </View>
                            </View>
                        )}
                    </KeyboardAvoidingView>
                    <View style={[styles.warningContainer, { position: 'absolute', bottom: 0, left: 0, right: 0 }]}>
                            <Text style={styles.warningText}>
                                Başvuru yaptıktan sonra hiçbir şekilde başvurunuzu geri çekemezsiniz, bu yüzden başvururken lütfen dikkat ediniz.
                            </Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}