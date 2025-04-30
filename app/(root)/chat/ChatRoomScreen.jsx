import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useChatContext } from "./ChatContext";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";

const ChatRoomScreen = () => {
    const { currentChannel } = useChatContext();
    const navigation = useNavigation();
    const route = useRoute();
    const { dealerName } = route.params || {};

    useEffect(() => {
        if (dealerName) {
            navigation.setOptions({
                headerTitle: () => (
                    <View>
                        <Text style={{ fontSize: 16, fontWeight: "bold", textTransform: 'capitalize' }}>{dealerName}</Text>
                    </View>
                ),
                tabBarStyle: { display: 'none' },
            });
        }
    }, [dealerName]);




    if (!currentChannel) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <Channel channel={currentChannel}>
            {/* Fixed car name under header */}
            <View style={styles.subtitleContainer}>
                <Text style={styles.subtitleText}>
                    {currentChannel?.data?.name}
                </Text>
            </View>
            <MessageList />
            <MessageInput />
        </Channel>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitleContainer: {
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    subtitleText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});

export default ChatRoomScreen;
