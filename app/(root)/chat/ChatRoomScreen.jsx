import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useChatContext } from "./ChatContext";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { useNavigation } from "@react-navigation/native";

const ChatRoomScreen = () => {
    const { currentChannel } = useChatContext();
    const navigation = useNavigation();

    useEffect(() => {
        if (currentChannel) {
            navigation.setOptions({ title: currentChannel?.data?.name || "Channel" });
        }
    }, [currentChannel?.data?.name]);

    if (!currentChannel) {
        // Render a loading state if the channel is not set
        return <ActivityIndicator />;
    }

    return (
        <Channel channel={currentChannel}>
            <MessageList />
            <MessageInput />
        </Channel>
    );
};

export default ChatRoomScreen;
