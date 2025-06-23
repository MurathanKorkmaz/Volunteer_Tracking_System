import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { collection, getDocs, doc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminusers.style";
import { useNavigation } from "@react-navigation/native";

export default function adminUsers() {
    const [searchText, setSearchText] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const router = useRouter();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;

    const fetchData = async () => {
        try {
            setLoading(true);
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
                registerAt: doc.data().registerAt || "",
            }));            

            setUsers([...adminData, ...guestData]);
            setRequests(requestData);
        } catch (error) {
            console.error("Veriler alınırken hata oluştu: ", error);
            Alert.alert("Hata", "Veriler yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Gesture'ı etkinleştir ama kendi animasyonunu devre dışı bırak
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        // Gesture handler'ı ekle
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // Prevent default behavior
            e.preventDefault();

            // Animasyonlu geri dönüş
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                navigation.dispatch(e.data.action);
            });
        });

        // Animasyonu başlat
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchData();

        return unsubscribe;
    }, [navigation]);

    const handleBack = () => {
        // Animasyonlu geri dönüş
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    const handleSearch = (text) => {
        setSearchText(text);
        const activeList = activeTab === "users" ? users : requests;
        
        // If search text is empty, show all users
        if (!text.trim()) {
            setFilteredUsers(activeList);
            return;
        }

        // Split search terms by spaces to handle multiple words
        const searchTerms = text.toLowerCase().trim().split(/\s+/);

        // Filter users that match any of the search terms
        const filtered = activeList.filter((user) => {
            const userName = user.Name.toLowerCase();
            // Check if all search terms are found in the user name
            return searchTerms.every(term => userName.includes(term));
        });

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
                authority: "1",
                password: requestData.Password,
                phoneNumber: requestData.PhoneNumber,
                block: requestData.isBlocked,
                registerAt: requestData.registerAt,
                rating: requestData.Rating,
                turnout: requestData.Turnout,
                ratingCounter: requestData.RatingCounter,
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
                    onPress={() => {
                        // Start exit animation
                        Animated.timing(translateX, {
                            toValue: -screenWidth,
                            duration: 100,
                            useNativeDriver: true,
                        }).start(() => {
                            router.push({
                                pathname: "./adminusersEdit",
                                params: {
                                    id: user.Id,
                                    name: user.Name,
                                    role: user.Role,
                                    blocked: user.isBlocked,
                                    rating: user.Rating,
                                    turnout: user.Turnout,
                                    ratingCounter: user.RatingCounter,
                                    from: "users"
                                },
                            });
                        });
                    }}
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
                                            fetchData();
                                        }}
                                    />
                                }
                            >
                                {(searchText
                                    ? filteredUsers
                                    : activeTab === "users"
                                        ? users
                                        : requests
                                ).map(renderUser)}
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
