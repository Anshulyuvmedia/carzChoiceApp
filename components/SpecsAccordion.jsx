import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

const SpecsAccordion = ({ specifications = [] }) => {
    // Transform data into the required structure
    const groupedSpecs = Array.isArray(specifications)
        ? specifications.reduce((acc, spec) => {
            if (!acc[spec.name]) {
                acc[spec.name] = [];
            }
            acc[spec.name] = acc[spec.name].concat(spec.details || []);
            return acc;
        }, {})
        : {};

    const [expanded, setExpanded] = useState(null);

    if (!Object.keys(groupedSpecs).length) {
        return <Text style={{ textAlign: "center", margin: 20 }}>No Specs Available</Text>;
    }

    return (
        <View>
            {Object.keys(groupedSpecs).map((type, index) => (
                <List.Accordion
                    key={index}
                    title={type || "Unknown"}
                    expanded={expanded === index}
                    onPress={() => setExpanded(expanded === index ? null : index)}
                    titleStyle={styles.accordionTitle}
                    style={styles.accordion}
                    theme={{ colors: { primary: "#007AFF" } }}
                >
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.boldText]}>Specifications</Text>
                        <Text style={[styles.tableCell, styles.boldText]}>Value</Text>
                    </View>
                    {groupedSpecs[type].map((item, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{item.label}</Text>
                            <Text style={styles.tableCell}>
                                {item.value === "1" ? (
                                    <MaterialIcons name="check" size={20} color="green" />
                                ) : (
                                    item.value || "-"
                                )}
                            </Text>
                        </View>
                    ))}
                </List.Accordion>
            ))}
        </View>
    );
};


export default SpecsAccordion;

const styles = StyleSheet.create({
    accordion: {
        backgroundColor: "#f5f5f5", // Light gray background
        borderRadius: 10, // Rounded corners
        overflow: "hidden",
        margin: 10,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333", // Dark text color
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff", // White background for rows
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    boldText: {
        fontWeight: "bold",
    },
});

