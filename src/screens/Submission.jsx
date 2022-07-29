import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, IconButton, Button } from 'react-native-paper';

function SubmissionScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Take a picture of your proof of result or enter Result ID.</Text>
      <IconButton
        mode="contained"
        containerColor="#e6e6fa"
        color="#8A2BE2"
        size={200}
        icon="photo-camera"
      />
      <Button
        mode="contained"
        onPress={() => {
          navigation.replace('Welcome');
        }}
      >
        Submit
      </Button>
    </View>
  );
}

export default SubmissionScreen;
