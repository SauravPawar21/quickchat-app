import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { clearUser, setUser } from "../redux/userSlice";
import { removeToken, removeUser, getToken, saveUser } from "../utils/storage";
import { disconnectSocket } from "../utils/socket";
import api from "../utils/api";

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await api.post("/api/auth/logout");
          disconnectSocket();
          await removeToken();
          await removeUser();
          dispatch(clearUser());

          navigation.replace("Login");
        },
      },
    ]);
  };

  const handlePickPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      await uploadPhoto(result.assets[0]);
    } catch (err) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadPhoto = async (imageAsset) => {
    try {
      setUploading(true);

      const token = await getToken();

      const formData = new FormData();
      formData.append("photo", {
        uri: imageAsset.uri,
        type: "image/jpeg",
        name: "profile-photo.jpg",
      });

      const response = await api.post("/api/upload/profile-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;
      dispatch(setUser({ user: updatedUser, token }));
      await saveUser(updatedUser);

      Alert.alert("Success", "Profile photo updated!");
    } catch (err) {
      console.log("Upload error:", err.message);
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const renderAvatar = () => (
    <TouchableOpacity
      style={styles.avatarContainer}
      onPress={handlePickPhoto}
      disabled={uploading}
    >
      {user?.photoUrl && !user.photoUrl.includes("avatar.iran.liara.run") ? (
        <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Text>
        </View>
      )}

      <View style={styles.avatarOverlay}>
        {uploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.avatarOverlayText}>📷</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        {renderAvatar()}
        <Text style={styles.tapText}>
          {uploading ? "Uploading..." : "Tap to change photo"}
        </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    position: "relative",
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarOverlayText: {
    fontSize: 14,
  },
  tapText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
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
  editButton: {
    fontSize: 16,
    color: "#1A73E8",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
