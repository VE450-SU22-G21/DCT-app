import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';

function SuccessScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.text}>
            Your result has been reported. Thank you!
          </Text>
          <Text style={styles.text}>Get well soon!</Text>
        </View>
        <View style={styles.tracingViewItem}>
          <Avatar.Icon size={192} icon="done" />
        </View>
        <Button
          mode="contained"
          onPress={() => {
            navigation.navigate('Home');
          }}
        >
          Back to Home
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracingViewItem: {
    marginTop: 30,
    marginBottom: 50,
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
  text: {
    color: '#000',
  },
});

export default SuccessScreen;
