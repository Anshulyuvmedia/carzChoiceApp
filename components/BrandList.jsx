import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const BrandList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.propertyType || 'All');
    const [brandData, setBrandData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;

        // Prepare new query parameters
        const updatedParams = { ...params };

        if (isRemovingFilter) {
            delete updatedParams.propertyType; // Remove filter if category is already selected
            setSelectedCategory('All');
        } else {
            updatedParams.propertyType = category;
            setSelectedCategory(category);
        }

        // Navigate with updated query parameters
        router.push({
            pathname: "/properties/explore",
            params: updatedParams,
        });
    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            // console.log("brandData", response.data.data);

            if (response.data && response.data) {
                setBrandData(response.data.data);
                // console.log("brandData:", brandData);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching brand list:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrandList();
    }, []);

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-2 pb-3">

            {brandData.map((item) => (
                    <TouchableOpacity
                        key={item.id.toString()}
                        onPress={() => handleCategoryPress(item.label)}
                        className={`flex flex-col items-center mr-2 px-2 rounded-lg  ${selectedCategory === item.label ? 'bg-primary-300' : ' border border-primary-200'
                            }`}
                    >
                        {item.iconimage ? (
                            <Image
                                style={styles.brandImg}
                                source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                                onError={(e) => console.error(`Error loading image for ${item.label}:`, e.nativeEvent.error)}
                            />
                        ) : (
                            <Text>No Image</Text> // Fallback text if image is missing
                        )}

                        <Text className={`text-sm ${selectedCategory === item.label ? 'text-white font-rubik-bold mt-0.5' : 'text-black-300 font-rubik'}`}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
            ))}

        </ScrollView>
    );
};

export default BrandList;

const styles = StyleSheet.create({
    brandImg: {
        width: 50,
        height: 50,
        resizeMode: "contain",
    },
});
