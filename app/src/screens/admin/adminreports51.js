import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminreports51.style"; // aynı tasarımı kullanıyoruz

export default function AdminReports51() {
    const router = useRouter();
    const { year, month } = useLocalSearchParams(); // parametreleri al
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    const [searchText, setSearchText] = useState("");
    const [participants, setParticipants] = useState([]);
    const [filteredParticipants, setFilteredParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            if (!year || !month) return;

            const reportRef = collection(db, "pointsReports", year.toString(), month.toString());
            const reportSnap = await getDocs(reportRef);

            const participantsList = reportSnap.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || "İsimsiz",
                rating: doc.data().rating || "0"
            }));

            participantsList.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
            setParticipants(participantsList);
            setFilteredParticipants(participantsList);
        } catch (error) {
            console.error("❌ Katılım puanları alınırken hata:", error);
            Alert.alert("Hata", "Katılım puanları alınırken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, [year, month]);

    const handleSearch = (text) => {
        setSearchText(text);
        
        // If search text is empty, show all participants
        if (!text.trim()) {
            setFilteredParticipants(participants);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter participants based on name
        const filtered = participants.filter((person) => {
            if (!person.name || typeof person.name !== "string") {
                return false;
            }
            const personName = person.name.toLowerCase();
            // Check if all search terms are found in the person's name
            return searchTerms.every(term => personName.includes(term));
        });

        setFilteredParticipants(filtered);
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Puan Raporu - {month}/{year}</Text>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="İsim ara..."
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={handleSearch}
                        />
                    </View>

                    <View style={styles.scrollableList}>
                        {loading ? (
                            <View style={styles.loadingOverlay}>
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#3B82F6" />
                                    <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
                                </View>
                            </View>
                        ) : (
                            <ScrollView
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
                                {filteredParticipants.map((person) => {
                                    // Gerçek sıralamayı bul (tüm katılımcılar arasındaki sırası)
                                    const actualRank = participants.findIndex(p => p.id === person.id) + 1;
                                    
                                    // Determine card style based on actual rank
                                    let cardStyle = styles.card;
                                    let rankStyle = null;

                                    if (actualRank === 1) {
                                        // 1. sıra - Altın
                                        cardStyle = [styles.card, { borderWidth: 3, borderColor: '#FFD700' }];
                                        rankStyle = { color: '#FFD700', fontWeight: 'bold' };
                                    } else if (actualRank === 2) {
                                        // 2. sıra - Gümüş
                                        cardStyle = [styles.card, { borderWidth: 3, borderColor: '#C0C0C0' }];
                                        rankStyle = { color: '#C0C0C0', fontWeight: 'bold' };
                                    } else if (actualRank === 3) {
                                        // 3. sıra - Bronz
                                        cardStyle = [styles.card, { borderWidth: 3, borderColor: '#CD7F32' }];
                                        rankStyle = { color: '#CD7F32', fontWeight: 'bold' };
                                    } else if (actualRank <= 10) {
                                        // 4-10 arası
                                        cardStyle = [styles.card, { borderWidth: 2, borderColor: '#4169E1' }];
                                        rankStyle = { color: '#4169E1', fontWeight: 'bold' };
                                    }

                                    return (
                                        <View key={person.id} style={cardStyle}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                    <Text style={[styles.rankNumber, rankStyle]}>{`${actualRank}. `}</Text>
                                                    <Text style={styles.cardName}>{person.name}</Text>
                                                </View>
                                                <Text style={[styles.cardScore, rankStyle]}>{person.rating} Puan</Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
