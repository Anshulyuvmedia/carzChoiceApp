import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

const FeaturesAccordion = ({ features = [] }) => {
    const [expanded, setExpanded] = useState(null);

    if (!Array.isArray(features) || features.length === 0) {
        return <Text style={{ textAlign: "center", margin: 20 }}>No Features Available</Text>;
    }
    // console.log("features", features)
    return (
        <View>
            {features.map((section, index) => (
                <List.Accordion
                    key={index}
                    title={section.name || "Unknown"}
                    expanded={expanded === index}
                    onPress={() => setExpanded(expanded === index ? null : index)}
                    titleStyle={styles.accordionTitle}
                    style={styles.accordion}
                    theme={{ colors: { primary: "#007AFF" } }}
                >
                    {Array.isArray(section.details) && section.details.length > 0 ? (
                        section.details.map((feature, idx) => (
                            <View key={idx} style={styles.tableRow}>
                                <Text style={styles.tableCell}>{feature}</Text>
                                <Text>
                                    <Text>
                                        {feature.includes("No ") ? (
                                            <MaterialIcons name="close" size={20} color="red" />
                                        ) : (
                                            <MaterialIcons name="check" size={20} color="green" />
                                        )}
                                    </Text>

                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={{ padding: 10 }}>No data available</Text>
                    )}
                </List.Accordion>
            ))}
        </View>
    );
};

export default FeaturesAccordion;

const styles = StyleSheet.create({
    accordion: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        overflow: "hidden",
        margin: 7,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    tableRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        backgroundColor: "#fff",
    },
    tableCell: {
        fontSize: 14,
        color: "#333",
    },
});
