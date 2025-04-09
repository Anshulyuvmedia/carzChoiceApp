import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import ModalSelector from 'react-native-modal-selector-searchable';

const CitySelector = ({ cityData = [], onSelectCity }) => {
    const [selectedCity, setSelectedCity] = useState('');
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    // Format data initially
    const formattedCities = (cityData || []).map((city, index) => ({
        key: index,
        label: city.label || city.name || city,
        value: city.value || city.id || city,
    }));

    // Show top 20 initially
    useEffect(() => {
        setFilteredData(formattedCities);
    }, [cityData]);

    // Filter on search
    const handleSearch = (text) => {
        setSearchText(text);
        if (text.length === 0) {
            setFilteredData(formattedCities);
        } else {
            const filtered = formattedCities.filter((item) =>
                item.label.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        }
    };

    return (
        <View style={styles.container}>
            <ModalSelector
                data={filteredData}
                initValue="Choose a city"
                onChange={(option) => {
                    setSelectedCity(option.label);
                    onSelectCity(option.value);
                }}
                searchable={true}
                searchText={searchText}
                onSearch={handleSearch}
                cancelText="Cancel"
                animationType="slide"
                optionTextStyle={{ color: 'black', textTransform: 'capitalize' }}
                optionContainerStyle={{ backgroundColor: 'white' }}
            >
                <TextInput
                    style={styles.input}
                    editable={false}
                    placeholder="Choose a City"
                    value={selectedCity}
                />
            </ModalSelector>
        </View>
    );
};

export default CitySelector;

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    input: {
        borderWidth: 0,
        borderColor: '#ccc',
        padding: 10,
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
    },
});
