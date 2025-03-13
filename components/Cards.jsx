import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import images from '@/constants/images'
import icons from '@/constants/icons'


const FeaturedCard = ({ item, onPress }) => {
  // Safely parse images array
  console.log("item:",item);
  let imagesArray = [];
  try {
    imagesArray = typeof item.images === "string" ? JSON.parse(item.images) : item.images || [];
  } catch (error) {
    console.warn("Error parsing images:", error.message);
  }

  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;

  return (
    <View>
      <TouchableOpacity onPress={onPress} className='flex flex-col items-start w-60 h-60 relative'>
        {firstImageUrl ? (
          <Image source={{ uri: `https://carzchoice.com/${firstImageUrl}` }} className='size-full rounded-2xl' />
        ) : (
          <Text className="text-white">Image Not Available</Text>
        )}

        <Image source={images.cardGradient} className='size-full rounded-2xl absolute bottom-0' />

        <View className='flex flex-col items-start absolute bottom-5 inset-x-5'>
          <Text className='text-xl font-rubik-extrabold text-white' numberOfLines={1}>{item.carname}</Text>
          <Text className='text-base font-rubik text-white' numberOfLines={1}>{item.modalname}, {item.district}</Text>
          <View className='flex flex-row items-center justify-between w-full'>
            <Text className='text-xl font-rubik-extrabold text-white'>{item.brandname}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export { FeaturedCard };

const Card = ({ item, onPress }) => {
  let imagesArray = [];
  try {
    imagesArray = typeof item.images === "string" ? JSON.parse(item.images) : item.images || [];
  } catch (error) {
    console.warn("Error parsing images:", error.message);
  }

  const firstImageUrl = imagesArray.length > 0 ? imagesArray[0]?.imageurl : null;

  return (
    <TouchableOpacity onPress={onPress} className='flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative'>
      {firstImageUrl ? (
        <Image source={{ uri: `https://carzchoice.com/${firstImageUrl}` }} className='w-full h-40 rounded-lg' />
      ) : (
        <Text className="text-black">Image Not Available</Text>
      )}

      <View className='flex flex-col mt-2'>
        <Text className='text-base font-rubik-bold text-black-300'>{item.carname}</Text>
        <Text className='text-xs font-rubik text-black-100'>{item.modalname}</Text>
        <Text className='text-xs font-rubik text-black-100'>{item.brandname}, {item.district}</Text>

        <View className='flex flex-row items-center justify-between mt-2'>
          <Text className='text-base font-rubik-bold text-primary-300'>Rs. {item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export { Card };


const styles = StyleSheet.create({})