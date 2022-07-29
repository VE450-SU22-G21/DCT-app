import React, { useState } from 'react';
import { BottomNavigation } from 'react-native-paper';
import _ from 'lodash';

import TracingRoute from '../components/HomeRoutes/TracingRoute';
import SymptomRoute from '../components/HomeRoutes/SymptomRoute';
import HelpRoute from '../components/HomeRoutes/HelpRoute';

function HomeScreen() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'tracing', title: 'Tracing', focusedIcon: 'my-location' },
    { key: 'symptom', title: 'Symptom', focusedIcon: 'medical-services' },
    { key: 'help', title: 'Exposures', focusedIcon: 'history' },
  ]);
  const [exposureKeys, setExposureKeys] = useState({
    all: [],
    unchecked: [],
  });

  const renderScene = ({ route, jumpTo }) => {
    switch (route.key) {
      case 'tracing':
        return (
          <TracingRoute
            jumpTo={jumpTo}
            setIndex={setIndex}
            exposureKeys={exposureKeys}
            setExposureKeys={setExposureKeys}
          />
        );
      case 'symptom':
        return <SymptomRoute jumpTo={jumpTo} />;
      case 'help':
        return <HelpRoute jumpTo={jumpTo} exposureKeys={exposureKeys} />;
      default:
        return null;
    }
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

export default HomeScreen;
