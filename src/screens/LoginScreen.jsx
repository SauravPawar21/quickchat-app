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
} from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { removeToken, removeUser, saveToken, saveUser } from "../utils/storage";
import { disconnectSocket, initSocket } from "../utils/socket";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";

const LoginScreen = ({ navigation }) => {
  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!emailId || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/login", {
        emailId,
        password,
      });

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
      <View style={styles.innerContainer}>
        <Text style={styles.title}>💬 QuickChat</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Welcome back!
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
          placeholder="Password"
          placeholderTextColor={theme.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={[styles.linkText, { color: theme.textSecondary }]}>
            Don't have an account? <Text style={styles.link}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
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

export default LoginScreen;
