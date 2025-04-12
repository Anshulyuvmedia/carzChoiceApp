import React, { useRef, useState } from 'react';
import { View, Dimensions, Image, TouchableOpacity, Pressable } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const data = [
    {
        image: 'https://stimg.cardekho.com/images/uploadimages/1741678105500/CD-MasterHead_Mobile_624x340px-(3).jpg',
        title: 'Tata Harrier EV',
        link: 'https://cardekho.com/tata-harrier-ev',
    },
    {
        image: 'https://stimg.cardekho.com/images/uploadimages/1741678105500/CD-MasterHead_Mobile_624x340px-(3).jpg',
        title: 'Mahindra XUV400',
        link: 'https://cardekho.com/mahindra-xuv400',
    },
];

const BannerSlider = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null); // Step 1: Ref

    return (
        <View style={{ marginBottom: 16 }}>
            <Carousel
                ref={carouselRef}
                loop
                width={width}
                height={200}
                autoPlay={true}
                autoPlayInterval={7000} // Slide stay time = 7 seconds
                scrollAnimationDuration={3000} // Transition animation = 3 seconds
                data={data}
                onSnapToItem={(index) => setActiveIndex(index)}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => console.log('Navigate to:', item.link)}>
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: '95%',
                                height: 200,
                                borderRadius: 12,
                                alignSelf: 'start',
                            }}
                        />
                    </TouchableOpacity>
                )}
            />


            {/* Clickable Dots */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 10,
            }}>
                {data.map((_, index) => (
                    <Pressable
                        key={index}
                        onPress={() => {
                            setActiveIndex(index);
                            carouselRef.current?.scrollTo({ index }); // Step 3: Scroll on click
                        }}
                    >
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                marginHorizontal: 4,
                                backgroundColor: activeIndex === index ? '#0061FF' : 'gray',
                            }}
                        />
                    </Pressable>
                ))}
            </View>
        </View>
    );
};

export default BannerSlider;
