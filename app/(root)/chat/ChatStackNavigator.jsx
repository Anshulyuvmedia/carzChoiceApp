import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatContextProvider from './ChatContext'; // Import context provider
import ChatsScreen from './ChatsScreen';
import ChatRoomScreen from './ChatRoomScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <ChatContextProvider>
            <Stack.Navigator>
                <Stack.Screen name="Chats" component={ChatsScreen} />
                <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            </Stack.Navigator>
        </ChatContextProvider>
    );
};

export default AppNavigator;
