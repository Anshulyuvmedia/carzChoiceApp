import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import icons from "@/constants/icons";

const AllBrands = () => {
    const params = useLocalSearchParams();
    const router = useRouter();

    const [selectedCategory, setSelectedCategory] = useState(params.propertyType || 'All');
    const [brandData, setBrandData] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
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

        router.push({ pathname: "/vehicles/explore", params: updatedParams });
    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data && response.data.data) {
                setBrandData(response.data.data);
                setFilteredBrands(response.data.data); // Initialize filtered list
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

    useEffect(() => {
        // Filter brands based on search query
        const filtered = brandData.filter(brand =>
            brand.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBrands(filtered);
    }, [searchQuery, brandData]);

    return (
        <View className="flex-1 mt-10 px-5">
            {/* Header */}
            <View className="flex flex-row items-center justify-between mb-3">
                <Text className="text-xl font-rubik-bold">All Brands</Text>
                <TouchableOpacity onPress={() => router.back()} className="flex-row bg-gray-300 rounded-full w-11 h-11 items-center justify-center">
                    <Image source={icons.backArrow} className="w-5 h-5" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex flex-row items-center justify-between w-full px-4 mb-3 rounded-lg bg-accent-100 border border-primary-100 py-2">
                <View className="flex-1 flex flex-row items-center">
                    <Image source={icons.search} className="size-5" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={(text) => setSearchQuery(text)}
                        placeholder="Search brand..."
                        className="text-sm font-rubik text-black-300 ml-2 flex-1"
                    />
                </View>
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Text className="text-red-500">Clear</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Brand List with ScrollView */}
            <View className="flex-1 pb-5">
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    {filteredBrands.map((item) => (
                        <TouchableOpacity
                            key={item.id.toString()}
                            onPress={() => handleCategoryPress(item.label)}
                            className={`flex flex-col bg-white items-center m-1 w-24 rounded-xl ${selectedCategory === item.label ? 'bg-primary-300' : 'border border-primary-200'}`}
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
                            <Text className={`text-sm font-rubik-bold ${selectedCategory === item.label ? 'text-white mt-0.5' : 'text-black-300 font-rubik'}`}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default AllBrands;

const styles = StyleSheet.create({
    brandImg: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        backgroundColor: "white",
    },
    scrollContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
});
