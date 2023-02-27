import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Text, FlatList, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { QUALIFICATION_TIME_PER_ARROW } from "../constants/Times";

const timerCollection = [
  {
    id: "1",
    name: "Indoor",
    arrows: 3,
    timePerArrow: QUALIFICATION_TIME_PER_ARROW,
  },
];

export const Timers = () => {
  return (
    <SafeAreaView>
      <View>
        <FlatList
          data={timerCollection}
          renderItem={({ item }) => (
            <View>
              <FontAwesome size={30} name="bullseye" color="#000" />
              <Text>{item.name}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});
