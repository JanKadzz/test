// app/tasks.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { POINTS } from "../../lib/points";

const SCORE_KEY = "hunt.score.v1";
const DONE_KEY = "hunt.done.v1";

export default function TasksScreen() {
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hasPerm, setHasPerm] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [s, d] = await Promise.all([
        AsyncStorage.getItem(SCORE_KEY),
        AsyncStorage.getItem(DONE_KEY),
      ]);
      if (s) setScore(parseInt(s, 10) || 0);
      if (d) setDone(JSON.parse(d));
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPerm(status === "granted");
    })();
  }, []);

  const resetProgress = async () => {
    await AsyncStorage.multiRemove([SCORE_KEY, DONE_KEY]);
    setScore(0);
    setDone({});
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Zadania</Text>
      <Text style={{ fontWeight: "600" }}>
        Wynik: {score} pkt • Ukończone: {Object.values(done).filter(Boolean).length}/{POINTS.length}
      </Text>
      {!hasPerm && (
        <Text style={{ color: "#c00" }}>
          Uwaga: brak uprawnień do lokalizacji — mapa nie zadziała. Otwórz ustawienia i przyznaj dostęp.
        </Text>
      )}

      <FlatList
        data={POINTS}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: 10, paddingTop: 8 }}
        renderItem={({ item }) => {
          const isDone = !!done[item.id];
          return (
            <View
              style={{
                padding: 14,
                borderRadius: 12,
                backgroundColor: isDone ? "#e8f7e8" : "#fff",
                borderWidth: 1,
                borderColor: "#eee",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>
                {item.title} {isDone ? "✅" : ""}
              </Text>
              <Text style={{ opacity: 0.75 }}>
                Nagroda: {item.reward} pkt • Promień: {item.radiusMeters} m
              </Text>
              <Text style={{ marginTop: 6, opacity: 0.9 }}>Pytanie: {item.question}</Text>
            </View>
          );
        }}
      />

      <Pressable
        onPress={resetProgress}
        style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#f2f2f2",
          alignItems: "center",
        }}
      >
        <Text>Wyczyść postęp</Text>
      </Pressable>
    </View>
  );
}
