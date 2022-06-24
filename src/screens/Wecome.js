import {View} from "react-native";
import {Text} from "react-native-paper";
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';


function WelcomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ProgressSteps>
        <ProgressStep label="Welcome">
          <View style={{ alignItems: 'center' }}>
            <Text>This is the content within step 1!</Text>
          </View>
        </ProgressStep>
        <ProgressStep label="Introduction">
          <View style={{ alignItems: 'center' }}>
            <Text>This is the content within step 2!</Text>
          </View>
        </ProgressStep>
        <ProgressStep label="Permissions" onSubmit={() => navigation.replace('Home')}>
          <View style={{ alignItems: 'center' }}>
            <Text>To opt in, we need your bluetooth permission.
              For XXX to function correctly, please select “Allow all the time.”</Text>
          </View>
        </ProgressStep>
      </ProgressSteps>
    </View>
  );
}

export default WelcomeScreen;
