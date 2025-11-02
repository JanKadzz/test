import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback
} from "react-native";

export default function ModalScreen() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ThemedView style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={24}
          style={styles.sheetWrap}
        >
          <ThemedView style={styles.sheet}>
            <ThemedText type="title">Przykładowy modal</ThemedText>
            <ThemedText style={{ marginTop: 8 }}>
              Ten modal unosi się nad klawiaturą. Stuknij tło, aby ją schować.
            </ThemedText>

            <TextInput
              placeholder="Wpisz coś…"
              autoCapitalize="none"
              style={styles.input}
              returnKeyType="done"
            />

            <Link href="/" dismissTo style={styles.link}>
              <ThemedText type="link">Zamknij</ThemedText>
            </Link>
          </ThemedView>
        </KeyboardAvoidingView>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheetWrap: {
    width: "100%",
  },
  sheet: {
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  link: {
    marginTop: 16,
    paddingVertical: 12,
    alignSelf: "flex-start",
  },
});
