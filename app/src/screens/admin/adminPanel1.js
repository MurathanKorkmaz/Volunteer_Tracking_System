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
import styles from "./adminPanel1.style"; // Stil dosyasını import et

export default function adminPanel1() {
    const router = useRouter(); // Router oluşturuldu

    const handleUsers = () => {
        router.push("./adminusers"); // Kullanıcı Yönetimi sayfasına yönlendirme
    };

    const handleEvents = () => {
        router.push("./adminevents");
    };

    const handleReports = () => {
        router.push("./adminreports");
    };

    const handleCalendar = () => {
        router.push("./adminCalendar");
    };

    const handleAnnouncements = () => {
        router.push("./adminannouncements");
    };
    
    const handleSettings = () => {
        router.push("./adminsettings");
    };

    const handleLogout = () => {
        router.push("./adminlogin");
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Yönetici Paneli</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Kullanıcı Yönetimi */}
                    <TouchableOpacity style={styles.card} onPress={handleUsers}>
                        <Text style={styles.cardTitle}>Kullanıcı Yönetimi</Text>
                        <Text style={styles.cardDescription}>
                            Kullanıcıları görüntüleyin ve yönetin.
                        </Text>
                    </TouchableOpacity>

                    {/* Etkinlik Yönetimi */}
                    <TouchableOpacity style={styles.card} onPress={handleEvents}>
                        <Text style={styles.cardTitle}>Etkinlik Yönetimi</Text>
                        <Text style={styles.cardDescription}>
                            Etkinlikleri düzenleyin ve yönetin.
                        </Text>
                    </TouchableOpacity>

                    {/* Raporlar */}
                    <TouchableOpacity style={styles.card} onPress={handleReports}>
                        <Text style={styles.cardTitle}>Raporlar</Text>
                        <Text style={styles.cardDescription}>
                            Sisteme dair raporları görüntüleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Yıllık Zaman Çizelgesi */}
                    <TouchableOpacity style={styles.card} onPress={handleCalendar}>
                        <Text style={styles.cardTitle}>Yıllık Zaman Çizelgesi</Text>
                        <Text style={styles.cardDescription}>
                            Yıllık hedeflerinizi planlayın ve izleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Duyurular */}
                    <TouchableOpacity style={styles.card} onPress={handleAnnouncements}>
                        <Text style={styles.cardTitle}>Duyurular</Text>
                        <Text style={styles.cardDescription}>
                            Duyuru yayınlayın ve izleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Ayarlar */}
                    <TouchableOpacity style={styles.card} onPress={handleSettings}>
                        <Text style={styles.cardTitle}>Ayarlar</Text>
                        <Text style={styles.cardDescription}>
                            Panel ayarlarını düzenleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Çıkış Yap */}
                    <TouchableOpacity style={styles.card} onPress={handleLogout}>
                        <Text style={styles.cardTitle}>Çıkış Yap</Text>
                        <Text style={styles.cardDescription}>
                            Hesabınızdan çıkış yapın.
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}
