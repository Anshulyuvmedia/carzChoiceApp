import React, { createContext, useContext, useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';
import { OverlayProvider, Chat, defaultTheme } from 'stream-chat-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Toast, { BaseToast } from 'react-native-toast-message';

// Create the Chat context
const ChatContext = createContext();

// Provider component
const ChatContextProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const [currentChannel, setCurrentChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0); // Store unread message count
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
    const initChat = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.error("❌ No user token found in AsyncStorage");
                setLoading(false); // <-- Prevent infinite loading
                return;
            }

            const storedUserData = await AsyncStorage.getItem('userData');
            const parsedUserData = storedUserData ? JSON.parse(storedUserData) : null;

            if (!parsedUserData?.id) {
                console.error("❌ Invalid user data, logging out");
                // Show a toast message
                Toast.show({
                    type: 'error',
                    text1: 'Invalid user data',
                    text2: 'Redirecting to home.',
                });
                // Redirect to the login page
                router.push(`/`);
                setLoading(false); // <-- Prevent infinite loading
                return;
            }

            const client = StreamChat.getInstance('3nbgqeewske9');

            const user = {
                id: parsedUserData.id.toString(),
                name: parsedUserData.fullname,
            };

            if (client.user) {
                await client.disconnectUser();
                console.log('✅ Disconnected existing user');
            }

            const response = await fetch('https://carzchoice.com/api/generate-chat-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    userName: user.name,
                }),
            });

            const data = await response.json();
            const token = data?.token;

            if (!token) {
                console.error("❌ Token generation failed:", data);
                setLoading(false); // <-- Prevent infinite loading
                return;
            }

            console.log("🔌 Connecting user to chat...");
            await client.connectUser(user, token);
            setChatClient(client);
            console.log("✅ User connected to chat");

        } catch (error) {
            console.error("❌ StreamChat initialization error:", error);
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

    const createOrGetChannel = async ({ sellerId, buyerId, carId, carName, dealerName, carImage }) => {
        if (!chatClient) return null;
        // console.log("Parsed enquiryData:", sellerId, buyerId, carId, carName, dealerName, carImage);

        const seller = String(sellerId).trim();
        const buyer = String(buyerId).trim();
        const sorted = [seller, buyer].sort();
        const channelId = `chat-${sorted.join("-")}-${carId}`;

        const fullMetadata = {
            name: carName || "Car Chat",
            sellername: dealerName || "Dealer",
            carId: carId,
            image: carImage || "",
            members: [seller, buyer],
        };

        try {
            const channel = chatClient.channel("messaging", channelId, fullMetadata);
            await channel.watch();

            // Check if update is needed
            const currentData = channel.data || {};
            const needsUpdate = ['name', 'sellername', 'carId', 'image'].some(
                key => fullMetadata[key] && currentData[key] !== fullMetadata[key]
            );

            if (needsUpdate) {
                await channel.update(fullMetadata);
                console.log("Channel metadata updated:", fullMetadata);
            }

            setCurrentChannel(channel);
            return channel;
        } catch (error) {
            console.error("Error creating or syncing channel:", error);
            return null;
        }
    };


    // Prevent render if loading or client isn't ready
    if (loading || !chatClient) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Toast config={toastConfig} position="bottom" />
                <Text style={{ marginBottom: 10 }}>Connecting user to chat...</Text>
                <ActivityIndicator size="large" color="#0000ff" />
                {!loading && (
                    <TouchableOpacity onPress={initChat}>
                        <Text style={{ marginTop: 20, color: 'blue' }}>Retry</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }
    const customTheme = {
        ...defaultTheme,
        attachment: {
            image: {
                width: '100%',
                height: undefined, // Let aspectRatio control the height
                aspectRatio: 1.5,  // Adjust to fit common image shapes
                resizeMode: 'cover',
                borderRadius: 12,
            },
        },
    };

    return (
        <OverlayProvider value={{ style: customTheme }}>
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
