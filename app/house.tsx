import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { houseStyles as styles } from "../styles/house.styles";

export default function HouseScreen() {
  const router = useRouter();
  const [houseNumber, setHouseNumber] = useState("");
  const [error, setError] = useState("");

  const isValid = houseNumber.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) {
      setError("Please enter your house number");
      return;
    }

    setError("");
    console.log("House number:", houseNumber);

    // later → router.replace("/home");
  };

  return (
    <View style={styles.container}>
      {/* Step */}
      <Text style={styles.step}>Step 3 of 3</Text>

      {/* Title */}
      <Text style={styles.title}>What’s your house number?</Text>
      <Text style={styles.subtitle}>
        Enter your exact house number
      </Text>

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Input */}
      <TextInput
        placeholder="e.g. 116C"
        placeholderTextColor="#9CA3AF"
        value={houseNumber}
        onChangeText={(text) => {
          setHouseNumber(text);
          if (text.trim()) setError("");
        }}
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        autoCapitalize="characters"
      />

      {/* Continue */}
      <TouchableOpacity
        style={[
          styles.button,
          !isValid && styles.buttonDisabled,
        ]}
        disabled={!isValid}
        onPress={handleContinue}
      >
        <Text
          style={[
            styles.buttonText,
            !isValid && styles.buttonTextDisabled,
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
