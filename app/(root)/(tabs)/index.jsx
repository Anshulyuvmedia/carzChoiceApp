import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card, FeaturedCard } from '@/components/Cards';
import Filters from '@/components/Filters';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// import * as Location from 'expo-location';
// import { useNavigation } from "expo-router"; 
import { useNavigation } from "@react-navigation/native";
import BrandList from '../../../components/BrandList';
import { Colors } from '@/constants/Colors'
import BodyTypeList from '../../../components/BodyTypeList';
import LocationList from '../../../components/LocationList';

const Index = () => {
    const handleCardPress = (id) => router.push(`/vehicles/${id}`);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [image, setImage] = useState(images.avatar); // Default avatar
    const [listingData, setListingData] = useState(); // Default avatar
    const navigation = useNavigation();


    // const requestLocationPermission = async () => {
    //     const { status } = await Location.requestForegroundPermissionsAsync();

    //     if (status !== 'granted') {
    //         Alert.alert('Permission Denied', 'Location permission is required to show the map.');
    //         return false; // Return false if permission is denied
    //     }

    //     return true; // Return true if permission is granted
    // };


    const fetchUserData = async () => {
        setLoading(true);
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

            if (!parsedUserData || typeof parsedUserData !== 'object' || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            // Fetch user data from API
            const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);

            if (response.data && Array.isArray(response.data.userData) && response.data.userData.length > 0) {
                const apiUserData = response.data.userData[0];
                setUserData(apiUserData);

                // Set Profile Image, ensuring fallback to default avatar
                setImage(
                    apiUserData.dp
                        ? apiUserData.dp.startsWith('http')
                            ? apiUserData.dp
                            : `https://carzchoice.com/assets/backend-assets/images/${apiUserData.dp}`
                        : images.avatar
                );
            } else {
                console.error('Unexpected API response format:', response.data);
                setImage(images.avatar);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setImage(images.avatar);
        } finally {
            setLoading(false);
        }
    };

    const fetchListingData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/oldvehiclelist`);
            if (response) {
                const apiData = response;
                setListingData(apiData);
                // console.log('ApiData: ',apiData);

            } else {
                console.error('Unexpected API response format:', response.data);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }

    // useEffect(() => {
    //     (async () => {
    //         const hasPermission = await requestLocationPermission();
    //         if (hasPermission) {
    //             getLocation(); // Call the function instead of writing logic directly inside useEffect
    //         }
    //     })();
    // }, []);

    // Define the getLocation function
    // const getLocation = async () => {
    //     try {
    //         const location = await Location.getCurrentPositionAsync({
    //             accuracy: Location.Accuracy.High,
    //             timeout: 5000, // Prevents infinite hang
    //         });

    //         console.log("User Location:", location);
    //     } catch (error) {
    //         console.error("Location fetch failed, using fallback:", error);
    //         // You can set a default location or show an alert here
    //     }
    // };

    useEffect(() => {
        fetchUserData();
        fetchListingData();
    }, []);

    // console.log('Api listing data: ',listingData);
    return (
        <SafeAreaView className='bg-white h-full'>
            <FlatList
                data={listingData?.data || []}
                renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerClassName="pb-32"
                columnWrapperClassName='flex gap-2 px-3'
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View className='px-5'>
                        <View className='flex flex-row items-center justify-between mt-5'>
                            <TouchableOpacity onPress={() => router.push('/dashboard')} className='flex flex-row items-center ml-2 justify-center'>
                                <Image source={typeof image === 'string' ? { uri: image } : images.avatar} className='size-12 rounded-full' />
                                <View className='flex flex-col items-start ml-2 justify-center'>
                                    <Text className='text-sm font-rubik text-black-100'>
                                        Welcome
                                    </Text>
                                    <Text className='text-lg font-rubik-medium text-black-300'>
                                        {userData?.fullname?.split(' ')[0] || 'User'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.push('/notifications')}>
                                <Image source={icons.bell} className='size-6' />
                            </TouchableOpacity>
                        </View>

                        <Search />
                        <View className='my-5'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl font-rubik-bold text-black-300'>Special Offer</Text>
                                <TouchableOpacity>
                                    <Text className='text-base font-rubik-bold' style={{ color: Colors.dark }}>See All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <FlatList
                            data={listingData?.data || []}
                            renderItem={({ item }) => <FeaturedCard item={item} onPress={() => handleCardPress(item.id)} />}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                            pagingEnabled
                            contentContainerClassName='flex gap-2'
                        />
                        <BrandList />

                        <View className='mt-5'>
                            <View className='flex flex-row items-center justify-between'>
                                <Text className='text-xl font-rubik-bold text-black-300'>Used Car By Cities</Text>
                            </View>
                        </View>
                        <LocationList />


                    </View>
                }
            />


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Index;
