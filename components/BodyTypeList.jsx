import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

const BodyTypeList = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.propertyType || 'All');
    const [brandData, setBrandData] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCategoryPress = (category) => {
        const isRemovingFilter = selectedCategory === category;
        const updatedParams = { ...params };

        if (isRemovingFilter) {
            delete updatedParams.propertyType;
            setSelectedCategory('All');
        } else {
            updatedParams.propertyType = category;
            setSelectedCategory(category);
        }

        router.push({ pathname: "/properties/explore", params: updatedParams });
    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data && response.data.data) {
                setBrandData(response.data.data);
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
        <View className="flex flex-row flex-wrap mt-10 mb-2 pb-3 align-middle justify-center">
            {brandData.slice(0, 11).map((item) => (
                <TouchableOpacity
                    key={item.id.toString()}
                    onPress={() => handleCategoryPress(item.label)}
                    className={`flex flex-col items-center mr-2 mb-2 w-24 rounded-xl  ${selectedCategory === item.label ? 'bg-primary-300' : 'border border-primary-200'}`}
                >
                    {item.iconimage ? (
                        <Image
                            style={styles.brandImg}
                            source={{ uri: `https://carzchoice.com/assets/backend-assets/images/${item.iconimage}` }}
                            onError={(e) => console.error(`Error loading image for ${item.label}:`, e.nativeEvent.error)}
                        />
                    ) : (
                        <Text>No Image</Text>
                    )}

                    <Text className={`text-sm font-rubik-bold ${selectedCategory === item.label ? 'text-white  mt-0.5' : 'text-black-300 font-rubik'}`}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}

            {brandData.length > 12 && (
                <TouchableOpacity
                    onPress={() => router.push("../dashboard/AllBrands")}
                    className="flex flex-col justify-center items-center mr-2 mb-2 w-24 rounded-xl bg-gray-200 border border-primary-200"
                >
                    <Text className="text-sm text-black font-rubik-bold">View More</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default BodyTypeList;

const styles = StyleSheet.create({
    brandImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
    },
});
