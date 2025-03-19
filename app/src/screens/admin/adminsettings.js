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
import styles from "./adminsettings.style";

export default function adminSettings() {
    const router = useRouter();

    const options = [
        { id: "1", title: "Erişimi Engelle", description: "Tüm Guest Kullanıcların erişimlerini engelleyin." },
        { id: "2", title: "Bakım Arası", description: "Bakım modu başlatmak için dokunun." },
        { id: "3", title: "Yazılım Güncelle", description: "Yazılım güncellemelerini kontrol edin." },
    ];

    const handleOptionPress = (option) => {
        alert(`${option.title} seçeneğine tıklandı.`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerText}>Ayarlar</Text>
                </View>

                {/* Options List */}
                <ScrollView contentContainerStyle={styles.optionsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={styles.optionCard}
                            onPress={() => handleOptionPress(option)}
                        >
                            <Text style={styles.optionTitle}>{option.title}</Text>
                            <Text style={styles.optionDescription}>{option.description}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}
