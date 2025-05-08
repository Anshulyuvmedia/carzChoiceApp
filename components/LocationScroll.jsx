import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import cities from '@/constants/cities';

const LocationScroll = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState((params.city || '').toUpperCase());


    const handleCategoryPress = (category) => {
        const updatedParams = { ...params };
        const upperCategory = category.toUpperCase();
        if (selectedCategory === upperCategory) {
            setSelectedCategory('');
            delete updatedParams.city;
        } else {
            setSelectedCategory(upperCategory);
            updatedParams.city = upperCategory;
            // console.log("Current Selected City:", updatedParams);
        }

        // Uncomment this when ready to navigate
        router.push({ pathname: "/dashboard/explore", params: updatedParams });
    };


    return (
        <FlatList
            data={Object.keys(cities)}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true} // ✅ Allows scrolling inside ScrollView
            contentContainerStyle={styles.flatListContainer}
            renderItem={({ item }) => {
                const city = cities[item];
                const isSelected = selectedCategory === item.toUpperCase();
                return (
                    <TouchableOpacity
                        onPress={() => handleCategoryPress(item)}
                        style={[
                            styles.touchableOpacity,
                            isSelected ? styles.selectedCategory : styles.unselectedCategory
                        ]}
                    >
                        <Image source={city} style={styles.cityImg} />
                        <Text style={[
                            styles.text,
                            isSelected ? styles.selectedText : styles.unselectedText
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
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 50, // rounded-xl
        borderWidth: 1,
    },
    selectedCategory: {
        backgroundColor: '#E0F2FE', // bg-blue-50
        borderColor: '#007bff',
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
        fontWeight: 'bold',
    },
    unselectedText: {
        color: 'black',
        fontFamily: 'Rubik-Medium',
    },
    cityImg: {
        width: 25,
        height: 25,
        resizeMode: "contain",
        marginEnd: 5,
    },
});
