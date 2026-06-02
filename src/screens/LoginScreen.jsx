// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
// } from "react-native";
// import { useDispatch } from "react-redux";
// import { setUser } from "../redux/userSlice";
// import { removeToken, removeUser, saveToken, saveUser } from "../utils/storage";
// import { disconnectSocket, initSocket } from "../utils/socket";
// import api from "../utils/api";
// import { useTheme } from "../context/ThemeContext";
// import Icon from "./Icons";

// const LoginScreen = ({ navigation }) => {
//   const [emailId, setEmailId] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [focusedField, setFocusedField] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const dispatch = useDispatch();
//   const { theme } = useTheme();

//   const handleLogin = async () => {
//     if (!emailId || !password) {
//       Alert.alert("Error", "Please fill in all fields");
//       return;
//     }
//     try {
//       setLoading(true);
//       const response = await api.post("/api/auth/login", { emailId, password });
//       const { token, user } = response.data;
//       await removeToken();
//       await removeUser();
//       disconnectSocket();
//       await saveToken(token);
//       await saveUser(user);
//       dispatch(setUser({ user, token }));
//       initSocket(user._id);
//       navigation.replace("MainTabs");
//     } catch (err) {
//       Alert.alert(
//         "Login Failed",
//         err.response?.data?.message || "Something went wrong",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={[styles.container, { backgroundColor: theme.background }]}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       {/* Decorative background */}
//       <View style={[styles.bgBlob, { backgroundColor: theme.primaryLight }]} />

//       <View style={styles.innerContainer}>
//         {/* Logo */}
//         <View style={styles.logoSection}>
//           <View style={styles.logoBox}>
//             <View style={styles.logoBubble} />
//             <View style={styles.logoDot1} />
//             <View style={styles.logoDot2} />
//             <View style={styles.logoDot3} />
//           </View>
//           <Text style={[styles.brandName, { color: theme.primary }]}>
//             QuickChat
//           </Text>
//         </View>

//         <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
//         <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
//           Sign in to continue
//         </Text>

//         <View style={styles.form}>
//           {/* Email input */}
//           <View style={styles.inputGroup}>
//             <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
//               Email
//             </Text>
//             <View
//               style={[
//                 styles.inputWrap,
//                 {
//                   backgroundColor: theme.inputBg,
//                   borderColor:
//                     focusedField === "email"
//                       ? theme.primary
//                       : theme.inputBorder,
//                 },
//               ]}
//             >
//               <View style={styles.inputIconWrap}>
//                 <Icon
//                   name="mail"
//                   size={18}
//                   color={
//                     focusedField === "email"
//                       ? theme.primary
//                       : theme.textSecondary
//                   }
//                 />
//               </View>
//               <TextInput
//                 style={[styles.input, { color: theme.text }]}
//                 placeholder="you@example.com"
//                 placeholderTextColor={theme.placeholder}
//                 value={emailId}
//                 onChangeText={setEmailId}
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 onFocus={() => setFocusedField("email")}
//                 onBlur={() => setFocusedField(null)}
//               />
//             </View>
//           </View>

//           {/* Password input */}
//           <View style={styles.inputGroup}>
//             <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
//               Password
//             </Text>
//             <View
//               style={[
//                 styles.inputWrap,
//                 {
//                   backgroundColor: theme.inputBg,
//                   borderColor:
//                     focusedField === "pass" ? theme.primary : theme.inputBorder,
//                 },
//               ]}
//             >
//               <View style={styles.inputIconWrap}>
//                 <Icon
//                   name="lock"
//                   size={18}
//                   color={
//                     focusedField === "pass"
//                       ? theme.primary
//                       : theme.textSecondary
//                   }
//                 />
//               </View>
//               <TextInput
//                 style={[styles.input, { color: theme.text }]}
//                 placeholder="Enter your password"
//                 placeholderTextColor={theme.placeholder}
//                 value={password}
//                 onChangeText={setPassword}
//                 secureTextEntry={!showPassword}
//                 onFocus={() => setFocusedField("pass")}
//                 onBlur={() => setFocusedField(null)}
//               />
//               <TouchableOpacity
//                 onPress={() => setShowPassword(!showPassword)}
//                 style={{ padding: 4 }}
//               >
//                 <Icon
//                   name={showPassword ? "eyeOff" : "eye"}
//                   size={18}
//                   color={
//                     focusedField === "pass"
//                       ? theme.primary
//                       : theme.textSecondary
//                   }
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: theme.primary }]}
//             onPress={handleLogin}
//             disabled={loading}
//             activeOpacity={0.85}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.buttonText}>Sign In</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         <View style={styles.divider}>
//           <View
//             style={[styles.dividerLine, { backgroundColor: theme.border }]}
//           />
//           <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
//             or
//           </Text>
//           <View
//             style={[styles.dividerLine, { backgroundColor: theme.border }]}
//           />
//         </View>

//         <TouchableOpacity
//           onPress={() => navigation.navigate("Signup")}
//           style={[styles.outlineBtn, { borderColor: theme.border }]}
//           activeOpacity={0.8}
//         >
//           <Text style={[styles.outlineBtnText, { color: theme.text }]}>
//             Create an account
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   bgBlob: {
//     position: "absolute",
//     width: 360,
//     height: 360,
//     borderRadius: 180,
//     top: -180,
//     right: -100,
//     opacity: 0.6,
//   },
//   innerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     paddingHorizontal: 28,
//   },
//   logoSection: {
//     alignItems: "center",
//     marginBottom: 32,
//   },
//   logoBox: {
//     width: 72,
//     height: 72,
//     borderRadius: 22,
//     backgroundColor: "#3B6EF8",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//     shadowColor: "#3B6EF8",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 10,
//   },
//   logoBubble: {
//     position: "absolute",
//     width: 42,
//     height: 30,
//     borderRadius: 14,
//     backgroundColor: "rgba(255,255,255,0.95)",
//     bottom: 18,
//     left: 14,
//   },
//   logoDot1: {
//     position: "absolute",
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: "#3B6EF8",
//     bottom: 31,
//     left: 22,
//   },
//   logoDot2: {
//     position: "absolute",
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: "#3B6EF8",
//     bottom: 31,
//     left: 31,
//   },
//   logoDot3: {
//     position: "absolute",
//     width: 5,
//     height: 5,
//     borderRadius: 2.5,
//     backgroundColor: "#3B6EF8",
//     bottom: 31,
//     left: 40,
//   },
//   brandName: {
//     fontSize: 15,
//     fontWeight: "800",
//     letterSpacing: 0.5,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "800",
//     letterSpacing: -0.5,
//     marginBottom: 6,
//     textAlign: "center",
//   },
//   subtitle: {
//     fontSize: 15,
//     textAlign: "center",
//     marginBottom: 32,
//     fontWeight: "400",
//   },
//   form: { gap: 4 },
//   inputGroup: { marginBottom: 16 },
//   inputLabel: {
//     fontSize: 12,
//     fontWeight: "600",
//     letterSpacing: 0.4,
//     marginBottom: 8,
//     textTransform: "uppercase",
//   },
//   inputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderRadius: 14,
//     paddingHorizontal: 14,
//     paddingVertical: 14,
//   },
//   inputIconWrap: { marginRight: 12 },
//   input: { flex: 1, fontSize: 15, fontWeight: "400" },
//   button: {
//     borderRadius: 14,
//     padding: 17,
//     alignItems: "center",
//     marginTop: 8,
//     shadowColor: "#3B6EF8",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.28,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 15,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },
//   divider: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 20,
//     gap: 10,
//   },
//   dividerLine: { flex: 1, height: 1 },
//   dividerText: { fontSize: 13, fontWeight: "500" },
//   outlineBtn: {
//     borderWidth: 1.5,
//     borderRadius: 14,
//     padding: 16,
//     alignItems: "center",
//   },
//   outlineBtnText: { fontSize: 15, fontWeight: "600" },
// });

// export default LoginScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { removeToken, removeUser, saveToken, saveUser } from "../utils/storage";
import { disconnectSocket, initSocket } from "../utils/socket";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icons";

const LoginScreen = ({ navigation }) => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!emailId || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      const response = await api.post("/api/auth/login", { emailId, password });
      const { token, user } = response.data;
      await removeToken();
      await removeUser();
      disconnectSocket();
      await saveToken(token);
      await saveUser(user);
      dispatch(setUser({ user, token }));
      initSocket(user._id);
      navigation.replace("MainTabs");
    } catch (err) {
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Decorative background */}
      <View style={[styles.bgBlob, { backgroundColor: theme.primaryLight }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <View style={styles.logoBubble} />
              <View style={styles.logoDot1} />
              <View style={styles.logoDot2} />
              <View style={styles.logoDot3} />
            </View>
            <Text style={[styles.brandName, { color: theme.primary }]}>
              QuickChat
            </Text>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Sign in to continue
          </Text>

          <View style={styles.form}>
            {/* Email input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Email
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor:
                      focusedField === "email"
                        ? theme.primary
                        : theme.inputBorder,
                  },
                ]}
              >
                <View style={styles.inputIconWrap}>
                  <Icon
                    name="mail"
                    size={18}
                    color={
                      focusedField === "email"
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.placeholder}
                  value={emailId}
                  onChangeText={setEmailId}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: theme.inputBg,
                    borderColor:
                      focusedField === "pass"
                        ? theme.primary
                        : theme.inputBorder,
                  },
                ]}
              >
                <View style={styles.inputIconWrap}>
                  <Icon
                    name="lock"
                    size={18}
                    color={
                      focusedField === "pass"
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                </View>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("pass")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    size={18}
                    color={
                      focusedField === "pass"
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
              or
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: theme.border }]}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Signup")}
            style={[styles.outlineBtn, { borderColor: theme.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineBtnText, { color: theme.text }]}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlob: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -180,
    right: -100,
    opacity: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#3B6EF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBubble: {
    position: "absolute",
    width: 42,
    height: 30,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    bottom: 18,
    left: 14,
  },
  logoDot1: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 31,
    left: 22,
  },
  logoDot2: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 31,
    left: 31,
  },
  logoDot3: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 31,
    left: 40,
  },
  brandName: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "400",
  },
  form: { gap: 4 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inputIconWrap: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: "400" },
  button: {
    borderRadius: 14,
    padding: 17,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: "500" },
  outlineBtn: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  outlineBtnText: { fontSize: 15, fontWeight: "600" },
});

export default LoginScreen;
