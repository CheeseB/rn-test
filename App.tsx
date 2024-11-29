import React from 'react';
import {StyleSheet, View} from 'react-native';
import Mapbox, {MapView, Camera} from '@rnmapbox/maps';

Mapbox.setAccessToken(
  'sk.eyJ1IjoiY2hlZWVlZXNlYiIsImEiOiJjbTQwdXE4dGYyNzRpMm1zY2JyODd0cHRlIn0.EYPaTJH2ZjbO4xWFwYAvQw',
);

function App(): React.JSX.Element {
  const coordinate = [127.0721445, 38.0979485];

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          styleURL="mapbox://styles/mapbox/satellite-v9">
          <Camera zoomLevel={18} centerCoordinate={coordinate} />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default App;
