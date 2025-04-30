import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatContextProvider from './ChatContext'; // Import context provider
import ChatsScreen from './ChatsScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
    return (
        <ChatContextProvider>
            <Stack.Navigator>
                <Stack.Screen name="Chats" component={ChatsScreen}  options={{ headerShown: false, title: "My Enquiries" }} />
                <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            </Stack.Navigator>
        </ChatContextProvider>
    );
};

export default ChatStack;
