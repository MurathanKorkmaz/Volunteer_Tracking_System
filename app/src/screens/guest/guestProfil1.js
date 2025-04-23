import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Circle, Svg } from "react-native-svg"; // Grafik için SVG
import { useRouter, useLocalSearchParams } from "expo-router"; // Router kullanımı için
import styles from "./guestProfil1.style";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function GuestProfil1() {
    const { userId, userName } = useLocalSearchParams();
    const router = useRouter(); // Router tanımlandı
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [ratingCounter, setRatingCounter] = useState(0);
    const [participationRate, setParticipationRate] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
    
            try {
                const userRef = doc(db, "guests", userId);
                const userSnap = await getDoc(userRef);
    
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    
                    setName(userData.name || "Bilinmiyor");
                    setEmail(userData.email || "E-posta Yok");
                    setPhone(userData.phoneNumber || "Telefon Yok");
                    setParticipationRate(userData.turnout ? parseInt(userData.turnout) : 0);
                    setRatingCounter(userData.ratingCounter ? parseInt(userData.ratingCounter) : 0); // Katılım Sayısını Al
                } else {
                    console.log("Kullanıcı bulunamadı");
                }
            } catch (error) {
                console.error("Kullanıcı verileri çekilirken hata oluştu:", error);
            }
        };
    
        fetchUserData();
    }, [userId]); // `userId` değiştiğinde yeniden çalıştır

    const handleResetPassword = async () => {
        if (newPassword.trim() === "" || confirmPassword.trim() === "") {
            alert("Lütfen tüm alanları doldurun!");
            return;
        }
    
        if (newPassword !== confirmPassword) {
            alert("Şifreler eşleşmiyor!");
            return;
        }
    
        try {
            const userRef = doc(db, "guests", userId);
            const userSnap = await getDoc(userRef);
    
            if (userSnap.exists()) {
                const currentPassword = userSnap.data().password || "";
    
                if (currentPassword.trim() === newPassword.trim()) {
                    alert("Yeni şifreniz eski şifrenizle aynı olamaz!");
                    return;
                }
    
                // Şifreyi güncelle
                await updateDoc(userRef, { password: newPassword.trim() });
    
                alert("Şifreniz başarıyla sıfırlandı!");
                setModalVisible(false);
                setNewPassword("");
                setConfirmPassword("");
            } else {
                alert("Kullanıcı bulunamadı!");
            }
        } catch (error) {
            console.error("Şifre güncellenirken hata oluştu:", error);
            alert("Şifre güncellenirken bir hata oluştu.");
        }
    };
    

    const renderCircularGraph = (percentage, color, label, isPoints = false) => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const progress = (percentage / 100) * circumference;
    
        return (
            <View style={styles.circularGraphContainer}>
                <Svg width={100} height={100} viewBox="0 0 100 100">
                    {/* Arka Plan Çemberi */}
                    <Circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#E0E0E0"
                        strokeWidth="10"
                        fill="none"
                    />
                    {/* Dolum Çemberi */}
                    <Circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke={color}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - progress}
                        strokeLinecap="round"  // Düzgün dolum için eklendi
                        rotation="-90"
                        origin="50,50"
                    />
                </Svg>
                {/* Oran veya Puan */}
                <Text style={styles.circularGraphText}>
                    {isPoints ? `${Math.round(percentage / 100 * 200)}` : `${percentage}%`}
                </Text>
                <Text style={styles.circularGraphLabel}>{label}</Text>
            </View>
        );
    };
    

    return (
        <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Profil</Text>
            </View>

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>{"<"}</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                
                {/* Dairesel Grafikler */}
                <View style={styles.graphsContainer}>
                    {renderCircularGraph(participationRate, "#1E90FF", "Katılım Oranı")}
                </View>

                {/* Katılım Sayısı */}
                <View style={styles.participationCountContainer}>
                    <Text style={styles.participationCountText}>
                        Katıldığı Etkinlik Sayısı: {ratingCounter}
                    </Text>
                </View>

                {/* Bilgi Alanları */}
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <TextInput 
                        style={styles.input} 
                        value={name} 
                        editable={false} 
                    />

                    <Text style={styles.label}>E-posta</Text>
                    <TextInput 
                        style={styles.input} 
                        value={email} 
                        editable={false} 
                        keyboardType="email-address" 
                    />

                    <Text style={styles.label}>Telefon Numarası</Text>
                    <TextInput 
                        style={styles.input} 
                        value={phone} 
                        editable={false} 
                        keyboardType="phone-pad" 
                    />

                    <Text style={styles.label}>Rozetler</Text>
                    <View style={styles.badgesContainer}>
                        <Text style={styles.badge}>Gönüllülük Rozeti</Text>
                        <Text style={styles.badge}>Katılım Rozeti</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.resetPasswordButton}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={styles.resetPasswordText}>Şifreyi Sıfırla</Text>
                    </TouchableOpacity>

                    {/* Şifre Sıfırlama Modalı */}
                    <Modal transparent={true} visible={modalVisible} animationType="slide">
                        <View style={styles.modalBackground}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Şifreyi Sıfırla</Text>

                                {/* Yeni Parola */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Yeni Parola"
                                    placeholderTextColor="#888"
                                    secureTextEntry={true}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />

                                {/* Yeni Parola Tekrar */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Yeni Parola Tekrar"
                                    placeholderTextColor="#888"
                                    secureTextEntry={true}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />

                                {/* Butonlar */}
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                                        <Text style={styles.buttonText}>Sıfırla</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                        <Text style={styles.buttonText}>İptal</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}
