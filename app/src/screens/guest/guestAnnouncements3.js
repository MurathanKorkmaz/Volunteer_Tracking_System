import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./guestAnnouncements3.style";

export default function GuestAnnouncements3() {
    const router = useRouter();
    const [searchText, setSearchText] = useState("");
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const now = new Date();
                const year = now.getFullYear().toString();
                const month = (now.getMonth() + 1).toString().padStart(2, "0");

                const reportRef = collection(db, "pointsReports", year, month);
                const reportSnap = await getDocs(reportRef);

                const participantsList = reportSnap.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name || "İsimsiz",
                    rating: doc.data().rating || "0"
                }));

                participantsList.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
                
                // Add ranks to participants
                participantsList.forEach((participant, index) => {
                    participant.rank = index + 1;
                });
                
                setParticipants(participantsList);
            } catch (error) {
                console.error("❌ Katılım puanları alınırken hata:", error);
            }
        };

        fetchParticipants();
    }, []);

    const filteredParticipants = searchText.trim()
        ? participants.filter(person =>
            person.name.toLowerCase().includes(searchText.toLowerCase().trim())
          )
        : participants;

    const getBorderStyle = (rank) => {
        if (rank === 1) {
            return { borderColor: "#FFD700", borderWidth: 3 }; // Altın
        } else if (rank === 2) {
            return { borderColor: "#C0C0C0", borderWidth: 3 }; // Gümüş
        } else if (rank === 3) {
            return { borderColor: "#CD7F32", borderWidth: 3 }; // Bronz
        } else if (rank <= 10) {
            return { borderColor: "#4169E1", borderWidth: 3 }; // Mavi
        }
        return { borderColor: "#FFF", borderWidth: 1 }; // Normal
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Katılım Puanları</Text>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="İsim ara..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                <ScrollView contentContainerStyle={styles.scrollableList}>
                    {filteredParticipants.map((person) => (
                        <View 
                            key={person.id} 
                            style={[
                                styles.card,
                                getBorderStyle(person.rank)
                            ]}
                        >
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.cardName}>{person.name}</Text>
                                <Text style={styles.cardScore}>{person.rating} Puan</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}
