
import { StyleSheet, Image, ScrollView, Alert, Text, TouchableOpacity, View, Dimensions, Platform, ActivityIndicator, Share } from "react-native";
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

const { width } = Dimensions.get("window");
const CarDetails = () => {
    const CarId = useLocalSearchParams().id;
    const windowHeight = Dimensions.get("window").height;
    const [CarData, setCarData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [CarThumbnail, setCarThumbnail] = useState(images.avatar);
    const [CarGallery, setCarGallery] = useState();
    const [loggedinUserId, setLoggedinUserId] = useState([]);
    const [amenities, setAmenities] = useState([]);
    const carouselRef = useRef(null);
    const navigation = useNavigation();

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
            // Get user data from AsyncStorage
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            const userId = parsedUserData?.id; // Extract user ID safely
            // console.log("Stored userData:", parsedUserData);
            if (!userId) {
                console.error("User ID not found in stored userData.");
                return;
            }
            const enquiryData = {
                customername: parsedUserData.name,
                phone: parsedUserData.mobile,
                email: parsedUserData.email,
                city: CarData.city || '',
                Cartype: CarData.category || '',
                Carid: CarId,
                userid: parsedUserData.id,
                state: CarData.city || '',
            };
            // Send enquiry request
            const response = await axios.post("https://carzchoice.com/api/sendenquiry", enquiryData);

            if (response.status === 200 && !response.data.error) {
                alert("Enquiry submitted successfully!");
            } else {
                alert("Failed to submit enquiry. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting enquiry:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    const shareCar = async () => {
        try {
            const CarUrl = `https://carzchoice.com/api/oldcarlistingdetails/${CarId}`;

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
            const parsedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            setLoggedinUserId(parsedUserData?.id || "");

            // Fetch Car data from API
            const response = await axios.get(`https://carzchoice.com/api/oldcarlistingdetails/${CarId}`);
            // console.log("API Full Response:", JSON.stringify(response.data, null, 2));

            if (response.data && response.data.data && response.data.data.cardetails) {
                let apiData = response.data.data.cardetails;

                // ✅ Parse JSON fields
                if (apiData.specifications && apiData.specifications.length > 0) {
                    apiData.specifications = JSON.parse(apiData.specifications[0].specifications);
                }

                if (apiData.features && apiData.features.length > 0) {
                    apiData.features = JSON.parse(apiData.features[0].features);
                }
                // ✅ Set state with parsed data
                setCarData(apiData);

                // console.log("Processed Car Details:", apiData);

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


                // ✅ Handle Amenities
                let parsedAmenities = [];
                try {
                    parsedAmenities = apiData.amenties
                        ? JSON.parse(apiData.amenties)
                        : [];
                } catch (error) {
                    console.error("Error parsing amenities:", error);
                }
                setAmenities(parsedAmenities);


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

    const renderItem = ({ item }) => (
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



    return (
        <View className="pb-24">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-32 bg-white"
                contentContainerStyle={{ paddingBottom: 32, backgroundColor: 'white' }}>
                <View className="relative w-full" style={{ height: windowHeight / 4 }}>
                    {/* <Image
                        source={{ uri: CarThumbnail }}
                        className="size-full"
                        resizeMode="contain"
                    /> */}
                    {CarGallery.length > 0 ? (
                        <>
                            {/* Left Arrow */}
                            <TouchableOpacity
                                style={styles.arrowLeft}
                                onPress={() => carouselRef.current?.prev()}
                            >
                                <AntDesign name="left" size={24} color="white" />
                            </TouchableOpacity>

                            {/* Carousel */}
                            <Carousel
                                ref={carouselRef}
                                loop
                                width={width}
                                height={200}
                                autoPlay={true}
                                autoPlayInterval={7000}
                                data={CarGallery}
                                scrollAnimationDuration={3000}
                                renderItem={renderItem}
                            />

                            {/* Right Arrow */}
                            <TouchableOpacity
                                style={styles.arrowRight}
                                onPress={() => carouselRef.current?.next()}
                            >
                                <AntDesign name="right" size={24} color="white" />
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text>No Images Available</Text>
                    )}
                    {/* <Image
                        source={images.whiteGradient}
                        className="absolute top-0 w-full z-40"
                    /> */}

                    <View
                        className="z-50 absolute inset-x-7"
                        style={{
                            top: Platform.OS === "ios" ? 70 : 20,
                        }}
                    >
                        <View className="flex flex-row items-center w-full justify-between">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                            >
                                <Image
                                    source={icons.backArrow}
                                    className="size-5"
                                />
                            </TouchableOpacity>

                            <View className="flex flex-row items-center gap-3">
                                {CarData.roleid == loggedinUserId &&
                                    <Text className={`inline-flex items-center rounded-md capitalize px-2 py-1 text-xs font-rubik ring-1 ring-inset ${CarData.status === 'published' ? ' bg-green-50  text-green-700  ring-green-600/20 ' : 'bg-red-50  text-red-700 ring-red-600/20'}`}>{CarData.status}</Text>
                                }
                                {/* <Image
                                    source={icons.heart}
                                    className="size-7"
                                    tintColor={"#191D31"}
                                /> */}
                                <TouchableOpacity
                                    onPress={shareCar}
                                    className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                                >
                                    <Image source={icons.send} className="size-7" />
                                </TouchableOpacity>


                            </View>
                        </View>
                    </View>
                </View>

                <View className='px-5 mt-2 flex gap-2'>
                    <Text className='text-xl font-rubik-bold'>{CarData.manufactureyear} {CarData.brandname} {CarData.carname} {CarData.modalname}</Text>

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
                            <Text className='text-black-300 text-sm font-rubik-medium ml-2'>
                                {CarData.color}
                            </Text>
                        </View>
                    </View>

                    <View className='flex flex-row items-center flew-wrap'>
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
                    </View>

                    <View className="w-full border-t border-primary-200 pt-7 mt-5">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Contact Us
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between mt-4">
                        <View className="flex flex-row items-center">
                            <Image
                                source={images.appfavicon}
                                className="size-14 rounded-full"
                            />

                            <View className="flex flex-col items-start justify-center ml-3">
                                <Text className="text-lg text-black-300 text-start font-rubik-bold">
                                    Carz Choice's Consultant
                                </Text>
                                <Text className="text-sm text-black-200 text-start font-rubik-medium">
                                    You are one call away.
                                </Text>
                            </View>
                        </View>

                        <View className="flex flex-row items-center gap-3">
                            <TouchableOpacity onPress={() => openWhatsApp("919876543210")}>
                                <Image source={icons.chat} className="size-7" />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Image source={icons.phone} className="size-7" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className='mt-7'>
                        <Text className='text-black-300 text-xl font-rubik-bold'>Car Overview</Text>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.registrationYear} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Registration Year:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.registrationyear || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.insuranceValidity} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Insurance:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.insurance || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.fuel} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Fuel Type:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.fueltype || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.seats} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Seats:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.seats || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.kmsDriven} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Kms Driven:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.kilometersdriven || '-'} Kms
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.rto} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium uppercase">
                                    RTO:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.district || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.ownership} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Ownership:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.ownernumbers || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.engineDisplacement} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Engine Displacement:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.engine || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.transmission} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Transmission:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {JSON.parse(CarData.transmissiontype)}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.yearManufacture} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Year of Manufacture:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.manufactureyear || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.color} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Color:
                                </Text>
                            </View>
                            <View>
                                <Text className=" text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.color || '-'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex flex-row justify-between  my-2">
                            <View className="flex flex-row items-center justify-start gap-2">
                                <Image source={icons.lastUpdated} className="w-5 h-5" />
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    Last Updated:
                                </Text>
                            </View>
                            <View>
                                <Text className="text-black-200 text-base font-rubik-medium capitalize">
                                    {CarData.lastupdated || '-'}
                                </Text>
                            </View>
                        </View>

                        {CarData.nearbylocation && (
                            <>
                                <Text className='text-black-300 text-base font-rubik-medium mt-3'>Near by Locations:</Text>
                                <Text className='text-black-200 text-base font-rubik mt-2'>
                                    {CarData.nearbylocation}
                                </Text>
                            </>
                        )}

                        {CarData.approxrentalincome && (
                            <Text className='text-black-300 text-center font-rubik-medium mt-2 bg-blue-100 flex-grow p-2 rounded-full'>
                                Approx Rental Income: ₹{CarData.approxrentalincome}
                            </Text>
                        )}
                    </View>

                    {/* facilities */}
                    {amenities && Array.isArray(amenities) && amenities.length > 0 && (
                        <View className='mt-7'>
                            <Text className='text-black-300 text-xl font-rubik-bold'>Amenities</Text>
                            <View className="flex flex-row flex-wrap items-start justify-start mt-2 gap-3">
                                {amenities.map((item, index) => (
                                    <View key={index} className="flex items-start">
                                        <View className="px-3 py-2 bg-blue-100 rounded-full flex flex-row items-center justify-center">
                                            <Image source={icons.checkmark} className="size-6 me-2" />
                                            <Text className="text-black-300 text-sm text-center font-rubik-bold capitalize">
                                                {item}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}


                    {/* location */}
                    <View className="mt-7">
                        <Text className="text-black-300 text-xl font-rubik-bold">
                            Location
                        </Text>
                        <View className="flex flex-row items-center justify-start my-4 gap-2">
                            <Image source={icons.location} className="w-5 h-5" />
                            <Text className="text-black-200 text-sm font-rubik-medium capitalize">
                                {CarData.district}, {CarData.state}
                            </Text>
                        </View>
                    </View>

                    <View className="mt-4">
                        <View className="">
                            <MortgageCalculator />
                        </View>
                    </View>
                </View>
            </ScrollView>


            {/* bottom book now button */}
            <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-r border-l border-primary-200 p-7">
                <View className="flex flex-row items-center justify-between gap-10">
                    <View className="flex flex-col items-start">
                        <Text className="text-black-200 text-xs font-rubik-medium">
                            Price
                        </Text>
                        <Text
                            numberOfLines={1}
                            className="text-primary-300 text-start text-2xl font-rubik-bold"
                        >
                            ₹{CarData.price}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => handleEnquiry()} className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-3 rounded-full shadow-md shadow-zinc-400">
                        <Text className="text-white text-lg text-center font-rubik-bold">
                            Book Now
                        </Text>
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
});