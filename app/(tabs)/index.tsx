import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";

type Coord = { latitude: number; longitude: number };

export default function HomeMap() {
  const mapRef = useRef<MapView | null>(null);
  const [coord, setCoord] = useState<Coord | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        setErrorMsg("Brak uprawnień do lokalizacji.");
        return;
      }
      setHasPermission(true);
      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const start = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setCoord(start);

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
        },
        (loc) => {
          const next = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setCoord(next);
          mapRef.current?.animateCamera({ center: next, zoom: 16 });
        }
      );
    })();
  }, []);

  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Text style={{ textAlign: "center" }}>
          {errorMsg ?? "Brak dostępu do lokalizacji."}
        </Text>
      </View>
    );
  }

  if (!coord) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Pobieram lokalizację…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: coord.latitude,
          longitude: coord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={coord} title="Tu jesteś" />
        <Circle
          center={coord}
          radius={50}
          strokeWidth={2}
          strokeColor="rgba(0,0,255,0.3)"
          fillColor="rgba(0,0,255,0.1)"
        />
      </MapView>
    </View>
  );
}
