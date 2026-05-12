import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../redux/userSlice";
import { removeToken, removeUser } from "../utils/storage";
import { disconnectSocket } from "../utils/socket";

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          disconnectSocket();
          await removeToken();
          await removeUser();
          dispatch(clearUser());

          navigation.replace("Login");
        },
      },
    ]);
  };

  const renderAvatar = () => (
    <View style={styles.avatarContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileSection}>
        {renderAvatar()}
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.emailId}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>First Name</Text>
          <Text style={styles.infoValue}>{user?.firstName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Last Name</Text>
          <Text style={styles.infoValue}>{user?.lastName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.emailId}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoValue}>{user?.bio || "No bio yet"}</Text>
        </View>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>💬 QuickChat</Text>
        <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
        <Text style={styles.appInfoSubtext}>
          Built with React Native + Node.js + Socket.io
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#999",
  },
  infoSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoCard: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: "#1A1A2E",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 16,
  },
  appInfoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A73E8",
    marginBottom: 4,
  },
  appInfoVersion: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: "#ccc",
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
