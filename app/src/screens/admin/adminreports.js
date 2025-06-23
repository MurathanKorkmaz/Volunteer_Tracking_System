import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Animated,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./adminreports.style";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../configs/FirebaseConfig";
import { Stack } from "expo-router";

export default function AdminReports() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const screenWidth = Dimensions.get('window').width;
    const translateX = React.useRef(new Animated.Value(params.from === "panel1" ? screenWidth : -screenWidth)).current;

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animationEnabled: false,
        });

        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();

            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 100,
                useNativeDriver: true,
            }).start(() => {
                navigation.dispatch(e.data.action);
            });
        });

        Animated.timing(translateX, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start();

        fetchReports();

        return unsubscribe;
    }, [navigation]);

    const fetchReports = async () => {
        // You can implement fetching logic here if needed in the future
    };

    const handleVolunteerReport = () => {
        router.push({
            pathname: "./adminreports2",
            params: { from: "reports" }
        });
    };

    const handleEventReport = () => {
        router.push({
            pathname: "./adminreports1",
            params: { from: "reports" }
        });
    };

    const handleUsersReport = () => {
        router.push({
            pathname: "./adminreports3",
            params: { from: "reports" }
        });
    };

    const handleAnnouncementsReport = () => {
        router.push({
            pathname: "./adminreports4",
            params: { from: "reports" }
        });
    };

    const handleMonthlyPointReport = () => {
        router.push({
            pathname: "./adminreports5",
            params: { from: "reports" }
        });
    };

    const handleBack = () => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <LinearGradient colors={["#FFFACD", "#FFD701"]} style={styles.background}>
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateX }],
                    }}
                >
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backIcon}>{"<"}</Text>
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <Text style={styles.headerText}>Raporlar</Text>
                    </View>

                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <TouchableOpacity style={styles.card1} onPress={handleVolunteerReport}>
                            <Text style={styles.cardTitle}>Gönüllü Katılım Raporu</Text>
                            <Text style={styles.cardDescription}>Gönüllülerin katılım durumlarını inceleyin.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card2} onPress={handleEventReport}>
                            <Text style={styles.cardTitle}>Etkinlik Katılım Raporu</Text>
                            <Text style={styles.cardDescription}>Etkinliklere katılım istatistiklerini inceleyin.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card2} onPress={handleUsersReport}>
                            <Text style={styles.cardTitle}>Kullanıcı Kayıt Raporu</Text>
                            <Text style={styles.cardDescription}>Kayıt olan kullanıcıları inceleyin.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card2} onPress={handleAnnouncementsReport}>
                            <Text style={styles.cardTitle}>Duyuru Raporu</Text>
                            <Text style={styles.cardDescription}>Yayınlanan duyuruları görüntüleyin.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.card2} onPress={handleMonthlyPointReport}>
                            <Text style={styles.cardTitle}>Aylık Puan Raporları</Text>
                            <Text style={styles.cardDescription}>Kullanıcı puanlarını inceleyin.</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </LinearGradient>
        </View>
    );
}
