import { View, TouchableOpacity,TouchableWithoutFeedback, Keyboard, Image, TextInput, Text, StyleSheet, ActivityIndicator, FlatList, Modal } from "react-native";
import { useLocalSearchParams, router, usePathname } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import icons from "@/constants/icons";
import axios from "axios";
import Filters from "./Filters";
import LocationScroll from "./LocationScroll";
import RangeSlider, { Slider } from 'react-native-range-slider-expo';

const Search = () => {
    const refRBSheet = useRef(null);
    const [cityData, setCityData] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [searchText, setSearchText] = useState("");
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const inputRef = useRef(null);
    const [fromValue, setFromValue] = useState(0);
    const [toValue, setToValue] = useState(0);
    const [value, setValue] = useState(0);

    useEffect(() => {
        getCityList();
    }, []);

    const getCityList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getCityList");
            if (response.data && Array.isArray(response.data.data)) {
                const formattedCities = response.data.data.map((city, index) => ({
                    label: city.District || `City ${index}`,
                    value: city.District || index,
                }));
                setCityData(formattedCities);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching city list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (text.length > 0) {
            const filtered = cityData.filter((city) =>
                city.label.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCities(filtered);
        } else {
            setFilteredCities([]);
        }
    };

    return (
        <View className="flex-1">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View className="flex flex-row items-center justify-between w-full px-4 rounded-lg bg-accent-100 border border-primary-100 mt-5 py-2">
                    <View className="flex-1 flex flex-row items-center justify-start">
                        <Image source={icons.search} className="size-5" />
                        <TextInput
                            value={selectedCity || "Search Vehicle..."}
                            editable={false}
                            placeholder="Search Vehicle..."
                            className="text-sm font-rubik text-black-300 ml-2 flex-1"
                        />
                    </View>
                    <Image source={icons.filter} className="size-5" />
                </View>
            </TouchableOpacity>

            {/* Search Modal */}
            <Modal animationType="slide" visible={modalVisible} transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View className="flex flex-row justify-between items-center mb-3">
                            <Text className="text-lg font-rubik-bold text-black-300">
                                Search City
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-lg font-rubik-bold text-red-500">
                                    Close
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View className="flex flex-row items-center w-full bg-blue-50 rounded-lg px-3 py-2">
                            <Image source={icons.location} className="size-6" />
                            <TextInput
                                ref={inputRef}
                                value={searchText}
                                onChangeText={handleSearch}
                                placeholder="Search City..."
                                className="flex-1 ml-2 text-black-300 text-sm"
                                autoFocus={true}
                            />
                        </View>

                        {filteredCities.length > 0 && (
                            <FlatList
                                data={filteredCities}
                                keyExtractor={(item, index) => `city-${index}`}
                                keyboardShouldPersistTaps="handled"
                                style={{ backgroundColor: "#fff", borderRadius: 10, marginTop: 5 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedCity(item.label);
                                            setSearchText(item.label);
                                            setFilteredCities([]);
                                            setModalVisible(false);
                                        }}
                                        className="p-2 border-b border-gray-200 bg-primary-100 "
                                    >
                                        <Text className="text-black-300 ">{item.label}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                        <LocationScroll />

                        <Text className="text-lg font-rubik-bold text-black-300 mt-3">
                            Search by brand
                        </Text>
                        <Filters />

                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                            <View>
                                <RangeSlider
                                    min={5}
                                    max={250000}
                                    fromValueOnChange={value => setFromValue(value)}
                                    toValueOnChange={value => setToValue(value)}
                                    initialFromValue={20}
                                    thumbRadius={5}
                                    inRangeBarHeight={2}
                                    outOfRangeBarHeight={2}
                                />
                                <Text>From Value: {fromValue}</Text>
                                <Text>To Value: {toValue}</Text>
                            </View>
                        </TouchableWithoutFeedback>

                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Search;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "95%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 15,
    },
});
