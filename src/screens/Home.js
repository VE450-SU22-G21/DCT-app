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
  Paragraph, Title
} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


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

const SymptomRoute = () => <>
</>;

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
  chatRightMargin: {
    marginRight: 15
  }
});

export default HomeScreen;
