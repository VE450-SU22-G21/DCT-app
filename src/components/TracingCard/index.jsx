import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Paragraph,
} from 'react-native-paper';

export default function TracingCard({ setIndex, exposure }) {
  return (
    <Card style={styles.tracingCard}>
      <Card.Content>
        <Paragraph>
          Do you have symptoms of COVID-19 or a positive test
          result?
        </Paragraph>
      </Card.Content>
      <View style={styles.flexCenter}>
        <Button
          mode="contained"
          onPress={() => setIndex(1)}
        >
          {exposure ? 'I have symptoms' : 'Take next steps'}
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracingCard: {
    marginLeft: 20,
    marginRight: 20,
    height: 130,
  },
});
