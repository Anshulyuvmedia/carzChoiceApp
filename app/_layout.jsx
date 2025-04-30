import { SplashScreen, Stack, useRouter, useNavigationContainerRef } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import './globals.css';
import Toast from 'react-native-toast-message';
import { View } from "react-native";
import ChatContextProvider from './(root)/chat/ChatContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './NavigationService'; // Import your navigationRef

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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ChatContextProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </ChatContextProvider>
            <Toast />
        </GestureHandlerRootView>
    );
}
