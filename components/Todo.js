import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Todo = (props) => {
  return (
    <View style={styles.todo}>
      <View style={styles.todoitemleft}>
        <Text style={styles.todotext}>{props.text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  todo: {
    height: 30,
    justifyContent: "center", //Centered horizontally

    flex: 1,
  },
  todoitemleft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  todotext: {
    width: "80%",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Todo;
