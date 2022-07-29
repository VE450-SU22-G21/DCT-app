import React, { useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';
import {
  StyleSheet,
  View,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
import {
  Text,
  Button,
  Avatar,
  Portal,
  Dialog,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import moment from 'moment';
import _ from 'lodash';
import BLEAdvertiser from 'react-native-ble-advertiser';
import { v4 as uuidv4, validate } from 'uuid';
import storage from '../../utils/storage';
import useInterval from '../../utils/useInterval';
import TracingCard from '../TracingCard';

export default function TracingRoute({
  setIndex,
  exposureKeys,
  setExposureKeys,
}) {
  const { colors } = useTheme();
  const [tracing, setTracing] = useState({
    tracingState: true,
    lastPauseTimestamp: 0,
    exposure: false,
  });
  const [generateKeyInterval, setGenerateKeyInterval] = useState(null);
  const [snackVisible, setSnackVisible] = useState(false);

  const pollingInterval = 10000;

  useInterval(async () => {
    try {
      const url = new URL('/report', Constants.manifest.extra.baseURL);
      const response = await fetch(url.toString(), { method: 'GET' });
      const data = await response.json();
      const fetchedKeys = data.keys;
      const contactedKeys = await storage.getIdsForKey('contacted');
      const matchedKeys = _.intersection(fetchedKeys, contactedKeys);
      const newMatchedKeys = _.difference(matchedKeys, exposureKeys.all);
      console.log(contactedKeys);
      if (newMatchedKeys.length > 0) {
        console.log(newMatchedKeys);
        setExposureKeys({
          all: exposureKeys.all.concat(newMatchedKeys),
          unchecked: exposureKeys.unchecked.concat(newMatchedKeys),
        });
        console.log(exposureKeys.all);
        console.log(exposureKeys.unchecked);
      }
    } catch (e) {
      console.error(e);
    }
  }, pollingInterval);

  const generateKey = useCallback(async () => {
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
  }, []);

  const generateKeyStartRepeat = useCallback(async () => {
    await generateKey();
    const interval = setInterval(async () => {
      await generateKey();
    }, 15 * 60 * 1000); // generate a new key every 15 min
    setGenerateKeyInterval(interval);
  }, [generateKey]);

  const generateKeyStopRepeat = useCallback(() => {
    if (generateKeyInterval) {
      clearInterval(generateKeyInterval);
      setGenerateKeyInterval(null);
    }
  }, [generateKeyInterval]);

  const clearStorage = useCallback(() => {
    storage.clearMapForKey('keys');
    storage.clearMapForKey('contacted');
    setSnackVisible(true);
  }, []);

  const init = useCallback(async () => {
    let savedTracing;
    try {
      savedTracing = await storage.load({ key: 'tracing' });
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
      setTracing({ tracingState, lastPauseTimestamp, exposure });
    } catch (e) {
      console.error(e);
    }

    console.log('Tracing inited');
  }, [generateKeyStartRepeat]);

  useEffect(() => {
    init();

    BLEAdvertiser.setCompanyId(21);
    const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);
    eventEmitter.addListener('onDeviceFound', (deviceData) => {
      const uuids = deviceData.serviceUuids;
      if (Array.isArray(uuids) && uuids.length > 0) {
        const scannedKey = uuids[0];
        if (scannedKey && validate(scannedKey)) {
          // If is valid UUID
          console.log('Scanned', scannedKey);
          storage.save({
            key: 'contacted',
            id: scannedKey.toLowerCase(),
            data: moment.now(),
          }); // Save scanned key with timestamp
        }
      }
    });

    return () => {
      generateKeyStopRepeat();
    };
    // eslint-disable-next-line
  }, []);

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
    } catch (e) {
      console.error(e);
    }
    setTracing(newTracing);
  };

  return (
    <View style={styles.flexCenter}>
      <View style={styles.tracingViewItem}>
        <Avatar.Icon
          size={192}
          icon={
            tracing.tracingState ? 'bluetooth-searching' : 'bluetooth-disabled'
          }
          color={colors.primary}
          style={{ backgroundColor: colors.secondary }}
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
            <Text
              variant="bodyLarge"
              style={styles.center}
              onLongPress={clearStorage}
            >
              {`Paused on ${moment(tracing.lastPauseTimestamp).format(
                'MMMM Do YYYY, h:mm:ss a'
              )}`}
            </Text>
          </>
        ) : (
          <>
            <Text variant="bodyLarge" style={styles.center}>
              A lot of contacts around you
            </Text>
            <Text variant="bodyLarge" style={styles.center}>
              Remember to keep social distance
            </Text>
          </>
        )}
      </View>
      <View style={styles.tracingViewItem}>
        <TracingCard setIndex={setIndex} exposure={tracing.exposure} />
      </View>
      <Portal>
        <Dialog
          visible={exposureKeys.unchecked.length > 0}
          onDismiss={() => {
            setExposureKeys({
              all: exposureKeys.all,
              unchecked: [],
            });
          }}
          style={styles.exposureDialog}
        >
          <Dialog.Icon icon="warning" size={48} color={colors.error} />
          {/* <Dialog.Title> */}
          {/*  Warning!!! */}
          {/* </Dialog.Title> */}
          <Dialog.Content style={{ marginTop: 20 }}>
            <Text variant="bodyLarge">
              {exposureKeys.unchecked.length}
              new exposures detected! Take care!
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained"
              onPress={() => {
                setExposureKeys({
                  all: exposureKeys.all,
                  unchecked: [],
                });
              }}
              buttonColor={colors.error}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        action={{ label: 'OK' }}
      >
        Local keys cleared!
      </Snackbar>
    </View>
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
  tracingButton: {
    borderRadius: 100,
  },
  exposureDialog: {
    backgroundColor: '#FFC7C7',
  },
});
