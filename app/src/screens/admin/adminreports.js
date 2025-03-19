import { useRouter } from "expo-router"; // useRouter import edildi
import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminreports.style"; // Stil dosyasını import et

export default function adminReports() {
    const router = useRouter(); // Router oluşturuldu

    const handleVolunteerReport = () => {
        router.push("./adminreports2"); // Gönüllü Katılım Raporu sayfasına yönlendirme
    };

    const handleEventReport = () => {
        router.push("./adminreports1"); // Etkinlik Katılım Raporu sayfasına yönlendirme
    };

    const handleUsersReport = () => {
        router.push("./adminreports3"); // Etkinlik Katılım Raporu sayfasına yönlendirme
    };

    const handleAnnouncementsReport = () => {
        router.push("./adminreports4"); // Etkinlik Katılım Raporu sayfasına yönlendirme
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.push("./adminPanel1")}
                >
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>
                
                <View style={styles.header}>
                    <Text style={styles.headerText}>Raporlar</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Gönüllü Katılım Raporu */}
                    <TouchableOpacity style={styles.card1} onPress={handleVolunteerReport}>
                        <Text style={styles.cardTitle}>Gönüllü Katılım Raporu</Text>
                        <Text style={styles.cardDescription}>
                            Gönüllülerin katılım durumlarını inceleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Etkinlik Katılım Raporu */}
                    <TouchableOpacity style={styles.card2} onPress={handleEventReport}>
                        <Text style={styles.cardTitle}>Etkinlik Katılım Raporu</Text>
                        <Text style={styles.cardDescription}>
                            Etkinliklere katılım istatistiklerini inceleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Kullanıcı Kayıt Raporu */}
                    <TouchableOpacity style={styles.card2} onPress={handleUsersReport}>
                        <Text style={styles.cardTitle}>Kullanıcı Kayıt Raporu</Text>
                        <Text style={styles.cardDescription}>
                            Uygulamaya kayıt olan kullanıcıları inceleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Duyuru Raporu */}
                    <TouchableOpacity style={styles.card2} onPress={handleAnnouncementsReport}>
                        <Text style={styles.cardTitle}>Duyuru Raporu</Text>
                        <Text style={styles.cardDescription}>
                            Duyuru yayınlarını inceleyin.
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}