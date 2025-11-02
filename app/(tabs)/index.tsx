// app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TextInput,
  View
} from "react-native";
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { POINTS, PointTask, normalize } from "../../lib/points";

type Coord = { latitude: number; longitude: number };

const SCORE_KEY = "hunt.score.v1";
const DONE_KEY = "hunt.done.v1";

// Haversine (m)
function distanceMeters(a: Coord, b: Coord) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function MapScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [me, setMe] = useState<Coord | null>(null);
  const [hasPerm, setHasPerm] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // stan gry
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [activeTask, setActiveTask] = useState<PointTask | null>(null);
  const [answer, setAnswer] = useState("");

  // wczytaj wynik + ukończone
  useEffect(() => {
    (async () => {
      const [s, d] = await Promise.all([
        AsyncStorage.getItem(SCORE_KEY),
        AsyncStorage.getItem(DONE_KEY),
      ]);
      if (s) setScore(parseInt(s, 10) || 0);
      if (d) setDone(JSON.parse(d));
    })();
  }, []);

  // zapisz gdy się zmienia
  useEffect(() => {
    AsyncStorage.setItem(SCORE_KEY, String(score));
  }, [score]);
  useEffect(() => {
    AsyncStorage.setItem(DONE_KEY, JSON.stringify(done));
  }, [done]);

  // lokalizacja + watch
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPerm(false);
        setError("Brak uprawnień do lokalizacji.");
        return;
      }
      setHasPerm(true);

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const start: Coord = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
      setMe(start);

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 5,
          timeInterval: 1500,
        },
        (loc) => {
          const next = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          setMe(next);
          mapRef.current?.animateCamera({ center: next, zoom: 16 }, { duration: 500 });
        }
      );
    })();
  }, []);

  // sprawdź, czy wchodzimy w jakiś punkt (który nie jest ukończony)
  useEffect(() => {
    if (!me) return;
    // jeżeli już mamy aktywne zadanie — nie wyzwalaj kolejnego
    if (activeTask) return;

    for (const p of POINTS) {
      if (done[p.id]) continue;
      const d = distanceMeters(me, p.coords);
      if (d <= p.radiusMeters) {
        setActiveTask(p);
        break;
      }
    }
  }, [me, done, activeTask]);

  const completedCount = useMemo(
    () => Object.values(done).filter(Boolean).length,
    [done]
  );

  if (hasPerm === false) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Text style={{ textAlign: "center" }}>
          {error ?? "Aby gra działała, przyznaj dostęp do lokalizacji w ustawieniach systemu."}
        </Text>
      </View>
    );
  }

  if (!me) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Pobieram lokalizację…</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!activeTask) return;
    const ok = activeTask.answers.some(
      (a) => normalize(a) === normalize(answer)
    );
    if (ok) {
      setScore((s) => s + activeTask.reward);
      setDone((d) => ({ ...d, [activeTask.id]: true }));
      setActiveTask(null);
      setAnswer("");
      Alert.alert("✅ Dobrze!", `Zdobywasz +${activeTask.reward} pkt.`);
    } else {
      Alert.alert("❌ Niedokładnie", "Spróbuj jeszcze raz. 😉");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton
        initialRegion={{
          latitude: me.latitude,
          longitude: me.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {POINTS.map((p) => {
          const isDone = !!done[p.id];
          return (
            <Marker
              key={p.id}
              coordinate={p.coords}
              title={`${p.title}${isDone ? " ✅" : ""}`}
              description={isDone ? "Ukończone" : `Zadanie w promieniu ${p.radiusMeters} m`}
              pinColor={isDone ? "green" : "red"}
            />
          );
        })}
        {POINTS.map((p) => (
          <Circle
            key={p.id + "_c"}
            center={p.coords}
            radius={p.radiusMeters}
            strokeColor="rgba(0,122,255,0.4)"
            fillColor="rgba(0,122,255,0.12)"
          />
        ))}
      </MapView>

      {/* prosty HUD ze statusem */}
      <View
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.95)",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
        }}
      >
        <Text style={{ fontWeight: "700" }}>
          Wynik: {score} pkt • Ukończone: {completedCount}/{POINTS.length}
        </Text>
      </View>

      {/* Modal z pytaniem */}
      <Modal visible={!!activeTask} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              paddingBottom: 24,
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {activeTask?.title} — zadanie za {activeTask?.reward} pkt
            </Text>
            <Text style={{ fontSize: 16 }}>{activeTask?.question}</Text>
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="Twoja odpowiedź"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
              }}
              onSubmitEditing={handleSubmit}
              returnKeyType="send"
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setActiveTask(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#eee",
                  alignItems: "center",
                }}
              >
                <Text>Anuluj</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: "#007AFF",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Sprawdź</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
