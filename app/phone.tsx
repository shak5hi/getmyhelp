import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { phoneStyles as styles } from "../styles/phone.styles";

export default function PhoneScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <Text style={styles.subtitle}>
        We’ll send you an OTP to continue.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>91+</Text>
        <TextInput
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
