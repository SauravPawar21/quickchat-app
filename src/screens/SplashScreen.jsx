import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { getToken, getUser } from "../utils/storage";
import { initSocket } from "../utils/socket";
import api from "../utils/api";

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      // Check if token exists in AsyncStorage
      const token = await getToken();

      if (!token) {
        // No token — go to Login
        navigation.replace("Login");
        return;
      }

      // Token exists — verify it with backend
      const response = await api.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.user;

      // Save user to Redux
      dispatch(setUser({ user, token }));

      // Connect socket
      initSocket(user._id);

      // Go to main app
      navigation.replace("MainTabs");
    } catch (err) {
      // Token expired or invalid — go to Login
      console.log("Token check failed:", err.message);
      navigation.replace("Login");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 QuickChat</Text>
      <Text style={styles.subtitle}>Connect instantly</Text>
      <ActivityIndicator size="large" color="#1A73E8" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1A73E8",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
