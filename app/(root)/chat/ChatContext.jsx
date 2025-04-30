import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { OverlayProvider, Chat } from 'stream-chat-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

// Create the Chat context
const ChatContext = createContext();

// Provider component
const ChatContextProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0); // Store unread message count

    const initChat = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.error("User not authenticated!");
                return;
            }

            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

            if (!parsedUserData || typeof parsedUserData !== 'object' || !parsedUserData.id) {
                await AsyncStorage.removeItem('userData');
                router.push('/signin');
                return;
            }

            const client = StreamChat.getInstance('3nbgqeewske9');
            const user = {
                id: parsedUserData.id.toString(),
                name: parsedUserData.fullname
            };

            // Ensure that the client is disconnected before connecting
            if (client.user) {
                await client.disconnectUser();
                console.log('Disconnected existing user');
            }

            const response = await fetch('https://carzchoice.com/api/generate-chat-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    userId: parsedUserData.id.toString(),
                    userName: parsedUserData.fullname,
                }),
            });
            const data = await response.json();
            const token = data.token;

            if (token) {
                console.log('Connecting user to chat...');
                await client.connectUser(user, token);
                setChatClient(client);
                console.log('User connected to chat');
            } else {
                console.error("Failed to fetch chat token");
            }
        } catch (error) {
            console.error("StreamChat initialization error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initChat();

        return () => {
            if (chatClient) {
                console.log('Disconnecting user...');
                chatClient.disconnectUser();
            }
        };
    }, []);

    // Listen for new messages in the current channel
    useEffect(() => {
        if (!currentChannel) return;

        const handleNewMessage = (event) => {
            setUnreadCount(prevCount => prevCount + 1);  // Increment unread count
        };

        currentChannel.on('message.new', handleNewMessage);

        return () => {
            currentChannel.off('message.new', handleNewMessage);
        };
    }, [currentChannel]);

    const createOrGetChannel = async ({ sellerId, buyerId, carId, carName, dealerName }) => {
        if (!chatClient) return null;

        const seller = String(sellerId).trim();
        const buyer = String(buyerId).trim();

        const sorted = [seller, buyer].sort();
        const channelId = `chat-${sorted.join("-")}-${carId}`;

        try {
            const channel = chatClient.channel("messaging", channelId, {
                name: carName,
                sellername: dealerName,  
                members: [seller, buyer],
                carId: carId,
            });

            await channel.watch();
            setCurrentChannel(channel);
            return channel;
        } catch (error) {
            console.error("Error creating or getting channel:", error);
            return null;
        }
    };

    // Prevent render if loading or client isn't ready
    if (loading || !chatClient) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Connecting user to chat...</Text>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <OverlayProvider>
            <Chat client={chatClient}>
                <ChatContext.Provider value={{ currentChannel, setCurrentChannel, chatClient, createOrGetChannel, unreadCount }}>
                    {children}
                </ChatContext.Provider>
            </Chat>
        </OverlayProvider>
    );
};

// Hook to use the chat context
export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatContextProvider");
    }
    return context;
};

export default ChatContextProvider;
