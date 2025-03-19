import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import styles from "./adminreports11.style";
import { collection, doc, getDocs, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminReports11() {
    const router = useRouter();
    const { id, applycount, limitcount, year, month } = useLocalSearchParams(); // Etkinlik ID

    const [progress, setProgress] = useState(0); // Oran hesaplamak için state

    const [applicants, setApplicants] = useState([]);
    const [nonApplicants, setNonApplicants] = useState([]);
    const [activeTab, setActiveTab] = useState("applicants");
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || !year || !month) return;

        // applycount ve limitcount değerlerini kullanarak oranı hesapla
        if (applycount && limitcount && parseInt(limitcount) > 0) {
            const calculatedProgress = (parseInt(applycount) / parseInt(limitcount)) * 100;
            setProgress(calculatedProgress);
        }

        const fetchParticipants = async () => {
            try {
                const particantRef = collection(db, "pastEvents", year, month, id, "Particant");
                const nonParticantRef = collection(db, "pastEvents", year, month, id, "NonParticant");

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
            } catch (error) {
                console.error("Başvuru verileri çekilirken hata oluştu:", error);
                Alert.alert("Hata", "Veriler çekilirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [id, year, month, applycount, limitcount]);
    
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
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Etkinlik Katılımcıları</Text>
                </View>

                {/* Başvuru Oranını Gösteren Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%` }]} />
                </View>

                {/* Başvuru Bilgisi */}
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressText}>
                        Başvuru Oranı: {progress.toFixed(2)}% ({applycount}/{limitcount})
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

                <View style={styles.scrollableList}>
                    <ScrollView>
                        {filteredList.length > 0 ? (
                            filteredList.map(renderPerson)
                        ) : (
                            <Text style={styles.emptyText}>
                                {activeTab === "applicants" ? "Başvuran bulunmamaktadır." : "Başvurmayan bulunmamaktadır."}
                            </Text>
                        )}
                    </ScrollView>
                </View>

                {/* Başvuru Sayısını Gösteren Bilgilendirme Alanı */}
                <View style={styles.counterContainer}>
                    <Text style={styles.counterText}>
                        {activeTab === "applicants"
                            ? `Başvuran sayısı: ${applicants.length} kişi`
                            : `Başvurmayan sayısı: ${nonApplicants.length} kişi`}
                    </Text>
                </View>

            </LinearGradient>
        </SafeAreaView>
    );
}