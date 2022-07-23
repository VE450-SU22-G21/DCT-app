import React from 'react';
import {
  View,
  PermissionsAndroid,
  Platform,
  Linking,
  TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import {Text, Avatar, useTheme} from 'react-native-paper';
// import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import {ProgressSteps, ProgressStep} from '../components/ProgressSteps';

function WelcomeScreen({navigation}) {
  const defaultScrollViewProps = {
    contentContainerStyle: {
      flex: 1,
      justifyContent: 'center',
    },
  };

  const {colors} = useTheme();
  const textStyle = {};

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

  const appName = 'JI Exposure';

  return (
    <View style={{
      flex: 1, alignItems: 'center', justifyContent: 'center', margin: 20,
    }}
    >
      <ProgressSteps>
        <ProgressStep label="Welcome" scrollViewProps={defaultScrollViewProps}>
          <View style={styles.titleView}>
            <Text variant="titleLarge" style={styles.title}>Welcome
              to {appName}!</Text>
          </View>
          <ScrollView contentContainerStyle={styles.contentView}>
            <Text variant="bodyLarge">
              This version of {appName} is to demonstrate the
              use of Bluetooth Low Energy Digital Contact Tracing
              Application.
              {'\n\n'}
              Our code can be found on github at
              <TouchableOpacity
                onPress={() => Linking.openURL(
                  'https://github.com/VE450-SU22-G21/DCT-app/')}>
                <Text variant="bodyLarge" style={{color: 'blue'}}>
                  https://github.com/VE450-SU22-G21/DCT-app/
                </Text>
              </TouchableOpacity>
            </Text>
          </ScrollView>
        </ProgressStep>
        <ProgressStep label="Introduction"
                      scrollViewProps={defaultScrollViewProps}>
          <View style={styles.titleView}>
            <Text variant="titleLarge" style={styles.title}>{appName}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.contentView}>
            <Text variant="bodyLarge">
              {appName} defend the health for both you and the people around you
              by notifying your risks of being infected with COVID-19.
              {'\n\n'}
              We fully esteem your personal privacy and safety. {appName} tracks
              exposures without occupying any personal or location data using
              BLE technology.
            </Text>
          </ScrollView>
        </ProgressStep>
        <ProgressStep label="Explanation"
                      scrollViewProps={defaultScrollViewProps}>
          <View style={styles.titleView}>
            <Text variant="titleLarge" style={styles.title}>Privacy and
              Safety</Text>
          </View>
          <ScrollView contentContainerStyle={styles.contentView}>
            <Text variant="bodyLarge">
              {appName} uses BLE to let your phone recognize
              all the other {appName} users around you.
              {'\n\n'}
              {appName} saves key information of the phones nearby in an
              anonymous, local, and privacy-preserving way.
              {'\n\n'}
              If someone that are stored in your phone becomes infected, you
              are at risk of being infected. You would receive a notification.
              {'\n\n'}
              If you become infected, you can also report in the app
              and let others know.
              {'\n\n'}
              None of actions used by the app keeps records of your personal
              information. You are safe. And your privacy is well-preserved.
            </Text>
          </ScrollView>
        </ProgressStep>
        <ProgressStep label="Permissions" onSubmit={onSubmit}
                      scrollViewProps={defaultScrollViewProps}>
          <View style={styles.titleView}>
            <Text variant="titleLarge" style={styles.title}>App
              Permission</Text>
          </View>
          <ScrollView contentContainerStyle={styles.contentView}>
            <Text variant="bodyLarge">
              To opt in, we need your bluetooth permission.
              For {appName} to function correctly, please select “Allow all the
              time.”
            </Text>
            <View>
              <Avatar.Icon
                size={192}
                icon="bluetooth"
                color={colors.primary}
                style={{backgroundColor: colors.secondary}}
              />
            </View>
          </ScrollView>
        </ProgressStep>
      </ProgressSteps>
    </View>
  );
}

const styles = StyleSheet.create({
  titleView: {
    marginTop: 50,
  },
  title: {
    textAlign: 'center',
  },
  contentView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
});

export default WelcomeScreen;
