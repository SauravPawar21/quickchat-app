import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { getToken } from "../utils/storage";
import { initSocket } from "../utils/socket";
import api from "../utils/api";

const SplashScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const scaleAnim = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
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
      {/* Subtle background accent */}
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoInner}>
            {/* Custom chat icon shapes */}
            <View style={styles.bubbleMain} />
            <View style={styles.bubbleDot1} />
            <View style={styles.bubbleDot2} />
            <View style={styles.bubbleDot3} />
          </View>
        </View>

        <Text style={styles.title}>QuickChat</Text>
        <Text style={styles.subtitle}>Conversations that matter</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="small" color="#3B6EF8" style={styles.loader} />
        <Text style={styles.loadingText}>Getting things ready…</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  bgAccent: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "#EEF3FF",
    top: -160,
    right: -120,
    opacity: 0.7,
  },
  bgAccent2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#F0FFF8",
    bottom: -100,
    left: -80,
    opacity: 0.6,
  },
  content: { alignItems: "center" },
  logoWrap: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: "#3B6EF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  logoInner: {
    width: 48,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleMain: {
    position: "absolute",
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    bottom: 6,
    left: 0,
  },
  bubbleDot1: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B6EF8",
    bottom: 19,
    left: 10,
  },
  bubbleDot2: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B6EF8",
    bottom: 19,
    left: 21,
  },
  bubbleDot3: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B6EF8",
    bottom: 19,
    left: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0D0F14",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#8A8FA3",
    letterSpacing: 0.1,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  loader: { marginBottom: 10 },
  loadingText: {
    fontSize: 13,
    color: "#B0B5C8",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
