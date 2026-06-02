import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icons";

const SignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!firstName || !lastName || !emailId || !password) {
      Alert.alert("Error", "Please fill in all fields");
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await api.post("/api/auth/signup", {
        firstName,
        lastName,
        emailId,
        password,
      });
      Alert.alert("Success", "Account created! Please login.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      Alert.alert(
        "Signup Failed",
        err.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputBorderColor = (field) =>
    focusedField === field ? theme.primary : theme.inputBorder;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.bgBlob, { backgroundColor: theme.primaryLight }]} />

      <ScrollView
        contentContainerStyle={styles.innerContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <View style={styles.logoBubble} />
            <View style={styles.logoDot1} />
            <View style={styles.logoDot2} />
            <View style={styles.logoDot3} />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Create account
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Join QuickChat today
        </Text>

        {/* Name row */}
        <View style={styles.nameRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              First Name
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: inputBorderColor("fname"),
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="John"
                placeholderTextColor={theme.placeholder}
                value={firstName}
                onChangeText={setFirstName}
                onFocus={() => setFocusedField("fname")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={{ width: 12 }} />

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Last Name
            </Text>
            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: inputBorderColor("lname"),
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Doe"
                placeholderTextColor={theme.placeholder}
                value={lastName}
                onChangeText={setLastName}
                onFocus={() => setFocusedField("lname")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Email
          </Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.inputBg,
                borderColor: inputBorderColor("email"),
              },
            ]}
          >
            <View style={styles.inputIconWrap}>
              <Icon
                name="mail"
                size={18}
                color={
                  focusedField === "email" ? theme.primary : theme.textSecondary
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

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
            Password
          </Text>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.inputBg,
                borderColor: inputBorderColor("pass"),
              },
            ]}
          >
            <View style={styles.inputIconWrap}>
              <Icon
                name="lock"
                size={18}
                color={
                  focusedField === "pass" ? theme.primary : theme.textSecondary
                }
              />
            </View>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Min. 6 characters"
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
                  focusedField === "pass" ? theme.primary : theme.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

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
          onPress={() => navigation.navigate("Login")}
          style={[styles.outlineBtn, { borderColor: theme.border }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.outlineBtnText, { color: theme.text }]}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgBlob: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -140,
    right: -80,
    opacity: 0.6,
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  logoSection: { alignItems: "center", marginBottom: 28 },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: "#3B6EF8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBubble: {
    position: "absolute",
    width: 38,
    height: 27,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    bottom: 16,
    left: 14,
  },
  logoDot1: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 28,
    left: 20,
  },
  logoDot2: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 28,
    left: 29,
  },
  logoDot3: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#3B6EF8",
    bottom: 28,
    left: 38,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 28,
    fontWeight: "400",
  },
  nameRow: { flexDirection: "row", marginBottom: 0 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  inputIconWrap: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  button: {
    borderRadius: 14,
    padding: 17,
    alignItems: "center",
    marginTop: 4,
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
    marginVertical: 18,
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

export default SignupScreen;
