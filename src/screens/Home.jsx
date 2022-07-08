import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
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
import _ from 'lodash';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import storage from '../utils/storage';

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

  const init = async () => {
    try {
      const savedTracing = await storage.load({ key: 'tracing' });
      console.log('storage.load', savedTracing);
      const tracingState = _.get(savedTracing, 'tracingState', true);
      let lastPauseTimestamp = _.get(savedTracing, 'lastPauseTimestamp', 0);
      const exposure = _.get(savedTracing, 'exposure', false);
      if (tracingState) {
        lastPauseTimestamp = 0;
      }
      setTracing({ tracingState, lastPauseTimestamp, exposure });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onTracingClick = async () => {
    let { tracingState, lastPauseTimestamp } = tracing;
    tracingState = !tracingState;
    if (!tracingState) {
      // set starting pause time
      lastPauseTimestamp = moment.now();
    }
    const newTracing = { ...tracing, tracingState, lastPauseTimestamp };
    try {
      await storage.save({ key: 'tracing', data: newTracing });
      console.log('storage.save', newTracing);
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

  const reportKeys = () => {
    const keys = storage.load({ key:"tracing" }); // should be keys
    fetch("report", {
      method: 'POST',
      body: JSON.stringify({
        keys
      })
    })
    .then((response) => {
      return response.json();
    })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error);
    });
  }

  return (
    <View style={styles.flexCenter}>
      <View style={{
        ...styles.tracingViewItem,
        alignItems: 'center',
      }}>
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
                onPress={() => {
                  hideReportConfirm();
                  reportKeys();
                  navigation.navigate('Success');
                }}
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
    borderRadius: 10,
  },
  chatRightMargin: {
    marginRight: 15,
  },
});

export default HomeScreen;
