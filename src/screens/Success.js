import {StyleSheet, View} from "react-native";
import {
  Text,
  Avatar,
  Button,
} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";

function SuccessScreen({ navigation }) {
  return (
    <View style={styles.center}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 30}}>
        <Text style={styles.text}>Your result has been reported. Thank you!</Text>
        <Text style={styles.text}>Get well soon!</Text>
        <View style={styles.tracingViewItem}>
          <Avatar.Icon size={192} icon="done" />
        </View>
        <Button mode="contained" onPress={()=>{navigation.navigate('Home')}}>Back to Home</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // textAlign: 'center'
  },
  tracingViewItem: {
    marginTop: 30
  },
  tracingCard: {
    marginLeft: 50,
    marginRight: 50,
    height: 130,
  },
  tracingButton: {
    borderRadius: 10
  },
  chatRightMargin: {
    marginRight: 15
  },
  text: {
    color: '#000'
  }
});

export default SuccessScreen;