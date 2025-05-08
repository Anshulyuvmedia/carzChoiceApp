import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import images from '@/constants/images';
import icons from '@/constants/icons';
import { settings } from '@/constants/data';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast, { BaseToast } from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const navigation = useNavigation();
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

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      onPress={() => router.push(item.onPress)}
      className="flex flex-row items-center justify-between py-2 border border-gray-300 mb-2 rounded-2xl ps-4 bg-white mx-5"
    >
      <View className="flex flex-row items-center">
        <Image source={item.icon} className="size-6" />
        <View>
          <Text className="text-lg font-rubik-medium text-black-300 ml-3">{item.title}</Text>
          <Text className="text-sm font-rubik text-gray-700 ml-3">{item.subtitle}</Text>
        </View>
      </View>
      <View className="me-3">
        <Image source={icons.rightArrow} className="size-6 ms-auto" />
      </View>
    </TouchableOpacity>
  );

  const listData = [
    ...settings,
    {
      title: 'Become A Dealer',
      subtitle: 'Sell Car of Multiple Brands',
      icon: icons.person,
      onPress: '/dashboard/registerdealer',
      condition: userData && userData.usertype === 'User',
    },
    {
      title: 'Help & Support',
      subtitle: 'Help Center & Legal terms',
      icon: icons.customersupport,
      onPress: '/dashboard/support',
    },
  ];

  return (
    <View className="flex-1">
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
        <Toast config={toastConfig} position="top" />
      </View>
      <FlatList
        data={listData.filter(item => item.condition !== false)}  // Filter out items based on the condition
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View className="flex flex-row items-center justify-between m-5">
              <Text className="text-xl font-rubik-bold upper">My Account</Text>
              <TouchableOpacity onPress={() => router.back()} className="flex-ro rounded-full w-11 h-11 items-center justify-center">
                <Image source={icons.backArrow} className="w-5 h-5" />
              </TouchableOpacity>
            </View>

            {/* Profile Info */}
            <View className="flex flex-row items-center justify-start shadow bg-white rounded-2xl px-3 mx-5 mb-3">
              <Image
                source={typeof image === 'string' ? { uri: image } : image}
                className="size-12 rounded-full"
              />
              <View className="flex flex-col items-start ml-2 justify-center">
                {userData && (
                  <View className="bg-white p-4 rounded-lg shadow-sm">
                    <Text className="text-2xl font-rubik-bold text-primary-300 capitalize">
                      {userData?.fullname || 'User'}
                    </Text>

                    <Text className="text-black text-base mb-2">
                      Email: <Text className="font-medium">{userData.email || 'N/A'}</Text>
                    </Text>
                    <View className="flex-row items-start justify-between">
                      <View>
                        <Text className="text-black text-base mb-1">
                          Mobile: <Text className="font-medium">{userData.contactno || 'N/A'}</Text>
                        </Text>
                        <Text className="text-black text-base capitalize">
                          Role: <Text className="font-medium">{userData.usertype || 'N/A'}</Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => router.push('/dashboard/editprofile')}
                        className="bg-primary-200 px-4 py-2 rounded-lg self-end ms-10"
                      >
                        <Text className="text-primary-300 text-base font-rubik-medium">
                          Edit Profile
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Dashboard;
