import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import icons from '@/constants/icons';
import { useChatContext } from './ChatContext';

const ChatsScreen = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();
    const router = useRouter();

    const { chatClient, setCurrentChannel } = useChatContext();

    const handleCardPress = (carId) => {
        router.push(`/vehicles/${carId}`);
    };

    const fetchUserChannels = async () => {
        setLoading(true);
        try {
            if (!chatClient?.user?.id) {
                console.error("Chat client or user not initialized");
                return;
            }

            const userId = chatClient.user.id;

            const filters = { members: { $in: [userId] } };
            const sort = [{ last_message_at: -1 }];
            const options = { watch: true, state: true };

            const result = await chatClient.queryChannels(filters, sort, options);
            setChannels(result);
        } catch (error) {
            console.error('Error fetching user channels:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (chatClient?.user) {
            fetchUserChannels();
        }
    }, [chatClient?.user]); // Only fetch channels once user is connected


    const handleChatPress = async (channel) => {
        setCurrentChannel(channel);

        const otherMember = Object.values(channel.state.members).find(
            member => member.user.id !== chatClient.user.id
        );

        const dealerName = otherMember?.user?.name || 'Dealer';

        navigation.navigate("ChatRoom", { dealerName });
    };
    const getInitials = (name) => {
        if (!name) return '';
        const nameParts = name.trim().split(' ');
        if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
        return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    };


    const renderItem = ({ item: channel }) => {
        const lastMessage = channel.state.messages[channel.state.messages.length - 1];
        const otherMember = Object.values(channel.state.members).find(member => member.user.id !== chatClient.user.id);
        const carName = channel.data.name || "Car Chat";

        return (
            <TouchableOpacity onPress={() => handleChatPress(channel)} className="mb-4 p-4 bg-gray-100 rounded-2xl shadow-sm">
                <View className="flex-row items-start space-x-4">
                    <View className="relative">
                        <View className="w-12 h-12 rounded-full bg-primary-200 items-center justify-center">
                            <Text className="text-primary-300 font-bold text-lg">
                                {getInitials(otherMember?.user?.name || 'D')}
                            </Text>
                        </View>
                        {channel.countUnread() > 0 && (
                            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 py-0.5 min-w-[20px] items-center justify-center">
                                <Text className="text-xs text-white font-bold">
                                    {channel.countUnread()}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 ms-3">
                        <View className="flex-row justify-between items-center mb-1">
                            <Text className="text-lg font-semibold text-primary-300 capitalize">
                                {otherMember?.user?.name || 'Dealer'}
                            </Text>
                            <Text className="text-xs text-gray-400">
                                {new Date(channel.data.last_message_at).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text className="text-sm font-medium text-gray-900">{carName}</Text>
                        <Text className="text-sm text-gray-700 mt-1" numberOfLines={1}>
                            {lastMessage?.text || 'No messages yet'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center mt-2 space-x-2">
                    <TouchableOpacity
                        onPress={() => handleCardPress(channel.data.carId)}
                        className="flex-1 flex-row items-center justify-center border border-gray-400 bg-blue-50 rounded-full px-3 py-2 me-2"
                    >
                        <Image source={icons.eye} className="w-4 h-4 mr-2" />
                        <Text className="text-sm font-rubik text-gray-700">View Car</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleChatPress(channel)}
                        className="flex-1 flex-row items-center justify-center bg-green-500 rounded-full px-3 py-2 me-2"
                    >
                        <Image source={icons.bubblechat} className="w-4 h-4 mr-2" />
                        <Text className="text-sm font-rubik-bold text-white">Open Chat</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading chats...</Text>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white px-4 py-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-rubik-bold text-black">All Chats</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
                >
                    <Image source={icons.backArrow} className="w-4 h-4" />
                </TouchableOpacity>
            </View>

            {channels.length === 0 ? (
                <Text className="text-center text-gray-500 mt-20">No active chats yet.</Text>
            ) : (
                <FlatList
                    data={channels}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default ChatsScreen;
