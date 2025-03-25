
import { StyleSheet, Image, FlatList, ScrollView, Alert, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import icons from "@/constants/icons";
import images from "@/constants/images";
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { useNavigation } from "@react-navigation/native";
import MortgageCalculator from "@/components/MortgageCalculator";
import * as Linking from 'expo-linking';
import Carousel from "react-native-reanimated-carousel";
import { AntDesign } from "@expo/vector-icons";
import FeaturesAccordion from "../../../components/FeaturesAccordion";
import SpecsAccordion from "../../../components/SpecsAccordion";
import Toast, { BaseToast } from 'react-native-toast-message';

const { width } = Dimensions.get("window");
const CarDetails = () => {
    const CarId = useLocalSearchParams().id;
    const windowHeight = Dimensions.get("window").height;
    const [CarData, setCarData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [CarThumbnail, setCarThumbnail] = useState(images.avatar);
    const [CarGallery, setCarGallery] = useState();
    const [loggedinUserId, setLoggedinUserId] = useState([]);
    const carouselRef = useRef(null);
    const navigation = useNavigation();
    const [specifications, setSpecifications] = useState([]);
    const [features, setFeatures] = useState([]);
    const toastConfig = {
        success: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "green" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
        error: (props) => (
            <BaseToast
                {...props}
                style={{ borderLeftColor: "red" }}
                text1Style={{
                    fontSize: 16,
                    fontWeight: "bold",
                }}
                text2Style={{
                    fontSize: 14,
                }}
            />
        ),
    };
    const openWhatsApp = (phoneNumber) => {
        let url = "";

        if (Platform.OS === "android") {
            url = `whatsapp://send?phone=${phoneNumber}`;
        } else {
            url = `https://wa.me/${phoneNumber}`; // iOS uses wa.me
        }

        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert("WhatsApp is not installed");
                }
            })
            .catch((err) => console.error("An error occurred", err));
    };

    const handleEnquiry = async () => {
        try {
            setLoading(true); // Show loading indicator
            const storedData = await AsyncStorage.getItem('userData');
            if (!storedData) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'User data not found.',
                });
                return;
            }

            const parsedUserData = JSON.parse(storedData);

            const enquiryData = {
                fullname: parsedUserData.fullname || "Unknown",
                mobile: parsedUserData.contactno,
                email: parsedUserData.email,
                vehiclename: `${CarData.manufactureyear} ${CarData.brandname} ${CarData.carname} ${CarData.modalname}`,
                city: parsedUserData.district,
                statename: CarData.state,
                remarks: `Interested in ${CarData.manufactureyear} ${CarData.brandname} ${CarData.carname} ${CarData.modalname}`,
            };

            // console.log("Sending Enquiry Data:", enquiryData);

            const response = await axios.post("https://carzchoice.com/api/bookvehiclenow", enquiryData, {
                headers: { "Content-Type": "application/json" }
            });

            // console.log("Full API Response:", response.data);

            // Fix success check
            if (response.data.success === true) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Enquiry submitted successfully!',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Submission Failed',
                    text2: response.data.message || "Unknown error",
                });
            }
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    const shareCar = async () => {
        try {
            const CarUrl = `https://carzchoice.com/carlistingdetails/${CarId}`;

            const message = `View my Car: ${CarUrl}`;

            const result = await Share.share({
                message: message,
                url: CarUrl,
                title: "Check out this Car!",
            });
            if (result.action === Share.sharedAction) {
                console.log("Car shared successfully!");
            } else if (result.action === Share.dismissedAction) {
                console.log("Share dismissed.");
            }
        } catch (error) {
            console.error("Error sharing Car:", error);
        }
    };


    const fetchCarData = async () => {
        try {
            // Fetch Car data from API
            const response = await axios.get(`https://carzchoice.com/api/oldcarlistingdetails/${CarId}`);
            // console.log("API Full Response:", response.data);

            if (response.data && response.data.data && response.data.data.cardetails) {
                let apiData = response.data.data.cardetails;

                let parsedSpecifications = [];

                try {
                    const carDetails = apiData;

                    // console.log("Raw Specifications Data:", carDetails?.specifications); // Debugging

                    if (carDetails?.specifications && Array.isArray(carDetails.specifications)) {
                        let parsedSpecData = [];

                        // Try parsing the first element if it's a JSON string
                        try {
                            parsedSpecData = JSON.parse(carDetails.specifications[0]);
                        } catch (error) {
                            console.error("❌ Error parsing specifications JSON:", error);
                        }

                        // Ensure it's an array before mapping
                        if (Array.isArray(parsedSpecData)) {
                            parsedSpecifications = parsedSpecData.map((spec) => ({
                                name: spec.type || "Unknown",
                                details: [
                                    {
                                        label: spec.label || "N/A",
                                        value: spec.value || "N/A"
                                    }
                                ]
                            }));
                        } else {
                            console.warn("⚠️ Parsed specifications is not an array:", parsedSpecData);
                        }
                    } else {
                        console.warn("⚠️ Specifications field is missing or empty:", carDetails?.specifications);
                    }
                } catch (error) {
                    console.error("❌ Error processing specifications:", error);
                    parsedSpecifications = [];
                }

                try {
                    let rawFeatures = apiData.features;
                    // console.log("✅ rawFeatures:", JSON.stringify(rawFeatures, null, 2));

                    // 🔎 Check if rawFeatures is an array and contains a stringified JSON
                    if (Array.isArray(rawFeatures) && rawFeatures.length > 0 && typeof rawFeatures[0] === "string") {
                        try {
                            // 🛠️ Parse the first element (which is a stringified JSON)
                            rawFeatures = JSON.parse(rawFeatures[0]);
                            // console.log("✅ Parsed Features:", JSON.stringify(rawFeatures, null, 2));
                        } catch (parseError) {
                            console.error("❌ Error parsing nested features JSON string:", parseError);
                            rawFeatures = [];
                        }
                    }

                    // 🔎 Ensure it's an array before mapping
                    let parsedFeatures = [];
                    if (Array.isArray(rawFeatures) && rawFeatures.length > 0) {
                        parsedFeatures = rawFeatures.map((feature) => ({
                            name: feature?.type || "Unknown",
                            details: Array.isArray(feature?.label) ? feature.label : []
                        }));
                    } else {
                        console.warn("⚠️ No valid features array found");
                    }

                    // ✅ Debug the final output
                    // console.log("✅ Final Features Debug:", parsedFeatures);

                    // 🔄 Set state with the correct data
                    setFeatures(parsedFeatures);
                } catch (error) {
                    console.error("❌ Error parsing features:", error);
                    setFeatures([]);
                }


                // ✅ Set state with parsed data
                setCarData(apiData);
                setSpecifications(parsedSpecifications);

                // ✅ Handle Images Array (Extract Thumbnail)
                let imageBaseURL = "https://carzchoice.com/";
                let fallbackImage = "https://carzchoice.com/assets/backend-assets/images/1721106135_9.png"; // Use an actual fallback URL
                // Check if `apiData.images` is a valid JSON string and parse it
                let imagesArray = [];
                if (typeof apiData.images === "string") {
                    try {
                        imagesArray = JSON.parse(apiData.images);
                    } catch (error) {
                        console.error("Error parsing images JSON:", error);
                    }
                }

                // Extract the first image
                let thumbnail = fallbackImage; // Default image

                if (Array.isArray(imagesArray) && imagesArray.length > 0) {
                    let firstImage = imagesArray[0].imageurl;

                    if (typeof firstImage === "string" && firstImage.trim() !== "") {
                        thumbnail = firstImage.startsWith("http") ? firstImage : `${imageBaseURL}${firstImage}`;
                    }
                }
                // ✅ Ensure it's a valid string before setting it
                setCarThumbnail(thumbnail);



                // ✅ Handle Gallery Images
                let formattedImages = imagesArray.map(image =>
                    `${imageBaseURL}${image.imageurl.replace(/\\/g, "/")}`
                );

                setCarGallery(formattedImages);


            } else {
                console.error('Unexpected API response format:', response.data);
            }
        } catch (error) {
            console.error('Error fetching Car data:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchCarData();
    }, [CarId])

    const renderCarouselItem = ({ item }) => (
        <View style={styles.slide}>
            <Image source={{ uri: item }} style={styles.image} />
        </View>
    );

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
        );
    }

    if (!CarData) {
        return (
            <ActivityIndicator size="large" color="#0061ff" style={{ marginTop: 400 }} />
        );
    }

    const carDetails = [
        { key: 'Registration Year', icon: icons.registrationYear, value: CarData.registeryear || '-' },
        { key: 'Insurance', icon: icons.insuranceValidity, value: CarData.insurance || '-' },
        { key: 'Fuel Type', icon: icons.fuel, value: CarData.fueltype || '-' },
        { key: 'Seats', icon: icons.seats, value: CarData.seats || '-' },
        { key: 'Kms Driven', icon: icons.kmsDriven, value: `${CarData.kilometersdriven || '-'} Kms` },
        { key: 'RTO', icon: icons.rto, value: CarData.district || '-' },
        { key: 'Ownership', icon: icons.ownership, value: CarData.ownernumbers || '-' },
        { key: 'Engine Displacement', icon: icons.engineDisplacement, value: CarData.engine || '-' },
        { key: 'Transmission', icon: icons.transmission, value: JSON.parse(CarData.transmissiontype) },
        { key: 'Year of Manufacture', icon: icons.yearManufacture, value: CarData.manufactureyear || '-' },
        { key: 'Color', icon: icons.color, value: CarData.color || '-' },
        { key: 'Last Updated', icon: icons.lastUpdated, value: CarData.lastupdated || '-' },
    ];

    const renderHeader = () => (
        <View className="relative w-full" style={{ height: windowHeight / 4 }}>
            <View
                className="z-50 absolute inset-x-7"
                style={{ top: Platform.OS === "ios" ? 70 : 20, }}
            >
                <View className="flex flex-row items-center w-full justify-between">
                    <TouchableOpacity onPress={() => router.back()}
                        className="flex flex-row bg-white rounded-full size-11 items-center justify-center"
                    >
                        <Image source={icons.backArrow} className="size-5" />
                    </TouchableOpacity>
                    <View className="flex flex-row items-center gap-3">
                        {CarData.roleid == loggedinUserId &&
                            <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik ring-1 ring-inset ${CarData.status === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{CarData.status}</Text>
                        }
                        {/* <Image source={icons.heart} className="size-7" tintColor={"#191D31"}/> */}
                        <TouchableOpacity onPress={shareCar}
                            className="flex flex-row bg-white rounded-full size-11 items-center justify-center"
                        >
                            <Image source={icons.send} className="size-7" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            {CarGallery.length > 0 ? (
                <>
                    <TouchableOpacity style={styles.arrowLeft} onPress={() => carouselRef.current?.prev()}>
                        <AntDesign name="left" size={24} color="white" />
                    </TouchableOpacity>

                    <Carousel
                        ref={carouselRef}
                        loop
                        width={width}
                        height={200}
                        autoPlay={true}
                        autoPlayInterval={7000}
                        data={CarGallery}
                        scrollAnimationDuration={3000}
                        renderItem={renderCarouselItem}
                    />

                    <TouchableOpacity style={styles.arrowRight} onPress={() => carouselRef.current?.next()}>
                        <AntDesign name="right" size={24} color="white" />
                    </TouchableOpacity>
                </>
            ) : (
                <Text>No Images Available</Text>
            )}
        </View>
    );

    const renderItem = ({ item }) => (
        <View className='px-5 mt-2 flex gap-2'>
            {item}
        </View>
    );

    return (
        <View className="pb-24">
            <FlatList
                data={[
                    <Toast config={toastConfig} position="top" />,
                    <Text className='text-xl font-rubik-bold'>{CarData.manufactureyear} {CarData.brandname} {CarData.carname} {CarData.modalname}</Text>,
                    <View className='flex flex-row items-center gap-3'>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold'> State: </Text>
                            <Text className='text-xs font-rubik-bold text-primary-300'> {CarData.state}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold'> City: </Text>
                            <Text className='text-xs font-rubik-bold text-primary-300 capitalize'> {CarData.district}</Text>
                        </View>
                        <View className='flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full'>
                            <Text className='text-xs font-rubik-bold'> Color: </Text>
                            <Text className='text-black-300 text-sm font-rubik-medium ml-2'>{CarData.color}</Text>
                        </View>
                    </View>,

                    <View className='flex flex-row items-center flew-wrap mb-5'>
                        <View className='flex flex-row  items-center justify-center bg-primary-100 rounded-full size-10'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className={`text-black-300 text-sm font-rubik-medium ml-2 ${CarData.fueltype === 'CNG' ? 'uppercase' : 'capitalize'}`}>
                            {CarData.fueltype}
                        </Text>
                        <View className='flex  flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bed} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2 capitalize'>
                            {JSON.parse(CarData.transmissiontype)}
                        </Text>
                        <View className='flex  flex-row items-center justify-center bg-primary-100 rounded-full size-10 ml-7'>
                            <Image source={icons.bath} className='size-4' />
                        </View>
                        <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                            {CarData.kilometersdriven} kms
                        </Text>
                    </View>,

                    <Text className='text-xl font-rubik-bold'>Car Overview</Text>,
                    <FlatList
                        data={carDetails}
                        keyExtractor={(item) => item.key}
                        className="bg-white drop-shadow-sm px-5 py-3 rounded-lg mb-5"
                        renderItem={({ item }) => (
                            <View className="flex flex-row justify-between my-2">
                                <View className="flex flex-row items-center justify-start gap-2">
                                    <Image source={item.icon} className="w-5 h-5" />
                                    <Text className="text-black text-base font-rubik-medium capitalize">{item.key}:</Text>
                                </View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">{item.value}</Text>
                            </View>
                        )}
                        scrollEnabled={false}
                        nestedScrollEnabled={true}
                    />,
                    <View className="bg-white rounded-lg pb-5">
                        <Text className='text-xl font-rubik-bold text-primary-300 m-5'>Car Features</Text>
                        <FeaturesAccordion features={features} />
                    </View>,

                    <View className="bg-white rounded-lg">
                        <Text className='text-xl font-rubik-bold text-primary-300 m-5'>Car specifications</Text>
                        <SpecsAccordion specifications={specifications} />
                    </View>,

                    <MortgageCalculator />
                ]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
            />

            <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text className="text-black-200 text-xs font-rubik-medium">Price</Text>
                        <Text numberOfLines={1} className="text-primary-300 text-start text-2xl font-rubik-bold">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(CarData.price)}
                        </Text>
                    </View>


                    <TouchableOpacity onPress={() => handleEnquiry()} className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text className="text-white text-lg text-center font-rubik-bold">Book Now</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default CarDetails

const styles = StyleSheet.create({
    slide: {
        borderRadius: 10,
        overflow: "hidden",
    },
    image: {
        width: width,
        height: 200,
        borderRadius: 10,
    },
    arrowLeft: {
        position: "absolute",
        left: 10,
        top: "40%",
        zIndex: 1,
    },
    arrowRight: {
        position: "absolute",
        right: 10,
        top: "40%",
        zIndex: 1,
    },
    section: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    bullet: {
        fontSize: 16,
        marginRight: 8,
    },
    text: {
        fontSize: 16,
    },
    overviewbox: {
        backgroundColor: 'red',
    },

});