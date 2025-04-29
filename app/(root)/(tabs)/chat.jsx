import React from 'react';
import { View, Text } from 'react-native';
import ChatStack from '../chat/_layout'; // Import the chat stack from the chat directory

const ChatTab = () => {
    return (
        <View style={{ flex: 1 }}>
            {/* Chat Stack will be rendered here */}
            <ChatStack />
        </View>
    );
};

export default ChatTab;
