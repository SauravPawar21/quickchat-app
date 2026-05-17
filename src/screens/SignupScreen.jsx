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

const SignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!firstName || !lastName || !emailId || !password) {
      Alert.alert("Error", "Please fill in all fields");
    }

    if (password.length < 6) {
      Alert.alert("Error", "Passord must be at least 6 characters");
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
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("Login");
          },
        },
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>💬 QuickChat</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Create your account
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="First name"
          placeholderTextColor={theme.placeholder}
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Last name"
          placeholderTextColor={theme.placeholder}
          value={lastName}
          onChangeText={setLastName}
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Email address"
          placeholderTextColor={theme.placeholder}
          value={emailId}
          onChangeText={setEmailId}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Password (min 6 characters)"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Already have an account? <Text style={styles.link}>Login</Text>
          </Text> 
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1A73E8",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  button: {
    backgroundColor: "#1A73E8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
  link: {
    color: "#1A73E8",
    fontWeight: "bold",
  },
});

export default SignupScreen;
