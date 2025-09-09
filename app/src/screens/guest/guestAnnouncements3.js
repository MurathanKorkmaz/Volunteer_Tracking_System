import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    BackHandler,
    LogBox,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NetInfo from "@react-native-community/netinfo";
import NoInternet from "../../components/NoInternet";
import DatabaseError from "../../components/DatabaseError";
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./guestAnnouncements3.style";
import { useNavigation } from "@react-navigation/native";
import MaintenanceModal from "../../components/MaintenanceModal";
import BlockModal from "../../components/BlockModal";

// Firebase hata mesajlarını gizle
LogBox.ignoreAllLogs();

export default function GuestAnnouncements3() {
    const router = useRouter();
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const [searchText, setSearchText] = useState("");
    const [participants, setParticipants] = useState([]);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [hasDbError, setHasDbError] = useState(false);

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

        const userDocRef = doc(db, "guests", userId);
        
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
    }, [userId]);

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
        const fetchParticipants = async () => {
            try {
                setHasDbError(false);
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
                setHasDbError(true);
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
            {!isConnected && <NoInternet onRetry={checkConnection} />}
            {hasDbError && <DatabaseError onRetry={() => {
                setHasDbError(false);
                fetchParticipants();
            }} />}
            <MaintenanceModal visible={maintenanceMode} onExit={handleExitApp} />
            <BlockModal visible={isBlocked} onClose={handleBlockExit} />

            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => {
                        if (isBlocked) {
                            handleBlockExit();
                        } else {
                            router.back();
                        }
                    }}
                >
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