import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { phoneStyles as styles } from "../styles/phone.styles";

export default function PhoneScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.appName}>GetMyHelp</Text>

      {/* Title */}
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <Text style={styles.subtitle}>
        We’ll send you an OTP to continue.
      </Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>91+</Text>
        <TextInput
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          style={styles.input}
        />
      </View>

      {/* Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get OTP</Text>
      </TouchableOpacity>
    </View>
  );
}
