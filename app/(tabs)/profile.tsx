import { Pressable, Text, View } from "react-native";

export default function Profile() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Profil użytkownika</Text>
      <Pressable
        style={{
          backgroundColor: "#007AFF",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>To tylko test 😉</Text>
      </Pressable>
    </View>
  );
}
