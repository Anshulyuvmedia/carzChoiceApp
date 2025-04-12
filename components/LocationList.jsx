import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import cities from '@/constants/cities'

const LocationList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState(params.city || 'All');
    const [brandData, setBrandData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;
        const updatedParams = { ...params };
    
        if (isRemovingFilter) {
            setSelectedCategory(category);
        } else {
            updatedParams.city = category;
            setSelectedCategory(category);
        }
    
        // 🔹 Delay navigation slightly to allow proper mounting
        setTimeout(() => {
            router.push({ pathname: "/vehicles/explore", params: updatedParams });
        }, 200); 
    };


    return (
        <View className="flex flex-row flex-wrap mt-5 mb-2 pb-3 align-middle justify-center">
            {Object.keys(cities).map((key) => {
                const city = cities[key];
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => handleCategoryPress(key)}
                        className={`flex flex-col items-center mr-2 mb-2 py-2 w-24 rounded-xl ${selectedCategory === key ? 'bg-blue-50' : 'border border-primary-200'}`}
                    >
                        <Image source={city} style={styles.cityImg} />
                        <Text className={`text-sm font-rubik-bold capitalize ${selectedCategory === key ? 'text-black mt-0.5' : 'text-black-300 font-rubik'}`}>
                            {key}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default LocationList;

const styles = StyleSheet.create({
    cityImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
});
