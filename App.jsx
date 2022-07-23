import {StatusBar} from 'expo-status-bar';
import * as React from 'react';
import 'react-native-get-random-values';
import {StyleSheet, View, ScrollView} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  Button,
  BottomNavigation,
  Text,
  Provider,
  Appbar,
  Card,
  Avatar,
  Divider,
  List,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from './src/screens/Home';
import WelcomeScreen from './src/screens/Welcome';
import SubmissionScreen from './src/screens/Submission';
import SuccessScreen from './src/screens/Success';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  version: 3,
  colors: {
    ...DefaultTheme.colors,
    surface: '#f2edf6',
    // primary: '#3498db',
    secondary: '#EADDFF',
    // tertiary: '#a1b2c3',
  },
};

export default function App() {
  return (
    // <View style={styles.container}>
    //   <Text>Open up App.jsx to start working on your app!</Text>
    //   <StatusBar style="auto" />
    // </View>
    <Provider
      settings={{icon: (props) => <MaterialIcons {...props} />}}
      theme={theme}
    >
      <NavigationContainer>
        <Stack.Navigator>
          {/* <Stack.Screen name="Submission" component={SubmissionScreen} /> */}
          <Stack.Screen name="Welcome" component={WelcomeScreen}/>
          <Stack.Screen name="Home" component={HomeScreen}/>
          <Stack.Screen name="Success" component={SuccessScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
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
