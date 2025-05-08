import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatContextProvider from './ChatContext'; // Import context provider
import ChatsScreen from './ChatsScreen';
import ChatRoomScreen from './ChatRoomScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

const ChatStack = () => {
    return (
        <ChatContextProvider>
            <Stack.Navigator>
                <Stack.Screen name="Chats" component={ChatsScreen} options={{ headerShown: false, title: "My Enquiries" }} />
                <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false }}  />
            </Stack.Navigator>
        </ChatContextProvider>
    );
};

export default ChatStack;
