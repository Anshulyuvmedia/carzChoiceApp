import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import cities from '@/constants/cities';

const LocationScroll = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(params.propertyType || 'All');

    const handleCategoryPress = (category) => {
        const updatedParams = { ...params };

        if (selectedCategory === category) {
            setSelectedCategory(category);
        } else {
            updatedParams.propertyType = category;
            setSelectedCategory(category);
        }

        // 🔹 Slight delay for smooth navigation
        setTimeout(() => {
            router.push({ pathname: "/vehicles/explore", params: updatedParams });
        }, 200);
    };

    return (

        <FlatList
            data={Object.keys(cities)}
            keyExtractor={(item) => item}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true} // ✅ Allows scrolling inside ScrollView
            contentContainerStyle={styles.flatListContainer}
            renderItem={({ item }) => {
                const city = cities[item];
                return (
                    <TouchableOpacity
                        onPress={() => handleCategoryPress(item)}
                        style={[
                            styles.touchableOpacity,
                            selectedCategory === item ? styles.selectedCategory : styles.unselectedCategory
                        ]}
                    >
                        <Image source={city} style={styles.cityImg} />
                        <Text style={[
                            styles.text,
                            selectedCategory === item ? styles.selectedText : styles.unselectedText
                        ]}>
                            {item}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
};

export default LocationScroll;

const styles = StyleSheet.create({
    flatListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    touchableOpacity: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 6,
        paddingInline: 10,
        paddingBlock: 5,
        // width: 96, // Same as `w-24`
        borderRadius: 50, // rounded-xl
        borderWidth: 2,
        borderColor: 'blue',
    },
    selectedCategory: {
        backgroundColor: '#E0F2FE', // bg-blue-50
    },
    unselectedCategory: {
        borderWidth: 1,
        borderColor: 'lightgrey',
    },
    text: {
        fontSize: 12,
        fontFamily: 'Rubik-medium',
        textTransform: 'capitalize',
    },
    selectedText: {
        color: '#000000',
        marginTop: 0.5,
    },
    unselectedText: {
        color: 'black',
        fontFamily: 'Rubik-Medium',
    },
    cityImg: {
        width: 30,
        height: 30,
        resizeMode: "contain",
        marginEnd: 5,
    },
});
