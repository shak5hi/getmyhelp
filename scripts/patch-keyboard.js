const fs = require('fs');

// Patch phone.tsx
let phoneFile = fs.readFileSync('app/phone.tsx', 'utf8');
phoneFile = phoneFile.replace(
  'import { TouchableOpacity, View } from "react-native";',
  'import { TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";'
);
phoneFile = phoneFile.replace(
  '<View style={styles.container}>',
  '<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>'
);
phoneFile = phoneFile.replace(
  '    </View>\n  );\n}\n',
  '    </KeyboardAvoidingView>\n  );\n}\n'
);
fs.writeFileSync('app/phone.tsx', phoneFile, 'utf8');
console.log('phone.tsx patched');

// Patch otp.tsx
let otpFile = fs.readFileSync('app/otp.tsx', 'utf8');
otpFile = otpFile.replace(
  'import { Alert, Pressable, TouchableOpacity, View } from "react-native";',
  'import { Alert, Pressable, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";'
);
otpFile = otpFile.replace(
  '<View style={styles.container}>',
  '<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>'
);
otpFile = otpFile.replace(
  '    </View>\n  );\n}\n',
  '    </KeyboardAvoidingView>\n  );\n}\n'
);
fs.writeFileSync('app/otp.tsx', otpFile, 'utf8');
console.log('otp.tsx patched');
