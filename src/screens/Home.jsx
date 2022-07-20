import React, { useEffect, useState } from 'react';
import {
  StyleSheet, ScrollView, View, NativeEventEmitter, NativeModules,
} from 'react-native';
import {
  BottomNavigation,
  Text,
  Provider,
  Appbar,
  Button,
  Card,
  Avatar,
  Divider,
  List,
  Portal,
  Dialog,
  Paragraph, Title,
} from 'react-native-paper';
import moment from 'moment';
import _, { keys } from 'lodash';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { v4 as uuidv4, validate } from 'uuid';
import storage from '../utils/storage';
import useInterval from '../utils/useInterval';

function TracingCard({ exposure }) {
  const navigation = useNavigation();
  return (
    <Card style={styles.tracingCard} elevation={5}>
      <Card.Content>
        {/* <Title>Card title</Title> */}
        <Paragraph>
          Do you have symptoms of COVID-19 or a positive test
          result?
        </Paragraph>
      </Card.Content>
      <Card.Actions style={styles.flexCenter}>
        {exposure
          ? <Button mode="contained" onPress={() => { navigation.navigate('Home'); }}>I have symptoms</Button>
          : <Button mode="contained" onPress={() => { navigation.navigate('Home'); }}>Take next steps</Button>}
      </Card.Actions>
    </Card>
  );
}

function TracingRoute() {
  const [tracing, setTracing] = useState(
    { tracingState: true, lastPauseTimestamp: 0, exposure: false },
  );
  const [generateKeyInterval, setGenerateKeyInterval] = useState(null);
  const pollingInterval = 10000;

  useInterval( async () => {
    console.log('Downloading reports')
    fetch ('http://nichujie.xyz:8000/report/', {
      method: "GET"
    })
    .then(response => response.json())
    .then(data => {
      storage.getIdsForKey('contacted')
      .then( contacted => {
        console.log(data['keys ']);
        if (contacted.filter(value => data['keys '].includes(value)) !== []) {
          console.log('Exposure detected!');
        } else {
          console.log('No exposure detected!')
        }
      })
    })
    .catch( error => {
      console.log(error);
    })
  }, pollingInterval)

  const generateKey = async () => {
    const key = uuidv4();
    const timestamp = moment.now();
    console.log('generate key:', key, timestamp);
    try {
      await storage.save({ key: 'keys', id: key, data: timestamp });
      // console.log('storage.save', key, timestamp);
      // Maybe can set expiration time here
    } catch (e) {
      console.error(e);
    }
  };

  const generateKeyStartRepeat = async () => {
    await generateKey();
    const interval = setInterval(async () => {
      await generateKey();
    }, 10000);
    setGenerateKeyInterval(interval);
  };

  const generateKeyStopRepeat = () => {
    if (generateKeyInterval) {
      clearInterval(generateKeyInterval);
      setGenerateKeyInterval(null);
    }
  };

  const init = async () => {
    try {
      const savedTracing = await storage.load({ key: 'tracing' });
      console.log('storage.load', savedTracing);
      const tracingState = _.get(savedTracing, 'tracingState', true);
      let lastPauseTimestamp = _.get(savedTracing, 'lastPauseTimestamp', 0);
      const exposure = _.get(savedTracing, 'exposure', false);
      if (tracingState) {
        lastPauseTimestamp = 0;
        await generateKeyStartRepeat();
      }
      setTracing({ tracingState, lastPauseTimestamp, exposure });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();

    BLEAdvertiser.setCompanyId(21);
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    eventEmitter.addListener('onDeviceFound', (deviceData) => {
      const uuids = deviceData.serviceUuids;
      if (Array.isArray(uuids) && uuids.length > 0) {
        const scannedKey = uuids[0];
        if (validate(scannedKey)) { // If is valid UUID
          storage.save({ key: 'contacted', id: scannedKey, data: moment.now() }); // Save scanned key with timestamp
        }
      }
    });

    return () => {
      generateKeyStopRepeat();
    };
  }, []);

  // const keyGeneration = async () => {
  //   const { tracingState } = tracing;
  //   if (tracingState) {
  //     const interval = setInterval(async () => {
  //       await generateKey();
  //     }, 10000);
  //     setKeyGenerationInterval(interval);
  //   } else if (keyGenerationInterval) {
  //     clearInterval(keyGenerationInterval);
  //   }
  // };
  //
  // useEffect(() => {
  //   keyGeneration();
  // }, [tracing, keyGeneration]);

  const onTracingClick = async () => {
    let { tracingState, lastPauseTimestamp } = tracing;
    tracingState = !tracingState;
    generateKeyStopRepeat();
    if (!tracingState) {
      // set starting pause time
      lastPauseTimestamp = moment.now();

      // Stop advertise
      BLEAdvertiser.stopBroadcast()
        .then(() => console.log('Stop Broadcast Successful'))
        .catch((error) => console.log('Stop Broadcast Error', error));
      // Stop scan
      BLEAdvertiser.stopScan()
        .then(() => console.log('Stop Scan Successful'))
        .catch((error) => console.log('Stop Scan Error', error));

      const contacted = await storage.getIdsForKey('contacted');
      console.log('Contacted', contacted);
    } else {
      await generateKeyStartRepeat();

      // Start advertise
      const keys = await storage.getIdsForKey('keys');
      if (Array.isArray(keys) && keys.length > 0) {
        const currentKey = keys[keys.length - 1];
        BLEAdvertiser.broadcast(currentKey, [], {})
          .then(() => console.log('Broadcasting Sucessful'))
          .catch((error) => console.log('Broadcasting Error', error));
      }

      // Start scan
      BLEAdvertiser.scan([], {}) // service UUID and options
        .then(() => console.log('Scan Successful'))
        .catch((error) => console.log('Scan Error', error));
    }

    const newTracing = { ...tracing, tracingState, lastPauseTimestamp };
    try {
      await storage.save({ key: 'tracing', data: newTracing });
      // console.log('storage.save', newTracing);
    } catch (e) {
      // console.error(e);
    }
    setTracing(newTracing);
  };

  return (
    <View style={styles.flexCenter}>
      <View style={styles.tracingViewItem}>
        <Avatar.Icon
          size={192}
          icon={tracing.tracingState
            ? 'bluetooth-searching'
            : 'bluetooth-disabled'}
        />
      </View>
      <View style={styles.tracingViewItem}>
        <Button
          icon={tracing.tracingState ? 'pause' : 'play-arrow'}
          mode="outlined"
          onPress={onTracingClick}
          style={styles.tracingButton}
        >
          {tracing.tracingState ? 'Pause' : 'Resume'}
        </Button>
      </View>
      <View style={styles.tracingViewItem}>
        {!tracing.tracingState && tracing.lastPauseTimestamp ? (
          <>
            <Text variant="bodyLarge" style={styles.center} />
            <Text variant="bodyLarge" style={styles.center}>
              {`Paused on ${moment(tracing.lastPauseTimestamp).format('MMMM Do YYYY, h:mm:ss a')}`}
            </Text>
          </>
        ) : (
          <>
            <Text variant="bodyLarge" style={styles.center}>A lot of contacts around you</Text>
            <Text variant="bodyLarge" style={styles.center}>Remember to keep social distance</Text>
          </>
        )}
      </View>
      <View style={styles.tracingViewItem}>
        <TracingCard exposure={tracing.exposure} />
      </View>
    </View>
  );
}

function SymptomRoute() {
  const navigation = useNavigation();
  const [report, setReport] = React.useState(false);

  const showReportConfirm = () => setReport(true);

  const hideReportConfirm = () => setReport(false);

  const reportKeys = async () => {
    try {
      const keys = await storage.getIdsForKey('keys');
      console.log('GetIdsForKey', keys);
      // const timestamps = await storage.getAllDataForKey('keys');
      // console.log('GetAllDataForKey', timestamps);
      // const data = keys.map((key, i) => {
      //   return {key: key,
      //   created_at: timestamps[i]}
      // });
      // console.log(data);
      // storage.clearMapForKey('keys');
      // // Clear all uploaded keys so same key won't be uploaded twice
      // console.log('Clear all keys');
      fetch('http://nichujie.xyz:8000/report/', {
        method: 'POST',
        body: JSON.stringify({
          // data,
          keys,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    catch (err) {
      console.warn(err.message);
    }
  };

  const onReportClick = async () => {
    hideReportConfirm();
    await reportKeys();
    navigation.navigate('Success');
  }

  return (
    <View style={styles.flexCenter}>
      <View style={{
        ...styles.tracingViewItem,
        alignItems: 'center',
      }}
      >
        <Text variant="bodyLarge" style={{ marginHorizontal: 30, marginBottom: 30 }}>
          If you think yourself has symptoms similar
          to covid, please use a test kit or
          schedule a PCR test.
        </Text>
        <Text variant="bodyLarge" style={{ marginHorizontal: 30, marginBottom: 30 }}>
          If you have positive report, please report
          to the system. Thank you. Your
          privacy will be protected.
        </Text>
      </View>
      <View style={styles.tracingViewItem}>
        <Button mode="contained" onPress={showReportConfirm}>
          Report positive
          result
        </Button>
        <Portal>
          <Dialog visible={report} onDismiss={hideReportConfirm}>
            <Dialog.Title>Confirm</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Are you sure you have a positive COVID-19
                result?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideReportConfirm}>Cancel</Button>
              <Button
                mode="contained"
                onPress={onReportClick}
              >
                Yes
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </View>
  );
}

function HelpRoute() {
  return (
    <>
    </>
  );
}

function Navigation() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'tracing', title: 'Tracing', icon: 'my-location' },
    { key: 'symptom', title: 'Symptom', icon: 'medical-services' },
    { key: 'help', title: 'Help', icon: 'help' },
    // {key: 'chat', title: 'Chats', icon: 'chat', badge: 99},
    // {key: 'contacts', title: 'Contacts', icon: 'contacts'},
    // {key: 'discover', title: 'Discover', icon: 'compass'},
    // {key: 'me', title: 'Me', icon: 'account'},
  ]);

  const renderScene = BottomNavigation.SceneMap({
    tracing: TracingRoute,
    symptom: SymptomRoute,
    help: HelpRoute,
    // me: MeRoute,
  });

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

function HomeScreen() {
  return (
    <Navigation />
  );
}

const styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    textAlign: 'center',
  },
  tracingViewItem: {
    marginTop: 30,
  },
  tracingCard: {
    marginLeft: 50,
    marginRight: 50,
    height: 130,
  },
  tracingButton: {
    borderRadius: 100,
  },
});

export default HomeScreen;
