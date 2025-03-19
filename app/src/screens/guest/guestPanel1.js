import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./guestPanel1.style";

export default function GuestPanel1() {
    const router = useRouter();
    const { userId, userName } = useLocalSearchParams();

    const handleProfile = () => {
        router.push({ pathname: "./guestProfil1", params: { userId, userName } });
    };

    const handleVolunteerEvents = () => {
        router.push({ pathname: "./guestEvents", params: { userId, userName } });
    };

    const handleTimeline = () => {
        router.push({ pathname: "./guestCalendar", params: { userId, userName } });
    };

    const handleAnnouncements = () => {
        router.push("./guestAnnouncements");
    };

    const handleSettings = () => {
        router.push("./guestSettings");
    };

    const handleLogout = () => {
        router.push("../admin/adminlogin");
    };

    

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <View style={styles.header}>
                    <Text style={styles.headerText}>Gönüllü Paneli</Text>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {/* Profil */}
                    <TouchableOpacity style={styles.card} onPress={handleProfile}>
                        <Text style={styles.cardTitle}>Profil</Text>
                        <Text style={styles.cardDescription}>
                            Profil bilgilerinizi görüntüleyin ve düzenleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Gönüllü Etkinlikleri */}
                    <TouchableOpacity style={styles.card} onPress={handleVolunteerEvents}>
                        <Text style={styles.cardTitle}>Gönüllü Etkinlikleri</Text>
                        <Text style={styles.cardDescription}>
                            Katıldığınız etkinlikleri görüntüleyin ve takip edin.
                        </Text>
                    </TouchableOpacity>

                    {/* Yıllık Zaman Çizelgesi */}
                    <TouchableOpacity style={styles.card} onPress={handleTimeline}>
                        <Text style={styles.cardTitle}>Takvim</Text>
                        <Text style={styles.cardDescription}>
                            Yıllık hedeflerinizi planlayın ve izleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Duyurular */}
                    <TouchableOpacity style={styles.card} onPress={handleAnnouncements}>
                        <Text style={styles.cardTitle}>Duyurular</Text>
                        <Text style={styles.cardDescription}>
                            Sisteme ait duyuruları görüntüleyin.
                        </Text>
                    </TouchableOpacity>

                    {/* Ayarlar */}
                    <TouchableOpacity style={styles.card} onPress={handleSettings}>
                        <Text style={styles.cardTitle}>Ayarlar</Text>
                        <Text style={styles.cardDescription}>
                            Hesap ayarlarınızı düzenleyin.
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
