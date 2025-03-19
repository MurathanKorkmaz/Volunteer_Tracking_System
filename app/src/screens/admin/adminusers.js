import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminusers.style";

export default function adminUsers() {
    const [searchText, setSearchText] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const router = useRouter();

    const fetchData = async () => {
        try {
            // Admin verilerini al
            const adminSnapshot = await getDocs(collection(db, "admin"));
            const adminData = adminSnapshot.docs.map((doc) => ({
                Id: doc.id,
                Mail: String(doc.data().email),
                Name: String(doc.data().name),
                Role:
                    doc.data().authority === "0"
                        ? "Yetkisiz"
                        : doc.data().authority === "1"
                            ? "Guest"
                            : "Admin",
                Password: String(doc.data().password),
                PhoneNumber: String(doc.data().phoneNumber),
                isBlocked: String(doc.data().block),
                Rating: doc.data().rating ? String(doc.data().rating) : "0", 
                Turnout: doc.data().turnout ? String(doc.data().turnout) : "0", 
                RatingCounter: doc.data().ratingCounter ? String(doc.data().ratingCounter) : "0",

            }));

            // Guest verilerini al
            const guestSnapshot = await getDocs(collection(db, "guests"));
            const guestData = guestSnapshot.docs.map((doc) => ({
                Id: doc.id,
                Mail: String(doc.data().email),
                Name: String(doc.data().name),
                Role:
                    doc.data().authority === "0"
                        ? "Yetkisiz"
                        : doc.data().authority === "1"
                            ? "Guest"
                            : "Admin",
                Password: String(doc.data().password),
                PhoneNumber: String(doc.data().phoneNumber),
                isBlocked: String(doc.data().block),
                Rating: doc.data().rating ? String(doc.data().rating) : "0", 
                Turnout: doc.data().turnout ? String(doc.data().turnout) : "0",
                RatingCounter: doc.data().ratingCounter ? String(doc.data().ratingCounter) : "0",                
            }));

            // Request verilerini al
            const requestSnapshot = await getDocs(collection(db, "request"));
            const requestData = requestSnapshot.docs.map((doc) => ({
                Id: doc.id,
                Mail: String(doc.data().email),
                Name: String(doc.data().name),
                Role:
                    doc.data().authority === "0"
                        ? "Yetkisiz"
                        : doc.data().authority === "1"
                            ? "Guest"
                            : "Admin",
                Password: String(doc.data().password),
                PhoneNumber: String(doc.data().phoneNumber),
                isBlocked: String(doc.data().block),
                Rating: doc.data().rating ? String(doc.data().rating) : "0", 
                Turnout: doc.data().turnout ? String(doc.data().turnout) : "0",
                RatingCounter: doc.data().ratingCounter ? String(doc.data().ratingCounter) : "0",
                
            }));

            setUsers([...adminData, ...guestData]);
            setRequests(requestData);
        } catch (error) {
            console.error("Veriler alınırken hata oluştu: ", error);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (text) => {
        setSearchText(text);
        const activeList = activeTab === "users" ? users : requests;
        const filtered = activeList.filter((user) =>
            user.Name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const handleAccept = async (id) => {
        try {
            const requestDocRef = doc(db, "request", id);
            const requestData = requests.find((req) => req.Id === id);

            if (!requestData) {
                Alert.alert("Hata", "Kayıt bulunamadı.");
                return;
            }

            // Veriyi guests koleksiyonuna taşı (authority güncellenmiş olarak)
            await setDoc(doc(db, "guests", id), {
                email: requestData.Mail,
                name: requestData.Name,
                authority: "1", // Authority alanı burada güncelleniyor
                password: requestData.Password,
                phoneNumber: requestData.PhoneNumber,
                block: requestData.isBlocked,
                rating: requestData.Rating !== undefined ? String(requestData.Rating) : "0",
                turnout: requestData.Turnout !== undefined ? String(requestData.Turnout) : "0",
                ratingCounter: requestData.RatingCounter !== undefined ? String(requestData.RatingCounter) : "0",
            });

            // Veriyi request koleksiyonundan sil
            await deleteDoc(requestDocRef);

            Alert.alert("Başarılı", "Kayıt başarıyla kabul edildi.");
            // Verileri yeniden yükle
            fetchData();
        } catch (error) {
            console.error("Kayıt taşınırken hata oluştu: ", error);
            Alert.alert("Hata", "Kayıt taşınırken bir hata oluştu.");
        }
    };

    const handleReject = async (id) => {
        try {
            const requestDocRef = doc(db, "request", id);
            await deleteDoc(requestDocRef);
            Alert.alert("Başarılı", "Kayıt başarıyla reddedildi.");
            fetchData();
        } catch (error) {
            console.error("Kayıt silinirken hata oluştu: ", error);
            Alert.alert("Hata", "Kayıt silinirken bir hata oluştu.");
        }
    };

    const renderUser = (user) => (
        <View key={user.Id} style={styles.userCard}>
            <View>
                <Text style={styles.userName}>{user.Name}</Text>
                <Text style={styles.userRole}>{user.Role}</Text>
            </View>
            {activeTab === "requests" ? (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(user.Id)}
                    >
                        <Text style={styles.acceptButtonText}>Kabul Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleReject(user.Id)}
                    >
                        <Text style={styles.rejectButtonText}>Reddet</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                        router.push({
                            pathname: "./adminusersEdit",
                            params: {
                                id: user.Id,
                                name: user.Name,
                                role: user.Role,
                                blocked: user.isBlocked,
                                rating: user.Rating, // Rating bilgisi eklendi
                                turnout: user.Turnout, // Turnout bilgisi eklendi
                                ratingCounter: user.RatingCounter,
                            },
                        })
                    }
                >
                    <Text style={styles.editButtonText}>Düzenle</Text>
                </TouchableOpacity>
            )}
        </View>
    );


    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={["#FFFACD", "#FFD701"]}
                style={styles.background}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>{"<"}</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Kullanıcı Yönetimi</Text>
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Kullanıcı ara..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={handleSearch}
                    />
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "users" && styles.tabButtonActive,
                        ]}
                        onPress={() => {
                            setActiveTab("users");
                            setSearchText("");
                        }}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === "users" && styles.tabButtonTextActive,
                            ]}
                        >
                            Kullanıcılar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabButton,
                            activeTab === "requests" && styles.tabButtonActive,
                        ]}
                        onPress={() => {
                            setActiveTab("requests");
                            setSearchText("");
                        }}
                    >
                        <Text
                            style={[
                                styles.tabButtonText,
                                activeTab === "requests" && styles.tabButtonTextActive,
                            ]}
                        >
                            İstekler
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.scrollableList}>
                    <ScrollView>
                        {(searchText
                            ? filteredUsers
                            : activeTab === "users"
                                ? users
                                : requests
                        ).map(renderUser)}
                    </ScrollView>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}
