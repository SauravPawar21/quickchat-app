import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { getToken } from "../utils/storage";
import { initSocket } from "../utils/socket";
import api from "../utils/api";

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await getToken();

      if (!token) {
        navigation.replace("Login");
        return;
      }

      const response = await api.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = response.data.user;

      dispatch(setUser({ user, token }));

      initSocket(user._id);

      navigation.replace("MainTabs");
    } catch (err) {
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
