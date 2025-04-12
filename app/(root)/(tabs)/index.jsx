import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import Search from '@/components/Search';
import { Card, FeaturedCard, LocationCard } from '@/components/Cards';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BrandList from '../../../components/BrandList';
import LocationList from '../../../components/LocationList';
import GetLocation from '../../../components/GetLocation';
import { LocationContext } from '@/components/LocationContext';
import BannerSlider from '../../../components/BannerSlider';

const Index = () => {
    const handleCardPress = (id) => router.push(`/vehicles/${id}`);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [image, setImage] = useState(images.avatar);
    const [listingData, setListingData] = useState();
    const [locationData, setLocationData] = useState();
    const { currentCity } = useContext(LocationContext);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;
            // console.log('Parsed User Data:', parsedUserData);
            if (!parsedUserData || typeof parsedUserData !== 'object' || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }
            // Fetch user data from API
            const response = await axios.get(`https://carzchoice.com/api/userprofile/${parsedUserData.id}`);

            if (response.data && Array.isArray(response.data.userData) && response.data.userData.length > 0) {
                const apiUserData = response.data.userData[0];

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

    const fetchFilterData = async () => {
        setLoading(true);
        setListingData([]);

        let requestBody = {
            location: currentCity || null,
            attribute: {} // Initialize attribute to avoid breaking below
        };

        // Remove null keys from attribute
        Object.keys(requestBody.attribute).forEach(
            (key) => requestBody.attribute[key] === null && delete requestBody.attribute[key]
        );

        if (!requestBody.location) delete requestBody.location;

        try {
            const response = await axios.post("https://carzchoice.com/api/filterOldCarByAttribute", requestBody, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.data.variants) {
                setLocationData(response.data.variants);
            } else {
                setLocationData([]);
            }
        } catch (error) {
            console.error("Error fetching listings:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentCity) {
            fetchFilterData(); // Call only after currentCity is available
        }
    }, [currentCity]);

    useEffect(() => {
        fetchUserData();
        fetchListingData();
    }, []);

    // console.log('Api listing data: ',listingData);
    return (
        <SafeAreaView className='bg-white h-full'>
            <View className='flex flex-row items-center justify-between my-3 px-3'>
                <TouchableOpacity onPress={() => router.push('/dashboard')} className='flex flex-row items-center ml-2 justify-center'>
                    <Image source={images.applogo} className='w-24 h-12' />
                    {/* <View className='flex flex-col items-start justify-center'>
                        <Text className='text-sm font-rubik text-black-100'>
                            Welcome
                        </Text>
                        <Text className='text-xl font-rubik-medium text-black-300'>
                            {userData?.fullname?.split(' ')[0] || 'User'}
                        </Text>
                    </View> */}
                </TouchableOpacity>

                <GetLocation />

                <View className='flex flex-row items-center justify-between'>
                    <TouchableOpacity onPress={() => router.push('/sellvehicle')}>
                        <Text className=" font-rubik-bold text-lg">Sell</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/vehicles/explore')}>
                        <Text className="ms-4 font-rubik-bold text-lg">Buy</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
            ) : (
                <FlatList
                    data={listingData?.data || []}
                    renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerClassName="pb-32"
                    columnWrapperClassName='flex gap-2 px-3'
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View className='px-3'>
                            <Search />

                            <View className='mt-5'>
                                <BannerSlider />
                            </View>
                            <View className='mt-5'>
                                <View className='flex flex-row items-center justify-between'>
                                    <Text className='text-xl font-rubik-bold text-black-300 capitalize'>Get Car in {currentCity}</Text>
                                </View>
                                {locationData && locationData.length > 0 ? (
                                    <FlatList
                                        data={locationData}
                                        renderItem={({ item }) => (
                                            <LocationCard item={item} onPress={() => handleCardPress(item.id)} />
                                        )}
                                        keyExtractor={(item) => item.id.toString()}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{
                                            paddingHorizontal: 12,
                                            gap: 16, // horizontal spacing between cards
                                            paddingBottom: 24,
                                        }}
                                    />
                                ) : (
                                    <Text className='text-base font-rubik text-black-300'>
                                        No cars in your location
                                    </Text>
                                )}

                            </View>
                            <View className='mt-5'>
                                <View className='flex flex-row items-center justify-between'>
                                    <Text className='text-xl font-rubik-bold text-black-300 capitalize'>Get Car By Brand </Text>
                                </View>
                                <BrandList />
                            </View>

                            <View className='mt-5'>
                                <View className='flex flex-row items-center justify-between'>
                                    <Text className='text-xl font-rubik-bold text-black-300'>Old Car By Cities</Text>
                                </View>
                            </View>
                            <LocationList />

                            <View className='mt-5'>
                                <View className='flex flex-row items-center justify-between'>
                                    <Text className='text-xl font-rubik-bold text-black-300'>Other Cars </Text>
                                </View>
                            </View>

                        </View>
                    }
                />
            )}


        </SafeAreaView>
    );
};

const styles = StyleSheet.create({

});

export default Index;
