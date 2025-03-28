import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { settings } from '@/constants/data';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast, { BaseToast } from 'react-native-toast-message';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [image, setImage] = useState(images.avatar);
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

  useEffect(() => {
    fetchUserData();
  }, []);


  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have been logged out successfully.',
        position: 'bottom',  // Optional: top, bottom, or center
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
    <SafeAreaView>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7">
        {loading ? (
          <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
        ) : (
          <View>
            <Toast config={toastConfig} position="top" />
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-xl font-rubik-bold upper">Dashboard</Text>

              <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center ml-2 justify-start shadow bg-white rounded-2xl p-5">
              <Image
                source={typeof image === 'string' ? { uri: image } : image}
                className="size-12 rounded-full"
              />
              <View className="flex flex-col items-start ml-2 justify-center">
                <Text className="text-2xl font-rubik-bold mt-2 text-primary-300 capitalize">
                  {userData?.fullname || 'User'}
                </Text>
                {userData && (
                  <View>
                    <Text className="text-black">Email: {userData.email || 'N/A'}</Text>
                    <Text className="text-black">Mobile: {userData.contactno || 'N/A'}</Text>
                    <Text className="text-black capitalize">Role: {userData.usertype || 'N/A'}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex flex-col mt-10 border-t pt-5 border-primary-200">


              <TouchableOpacity onPress={() => router.push('/dashboard/carloan')} className="flex flex-row items-center py-3">
                <Image source={icons.person} className="size-6" />
                <Text className="text-lg font-rubik-medium text-black-300 ml-3">Car Loan</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/dashboard/carinsurance')} className="flex flex-row items-center py-3">
                <Image source={icons.person} className="size-6" />
                <Text className="text-lg font-rubik-medium text-black-300 ml-3">Buy Insurance </Text>
              </TouchableOpacity>
              {settings.slice(1).map((item, index) => (
                <TouchableOpacity key={index} onPress={() => router.push(item.onPress)} className="flex flex-row items-center py-3">
                  <Image source={item.icon} className="size-6" />
                  <Text className="text-lg font-rubik-medium text-black-300 ml-3">{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
              <TouchableOpacity onPress={() => router.push('/dashboard/editprofile')} className="flex flex-row items-center py-3">
                <Image source={icons.person} className="size-6" />
                <Text className="text-lg font-rubik-medium text-black-300 ml-3">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/dashboard/registerdealer')} className="flex flex-row items-center py-3">
                <Image source={icons.person} className="size-6" />
                <Text className="text-lg font-rubik-medium text-primary-300 ml-3">Become A Dealer</Text>
              </TouchableOpacity>
            </View>

            <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
              <TouchableOpacity onPress={handleLogout} className="flex flex-row items-center py-3">
                <Image source={icons.logout} className="size-6" />
                <Text className="text-lg font-rubik-medium text-danger ml-3">Logout</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;
