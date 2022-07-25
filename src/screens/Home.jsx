import React, {useEffect, useState} from 'react';
import Constants from 'expo-constants';
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
  Paragraph, Title, useTheme, IconButton,
} from 'react-native-paper';
import moment from 'moment';
import _ from 'lodash';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import BLEAdvertiser from 'react-native-ble-advertiser';
import {v4 as uuidv4, validate} from 'uuid';
import storage from '../utils/storage';
import useInterval from '../utils/useInterval';

function TracingCard({setIndex, exposure}) {
  return (
    <Card style={styles.tracingCard}>
      <Card.Content>
        {/* <Title>Card title</Title> */}
        <Paragraph>
          Do you have symptoms of COVID-19 or a positive test
          result?
        </Paragraph>
      </Card.Content>
      <View style={styles.flexCenter}>
        <Button
          mode="contained"
          onPress={() => {
            setIndex(1);
          }}
        >
          {exposure ? 'I have symptoms' : 'Take next steps'}
        </Button>
      </View>
    </Card>
  );
}

function TracingRoute({setIndex, exposureKeys, setExposureKeys}) {
  const {colors} = useTheme();
  const [tracing, setTracing] = useState(
    {tracingState: true, lastPauseTimestamp: 0, exposure: false},
  );
  const [generateKeyInterval, setGenerateKeyInterval] = useState(null);

  const pollingInterval = 10000;

  useInterval(async () => {
    try {
      console.log('Downloading reports');
      const url = new URL('/report', Constants.manifest.extra.baseURL);
      const response = await fetch(url.toString(), {method: 'GET'});
      const data = await response.json();
      const fetchedKeys = data['keys '];
      const contactedKeys = await storage.getIdsForKey('contacted');
      const matchedKeys = _.intersection(fetchedKeys, contactedKeys);
      const newMatchedKeys = _.difference(matchedKeys, exposureKeys.all);
      // console.log(fetchedKeys);
      if (newMatchedKeys.length > 0) {
        console.log(newMatchedKeys);
        setExposureKeys({
          all: exposureKeys.all.concat(newMatchedKeys),
          unchecked: exposureKeys.unchecked.concat(newMatchedKeys),
        });
        console.log(exposureKeys.all);
        console.log(exposureKeys.unchecked);
      } else {
        console.log(exposureKeys.all);
        console.log(exposureKeys.unchecked);
      }
    } catch (e) {
      console.error(e);
    }
  }, pollingInterval);

  const generateKey = async () => {
    const key = uuidv4();
    const timestamp = moment.now();
    // console.log('generate key:', key, timestamp);
    try {
      await storage.save({key: 'keys', id: key, data: timestamp});
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
    let savedTracing;
    try {
      savedTracing = await storage.load({key: 'tracing'});
      console.log('storage.load', savedTracing);
    } catch (e) {
      savedTracing = {};
      console.log('storage.load: not found.');
    }
    try {
      const tracingState = _.get(savedTracing, 'tracingState', true);
      let lastPauseTimestamp = _.get(savedTracing, 'lastPauseTimestamp', 0);
      const exposure = _.get(savedTracing, 'exposure', false);
      if (tracingState) {
        lastPauseTimestamp = 0;
        await generateKeyStartRepeat();
      }
      setTracing({tracingState, lastPauseTimestamp, exposure});
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
          storage.save({key: 'contacted', id: scannedKey, data: moment.now()}); // Save scanned key with timestamp
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
    let {tracingState, lastPauseTimestamp} = tracing;
    tracingState = !tracingState;
    generateKeyStopRepeat();
    if (!tracingState) {
      // set starting pause time
      lastPauseTimestamp = moment.now();

      // Stop advertise
      BLEAdvertiser.stopBroadcast().
        then(() => console.log('Stop Broadcast Successful')).
        catch((error) => console.log('Stop Broadcast Error', error));
      // Stop scan
      BLEAdvertiser.stopScan().
        then(() => console.log('Stop Scan Successful')).
        catch((error) => console.log('Stop Scan Error', error));

      const contacted = await storage.getIdsForKey('contacted');
      console.log('Contacted', contacted);
    } else {
      await generateKeyStartRepeat();

      // Start advertise
      const keys = await storage.getIdsForKey('keys');
      if (Array.isArray(keys) && keys.length > 0) {
        const currentKey = keys[keys.length - 1];
        BLEAdvertiser.broadcast(currentKey, [], {}).
          then(() => console.log('Broadcasting Sucessful')).
          catch((error) => console.log('Broadcasting Error', error));
      }

      // Start scan
      BLEAdvertiser.scan([], {}) // service UUID and options
        .then(() => console.log('Scan Successful')).
        catch((error) => console.log('Scan Error', error));
    }

    const newTracing = {...tracing, tracingState, lastPauseTimestamp};
    try {
      await storage.save({key: 'tracing', data: newTracing});
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
          color={colors.primary}
          style={{backgroundColor: colors.secondary}}
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
            <Text variant="bodyLarge" style={styles.center}/>
            <Text variant="bodyLarge" style={styles.center}>
              {`Paused on ${moment(tracing.lastPauseTimestamp).
                format('MMMM Do YYYY, h:mm:ss a')}`}
            </Text>
          </>
        ) : (
          <>
            <Text variant="bodyLarge" style={styles.center}>
              A lot of contacts
              around you
            </Text>
            <Text variant="bodyLarge" style={styles.center}>
              Remember to keep
              social distance
            </Text>
          </>
        )}
      </View>
      <View style={styles.tracingViewItem}>
        <TracingCard setIndex={setIndex} exposure={tracing.exposure}/>
      </View>
      <Portal>
        <Dialog
          visible={exposureKeys.unchecked.length > 0}
          onDismiss={() => setExposureKeys({
            all: exposureKeys.all,
            unchecked: [],
          })}
          style={styles.exposureDialog}
        >
          <Dialog.Icon icon="warning" size={48} color={colors.error}/>
          {/* <Dialog.Title> */}
          {/*  Warning!!! */}
          {/* </Dialog.Title> */}
          <Dialog.Content style={{marginTop: 20}}>
            <Text variant="bodyLarge">
              {exposureKeys.unchecked.length}
              {' '}
              new exposures detected! Take care!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained"
              onPress={() => setExposureKeys({
                all: exposureKeys.all,
                unchecked: [],
              })}
              buttonColor={colors.error}
              // style={styles.exposureButton}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
      const url = new URL('/report', Constants.manifest.extra.baseURL);
      fetch(url.toString(), {
        method: 'POST',
        body: JSON.stringify({
          // data,
          keys,
        }),
      }).then((response) => response.json()).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.error(error);
      });
    } catch (err) {
      console.warn(err.message);
    }
  };

  const onReportClick = async () => {
    hideReportConfirm();
    await reportKeys();
    navigation.navigate('Success');
  };

  return (
    <View style={styles.flexCenter}>
      <View style={{
        ...styles.tracingViewItem,
        alignItems: 'center',
      }}
      >
        <Text
          variant="bodyLarge"
          style={{marginHorizontal: 30, marginBottom: 30}}
        >
          If you think yourself has symptoms similar
          to covid, please use a test kit or
          schedule a PCR test.
        </Text>
        <Text
          variant="bodyLarge"
          style={{marginHorizontal: 30, marginBottom: 30}}
        >
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

function HelpRoute({exposureKeys}) {
  const [groupContacts, setGroupContacts] = useState([]);
  const {colors} = useTheme();

  useEffect(() => {
    const init = async () => {
      await storage.save({
        key: 'contacted',
        id: '133d5d29-067e-49ac-96f7-600d509f14ab',
        data: moment().subtract(1, 'days'),
      });
      await storage.save({
        key: 'contacted',
        id: '117067bf-dd0e-4e97-b9dd-cc06f0f7f60e',
        data: moment().subtract(2, 'days'),
      });
      const exposureTimestamps = await storage.getBatchDataWithIds(
        {key: 'contacted', ids: exposureKeys.all});
      const contacts = _.zipWith(exposureKeys.all, exposureTimestamps,
        (a, b) => ({key: a, timestamp: b}));
      const _groupContacts = _.chain(contacts).
        sortBy(['timestamp']).
        groupBy(
          ({key, timestamp}) => moment(timestamp).startOf('day').format()).
        map((value, key) => ({day: key, contacts: value})).
        sortBy(['day']).
        reverse().
        value();
      console.log('Group contacts:', _groupContacts);
      setGroupContacts(_groupContacts);
    };
    init();
  }, []);

  return (
    <View>
      <Text variant="titleLarge" style={{...styles.center, margin: 20}}>All
        exposures</Text>
      <ScrollView>
        {groupContacts.map(({day, contacts}) => (
          <List.Section key={day}>
            <List.Subheader style={{backgroundColor: colors.surface}}>{moment(
              day).format('ddd, MMMM Do')}</List.Subheader>
            {contacts.map(({key, timestamp}) => <List.Item key={key}
                                                           title={moment(
                                                             timestamp).
                                                             format(
                                                               'hh:mm:ss a')}
                                                           left={() =>
                                                             <List.Icon
                                                               icon="warning"/>}/>)}
          </List.Section>
        ))}
      </ScrollView>
    </View>
  );
}

function Navigation() {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'tracing', title: 'Tracing', focusedIcon: 'my-location'},
    {key: 'symptom', title: 'Symptom', focusedIcon: 'medical-services'},
    {key: 'help', title: 'Exposures', focusedIcon: 'history'},
    // {key: 'chat', title: 'Chats', icon: 'chat', badge: 99},
    // {key: 'contacts', title: 'Contacts', icon: 'contacts'},
    // {key: 'discover', title: 'Discover', icon: 'compass'},
    // {key: 'me', title: 'Me', icon: 'account'},
  ]);

  const [exposureKeys, setExposureKeys] = useState({
    all: [
      '133d5d29-067e-49ac-96f7-600d509f14ab',
      '117067bf-dd0e-4e97-b9dd-cc06f0f7f60e'],
    unchecked: ['133d5d29-067e-49ac-96f7-600d509f14ab'],
  });

  const renderScene = ({route, jumpTo}) => {
    switch (route.key) {
      case 'tracing':
        return <TracingRoute jumpTo={jumpTo} setIndex={setIndex}
                             exposureKeys={exposureKeys}
                             setExposureKeys={setExposureKeys}/>;
      case 'symptom':
        return <SymptomRoute jumpTo={jumpTo}/>;
      case 'help':
        return <HelpRoute jumpTo={jumpTo} exposureKeys={exposureKeys}/>;
      default:
        return null;
    }
  };

  // const renderScene = BottomNavigation.SceneMap({
  //   tracing: TracingRoute,
  //   symptom: SymptomRoute,
  //   help: HelpRoute,
  //   // me: MeRoute,
  // });

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

function HomeScreen() {
  return (
    <Navigation/>
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
  exposureDialog: {
    backgroundColor: '#FFC7C7',
  },
  exposureButton: {
    backgroundColor: 'red',
  },
});

export default HomeScreen;
