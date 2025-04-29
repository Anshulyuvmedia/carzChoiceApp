import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ChatContextProvider, { useChatContext } from './ChatContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import icons from '@/constants/icons';

const ChatsScreen = () => {
    const [userLeadData, setUserLeadData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { createOrGetChannel, setCurrentChannel } = useChatContext();
    const navigation = useNavigation();

    // Fetch lead data
    const fetchLeadsData = async () => {
        setLoading(true);
        try {
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            const response = await axios.get(`https://carzchoice.com/api/getmyenquires/${parsedUserData.id}`);

            if (response.data && response.data.data) {
                const formattedData = response.data.data.map((item) => ({
                    id: item.carid,
                    carname: item.vehicle,
                    remarks: item.remarks,
                    mobile: item.mobile,
                    created_at: new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    status: item.leadstatus,
                    city: item.city,
                    state: item.state,
                }));
                setUserLeadData(formattedData);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeadsData();
    }, []);

    const handleChatPress = async (lead) => {
        const userData = JSON.parse(await AsyncStorage.getItem('userData'));

        const channel = await createOrGetChannel({
            sellerId: lead.seller_id,  // Seller's ID
            buyerId: userData.id,      // Current user's ID
            carId: lead.carid,         // Car's ID
            carName: lead.carname,     // Car's name
        });

        if (channel) {
            setCurrentChannel(channel);
            navigation.navigate("ChatRoom"); // Navigate to the chat screen
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ChatContextProvider>
            <View className="flex-1 bg-white px-4 py-4">
                <Text className="text-xl font-semibold text-gray-800 mb-4">My Enquiries</Text>

                {userLeadData.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-20">No enquiries found.</Text>
                ) : (
                    userLeadData.map((lead) => (
                        <View key={lead.id} className="mb-4 p-4 bg-gray-100 rounded-2xl shadow-sm">
                            <Text className="text-lg font-semibold text-gray-900">{lead.carname}</Text>
                            <Text className="text-sm text-gray-700 mt-1">City: {lead.city}, {lead.state}</Text>
                            <Text className="text-sm text-gray-700">Remarks: {lead.remarks}</Text>
                            <Text className="text-sm text-gray-500 mt-1">Status: {lead.status}</Text>
                            <Text className="text-xs text-gray-400 mt-1">Enquired on: {lead.created_at}</Text>

                            <TouchableOpacity
                                onPress={() => handleChatPress(lead)}
                                className="mt-4 flex-row items-center justify-center bg-green-600 rounded-full px-4 py-2"
                            >
                                <Image source={icons.bubblechat} className="w-5 h-5 mr-2" />
                                <Text className="text-sm font-semibold text-white">Chat Now</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>
        </ChatContextProvider>

    );
};

export default ChatsScreen;
