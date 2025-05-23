import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import icons from '@/constants/icons';
import { useRouter } from 'expo-router';
import Toast, { BaseToast } from 'react-native-toast-message';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Support = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "green" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "red" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
    };


    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'You have been logged out successfully.',
                position: 'top',  // Optional: top, bottom, or center
                visibilityTime: 4000, // Duration in ms
                autoHide: true,
            });

            setTimeout(() => {
                router.push('/signin'); // Ensure redirection happens after showing the toast
            }, 1000);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <View className="flex-1">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7">
                {loading ? (
                    <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
                ) : (
                    <View>
                        <Toast config={toastConfig} position="bottom" style={{ zIndex: 9999, elevation: 9999, position: 'absolute' }} />
                        <View className="flex flex-row items-center justify-between my-5">
                            <Text className="text-xl font-rubik-bold upper">Help & Support</Text>

                            <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                                <Image source={icons.backArrow} className="w-5 h-5" />
                            </TouchableOpacity>
                        </View>


                        <View className="flex flex-col mt-5 border-primary-200">
                            <TouchableOpacity
                                onPress={() => Linking.openURL("https://carzchoice.com/privacypolicy")}
                                className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white"
                            >
                                <View>
                                    <Text className="text-lg font-rubik-medium text-black-300 ml-3">Privacy Policy</Text>
                                    <Text className="text-sm font-rubik text-gray-700 ml-3">Help Center & Legal terms</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Linking.openURL("https://carzchoice.com/disclaimer")}
                                className="flex flex-row items-center py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white"
                            >
                                <View>
                                    <Text className="text-lg font-rubik-medium text-black-300 ml-3">Disclaimer</Text>
                                    <Text className="text-sm font-rubik text-gray-700 ml-3">Legal info and clarification</Text>
                                </View>
                            </TouchableOpacity>

                            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
                                <TouchableOpacity onPress={handleLogout} className="flex flex-row items-center py-2 border border-red-300 mb-2 rounded-2xl ps-4 bg-white">
                                    <Image source={icons.logout} className="size-6" />
                                    <Text className="text-lg font-rubik-medium text-danger ml-3">Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </View>


                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Support;
