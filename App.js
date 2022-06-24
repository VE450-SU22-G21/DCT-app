import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomNavigation, Text, Provider, Appbar, Card, Avatar, Divider, List } from 'react-native-paper';

import HomeScreen from "./src/screens/Home";
import WelcomeScreen from "./src/screens/Wecome";
import SubmissionScreen from "./src/screens/Submission";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.js to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerLeft: null, gestureEnabled: false}}/>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerLeft: null, gestureEnabled: false}}/>
        <Stack.Screen name="Submission" component={SubmissionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
