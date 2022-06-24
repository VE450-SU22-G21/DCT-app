import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { BottomNavigation, Text, Provider, Appbar, Card, Avatar, Divider, List } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const TracingRoute = () => <>
</>;

const SymptomRoute = () => <>
</>;

const HelpRoute = () => <>
</>;

const ChatRoute = () => {
  const data = [
    {title: "Yihao Liu", subtitle: "Good night :)", avatar: "face-man-shimmer", time: "06:15"},
    {title: "Chujie Ni", subtitle: "TODO: ...", avatar: "face-agent", time: "10:11"},
    {title: "Jiawen Fan", subtitle: "Changsha", avatar: "face-woman-profile", time: "08:24"},
    {title: "Yuru Liu", subtitle: "Sweden", avatar: "face-woman", time: "00:00"},
    {title: "Zhiyuan Zhang", subtitle: "111", avatar: "face-man", time: "00:00"},
    {title: "File Transfer", subtitle: "Homework1", avatar: "folder", time: "00:00"},
  ];
  return (
    < >
      <ScrollView>
        {data.map(row => <>
          <Card.Title
            title={row.title}
            subtitle={row.subtitle}
            left={(props) => <Avatar.Icon {...props} icon={row.avatar}/>}
            right={(props) => <Text>{row.time}</Text>}
            rightStyle={styles.chatRightMargin}
          />
          <Divider />
        </>)}
      </ScrollView>
    </>)}

const ContactsRoute = () => {
  const data = [
    {title: "Yihao Liu", subtitle: "Good night :)", avatar: "face-man-shimmer", time: "06:15"},
    {title: "Chujie Ni", subtitle: "TODO: ...", avatar: "face-agent", time: "10:11"},
    {title: "Jiawen Fan", subtitle: "Changsha", avatar: "face-woman-profile", time: "08:24"},
    {title: "Yuru Liu", subtitle: "Sweden", avatar: "face-woman", time: "00:00"},
    {title: "Zhiyuan Zhang", subtitle: "111", avatar: "face-man", time: "00:00"},
    {title: "File Transfer", subtitle: "Homework1", avatar: "folder", time: "00:00"},
  ];

  data.sort((a, b) => a.title < b.title ? -1 : 1);

  const data2 = {};
  for (let i in data) {
    let firstLetter = data[i].title[0];
    if (!data2.hasOwnProperty(firstLetter)) {
      data2[firstLetter] = [data[i]];
    } else {
      data2[firstLetter].push(data[i]);
    }
  }
  const keys = Object.keys(data2);
  keys.sort();
  return (
    < >
      <ScrollView>
        {keys.map(key => <List.Section>
          <List.Subheader>{key}</List.Subheader>
          {data2[key].map(row => <>
            <List.Item title={row.title} left={() => <List.Icon icon={row.avatar} />} />
            <Divider />
          </>)}
        </List.Section>)}
      </ScrollView>
    </ >);
}

const DiscoverRoute = () => <>
</>;

const MeRoute = () => <></>;

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
    // <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    //   <Text>Home Screen</Text>
    // </View>
    <Provider settings={{
      icon: props => <MaterialIcons {...props} />,
    }}>
      <Navigation/>
    </Provider>
  );
}

const styles = StyleSheet.create({
  chatRightMargin: {
    marginRight: 15
  }
});

export default HomeScreen;
