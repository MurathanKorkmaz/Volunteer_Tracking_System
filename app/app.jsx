import React from "react";
import { SafeAreaView,  StyleSheet } from "react-native";
import LoginScreen from "./src/screens/admin/adminanasayfa1";

const App = () => {
    return (
        <SafeAreaView style={styles.container}>
            <LoginScreen />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
});

export default App;