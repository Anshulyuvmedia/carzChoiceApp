import { SplashScreen, Stack, useRouter, useNavigationContainerRef } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './globals.css';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, View, Text } from "react-native";
import ChatContextProvider from './(root)/chat/ChatContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from '../components/NavigationService';

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
    const router = useRouter();
    const [hasNetworkError, setHasNetworkError] = useState(false);

    // ✅ Bind expo-router's navigation container to your custom ref
    const containerRef = useNavigationContainerRef();
    useEffect(() => {
        navigationRef.current = containerRef.current;
    }, [containerRef]);

    useEffect(() => {
        const checkAuthSession = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();

                if (fontsLoaded) {
                    const userData = await AsyncStorage.getItem("userData");
                    const parsedUserData = userData ? JSON.parse(userData) : null;

                    if (!parsedUserData || !parsedUserData.id) {
                        await AsyncStorage.removeItem("userData");
                        setIsAuthenticated(false);
                    } else {
                        setIsAuthenticated(true);
                    }
                }
            } catch (error) {
                console.error("Error during authentication check:", error);

                // ✅ Detect network error
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

                // Still move forward to allow UI to load
                setIsAuthenticated(false);
            } finally {
                setAppIsReady(true);
                await SplashScreen.hideAsync();
            }
        };

        checkAuthSession();
    }, [fontsLoaded]);


    useEffect(() => {
        if (appIsReady && isAuthenticated !== null) {
            requestAnimationFrame(() => {
                if (isAuthenticated) {
                    router.replace("/");
                } else {
                    router.replace("/signin");
                }
            });
        }
    }, [appIsReady, isAuthenticated]);

    if (!appIsReady) return null;

    if (hasNetworkError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 10 }}>Checking connection...</Text>
            </View>
        );
    }
    

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ChatContextProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ChatContextProvider>
            <Toast />
        </GestureHandlerRootView>
    );
}
