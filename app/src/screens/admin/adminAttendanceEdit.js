import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminAttendanceEdit.style";

export default function AdminAttendanceEdit() {
    const router = useRouter();
    const { id, score, year, month } = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [participants, setParticipants] = useState([]);

    const handleAccept = async (participantId) => {
        try {
            const participantRef = doc(db, "events", year, month, id, "Particant", participantId);
            const pastParticipantRef = doc(db, "pastEvents", year, month, id, "Particant", participantId);
            const participantSnap = await getDoc(participantRef);
    
            if (participantSnap.exists()) {
                const participantData = participantSnap.data();
                const currentState = parseInt(participantData.State || "0", 10);
    
                if (currentState !== 0) {
                    Alert.alert("Uyarı", "Bu kişinin seçimi zaten yapılmış.");
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
                    Alert.alert("Uyarı", "Bu kişinin seçimi zaten yapılmış.");
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
        }
    };
    
    

    useEffect(() => {
        // Start entrance animation
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        if (!id || !year || !month) return;

        const fetchParticipants = async () => {
            try {
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
                Alert.alert("Hata", "Katılımcı bilgileri yüklenemedi.");
                router.back();
            }
        };

        fetchParticipants();
    }, [id, year, month]);


    return (
        <SafeAreaView style={styles.container}>
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

                    <ScrollView contentContainerStyle={styles.scrollableList}>
                        {participants.length > 0 ? (
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