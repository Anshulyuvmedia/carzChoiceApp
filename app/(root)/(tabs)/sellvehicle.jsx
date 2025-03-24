import { Image, StyleSheet, Text, TouchableOpacity, View, TextInput, FlatList, Platform, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import icons from '@/constants/icons';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { Link, router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast, { BaseToast } from 'react-native-toast-message';

const SellVehicle = () => {

    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState(false);

    const [brandData, setBrandData] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [variantData, setVariantData] = useState(null);
    const [cityData, setCityData] = useState(null);
    const [stateData, setStateData] = useState("");
    const [pincodeList, setPincodeList] = useState([]); // Store multiple pincodes


    const [selectedBrand, setSelectedBrand] = useState([]);
    const [selectedModal, setSelectedModal] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [city, setCity] = useState(null);
    const [state, setState] = useState(null);
    const [pincode, setPincode] = useState(""); // Selected pincode

    const [sellingPrice, setSellingPrice] = useState(null);
    const [kmsDriven, setKmsDriven] = useState(null);
    const [selectedFuel, setSelectedFuel] = useState(null);
    const [regType, setRegType] = useState(null);
    const [ownerChanged, setOwnerChanged] = useState(null);
    const [transmissionType, setTransmissionType] = useState(null);
    const [regYear, setRegYear] = useState(null);
    const [makeYear, setMakeYear] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const [galleryImages, setGalleryImages] = useState([]);

    const [loading, setLoading] = useState(false);

    const [show, setShow] = useState(false);

    const buttonPreviousTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: '#ff938f',
        color: 'black',
    };
    const buttonNextTextStyle = {
        paddingInline: 20,
        paddingBlock: 5,
        borderRadius: 10,
        backgroundColor: 'lightgreen',
        color: 'black',
    };
    const categories = [
        { label: 'Apartment', value: 'Apartment' },
        { label: 'Villa', value: 'Villa' },
        { label: 'Penthouse', value: 'Penthouse' },
        { label: 'Residences', value: 'Residences' },
        { label: 'Luxury House', value: 'Luxury House' },
        { label: 'Bunglow', value: 'Bunglow' },
    ];
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
    // const status = [
    //     { label: 'Unpublished', value: 'unpublished' },
    //     { label: 'Published', value: 'published' },
    // ];

    // const validateStep = (step) => {
    //     if (step === 1) {
    //         if (!step1Data?.property_name || !step1Data?.description || !step1Data?.nearbylocation) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Step 1 Error',
    //                 text2: 'Vehicle Name, Description, and Nearby Location are required.',
    //             });
    //             return false;
    //         }
    //     }

    //     if (step === 2) {
    //         if (!step2Data?.approxrentalincome || step2Data?.historydate.length === 0 || !step2Data?.price) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Step 2 Error',
    //                 text2: 'Approx Rental Income, Price, and at least one History Date are required.',
    //             });
    //             return false;
    //         }
    //     }

    //     if (step === 3) {
    //         if (!step3Data?.sqfoot || !step3Data?.bathroom || !step3Data?.floor || !step3Data?.city || !step3Data?.officeaddress || !step3Data?.bedroom) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Step 3 Error',
    //                 text2: 'Square Foot, Bathroom, Floor, City, Office Address, and Bedroom are required.',
    //             });
    //             return false;
    //         }
    //     }

    //     if (step === 4) {
    //         if (!selectedCategory) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Category Required',
    //                 text2: 'Please select a vehicle category.',
    //             });
    //             return false;
    //         }

    //         if (!mainImage) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Image Required',
    //                 text2: 'Please upload a main vehicle image.',
    //             });
    //             return false;
    //         }

    //         if (galleryImages.length < 2) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Gallery Images Required',
    //                 text2: 'Please upload at least 2 gallery images.',
    //             });
    //             return false;
    //         }

    //         if (!coordinates.latitude || !coordinates.longitude) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Location Required',
    //                 text2: 'Please provide a valid vehicle location.',
    //             });
    //             return false;
    //         }

    //         if (propertyDocuments.length === 0) {
    //             Toast.show({
    //                 type: 'error',
    //                 text1: 'Documents Required',
    //                 text2: 'Please upload at least one vehicle document.',
    //             });
    //             return false;
    //         }
    //     }

    //     return true;
    // };

    const onNextStep = (step) => {
        if (!validateStep(step)) {
            setErrors(true);
        } else {
            setErrors(false);
        }
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Sorry, we need camera roll permissions to make this work!",
            });
            return false;
        }
        return true;
    };

    const pickGalleryImages = async () => {
        if (!(await requestPermissions())) return;

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.5,
            });

            // console.log("🚀 Image Picker Result:", result); // Debugging log

            if (!result.canceled && result.assets?.length) {
                // Extract only the URI (ensuring no extra object nesting)
                const selectedImages = result.assets.map(image => image.uri);

                // console.log("✅ Processed Image URIs:", selectedImages);

                // Ensure state only stores an array of URIs (not objects)
                setGalleryImages(prevImages => [
                    ...prevImages,
                    ...selectedImages,
                ]);
            } else {
                console.warn("⚠️ No images selected.");
            }
        } catch (error) {
            console.error("❌ Error picking images:", error);
        }
    };

    // Handle Date Change
    const handleMakeYear = (event, date) => {
        if (date) {
            const options = { year: "numeric", month: "long" }; // Example: March 2025
            const formattedDate = date.toLocaleDateString("en-GB", options);
            setMakeYear(formattedDate);
        }
        setShow(false);
    };
    const handlLastUpdated = (event, date) => {
        if (date) {
            const formattedDate = date.toLocaleDateString("en-GB", options);
            setLastUpdate(formattedDate);
        }
        setShow(false);
    };

    const getUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            const userToken = await AsyncStorage.getItem('userToken');

            return {
                userData: userData ? JSON.parse(userData) : null,
                userToken: userToken ? userToken : null
            };
        } catch (error) {
            console.error("Error fetching user data:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Could not retrieve user data.",
            });
            return null;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { userData, userToken } = await getUserData();
            if (!userData || !userToken) {
                throw new Error("User is not authenticated. Token missing.");
            }

            const { id, user_type } = userData;

            const formData = new FormData();

            // formData.append("status", selectedStatus ?? "");
            formData.append("roleid", id ?? "");
            formData.append("usertype", user_type ?? "");
            formData.append("amenities", JSON.stringify(amenities));


            // ✅ Append Gallery Images Correctly
            galleryImages.forEach((imageUri, index) => {
                if (imageUri) { // Directly check string
                    const fileType = imageUri.includes('.') ? imageUri.split('.').pop() : "jpeg";

                    formData.append(`galleryImages[${index}]`, {
                        uri: imageUri, // ✅ Corrected
                        type: `image/${fileType}`,
                        name: `gallery-image-${index}.${fileType}`,
                    });
                } else {
                    console.warn("Skipping image due to missing URI.");
                }
            });

            // console.log("Uploading galleryImages", galleryImages);


            // ✅ Prepare File Data Object & Append
            const safeFileName = (uri, defaultExt) => {
                return uri && uri.includes('.') ? uri.split('.').pop() : defaultExt;
            };

            const fileData = {
                galleryImages: galleryImages.map((image, index) => `gallery-image-${index}.${safeFileName(image.uri, "jpg")}`),

            };
            formData.append("fileData", JSON.stringify(fileData));
            console.log("Uploading FormData add vehicle:", formData);

            // Send API request
            const response = await axios.post("https://carzchoice.com/api/insertlisting", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${userToken}`,
                },
            });

            // console.log("API Response:", response.data);
            if (response.status === 200 && !response.data.error) {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: "Vehicle added successfully!",
                });
            } else {
                console.error("Error", response.data.message || "Failed to add vehicle.");
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: "Failed to add vehicle.",
                });
            }
        } catch (error) {
            console.error("API Error:", error?.response?.data || error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: "Something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Reset Form Function
    const resetForm = () => {

        setGalleryImages([]);

    };

    const fetchBrandList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/brandlist");
            if (response.data && response.data.data) {
                setBrandData(response.data.data); // API now sends correctly formatted {label, value}
                // console.log("Brand List:", brandData);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching brand list:", error);
        } finally {
            setLoading(false);
        }
    };


    const getCarModal = async (selectedBrand) => {
        if (!selectedBrand) return; // Ensure selectedBrand is valid
        setLoading(true);

        const url = `https://carzchoice.com/api/getCarModal/${selectedBrand}`;
        // console.log("Fetching:", url);

        try {
            const response = await axios.get(url);
            // console.log("Response:", response.data);

            if (response.data && response.data.carModal) {
                setModalData(response.data.carModal);
            } else {
                console.error("Unexpected API response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching car models:", error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };


    const getCarVariant = async (modalName) => {
        if (!modalName) return; // Ensure modalName is valid
        setLoading(true);
        try {
            const response = await axios.get(`https://carzchoice.com/api/getCarVariant/${modalName}`);
            if (response.data && response.data.carVariant) {
                setVariantData(response.data.carVariant.map((variant) => ({
                    label: String(variant), // Ensure it's a string
                    value: String(variant), // Ensure it's a string
                })));
            } else {
                console.error("Unexpected API response format:", response.data);
            }

        } catch (error) {
            console.error("Error fetching car variants:", error);
        } finally {
            setLoading(false);
        }
    };

    // Call functions when dependencies change
    useEffect(() => {
        fetchBrandList();
        getCityList();
    }, []);

    useEffect(() => {
        if (selectedBrand) getCarModal(selectedBrand);
    }, [selectedBrand]);

    useEffect(() => {
        if (selectedModal) getCarVariant(selectedModal);
    }, [selectedModal]);


    const getCityList = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://carzchoice.com/api/getCityList");
            // console.log("API Response:", response.data); // Debug API response

            if (response.data && Array.isArray(response.data.data)) {
                const formattedCities = response.data.data.map((city, index) => ({
                    label: city.District || `City ${index}`, // Use "District" instead of "name"
                    value: city.District || index, // Ensure a valid value
                }));

                // console.log("Formatted Cities:", formattedCities); // Debug formatted data
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

    const getLocationData = async (city) => {
        if (!city) return;
        setLoading(true);

        const url = `https://carzchoice.com/api/getLocationData/${city}`;
        // console.log("Fetching:", url);

        try {
            const response = await axios.get(url);
            // console.log("Response:", response.data);

            if (response.data && response.data.data) {
                const locationData = response.data.data;

                // Extract unique state (since all values are the same, pick the first)
                const uniqueState = Object.values(locationData)[0] || "";

                // Convert pincodes into an array for dropdown
                const pincodesArray = Object.keys(locationData).map((pincode) => ({
                    label: pincode, // Show pincode in dropdown
                    value: pincode, // Set value as pincode
                }));

                // Update state values
                setStateData(uniqueState); // Set single state value
                setPincodeList(pincodesArray); // Set pincode dropdown list
                setPincode(""); // Reset selected pincode
            } else {
                console.error("Unexpected API response format:", response.data);
                setStateData("");
                setPincodeList([]); // Clear pincode dropdown if no data
                setPincode("");
            }
        } catch (error) {
            console.error("Error fetching location data:", error.response?.data || error);
            setStateData("");
            setPincodeList([]);
            setPincode("");
        } finally {
            setLoading(false);
        }
    };








    useEffect(() => {
        if (city) getLocationData(city);
    }, [city]);

    return (
        <SafeAreaView style={{ backgroundColor: 'white', height: '100%', paddingHorizontal: 20 }}>


            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', backgroundColor: '#E0E0E0', borderRadius: 50, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                    <Image source={icons.backArrow} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <Text style={{ fontSize: 16, marginRight: 10, textAlign: 'center', fontFamily: 'Rubik-Medium', color: '#4A4A4A' }}>
                    Sell Your Vehicle
                </Text>
                <TouchableOpacity onPress={() => router.push('/notifications')}>
                    <Image source={icons.bell} className='size-6' />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={{ position: 'absolute', top: 10, left: 0, right: 0, zIndex: 9999 }}>
                    <Toast config={toastConfig} position="top" />
                </View>
                <ProgressSteps>
                    <ProgressStep label="General"
                        nextBtnTextStyle={buttonNextTextStyle}
                    // onNext={() => onNextStep(1)}
                    // errors={errors}
                    >
                        <View style={styles.stepContent}>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Car Brand Name</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedBrand(value)}
                                            items={brandData || []} // Ensuring it's always an array
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Car Modal</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedModal(value)}
                                            items={modalData?.map((model, index) => ({
                                                label: model,
                                                value: model,
                                                key: index.toString(), // Adding unique key
                                            })) || []}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: 'Choose an option...', value: null }}
                                        />

                                    </View>
                                </View>
                            </View>

                            {/* enter thumbnail */}
                            <Text style={styles.label}>Car Version</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setSelectedVariant(value)}
                                    items={variantData && Array.isArray(variantData) ? variantData : []}
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>

                            {/* select City */}
                            <Text style={styles.label}>Select District / City</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setCity(value)}
                                    items={Array.isArray(cityData) ? cityData : []} // Ensure it's an array
                                    style={pickerSelectStyles}
                                    placeholder={{ label: 'Choose an option...', value: null }}
                                />
                            </View>


                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={stateData} // Show state value
                                editable={false} // Prevent user from modifying state
                            />



                            {/* Enter Pincode */}
                            <Text style={styles.label}>Select Pincode</Text>
                            <View style={styles.pickerContainer}>
                                <RNPickerSelect
                                    onValueChange={(value) => setPincode(value)}
                                    items={pincodeList} // Use dynamically generated pincodes
                                    style={pickerSelectStyles}
                                    placeholder={{ label: "Choose Pincode...", value: null }}
                                />
                            </View>




                        </View>
                    </ProgressStep>

                    <ProgressStep label="Car Details"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                    // onNext={() => onNextStep(2)}
                    // errors={errors}
                    >
                        <View style={styles.stepContent}>
                            {/* enter rental income */}
                            <Text style={styles.label}>Expected Selling Price</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Enter Selling Price"
                                value={sellingPrice}
                                onChangeText={text => {
                                    const numericText = text.replace(/[^0-9]/g, '');
                                    setSellingPrice(numericText);
                                }}
                            />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View className="flex-1">
                                    <Text style={styles.label}>Killometer Driven</Text>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="numeric"
                                            placeholder="Enter km Driven"
                                            value={kmsDriven}
                                            onChangeText={text => {
                                                const numericText = text.replace(/[^0-9]/g, '');
                                                setKmsDriven(numericText);
                                            }}
                                        />
                                    </View>

                                </View>

                                <View style={{ flex: 1 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Fuel Selection</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setSelectedFuel(value)}
                                            items={[
                                                { label: "Petrol", value: "petrol" },
                                                { label: "Diesel", value: "diesel" },
                                                { label: "Electric", value: "electric" },
                                                { label: "Hybrid", value: "hybrid" },
                                            ]}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: "Choose Fuel Type...", value: null }}
                                        />

                                    </View>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>

                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Make Year</Text>
                                    <TouchableOpacity onPress={() => setShow(true)}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD-MM-YYYY"
                                            value={makeYear}
                                            editable={false}
                                        />
                                    </TouchableOpacity>

                                    {show && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                            onChange={handleMakeYear}
                                        />
                                    )}
                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Registration year</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="Enter Year"
                                        value={regYear}
                                        onChangeText={text => {
                                            const numericText = text.replace(/[^0-9]/g, '');
                                            setRegYear(numericText);
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                <View style={{ flex: 1, marginRight: 10 }}>
                                    {/* enter vehicle name */}
                                    <Text style={styles.label}>Registration Type</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setRegType(value)}
                                            items={[
                                                { label: "Private", value: "private" },
                                                { label: "Commercial", value: "commercial" },
                                            ]}
                                            style={pickerSelectStyles}
                                            placeholder={{ label: "Choose Fuel Type...", value: null }}
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, }}>
                                    {/* enter description */}
                                    <Text style={styles.label}>Car Ownership</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setOwnerChanged(value)}
                                            items={[
                                                { label: "1st Hand", value: "1st Hand" },
                                                { label: "2nd Hand", value: "2nd Hand" },
                                                { label: "3rd Hand", value: "3rd Hand" },
                                                { label: "4th Hand", value: "4th Hand" },
                                                { label: "5th Hand or More", value: "5th Hand" },
                                            ]}
                                            placeholder={{ label: "Select Ownership", value: null }}
                                            value={ownerChanged}
                                            style={pickerSelectStyles}
                                        />
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, marginRight: 10 }}>

                                    {/* enter vehicle price */}
                                    <Text style={styles.label}>Transmission Type</Text>
                                    <View style={styles.pickerContainer}>
                                        <RNPickerSelect
                                            onValueChange={(value) => setTransmissionType(value)}
                                            items={[
                                                { label: "Manual", value: "manual" },
                                                { label: "Automatic", value: "automatic" },
                                            ]}
                                            style={pickerSelectStyles} // Ensure picker styles are correctly defined
                                            placeholder={{ label: "Enter Transmission Type", value: null }}
                                        />


                                    </View>

                                </View>

                                <View style={{ flex: 1 }}>

                                    {/* Select Date */}
                                    <Text style={styles.label}>Last updated</Text>
                                    <TouchableOpacity onPress={() => setShow(true)}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD-MM-YYYY"
                                            value={lastUpdate}
                                            editable={false}
                                        />
                                    </TouchableOpacity>

                                    {show && (
                                        <DateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                                            onChange={handlLastUpdated}
                                        />
                                    )}
                                </View>
                            </View>
                        </View>
                    </ProgressStep>

                    <ProgressStep label="Gallery"
                        nextBtnTextStyle={buttonNextTextStyle}
                        previousBtnTextStyle={buttonPreviousTextStyle}
                        onSubmit={handleSubmit}>

                        {/* upload gallery */}
                        <Text style={styles.label}>Upload Car Images</Text>
                        <View style={{ flexGrow: 1, minHeight: 1 }}>
                            <FlatList
                                data={galleryImages}
                                horizontal
                                keyExtractor={(item, index) => index.toString()}
                                nestedScrollEnabled={true}
                                contentContainerStyle={styles.fileContainer}
                                renderItem={({ item, index }) => (
                                    <View style={styles.thumbnailBox} className="border border-gray-300">
                                        <Image source={{ uri: item }} style={styles.thumbnail} />
                                        <Text className="text-center font-rubik-bold">Image: {index + 1}</Text>

                                        <TouchableOpacity
                                            onPress={() => setGalleryImages(galleryImages.filter((_, i) => i !== index))}
                                            style={styles.deleteButton}
                                        >
                                            <Text className="text-white">X</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                        <TouchableOpacity onPress={pickGalleryImages} style={styles.dropbox}>
                            <Text style={{ textAlign: 'center' }}>Pick images from gallery</Text>
                        </TouchableOpacity>

                    </ProgressStep>
                </ProgressSteps>
            </View>
            {
                loading && (
                    <View className='absolute bottom-28 z-40 right-16'>
                        <ActivityIndicator />
                    </View>
                )
            }
        </SafeAreaView >
    )
}

export default SellVehicle

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        paddingBottom: 40,
        backgroundColor: '#fff',
    },
    stepContent: {
        paddingBottom: 20,
    },
    fileContainer: {
        padding: 5,
        backgroundColor: '#fff',
        flexDirection: 'row',
        display: 'flex',
    },
    deleteButton: {
        paddingHorizontal: 7,
        color: 'white',
        borderWidth: 1,
        borderRadius: 7,
        borderColor: 'red',
        marginLeft: 10,
        backgroundColor: 'red',
        width: 25,
        position: 'absolute',
        top: 0,
        right: 0,
    },
    label: {
        fontSize: 16,
        marginHorizontal: 5,
        marginTop: 10,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10
    },
    amenityItem: {
        flexDirection: 'row',
        justifyContent: 'start',
        padding: 5,
        borderRadius: 50,
        marginRight: 5,
        borderColor: 'green',
        backgroundColor: '#edf5ff',
        borderWidth: 1,
    },
    removeBtn: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 12,
        marginEnd: 5,
        marginTop: 3,

    },
    addBtn: {
        width: 40,
        height: 40,
        marginStart: 10,
        marginTop: 15,
    },
    mapTextInput: {
        width: '100%',
        height: 50,
        borderColor: "#edf5ff",
        borderWidth: 1,
        backgroundColor: "#edf5ff",
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    editor: {
        flex: 1,
        padding: 0,
        borderColor: 'gray',
        borderWidth: 1,
        marginHorizontal: 30,
        marginVertical: 5,
        backgroundColor: 'white',
    },

    textarea: {
        textAlignVertical: 'top',  // hack android
        height: 110,
        fontSize: 14,
        marginTop: 10,
        borderRadius: 10,
        color: '#333',
        paddingHorizontal: 15,
        backgroundColor: '#edf5ff',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    thumbnail: {
        width: 73,
        height: 70,
        borderRadius: 10,
    },
    thumbnailBox: {
        width: 75,
        height: 95,
        borderRadius: 10,
        marginRight: 10,
    },
    dropbox: {
        height: 80,
        padding: 5,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#edf5ff',
        backgroundColor: '#edf5ff',
        borderRadius: 10,
        marginTop: 10,
        marginRight: 10,
        justifyContent: 'center',
        alignContent: 'center',
        flex: 1,
    },
    map: {
        width: '100%',
        height: 150,
        marginTop: 10
    },
    addButton: {
        backgroundColor: '#D3D3D3', padding: 10, marginTop: 10, borderRadius: 5
    },
    addButtonText: { color: 'black', textAlign: 'center', fontWeight: 'bold' },
    tableRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10 },
    tableCell: { flex: 1, textAlign: 'center', borderEnd: 1, borderColor: '#c7c7c7', fontWeight: 600, },
    pickerContainer: {
        borderRadius: 10, // Apply borderRadius here
        overflow: 'hidden',
        backgroundColor: '#edf5ff',
        marginTop: 10,
        // marginBottom: 20,
    },

});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#edf5ff',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30,
    },
});
