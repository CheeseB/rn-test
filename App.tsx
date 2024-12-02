import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import Mapbox, {
  MapView,
  Camera,
  ShapeSource,
  Images,
  SymbolLayer,
  LineLayer,
} from '@rnmapbox/maps';

import MarkerIcon from './assets/Marker.png';

Mapbox.setAccessToken(
  'sk.eyJ1IjoiY2hlZWVlZXNlYiIsImEiOiJjbTQwdXE4dGYyNzRpMm1zY2JyODd0cHRlIn0.EYPaTJH2ZjbO4xWFwYAvQw',
);

const INITIAL_COORDINATE = [127.0721445, 38.0979485];

// calculate bearing between two coordinates
const calculateBearing = (start: number[], end: number[]) => {
  const startLat = (start[1] * Math.PI) / 180;
  const startLng = (start[0] * Math.PI) / 180;
  const endLat = (end[1] * Math.PI) / 180;
  const endLng = (end[0] * Math.PI) / 180;

  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const y = Math.sin(endLng - startLng) * Math.cos(endLat);

  return (Math.atan2(y, x) * 180) / Math.PI;
};

function App(): React.JSX.Element {
  const [coordinate, setCoordinate] = useState(INITIAL_COORDINATE);
  const [pathCoordinates, setPathCoordinates] = useState([INITIAL_COORDINATE]);
  const [bearing, setBearing] = useState(0);
  const [isFollowing, setIsFollowing] = useState(true);
  const [isSatellite, setIsSatellite] = useState(true);
  const cameraRef = useRef(null);

  useEffect(() => {
    // update coordinate randomly every 1 second
    const interval = setInterval(() => {
      const randomLng = coordinate[0] + Math.random() * 0.00002;
      const randomLat = coordinate[1] + Math.random() * 0.00005;
      const newCoordinate = [randomLng, randomLat];

      const newBearing = calculateBearing(coordinate, newCoordinate);
      setBearing(newBearing);

      setCoordinate(newCoordinate);
      setPathCoordinates(prev => [...prev, newCoordinate]);
    }, 1000);

    return () => clearInterval(interval);
  }, [coordinate]);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          styleURL={isSatellite ? 'mapbox://styles/mapbox/satellite-v9' : ''}
          onTouchStart={() => setIsFollowing(false)}>
          {/* Following Camera */}
          {isFollowing && (
            <Camera
              ref={cameraRef}
              zoomLevel={18}
              centerCoordinate={coordinate}
              animationDuration={1000}
            />
          )}

          {/* Path lines */}
          <ShapeSource
            id="pathLine"
            shape={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: pathCoordinates,
                  },
                  properties: null,
                },
              ],
            }}>
            {/* back line */}
            <LineLayer
              id="pathLineBackground"
              style={{
                lineColor: 'white',
                lineWidth: 20,
                lineOpacity: 0.5,
                lineCap: 'round',
              }}
            />
            {/* front line */}
            <LineLayer
              id="pathLineForeground"
              style={{
                lineColor: 'white',
                lineWidth: 4,
                lineOpacity: 1,
                lineCap: 'round',
              }}
            />
          </ShapeSource>

          {/* Marker Icon */}
          <ShapeSource
            id="CursorMarker"
            shape={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coordinate,
                  },
                  properties: null,
                },
              ],
            }}>
            <Images images={{CursorMarker: MarkerIcon}} />
            <SymbolLayer
              id="CursorMarker"
              style={{
                iconImage: 'CursorMarker',
                iconSize: 1,
                iconAllowOverlap: true,
                iconRotate: bearing,
                iconRotationAlignment: 'map',
              }}
            />
          </ShapeSource>
        </MapView>

        {/* buttons */}
        <TouchableOpacity
          style={styles.followButton}
          onPress={() => setIsFollowing(true)}>
          <Text style={styles.buttonText}>{'follow'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsSatellite(prev => !prev)}>
          <Text style={styles.buttonText}>{'toggle map'}</Text>
        </TouchableOpacity>
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
  followButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export default App;
