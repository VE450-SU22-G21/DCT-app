import React from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
// import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import { ProgressSteps, ProgressStep } from '../components/ProgressSteps';

function WelcomeScreen({ navigation }) {
  const defaultScrollViewProps = {
    contentContainerStyle: {
      flex: 1,
      justifyContent: 'center',
    },
  };

  const textStyle = { flex: 1, alignItems: 'center', justifyContent: 'space-evenly' };

  const onSubmit = async () => {
    // Get Bluetooth permission
    console.log(Platform.OS);
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      ];
      try {
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        console.log(granted);
        for (const permission in granted) {
          if (granted[permission] !== PermissionsAndroid.RESULTS.GRANTED) {
            throw permission;
          }
        }
        navigation.replace('Home');
      } catch (err) {
        console.warn(err);
      }
    } else {
      // TODO: iOS permission
      navigation.replace('Home');
    }
  };

  return (
    <View style={{
      flex: 1, alignItems: 'center', justifyContent: 'center', margin: 20,
    }}
    >
      <ProgressSteps>
        <ProgressStep label="Welcome" scrollViewProps={defaultScrollViewProps}>
          <View style={textStyle}>
            <Text>Welcome to JI Exposure!</Text>
            <Text>This version of XXX is to demonstrate the use of Bluetooth Low Energy Digital Contact Tracing Application.</Text>
            <Text>Our code can be found at github - https://github.com/VE450-SU22-G21/DCT-app/</Text>
          </View>
        </ProgressStep>
        <ProgressStep label="Introduction" scrollViewProps={defaultScrollViewProps}>
          <View style={textStyle}>
            <Text>JI Exposure</Text>
            <Text>XXX defend the health for both you and the people around you by notifying your risks of being infected with COVID-19.</Text>
            <Text>We fully esteem your personal privacy and safety. XXX tracks exposures without occupying any personal or location data using BLE technology.</Text>
          </View>
        </ProgressStep>
        <ProgressStep label="Explanation" scrollViewProps={defaultScrollViewProps}>
          <View style={textStyle}>
            <Text>How we preserve both privacy and safety</Text>
            <Text>XXX uses BLE to let your phone recognize all the other XXX users around you.</Text>
            <Text>XXX saves key information of the phones nearby in an anonymous, local, and privacy-preserving way.</Text>
            <Text>If someone that are stored in your phone becomes infected, you are at risk of being infected. You would receive a notification.</Text>
            <Text>If you become infected, you can also report in the app and let others know.</Text>
            <Text>None of actions used by the app keeps records of your personal information. You are safe. And your privacy is well-preserved.</Text>
          </View>
        </ProgressStep>
        <ProgressStep label="Permissions" onSubmit={onSubmit} scrollViewProps={defaultScrollViewProps}>
          <View style={textStyle}>
            <Text>
              To opt in, we need your bluetooth permission.
              For XXX to function correctly, please select “Allow all the time.”
            </Text>
            <View>
              <Avatar.Icon
                size={192}
                icon="bluetooth"
              />
            </View>
          </View>
        </ProgressStep>
      </ProgressSteps>
    </View>
  );
}

export default WelcomeScreen;
