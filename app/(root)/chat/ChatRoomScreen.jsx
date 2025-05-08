import React from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useChatContext } from "./ChatContext";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useRoute } from "@react-navigation/native";
import { useRouter } from 'expo-router';
import icons from '@/constants/icons'; // Assuming you have your icons

// Your provided getInitials function
const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase();
    return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
};

const ChatRoomScreen = () => {
    const { currentChannel } = useChatContext();
    const route = useRoute();
    const router = useRouter();

    const { dealerName, dealerId, imageUrl } = route.params || {};
    // console.log(currentChannel.data.image);
    const handleImagePress = (dealerId) => {
        router.push(`/dealers/${dealerId}`);
    };

    if (!currentChannel) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Channel channel={currentChannel}>
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => handleImagePress(dealerId)} style={styles.profileContainer}>
                        <View style={styles.profileImageWrapper}>
                            {currentChannel.data.image ? (

                                <Image
                                    source={{ uri: currentChannel.data.image }}
                                    style={styles.profileImage}
                                    resizeMode="cover"
                                />

                            ) : (
                                <Text style={styles.initialsText}>
                                    {getInitials(dealerName || 'D')}
                                </Text>
                            )}
                        </View>
                        <Text className="ms-3 font-rubik-bold capitalize text-lg">{dealerName}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Image source={icons.backArrow} style={styles.backIcon} />
                    </TouchableOpacity>
                </View>

                {/* Channel Name */}
                <View style={styles.subtitleContainer}>
                    <Text style={styles.subtitleText}>
                        {currentChannel?.data?.name}
                    </Text>
                </View>

                {/* Chat Components */}
                <MessageList />
                <MessageInput />
            </View>
        </Channel>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImageWrapper: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    initialsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4B8B3B', // You can customize the text color here
    },
    backButton: {
        flexDirection: 'row',
        borderRadius: 50,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    backIcon: {
        width: 20,
        height: 20,
    },
    subtitleContainer: {
        paddingVertical: 8,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});

export default ChatRoomScreen;
