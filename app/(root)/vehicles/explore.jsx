import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import axios from 'axios';
import icons from '@/constants/icons';
import Search from '@/components/Search';
import { Card } from '@/components/Cards';

const Explore = () => {
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams(); // Get URL parameters
  const [selectedFilters, setSelectedFilters] = useState({
    city: null,
    budget: null,
    fuelType: null,
    transmission: null,
    color: null,
    brand: null,
  });
  const handleCardPress = (id) => router.push(`/vehicles/${id}`);

  const fetchFilterData = async () => {
    setLoading(true);
    setListingData([]);

    // console.log("Raw params from URL:", params); // Debugging

    let requestBody = {
      attribute: {
        brand: params.brand || null,
        fuelType: params.fuelType || null,
        transmission: params.transmission || null,
        budget: params.budget || null,
        color: params.color || null,
      },
      location: params.city || null,
    };

    // Remove keys with null values
    Object.keys(requestBody.attribute).forEach(
      (key) => requestBody.attribute[key] === null && delete requestBody.attribute[key]
    );
    if (!requestBody.location) delete requestBody.location;

    // console.log("Final request payload:", JSON.stringify(requestBody, null, 2)); // Debugging

    try {
      const response = await axios.post("https://carzchoice.com/api/filterOldCarByAttribute", requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.variants) {
        setListingData(response.data.variants);
      } else {
        setListingData([]);
      }
    } catch (error) {
      console.error("Error fetching listings:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    // console.log("Params updated:", params);

    // Set selected filters from URL parameters
    setSelectedFilters({
      city: params.city || null,
      budget: params.budget || null,
      fuelType: params.fuelType || null,
      transmission: params.transmission || null,
      color: params.color || null,
      brand: params.brand || null,
    });

    fetchFilterData();
  }, [JSON.stringify(params)]);



  return (
    <SafeAreaView className='bg-white h-full'>
      <FlatList
        data={listingData}
        renderItem={({ item }) => <Card item={item} onPress={() => handleCardPress(item.id)} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 32 }}
        columnWrapperStyle={{ flex: 1, gap: 5, paddingHorizontal: 5 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className='px-5'>
            <View className='flex flex-row items-center ml-2 mb-3 justify-between'>
              <TouchableOpacity onPress={() => router.navigate('/')} className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center">
                <Image source={icons.backArrow} className='size-5' />
              </TouchableOpacity>
              <Text className='text-base mr-2 text-center font-rubik-medium text-black-300'>
                Search for Your Dream Car
              </Text>
              <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Image source={icons.bell} className='size-6' />
              </TouchableOpacity>
            </View>

            <Search selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />

            <View className='my-5'>
              <Text className='text-xl font-rubik-bold text-black-300'>
                {listingData.length > 0 ? `${listingData.length} cars found` : 'No cars found'}
              </Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Explore;
