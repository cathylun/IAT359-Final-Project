import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen({ photos }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Cooking Diary</Text>
      <Button
        title="Reminder Settings"
        onPress={() => navigation.navigate("ReminderSetting")}
      />

      {photos.length === 0 ? (
        <Text>No photos yet</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.gallery}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    margin: 24,
    backgroundColor: "#F6E9DB",
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
  },

  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  image: {
    width: 120,
    height: 120,
    margin: 5,
    borderRadius: 10,
  },
});
