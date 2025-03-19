import React from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import styles from "./guestSettings.style";

export default function GuestSettings() {
    const router = useRouter();

    const settingsOptions = [
        { id: "1", title: "Profil Ayarları", description: "Kişisel bilgilerinizi düzenleyin." },
        { id: "2", title: "Bildirim Ayarları", description: "Bildirim tercihlerinizi düzenleyin." },
        { id: "3", title: "Gizlilik Ayarları", description: "Hesap gizlilik ayarlarını kontrol edin." },
        { id: "4", title: "Dil ve Bölge", description: "Dil ve bölge ayarlarını değiştirin." },
        { id: "5", title: "Hakkında", description: "Uygulama bilgilerini görüntüleyin." },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                {/* Back Button */}
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Ayarlar</Text>
                </View>

                {/* Scrollable Settings List */}
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {settingsOptions.map((option) => (
                        <TouchableOpacity key={option.id} style={styles.optionCard}>
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionDescription}>{option.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}
