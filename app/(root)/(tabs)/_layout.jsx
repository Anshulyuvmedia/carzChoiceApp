import { Tabs, useNavigationContainerRef, usePathname } from "expo-router";
import { Image, Text, View } from "react-native";
import icons from "@/constants/icons";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const TabIcon = ({ focused, icon, title }) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image
            source={icon}
            tintColor={focused ? "#0061FF" : "#666876"}
            resizeMode="contain"
            className="size-6"
        />
        <Text
            className={`${focused
                ? "text-primary-300 font-rubik-medium"
                : "text-black-200 font-rubik"
                } text-xs w-full text-center mt-1`}
        >
            {title}
        </Text>
    </View>
);

const TabsLayout = () => {
    const pathname = usePathname();

    // Check if we're on a screen where tab bar should be hidden
    const hideTabBar = pathname.startsWith("/chat/ChatRoom");
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarStyle: hideTabBar
                        ? { display: "none" }
                        : {
                            backgroundColor: "white",
                            position: "absolute",
                            borderTopColor: "#0061FF1A",
                            borderTopWidth: 1,
                            minHeight: 70,
                        },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.home} title="Home" />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="explore"
                    options={{
                        title: "Buy Car",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.keys} title="Buy Car" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="myvehicles"
                    options={{
                        title: "My Vehicles",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.showroom} title="My Vehicles" />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="sellvehicle"
                    options={{
                        title: "Sell Car",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.sell} title="Sell Car" />
                        ),
                    }}
                />
                {/* Directly link to the chat route */}
                <Tabs.Screen
                    name="chat"
                    options={{
                        title: "Chat",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.bubblechat} title="Chats" />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="dashboard"
                    options={{
                        title: "Dashboard",
                        headerShown: false,
                        tabBarIcon: ({ focused }) => (
                            <TabIcon focused={focused} icon={icons.person} title="My Account" />
                        ),
                    }}
                />

            </Tabs>
        </GestureHandlerRootView>
    );
};

export default TabsLayout;