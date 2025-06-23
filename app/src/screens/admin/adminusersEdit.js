import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput, 
    TouchableOpacity,
    Alert,
    ScrollView,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import styles from "./adminusersEdit.style";
import { collection, doc, getDocs, updateDoc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";

export default function adminusersEdit() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    // from parametresine göre giriş yönü
    const initialX = params.from === "users" ? screenWidth : 0;
    const translateX = useRef(new Animated.Value(initialX)).current;


    useEffect(() => {
        // Giriş animasyonu
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);


    // Router ile gelen başlangıç değerleri
    const [userId] = useState(params.id || "");
    const [userName, setUserName] = useState(params.name || "");
    const [initialRole] = useState(params.role || "Guest");
    const [initialIsBlocked] = useState(params.blocked === "1");
    const [initialParticipationRate] = useState(parseInt(params.turnout) || 0);
    const [initialRating] = useState(parseInt(params.rating) || 0);

    // Kullanıcı değişikliklerini tutan state
    const [userRole, setUserRole] = useState(initialRole);
    const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
    const [participationRate, setParticipationRate] = useState(initialParticipationRate);
    const [rating, setRating] = useState(initialRating);

    const handleSave = async () => {
        try {
            let currentCollection = initialRole === "Admin" ? "admin" : "guests";
            let newCollection = userRole === "Admin" ? "admin" : "guests";
            let docRef = doc(db, currentCollection, userId);
            let newDocRef = doc(db, newCollection, userId);
            let updates = {};
    
            // **Admin <-> Guest değiştiyse işlemi gerçekleştir**
            if (userRole !== initialRole) {
                const userDoc = await getDoc(docRef);
    
                if (userDoc.exists()) {
                    const userData = userDoc.data();
    
                    // **Tüm değişiklikleri yeni koleksiyona aktar**
                    await setDoc(newDocRef, {
                        ...userData,
                        authority: userRole === "Admin" ? "2" : "1",
                        block: isBlocked ? "1" : "0",
                        turnout: participationRate.toString(),
                        rating: rating.toString(),
                    });
    
                    // **Eski koleksiyondaki veriyi sil**
                    await deleteDoc(docRef);
                    Alert.alert("Başarılı", "Sadece değişen veriler güncellendi.");
                } else {
                    Alert.alert("Hata", "Kullanıcı kaydı bulunamadı.");
                    return;
                }
            } else {
                // **Burada tüm değişiklikleri kontrol edip tek seferde güncelle**
                const userDoc = await getDoc(docRef);
    
                if (!userDoc.exists()) {
                    // **Eğer belge yoksa, oluştur ve veriyi ekle**
                    await setDoc(docRef, {
                        authority: userRole === "Admin" ? "2" : "1",
                        block: isBlocked ? "1" : "0",
                        turnout: participationRate.toString(),
                        rating: rating.toString(),
                    });
    
                    Alert.alert("Başarılı", "Kullanıcı kaydı oluşturuldu.");
                } else {
                    // **Tüm değişiklikleri tek seferde güncelle**
                    if (isBlocked !== initialIsBlocked) {
                        updates.block = isBlocked ? "1" : "0";
                    }
                    if (participationRate !== initialParticipationRate) {
                        updates.turnout = participationRate.toString();
                    
                        // **Veritabanındaki `eventPublish: 1` olan etkinlikleri say**
                        const eventsSnapshot = await getDocs(collection(db, "events"));
                        let totalPublishedEvents = 0;
                    
                        eventsSnapshot.forEach(doc => {
                            const data = doc.data();
                            if (parseInt(data.eventPublish) === 1) {
                                totalPublishedEvents++;
                            }
                        });
                    
                        console.log(`Katılım Oranı: ${participationRate}`); // Katılım oranı kontrol
                        console.log(`Toplam Yayınlanan Etkinlik: ${totalPublishedEvents}`); // Etkinlik sayısı kontrol
                    
                        // **ratingCounter Hesaplaması**
                        if (totalPublishedEvents > 0) {
                            let newRatingCounter = Math.round((participationRate * totalPublishedEvents) / 100);
                            updates.ratingCounter = newRatingCounter.toString(); // Tam sayıya çevrilip string olarak kaydediliyor
    
                            console.log(`Yeni Rating Counter (Yuvarlanmış): ${updates.ratingCounter}`);
                        } else {
                            console.warn("Hata: Yayınlanan etkinlik sayısı 0, ratingCounter hesaplanamıyor.");
                        }
                    }
    
                    if (rating !== initialRating) {
                        updates.rating = rating.toString();
                    }
    
                    if (Object.keys(updates).length > 0) {
                        await updateDoc(docRef, updates);
                        Alert.alert("Başarılı", "Sadece değişen veriler güncellendi.");
                    } else {
                        Alert.alert("Bilgi", "Herhangi bir değişiklik yapılmadı.");
                    }
                }
            }
            router.back();
        } catch (error) {
            console.error("Hata:", error);
            Alert.alert("Hata", "Değişiklikler kaydedilirken bir hata oluştu.");
        }
    };
    
    
    

    const handleDelete = async () => {
        try {
            let collectionToCheck = initialRole === "Admin" ? "admin" : "guests";
            const userDocRef = doc(db, collectionToCheck, userId);
            const userDoc = await getDoc(userDocRef);
    
            if (!userDoc.exists()) {
                Alert.alert("Hata", "Kullanıcı bulunamadı.");
                return;
            }
    
            // Kullanıcının mevcut tüm verilerini al
            const userData = userDoc.data();

            // **ratingCounter değerini Firestore'dan oku**
            let ratingCounter = "0"; // Varsayılan değer
            if (userData.ratingCounter) {
                ratingCounter = userData.ratingCounter.toString();
            }
    
            // Güncellenmesi gereken tüm alanlar
            const pastRequestData = {
                authority: initialRole === "Admin" ? "2" : "1",
                block: initialIsBlocked ? "1" : "0",
                email: userData.email || "", 
                name: userData.name || "",
                password: userData.password || "",
                phoneNumber: userData.phoneNumber || "",
                rating: initialRating.toString(),
                turnout: initialParticipationRate.toString(),
                ratingCounter: ratingCounter, 
                registerAt: userData.registerAt
                    ? typeof userData.registerAt === "string"
                        ? userData.registerAt
                        : userData.registerAt.toDate().toISOString()
                    : "",
                deletedAt: new Date().toISOString()
            };
    
            const pastRequestDocRef = doc(db, "pastrequest", userId);
            const pastRequestDoc = await getDoc(pastRequestDocRef);
    
            if (pastRequestDoc.exists()) {
                // Eğer geçmişte bir kayıt varsa sadece eksik alanları güncelle
                await updateDoc(pastRequestDocRef, pastRequestData);
            } else {
                // Eğer geçmişte kayıt yoksa, yeni bir belge oluştur
                await setDoc(pastRequestDocRef, pastRequestData);
            }
    
            // Kullanıcıyı admin veya guests koleksiyonundan sil
            await deleteDoc(userDocRef);
    
            Alert.alert("Başarılı", "Kullanıcı başarıyla silindi ve geçmiş veri güncellendi.");
            router.back();
        } catch (error) {
            console.error("Hata:", error);
            Alert.alert("Hata", "Kullanıcı silinirken veya geçmiş veri güncellenirken bir hata oluştu.");
        }
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
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Kullanıcı Düzenle</Text>
                    </View>

                    {/* ScrollView ile tüm kartları kaydırılabilir hale getiriyoruz */}
                    <View style={styles.scrollContainer}>
                        <ScrollView contentContainerStyle={styles.scrollWrapper}>
                            
                            {/* İsim-Soyisim Kartı */}
                            <View style={styles.inputContainer1}>
                                <Text style={styles.userNameText}>{userName}</Text>
    
                                {/* Rol Seçimi (Admin / Guest) */}
                                <View style={styles.roleContainer}>
                                    <TouchableOpacity
                                        style={[styles.roleButton, userRole === "Admin" && styles.roleButtonActive]}
                                        onPress={() => setUserRole("Admin")}
                                    >
                                        <Text style={[styles.roleButtonText, userRole === "Admin" && styles.roleButtonTextActive]}>
                                            Admin
                                        </Text>
                                    </TouchableOpacity>
    
                                    <TouchableOpacity
                                        style={[styles.roleButton, userRole === "Guest" && styles.roleButtonActive]}
                                        onPress={() => setUserRole("Guest")}
                                    >
                                        <Text style={[styles.roleButtonText, userRole === "Guest" && styles.roleButtonTextActive]}>
                                            Guest
                                        </Text>
                                    </TouchableOpacity>
                                </View>
    
                                {/* Bloke Et / Kaldır Butonu */}
                                <TouchableOpacity
                                    style={[styles.blockButton, isBlocked && styles.blockButtonActive]}
                                    onPress={() => setIsBlocked(!isBlocked)}
                                >
                                    <Text style={styles.blockButtonText}>
                                        {isBlocked ? "Blokeyi Kaldır" : "Bloke Et"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
    
                            {/* Katılım Oranı Kartı */}
                            <View style={styles.inputContainer2}>
                                <Text style={styles.userNameText}>Katılım Oranı: {participationRate}%</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={1}
                                    value={participationRate}
                                    onValueChange={(value) => setParticipationRate(value)}
                                    minimumTrackTintColor="#4CAF50"
                                    maximumTrackTintColor="#FF5733"
                                    thumbTintColor="#FFD700"
                                />
                            </View>
    
                            {/* Katılım Puanı Kartı */}
                            <View style={styles.inputContainer2}>
                                <Text style={styles.userNameText}>Katılım Puanı: {rating}</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={1}
                                    value={rating}
                                    onValueChange={(value) => setRating(value)}
                                    minimumTrackTintColor="#4CAF50"
                                    maximumTrackTintColor="#FF5733"
                                    thumbTintColor="#FFD700"
                                />
                            </View>

    
                        </ScrollView>
                    </View>
    
                    {/* Sil ve Kaydet Butonları (Scroll'un dışında) */}
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>Kullanıcıyı Sil</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Kaydet</Text>
                    </TouchableOpacity>
    
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
    
}
