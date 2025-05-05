import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './globals.css';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View, Text } from "react-native";
import ChatContextProvider from './(root)/chat/ChatContext'; // Adjusted path if you follow layout groups
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot } from "expo-router";
import { LocationProvider } from '@/components/LocationContext';

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
        "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
        "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
        "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
        "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
        "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    });

    const [appIsReady, setAppIsReady] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [hasNetworkError, setHasNetworkError] = useState(false);

    useEffect(() => {
        const checkAuthSession = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();

                if (fontsLoaded) {
                    const userData = await AsyncStorage.getItem("userData");
                    const parsedUserData = userData ? JSON.parse(userData) : null;

                    setIsAuthenticated(!!parsedUserData?.id);
                }
            } catch (error) {
                console.error("Error during authentication check:", error);

                if (error.message === "Network Error") {
                    setHasNetworkError(true);
                    Toast.show({
                        type: 'error',
                        text1: 'Network Error',
                        text2: 'Please check your internet connection.',
                    });
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Authentication Failed',
                        text2: 'An unexpected error occurred.',
                    });
                }

                setIsAuthenticated(false);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        checkAuthSession();
    }, [fontsLoaded]);

    if (!appIsReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ChatContextProvider>  {/* Always provide chat context */}
                <LocationProvider>
                    {appIsReady ? (
                        <Slot key={isAuthenticated ? "app" : "auth"} />
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#000" />
                            <Text style={{ marginTop: 10 }}>Loading...</Text>
                        </View>
                    )}
                </LocationProvider>
            </ChatContextProvider>
            <Toast />
        </GestureHandlerRootView>
    );


}
