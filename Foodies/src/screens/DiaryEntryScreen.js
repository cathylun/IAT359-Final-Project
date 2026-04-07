import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db, firebase_auth as auth } from "../firebaseConfig";

export default function DiaryEntryScreen({ route, navigation }) {
  const { photoUri, addPhoto } = route.params;
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const dateKey = today.toISOString().split("T")[0]; // YYYY-MM-DD
  const displayDate = today.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleSave() {
    if (rating === 0) {
      Alert.alert("Please give your meal a rating!");
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setSaving(true);
    try {
      await setDoc(doc(db, "users", userId, "entries", dateKey), {
        photoUri,
        text,
        rating,
        date: dateKey,
      });

      // Also update the parent photos state so the app stays in sync
      addPhoto(photoUri);

      navigation.navigate("ProtectedArea");
    } catch (e) {
      Alert.alert("Failed to save entry. Please try again.");
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    Alert.alert("Discard entry?", "Your photo and notes won't be saved.", [
      { text: "Keep editing", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => navigation.goBack(),
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleDiscard}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Today's Dish</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveText, saving && { opacity: 0.4 }]}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>{displayDate}</Text>

        <Image source={{ uri: photoUri }} style={styles.photo} />

        <Text style={styles.label}>How was it?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <TouchableOpacity key={n} onPress={() => setRating(n)}>
              <Text style={[styles.star, n <= rating && styles.starFilled]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && <Text style={styles.ratingLabel}>{rating} / 10</Text>}

        <Text style={styles.label}>Write about it</Text>
        <TextInput
          style={styles.input}
          placeholder="What did you make today? How did it turn out..."
          placeholderTextColor="#bbb"
          multiline
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F1",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  discardText: {
    fontSize: 15,
    color: "#999",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F48F92",
  },
  date: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 16,
    textAlign: "center",
  },
  photo: {
    width: "100%",
    height: 260,
    borderRadius: 16,
    marginBottom: 24,
    backgroundColor: "#eee",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 10,
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  star: {
    fontSize: 28,
    color: "#ddd",
  },
  starFilled: {
    color: "#F48F92",
  },
  ratingLabel: {
    fontSize: 13,
    color: "#F48F92",
    fontWeight: "600",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1a1a1a",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#eee",
    lineHeight: 22,
  },
});
