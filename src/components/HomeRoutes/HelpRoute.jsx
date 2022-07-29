import React, { useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, List, useTheme } from 'react-native-paper';
import moment from 'moment';
import _ from 'lodash';
import storage from '../../utils/storage';

export default function HelpRoute({ exposureKeys }) {
  const [groupContacts, setGroupContacts] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    const init = async () => {
      const exposureTimestamps = await storage.getBatchDataWithIds({
        key: 'contacted',
        ids: exposureKeys.all,
      });
      const contacts = _.zipWith(
        exposureKeys.all,
        exposureTimestamps,
        (a, b) => ({ key: a, timestamp: b })
      );
      const newGroupContacts = _.chain(contacts)
        .sortBy(['timestamp'])
        .groupBy(({ key, timestamp }) =>
          moment(timestamp).startOf('day').format()
        )
        .map((value, key) => ({ day: key, contacts: value }))
        .sortBy(['day'])
        .reverse()
        .value();
      console.log('Group contacts:', newGroupContacts);
      setGroupContacts(newGroupContacts);
    };
    init();
  }, []);

  return (
    <View>
      <Text variant="titleLarge" style={{ ...styles.center, margin: 20 }}>
        All exposures
      </Text>
      <ScrollView>
        {groupContacts.map(({ day, contacts }) => (
          <List.Section key={day}>
            <List.Subheader style={{ backgroundColor: colors.surface }}>
              {moment(day).format('ddd, MMMM Do')}
            </List.Subheader>
            {contacts.map(({ key, timestamp }) => (
              <List.Item
                key={key}
                title={moment(timestamp).format('hh:mm:ss a')}
                left={() => <List.Icon icon="warning" />}
              />
            ))}
          </List.Section>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    textAlign: 'center',
  },
});
