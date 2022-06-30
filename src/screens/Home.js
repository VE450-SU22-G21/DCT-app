import React, {useState} from "react";
import { StyleSheet, ScrollView, View } from "react-native";
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
  Paragraph, Title
} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";


const TracingCard = () => (
  <Card style={styles.tracingCard} elevation={5}>
    <Card.Content>
      {/*<Title>Card title</Title>*/}
      <Paragraph>Do you have symptoms of COVID-19 or a positive test result?</Paragraph>
    </Card.Content>
    <Card.Actions style={styles.center}>
      <Button mode="contained">Take next steps</Button>
    </Card.Actions>
  </Card>
);

const TracingRoute = () => {
  const [tracing, setTracing] = useState(true);

  return (
      <View style={styles.center}>
        <View style={styles.tracingViewItem}>
          <Avatar.Icon size={192} icon={tracing ? "bluetooth-searching" : "bluetooth-disabled"} />
        </View>
        <View style={styles.tracingViewItem}>
          <Button icon={tracing ? "pause" : "play-arrow"}
                  mode="outlined"
                  onPress={() => setTracing(!tracing)}
                  style={styles.tracingButton}
          >
            {tracing ? 'Pause' : 'Resume'}
          </Button>
        </View>
        <View style={{...styles.tracingViewItem, alignItems: 'center'}}>
          <Text variant="bodyLarge">A lot of contacts around you</Text>
          <Text variant="bodyLarge">Remember to keep social distance</Text>
        </View>
        <View style={styles.tracingViewItem}>
          <TracingCard />
        </View>
      </View>
  )
}

const SymptomRoute = () => {
  const navigation = useNavigation();
  const [report, setReport] = React.useState(false);

  const showReportConfirm = () => setReport(true);

  const hideReportConfirm = () => setReport(false);

  return (
    <View style={styles.center}>
      <View style={{...styles.tracingViewItem, alignItems: 'center', justifyContent: 'center'}}>
        <Text variant="bodyLarge">If you think yourself has symptoms similar to covid, please use a test kit or schedule a PCR test.</Text>
        <Text variant="bodyLarge">If you have positive report, please report to the system. Thank you. Your privacy will be protected.</Text>
      </View>
      <View style={styles.tracingViewItem}>
        <Button mode="contained" onPress={showReportConfirm}>Report positive result</Button>
        <Portal>
          <Dialog visible={report} onDismiss={hideReportConfirm}>
            <Dialog.Title>Confirm</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure you have a positive COVID-19 result?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideReportConfirm}>Cancel</Button>
              <Button mode='contained' onPress={()=>{hideReportConfirm();navigation.navigate('Success')}}>Yes</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </View>
  )
};

const HelpRoute = () => <>
</>;

const Navigation = () => {
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'tracing', title: 'Tracing', icon: 'my-location'},
    {key: 'symptom', title: 'Symptom', icon: 'medical-services'},
    {key: 'help', title: 'Help', icon: 'help'},
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
      navigationState={{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
};

function HomeScreen() {
  return (
    <Navigation/>
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
  }
});

export default HomeScreen;
