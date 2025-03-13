import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import Filters from '@/components/Filters';
import { Card } from '@/components/Cards';

const Explore = () => {
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams(); // Get URL parameters

  const handleCardPress = (id) => router.push(`/properties/${id}`);


  const fetchFilterData = async () => {
    setLoading(true);
    setListingData([]);

    console.log("params:", params);

    try {
      let apiUrl;
      let requestBody;

      if (params.propertyType) {
        // Fetch filtered listings when propertyType is present
        apiUrl = `https://carzchoice.com/api/filterByAttribute`;
        requestBody = { attribute: params.propertyType };
      } 

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.variants) {
        const formattedData = Object.values(response.data.variants).map((item) => ({
          ...item,
          mileage: safeParseJSON(item.mileage),
          fueltype: safeParseJSON(item.fueltype),
          transmission: safeParseJSON(item.transmission),
        }));

        setListingData(formattedData);
        console.log("item:", formattedData);

      } else {
        console.error("Unexpected API response format:", response.data);
        setListingData([]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error.response?.data || error.message);


    } finally {
      setLoading(false);
    }
  };





  // Function to safely parse JSON strings
  const safeParseJSON = (value) => {
    if (!value || typeof value !== "string") return value; // Return as-is if empty or not a string

    try {
      const trimmedValue = value.trim(); // Remove unwanted spaces

      // If it's a valid JSON string, parse it
      if ((trimmedValue.startsWith("{") && trimmedValue.endsWith("}")) ||
        (trimmedValue.startsWith("[") && trimmedValue.endsWith("]"))) {
        return JSON.parse(trimmedValue);
      }

      return value; // If not JSON, return as is
    } catch (error) {
      console.warn("JSON Parsing Failed for value:", value, "Error:", error.message);
      return value; // Return original value if parsing fails
    }
  };



  useEffect(() => {
    fetchFilterData();
  }, []);



  return (
    <SafeAreaView className='bg-white h-full'>
      <FlatList
        data={listingData}
        renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName='flex gap-5 px-5'
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className='px-5'>
            <View className='flex flex-row items-center ml-2 justify-between'>
              <TouchableOpacity onPress={() => router.navigate('/')} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center" >
                <Image source={icons.backArrow} className='size-5' />
              </TouchableOpacity>
              <Text className='text-base mr-2 text-center font-rubik-medium text-black-300'>
                Search for Your Dream Car
              </Text>
              <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Image source={icons.bell} className='size-6' />
              </TouchableOpacity>
            </View>

            <Search />
            <Filters />

            <View className='my-5'>
              <Text className='text-xl font-rubik-bold text-black-300'>
                {listingData.length > 0 ? `${listingData.length} properties found` : 'No properties found'}
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Explore;
