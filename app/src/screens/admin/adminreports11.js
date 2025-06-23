import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    Keyboard,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./adminreports11.style";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports11() {
    const router = useRouter();
    const { id, year, month } = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    const [progress, setProgress] = useState(0);
    const [applicants, setApplicants] = useState([]);
    const [nonApplicants, setNonApplicants] = useState([]);
    const [activeTab, setActiveTab] = useState("applicants");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            const particantRef = collection(db, "pastEvents", year, month, id, "Particant");
            const particantSnap = await getDocs(particantRef);

            let applicantsList = [];
            let nonApplicantsList = [];

            let totalParticipants = particantSnap.docs.length;
            let totalAccepted = 0;

            particantSnap.forEach(doc => {
                const data = doc.data();
                const state = parseInt(data.State || "0", 10);
                const appliedAt = data.appliedAt || "Bilinmiyor";
                const [date, time] = appliedAt.includes("--") ? appliedAt.split("--") : [appliedAt, ""];

                if (state === 1) {
                    applicantsList.push({
                        id: doc.id,
                        name: data.Name || "Bilinmeyen",
                        appliedDate: date,
                        appliedTime: time
                    });
                    totalAccepted++;
                } else if (state === 2) {
                    nonApplicantsList.push({
                        id: doc.id,
                        name: data.Name || "Bilinmeyen",
                        appliedDate: date,
                        appliedTime: time
                    });
                }
            });

            let calculatedProgress = 0;
            if (totalParticipants > 0) {
                calculatedProgress = (totalAccepted / totalParticipants) * 100;
            }

            setApplicants(applicantsList);
            setNonApplicants(nonApplicantsList);
            setProgress(calculatedProgress);
        } catch (error) {
            console.error("Başvuru verileri çekilirken hata oluştu:", error);
            Alert.alert("Hata", "Veriler çekilirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!id || !year || !month) return;
        fetchParticipants();
    }, [id, year, month]);

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

    const filteredList =
        activeTab === "applicants"
            ? applicants.filter(person => person.name.toLowerCase().includes(searchText.toLowerCase()))
            : nonApplicants.filter(person => person.name.toLowerCase().includes(searchText.toLowerCase()));

    const renderPerson = (person) => (
        <View key={person.id} style={styles.personCard}>
            <View style={styles.personDetails}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personDate}>{person.appliedDate !== "Bilinmiyor" ? `Tarih: ${person.appliedDate}` : ""}</Text>
                <Text style={styles.personTime}>{person.appliedTime !== "Bilinmiyor" ? `Saat: ${person.appliedTime}` : ""}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
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

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Etkinlik Katılımcıları</Text>
                    </View>

                    {/* Katılım Oranını Gösteren Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>

                    {/* Katılım Bilgisi */}
                    <View style={styles.progressTextContainer}>
                        <Text style={styles.progressText}>
                            Katılım Oranı: {progress.toFixed(2)}%
                        </Text>
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

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "applicants" && styles.tabButtonActive1]}
                            onPress={() => setActiveTab("applicants")}
                        >
                            <Text style={[styles.tabButtonText, activeTab === "applicants" && styles.tabButtonTextActive]}>
                                Katılanlar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === "nonApplicants" && styles.tabButtonActive2]}
                            onPress={() => setActiveTab("nonApplicants")}
                        >
                            <Text style={[styles.tabButtonText, activeTab === "nonApplicants" && styles.tabButtonTextActive]}>
                                Katılmayanlar
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.scrollableList, { flex: 1 }]}>
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
                                {filteredList.length > 0 ? (
                                    filteredList.map(renderPerson)
                                ) : (
                                    <Text style={styles.emptyText}>
                                        {activeTab === "applicants" ? "Katılan bulunmamaktadır." : "Katılmayan bulunmamaktadır."}
                                    </Text>
                                )}
                            </ScrollView>
                        )}
                    </View>

                    {/* Katılım Sayısını Gösteren Bilgilendirme Alanı - Klavye açıkken gizle */}
                    {!isKeyboardVisible && (
                        <View style={styles.counterContainer}>
                            <Text style={styles.counterText}>
                                {activeTab === "applicants"
                                    ? `Katılan sayısı: ${applicants.length} kişi`
                                    : `Katılmayan sayısı: ${nonApplicants.length} kişi`}
                            </Text>
                        </View>
                    )}

                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}