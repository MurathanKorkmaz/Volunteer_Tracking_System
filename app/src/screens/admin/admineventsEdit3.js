import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Animated,
    Dimensions,
    ActivityIndicator,
    RefreshControl,
    LogBox,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./admineventsEdit3.style";
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function adminEventsEdit3() {
    const router = useRouter();
    const navigation = useNavigation();
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
        router.back();
    };

    const [applicants, setApplicants] = useState([]);
    const [nonApplicants, setNonApplicants] = useState([]);
    const [activeTab, setActiveTab] = useState("applicants");
    const [searchText, setSearchText] = useState("");
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [filteredNonApplicants, setFilteredNonApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
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

    const fetchParticipants = async () => {
        if (!params.id || !params.year || !params.month) return;

        try {
            setLoading(true);
            setHasDbError(false);
            const particantRef = collection(db, "events", params.year, params.month, params.id, "Particant");
            const nonParticantRef = collection(db, "events", params.year, params.month, params.id, "NonParticant");

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
            setFilteredApplicants(applicantsList);
            setFilteredNonApplicants(nonApplicantsList);
        } catch (error) {
            console.error("Başvuru verileri çekilirken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, [params.id, params.year, params.month]);

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

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all people in both lists
        if (!text.trim()) {
            setFilteredApplicants(applicants);
            setFilteredNonApplicants(nonApplicants);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter function that checks if all search terms are in the person's name
        const filterBySearchTerms = (person) => {
            if (!person.name || typeof person.name !== "string") {
                return false;
            }
            const personName = person.name.toLowerCase();
            return searchTerms.every(term => personName.includes(term));
        };

        // Apply filters to both lists
        setFilteredApplicants(applicants.filter(filterBySearchTerms));
        setFilteredNonApplicants(nonApplicants.filter(filterBySearchTerms));
    };

    // Get the current active list based on the tab
    const currentList = activeTab === "applicants" ? filteredApplicants : filteredNonApplicants;

    const handleDelete = async (personId) => {
        try {
            const isApplicant = activeTab === "applicants";
            const collectionName = isApplicant ? "Particant" : "NonParticant";
            const counterField = isApplicant ? "eventApplyCounter" : "eventNonApplyCounter";
    
            await deleteDoc(doc(db, "events", params.year, params.month, params.id, collectionName, personId));
            await deleteDoc(doc(db, "pastEvents", params.year, params.month, params.id, collectionName, personId));
    
            if (isApplicant) {
                setApplicants((prev) => prev.filter(person => person.id !== personId));
            } else {
                setNonApplicants((prev) => prev.filter(person => person.id !== personId));
    
                console.log(`Kullanıcı ${personId} Başvurmayanlar kısmında olduğu için sadece silindi, eventNonApplyCounter azaltılıyor...`);
    
                const eventRef = doc(db, "events", params.year, params.month, params.id);
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
    
                const pastEventRef = doc(db, "pastEvents", params.year, params.month, params.id);
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
    
                showMessage({
                    title: "Başarılı",
                    message: "Kullanıcı başarıyla silindi.",
                    type: "success",
                });
                return;
            }
    
            const eventRef = doc(db, "events", params.year, params.month, params.id);
            const eventDoc = await getDoc(eventRef);
    
            if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                if (eventData[counterField] > 0) {
                    await updateDoc(eventRef, {
                        [counterField]: eventData[counterField] - 1
                    });
                }
            }
    
            const pastEventRef = doc(db, "pastEvents", params.year, params.month, params.id);
            const pastEventDoc = await getDoc(pastEventRef);
    
            if (pastEventDoc.exists()) {
                const pastEventData = pastEventDoc.data();
                if (pastEventData[counterField] > 0) {
                    await updateDoc(pastEventRef, {
                        [counterField]: pastEventData[counterField] - 1
                    });
                }
            }
    
            let userCollection = "guests";
            let userDocRef = doc(db, "guests", personId);
            let userDoc = await getDoc(userDocRef);
    
            console.log(`Kullanıcı ${personId} için Guests koleksiyonunda arama yapılıyor...`);
    
            if (!userDoc.exists()) {
                console.log(`Kullanıcı ${personId} Guests koleksiyonunda bulunamadı. Admin koleksiyonunda aranıyor...`);
                userCollection = "admin";
                userDocRef = doc(db, "admin", personId);
                userDoc = await getDoc(userDocRef);
            }
    
            if (!userDoc.exists()) {
                console.error(`Hata: Kullanıcı ${personId} veritabanında bulunamadı.`);
                showMessage({
                    title: "Hata",
                    message: "Kullanıcı bulunamadı.",
                    type: "error",
                });
                return;
            } else {
                console.log(`Kullanıcı ${personId} bulundu. Koleksiyon: ${userCollection}`);
            }
    
            const userData = userDoc.data();
            const currentRating = userData.rating ? parseInt(userData.rating) : 0;
            const currentRatingCounter = userData.ratingCounter ? parseInt(userData.ratingCounter) : 0;
    
            console.log(`Mevcut Rating: ${currentRating}`);
            console.log(`Mevcut Rating Counter: ${currentRatingCounter}`);
    
            const eventDocRef = doc(db, "events", params.year, params.month, params.id);
            const eventDocSnap = await getDoc(eventDocRef);
            const eventScore = eventDocSnap.exists() ? parseInt(eventDocSnap.data().eventScore) : 0;
    
            const pastEventDocRef = doc(db, "pastEvents", params.year, params.month, params.id);
            const pastEventDocSnap = await getDoc(pastEventDocRef);
            const pastEventScore = pastEventDocSnap.exists() ? parseInt(pastEventDocSnap.data().eventScore) : 0;
    
            const eventsSnapshot = await getDocs(collection(db, "events", params.year, params.month));
            let totalPublishedEvents = 0;
    
            eventsSnapshot.forEach(eventDoc => {
                const eventData = eventDoc.data();
                if (parseInt(eventData.eventPublish) === 1) {
                    totalPublishedEvents++;
                }
            });
    
            console.log(`Event Score: ${eventScore}`);
            console.log(`Total Published Events: ${totalPublishedEvents}`);
    
            const newRating = Math.max(0, currentRating - eventScore);
            const newRatingCounter = Math.max(0, currentRatingCounter - 1);
            const newTurnout = totalPublishedEvents > 0 ? parseInt((newRatingCounter / totalPublishedEvents) * 100) : 0;
    
            console.log(`Yeni Rating: ${newRating}`);
            console.log(`Yeni Rating Counter: ${newRatingCounter}`);
            console.log(`Yeni Turnout: ${newTurnout}`);
    
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
    
            showMessage({
                title: "Başarılı",
                message: "Kullanıcı başarıyla silindi ve başvuru bilgileri güncellendi.",
                type: "success",
            });
        } catch (error) {
            console.error("Silme işlemi başarısız:", error);
            showMessage({
                title: "Hata",
                message: "Silme işlemi başarısız oldu.",
                type: "error",
            });
        }
    };
    
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
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchParticipants();
            }} />}
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >

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
                        <View style={styles.header}>
                            <Text style={styles.headerText}>Etkinlik Detayları</Text>
                        </View>

                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.backIcon}>{"<"}</Text>
                        </TouchableOpacity>
                        

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="İsim ara..."
                                placeholderTextColor="#888"
                                value={searchText}
                                onChangeText={handleSearch}
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

                        <View style={[styles.scrollableList, { flex: 1 }]}>
                            <ScrollView
                                contentContainerStyle={{ flexGrow: 1 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={() => {
                                            setRefreshing(true);
                                            fetchParticipants();
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
                                ) : currentList.length > 0 ? (
                                    currentList.map(renderPerson)
                                ) : (
                                    <Text style={styles.emptyText}>
                                        {activeTab === "applicants" ? "Başvuran bulunmamaktadır." : "Başvurmayan bulunmamaktadır."}
                                    </Text>
                                )}
                            </ScrollView>
                        </View>

                        {/* Başvuru Sayısını Gösteren Bilgilendirme Alanı - Klavye açıkken gizle */}
                        {!isKeyboardVisible && (
                            <View style={styles.counterContainer}>
                                <Text style={styles.counterText}>
                                    {activeTab === "applicants"
                                        ? `Başvuran sayısı: ${filteredApplicants.length} kişi`
                                        : `Başvurmayan sayısı: ${filteredNonApplicants.length} kişi`}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                </LinearGradient>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}