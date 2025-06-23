import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import styles from "./adminreports5.style";

export default function AdminReports5() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(screenWidth)).current;
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthsList, setMonthsList] = useState([]);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleBack = () => {
        router.back();
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);

    const handleConfirm = (date) => {
        const year = date.getFullYear();
        setSelectedYear(year);
        hideDatePicker();
    };

    const fetchMonthlyReports = async () => {
        try {
            setLoading(true);
            const months = [];

            for (let i = 1; i <= 12; i++) {
                const month = i.toString().padStart(2, "0");
                const monthRef = collection(db, "pointsReports", selectedYear.toString(), month);
                const snapshot = await getDocs(monthRef);

                if (!snapshot.empty) {
                    months.push(month);
                }
            }

            setMonthsList(months);
        } catch (error) {
            console.error("❌ Yıla ait ay verileri alınamadı:", error);
            Alert.alert("Hata", "Yıla ait ay verileri alınamadı.");
            setMonthsList([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMonthlyReports();
    }, [selectedYear]);

    const getMonthName = (monthNumber) => {
        const months = [
            "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
            "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
        ];
        return months[parseInt(monthNumber) - 1] || "Bilinmeyen";
    };

    const handleMonthPress = (month) => {
        router.push({
            pathname: "./adminreports51",
            params: {
                year: selectedYear.toString(),
                month: month,
                from: "reports5"
            },
        });
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
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Aylık Puan Raporları</Text>
                    </View>

                    <TouchableOpacity onPress={showDatePicker} style={styles.datePickerButton}>
                        <Text style={styles.datePickerText}>
                            Seçilen Yıl: {selectedYear}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        display="spinner"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                        minimumDate={new Date(2000, 0, 1)}
                        maximumDate={new Date(2030, 11, 31)}
                    />

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
                                            fetchMonthlyReports();
                                        }}
                                    />
                                }
                            >
                                {monthsList.length > 0 ? (
                                    monthsList.map((month) => (
                                        <TouchableOpacity
                                            key={month}
                                            style={styles.card}
                                            onPress={() => handleMonthPress(month)}
                                        >
                                            <Text style={styles.cardMonth}>{getMonthName(month)}</Text>
                                            <Text style={styles.cardYear}>{selectedYear}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            Bu yıla ait puan verisi bulunamadı.
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </Animated.View>
            </LinearGradient>
        </SafeAreaView>
    );
}
