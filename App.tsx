import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {
  MapView,
  Camera,
  ShapeSource,
  Images,
  SymbolLayer,
  LineLayer,
} from '@rnmapbox/maps';

import MarkerIcon from './assets/Marker.png';
import {calculateBearing} from './util';
import {CameraRef} from '@rnmapbox/maps/lib/typescript/src/components/Camera';

const INITIAL_COORDINATE = [127.0721445, 38.0979485];

function App(): React.JSX.Element {
  const [coordinate, setCoordinate] = useState(INITIAL_COORDINATE);
  const [pathCoordinates, setPathCoordinates] = useState([INITIAL_COORDINATE]);

  const [bearing, setBearing] = useState(0);

  const [isFollowing, setIsFollowing] = useState(true);
  const [isSatellite, setIsSatellite] = useState(true);
  const [showLines, setShowLines] = useState(true);

  const [markerA, setMarkerA] = useState<number[] | null>(null);
  const [markerB, setMarkerB] = useState<number[] | null>(null);

  const cameraRef = useRef<CameraRef | null>(null);

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
          {/* following Camera */}
          {isFollowing && (
            <Camera
              ref={cameraRef}
              zoomLevel={18}
              centerCoordinate={coordinate}
              animationDuration={1000}
            />
          )}

          {/* path lines */}
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

          {/* interval lines */}
          {showLines && (
            <>
              {[...Array(5)].map((_, index) => {
                const percentage = index - 2; // -2, -1, 0, 1, 2
                return (
                  <ShapeSource
                    key={`line-${index}`}
                    id={`verticalLine-${index}`}
                    shape={{
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: [
                          [INITIAL_COORDINATE[0] + percentage * 0.0001, -90],
                          [INITIAL_COORDINATE[0] + percentage * 0.0001, 90],
                        ],
                      },
                      properties: {},
                    }}>
                    <LineLayer
                      id={`verticalLineLayer-${index}`}
                      style={{
                        lineColor: index === 2 ? 'red' : 'white',
                        lineWidth: 1,
                        lineOpacity: 0.8,
                      }}
                    />
                  </ShapeSource>
                );
              })}
            </>
          )}

          {/* center cursor icon */}
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

          {/* A/B button */}
          <TouchableOpacity
            style={styles.markerButton}
            onPress={() => {
              if (!markerA) {
                setMarkerA(coordinate);
              } else if (!markerB) {
                setMarkerB(coordinate);
              }
            }}>
            <Text style={styles.buttonText}>
              {!markerA ? 'A' : !markerB ? 'B' : 'A/B Set'}
            </Text>
          </TouchableOpacity>

          {/* A/B markers */}
          {markerA && (
            <ShapeSource
              id="markerA"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: markerA,
                },
                properties: {},
              }}>
              <SymbolLayer
                id="markerALayer"
                style={{
                  textField: 'A',
                  textSize: 20,
                  textColor: 'red',
                  textHaloColor: 'white',
                  textHaloWidth: 2,
                }}
              />
            </ShapeSource>
          )}

          {markerB && (
            <ShapeSource
              id="markerB"
              shape={{
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: markerB,
                },
                properties: {},
              }}>
              <SymbolLayer
                id="markerBLayer"
                style={{
                  textField: 'B',
                  textSize: 20,
                  textColor: 'blue',
                  textHaloColor: 'white',
                  textHaloWidth: 2,
                }}
              />
            </ShapeSource>
          )}
        </MapView>

        {/* toggle buttons */}
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
        <TouchableOpacity
          style={styles.toggleLinesButton}
          onPress={() => setShowLines(prev => !prev)}>
          <Text style={styles.buttonText}>{'toggle lines'}</Text>
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
  toggleLinesButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  markerButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
});

export default App;
