import { StyleSheet, Text, TouchableOpacity, View, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import images from '@/constants/images';
import icons from '@/constants/icons';

const MyVehicles = () => {
  const [userPropertyData, setUserPropertyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleCardPress = (id) => router.push(`/vehicles/${id}`);
  const handleEditPress = (id) => router.push(`/dashboard/editvehicle/${id}`);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));

      // Fetch user properties from API
      const response = await axios.get(`https://carzchoice.com/api/myoldvehiclelist/${parsedUserData.id}`);
      // console.log('API Response:', response.data.oldvehicles);

      if (response.data && response.data.oldvehicles) {
        const formattedData = response.data.oldvehicles.map((item) => {
          // ✅ Parse `images` field since it's a JSON string
          let parsedImages = [];
          try {
            parsedImages = JSON.parse(item.images); // Convert string to array
          } catch (error) {
            console.error("Error parsing images:", error);
          }

          // ✅ Get the first image (if exists) or fallback to a default image
          let firstImage = parsedImages.length > 0 && parsedImages[0].imageurl
            ? `https://carzchoice.com/${parsedImages[0].imageurl}`
            : 'https://carzchoice.com/assets/backend-assets/images/1720680106_3.png'; // Fallback image

            return {
            id: item.id,
            carname: item.carname,
            brandname: item.brandname,
            modalname: item.modalname,
            address: item.address,
            price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price), // ✅ Format price for Indian currency
            status: item.activationstatus,
            thumbnail: firstImage, // ✅ Use the first image
            city: item.district,
            state: item.state,
            manufactureyear: item.manufactureyear,
            };
        });

        setUserPropertyData(formattedData);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {


    fetchUserData();
  }, []);

  return (
    <SafeAreaView className="bg-white h-full px-4">
      <View className="flex-row items-center ml-2 justify-between">
        <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
          <Image source={icons.backArrow} className="w-5 h-5" />
        </TouchableOpacity>
        <Text className="text-lg mr-2 text-center font-rubik text-gray-700">My Vehicles</Text>
        <TouchableOpacity onPress={() => router.push('/notifications')}>
          <Image source={icons.bell} className='size-6' />
        </TouchableOpacity>
      </View>

      <View className="mt-3 mb-12">
        {loading ? (
          <View>
            <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 300 }} />
            <Text className="text-center text-gray-500 mt-10">Loading properties...</Text>
          </View>
        ) : userPropertyData.length === 0 ? (
          <Text className="text-center text-gray-500 mt-10">No properties found.</Text>
        ) : (
          <FlatList
            data={userPropertyData}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity className="flex-row my-2 p-3 rounded-lg border border-gray-100 bg-blue-50 shadow" onPress={() => handleCardPress(item.id)}>
                {/* Property Image */}
                <View className="w-24 h-24 overflow-hidden rounded-lg border border-gray-300">
                  <Image source={item.thumbnail ? { uri: item.thumbnail } : images.newYork} className="w-full h-full object-cover" />
                </View>

                {/* Property Details */}
                <View className="ml-4 flex-1">
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-md font-rubik text-gray-900">{item.manufactureyear} {item.carname}</Text>
                    <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik border  ${item.status === 'Activated' ? ' bg-green-50  text-green-700  border-green-500 ' : 'bg-red-50  text-red-700 border-red-600/20'}`}>{item.status}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-gray-700">{item.modalname}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{item.city} {item.state}</Text>
                  <View className="flex-row justify-between mt-2">
                    <Text className="text-sm font-semibold text-gray-700">{item.brandname}</Text>
                    <Text className="text-sm font-semibold text-blue-700">{item.price}</Text>
                    <TouchableOpacity onPress={() => handleEditPress(item.id)}>
                      <Text className="inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik border border-red-600 bg-gray-50 text-red-600">Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyVehicles;

const styles = StyleSheet.create({});
