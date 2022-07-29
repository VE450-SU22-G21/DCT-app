import React from 'react';
import Constants from 'expo-constants';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Portal, Dialog, Paragraph } from 'react-native-paper';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import storage from '../../utils/storage';

export default function SymptomRoute() {
  const navigation = useNavigation();
  const [report, setReport] = React.useState(false);

  const showReportConfirm = () => setReport(true);

  const hideReportConfirm = () => setReport(false);

  const reportKeys = async () => {
    try {
      const keys = await storage.getIdsForKey('keys');
      console.log('GetIdsForKey', keys);
      // NOTE: can upload timestamp of each key
      const url = new URL('/report/', Constants.manifest.extra.baseURL);
      fetch(url.toString(), {
        method: 'POST',
        body: JSON.stringify({
          // data,
          keys,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log('Report success');
        })
        .catch((error) => {
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
      <View
        style={{
          ...styles.tracingViewItem,
          paddingHorizontal: 30,
        }}
      >
        <Text
          variant="bodyLarge"
          style={{ marginBottom: 30, textAlign: 'left' }}
        >
          If you feel symptoms similar to COVID-19, please use a test kit or
          schedule a PCR test.
        </Text>
        <Text
          variant="bodyLarge"
          style={{ marginBottom: 30, textAlign: 'left' }}
        >
          If you have positive report, please report to the system. Thank you.
          Your privacy will be protected.
        </Text>
      </View>
      <View style={styles.tracingViewItem}>
        <Button mode="contained" onPress={showReportConfirm}>
          Report positive result
        </Button>
        <Portal>
          <Dialog visible={report} onDismiss={hideReportConfirm}>
            <Dialog.Title>Confirm</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Are you sure you have a positive COVID-19 result?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideReportConfirm}>Cancel</Button>
              <Button mode="contained" onPress={onReportClick}>
                Yes
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracingViewItem: {
    marginTop: 30,
  },
});
