import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    LogBox,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import MessageModal from "../../components/MessageModal";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminAttendanceEdit.style";
import { useNavigation } from "@react-navigation/native";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function AdminAttendanceEdit() {
    const router = useRouter();
    const navigation = useNavigation();
    const { id, score, year, month } = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [participants, setParticipants] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
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

    const handleBack = () => {
        router.back();
    };

    const handleAccept = async (participantId) => {
        try {
            const participantRef = doc(db, "events", year, month, id, "Particant", participantId);
            const pastParticipantRef = doc(db, "pastEvents", year, month, id, "Particant", participantId);
            const participantSnap = await getDoc(participantRef);
    
            if (participantSnap.exists()) {
                const participantData = participantSnap.data();
                const currentState = parseInt(participantData.State || "0", 10);
    
                if (currentState !== 0) {
                    showMessage({
                        title: "Uyarı",
                        message: "Bu kişinin seçimi zaten yapılmış.",
                        type: "warning",
                    });
                    return;
                }
    
                const guestRef = doc(db, "guests", participantId);
                const guestSnap = await getDoc(guestRef);
    
                if (guestSnap.exists()) {
                    const guestData = guestSnap.data();
                    const currentRating = parseInt(guestData.rating || "0", 10);
                    const currentRatingCounter = parseInt(guestData.ratingCounter || "0", 10);
    
                    const eventScore = parseInt(score || "0", 10);
    
                    const newRating = currentRating + eventScore;
                    const newRatingCounter = currentRatingCounter + 1;
    
                    const pastEventsSnapshot = await getDocs(collection(db, "pastEvents", year, month));
                    let totalPublishedEvents = 0;
    
                    pastEventsSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (parseInt(data.eventPublish) === 1) {
                            totalPublishedEvents++;
                        }
                    });
    
                    let newTurnout = 0;
                    if (totalPublishedEvents > 0) {
                        newTurnout = Math.round((newRatingCounter / totalPublishedEvents) * 100);
                    }
    
                    await updateDoc(guestRef, {
                        rating: newRating.toString(),
                        ratingCounter: newRatingCounter.toString(),
                        turnout: newTurnout.toString()
                    });
    
                    console.log(`Onayla: Rating, RatingCounter ve Turnout güncellendi!`);
                } else {
                    console.error("Kullanıcı bulunamadı:", participantId);
                }
    
                // State = 1 yap (hem events hem pastEvents altında)
                await updateDoc(participantRef, { State: 1 });
                await updateDoc(pastParticipantRef, { State: 1 });
    
                // Ekranda kart güncelle
                setParticipants(prev =>
                    prev.map(p =>
                        p.id === participantId ? { ...p, state: 1 } : p
                    )
                );
            }
        } catch (error) {
            console.error("Onaylama hatası:", error);
            setHasDbError(true);
        }
    };
    
    
    const handleReject = async (participantId) => {
        try {
            const participantRef = doc(db, "events", year, month, id, "Particant", participantId);
            const pastParticipantRef = doc(db, "pastEvents", year, month, id, "Particant", participantId);
            const participantSnap = await getDoc(participantRef);
    
            if (participantSnap.exists()) {
                const participantData = participantSnap.data();
                const currentState = parseInt(participantData.State || "0", 10);
    
                if (currentState !== 0) {
                    showMessage({
                        title: "Uyarı",
                        message: "Bu kişinin seçimi zaten yapılmış.",
                        type: "warning",
                    });
                    return;
                }
    
                const guestRef = doc(db, "guests", participantId);
                const guestSnap = await getDoc(guestRef);
    
                if (guestSnap.exists()) {
                    const guestData = guestSnap.data();
                    const currentRating = parseInt(guestData.rating || "0", 10);
    
                    const eventScore = parseInt(score || "0", 10);
    
                    const newRating = currentRating - eventScore;
    
                    await updateDoc(guestRef, {
                        rating: newRating.toString()
                    });
    
                    console.log(`Reddet: Sadece Rating güncellendi!`);
                } else {
                    console.error("Kullanıcı bulunamadı:", participantId);
                }
    
                // State = 2 yap (hem events hem pastEvents altında)
                await updateDoc(participantRef, { State: 2 });
                await updateDoc(pastParticipantRef, { State: 2 });
    
                // Ekranda kart güncelle
                setParticipants(prev =>
                    prev.map(p =>
                        p.id === participantId ? { ...p, state: 2 } : p
                    )
                );
            }
        } catch (error) {
            console.error("Reddetme hatası:", error);
            setHasDbError(true);
        }
    };
    
    

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            setHasDbError(false);
            const particantRef = collection(db, "events", year, month, id, "Particant");
            const particantSnap = await getDocs(particantRef);

            const particantList = particantSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().Name || "(İsimsiz)",
                state: doc.data().State !== undefined ? parseInt(doc.data().State, 10) : 0
            }));

            setParticipants(particantList);
        } catch (error) {
            console.error("Katılımcılar alınırken hata oluştu:", error);
            setHasDbError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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

    useEffect(() => {
        // Gesture'ı etkinleştir ama kendi animasyonunu devre dışı bırak
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        // Giriş animasyonunu başlat
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        if (!id || !year || !month) return;

        fetchParticipants();
    }, [id, year, month, navigation, screenWidth]);

    return (
        <SafeAreaView style={styles.container}>
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchParticipants();
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
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Katılımcılar</Text>
                    </View>

                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    ></TouchableOpacity>

                    <ScrollView 
                        contentContainerStyle={styles.scrollableList}
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
                        ) : participants.length > 0 ? (
                            participants.map((participant) => (
                                <View
                                    key={participant.id}
                                    style={[
                                        styles.eventCard,
                                        participant.state === 1
                                            ? { backgroundColor: "#d4edda" }
                                            : participant.state === 2
                                            ? { backgroundColor: "#f8d7da" }
                                            : {}
                                    ]}
                                >
                                    <Text style={styles.eventName}>{participant.name}</Text>

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(participant.id)}>
                                            <Text style={styles.buttonText}>Onayla</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(participant.id)}>
                                            <Text style={styles.buttonText}>Reddet</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.loadingText}>Katılımcı bulunamadı.</Text>
                        )}
                    </ScrollView>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}