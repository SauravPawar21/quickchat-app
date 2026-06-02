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
  Switch,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { clearUser, setUser } from "../redux/userSlice";
import { removeToken, removeUser, getToken, saveUser } from "../utils/storage";
import { disconnectSocket } from "../utils/socket";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icons";

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { theme, isDark, toggleTheme } = useTheme();
  const [uploading, setUploading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
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
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#3B6EF8",
      "#E24F7A",
      "#8B5CF6",
      "#F97316",
      "#059669",
      "#D97706",
    ];
    if (!name) return colors[0];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const renderAvatar = () => (
    <TouchableOpacity
      style={styles.avatarContainer}
      onPress={handlePickPhoto}
      disabled={uploading}
      activeOpacity={0.85}
    >
      {user?.photoUrl && !user.photoUrl.includes("avatar.iran.liara.run") ? (
        <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
      ) : (
        <View
          style={[
            styles.avatar,
            { backgroundColor: getAvatarColor(user?.firstName) },
          ]}
        >
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </Text>
        </View>
      )}
      <View style={[styles.avatarOverlay, { borderColor: theme.surface }]}>
        {uploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Icon name="camera" size={14} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );

  const InfoRow = ({ label, value, iconName }) => (
    <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
      <View
        style={[styles.infoIconWrap, { backgroundColor: theme.primaryLight }]}
      >
        <Icon name={iconName} size={16} color={theme.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: theme.text }]}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.surface }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme.primaryLight }]}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.8}
        >
          <Icon name="edit" size={15} color={theme.primary} />
          <Text style={[styles.editBtnText, { color: theme.primary }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero section */}
      <View style={[styles.heroSection, { backgroundColor: theme.card }]}>
        {renderAvatar()}
        <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
          {uploading ? "Uploading…" : "Tap photo to change"}
        </Text>
        <Text style={[styles.heroName, { color: theme.text }]}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={[styles.heroEmail, { color: theme.textSecondary }]}>
          {user?.emailId}
        </Text>
        {user?.bio ? (
          <View style={[styles.bioPill, { backgroundColor: theme.surface }]}>
            <Text style={[styles.bioText, { color: theme.textSecondary }]}>
              {user.bio}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Info card */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Account Info
        </Text>
        <InfoRow iconName="user" label="First Name" value={user?.firstName} />
        <InfoRow iconName="user" label="Last Name" value={user?.lastName} />
        <InfoRow iconName="mail" label="Email" value={user?.emailId} />
        <InfoRow
          iconName="fileText"
          label="Bio"
          value={user?.bio || "No bio yet"}
        />
      </View>

      {/* Settings */}
      <View
        style={[styles.section, { backgroundColor: theme.card, marginTop: 12 }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Preferences
        </Text>
        <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
          <View style={styles.settingLeft}>
            <View
              style={[
                styles.settingIconWrap,
                { backgroundColor: isDark ? "#1A2340" : "#FFF8E7" },
              ]}
            >
              <Icon
                name={isDark ? "moon" : "sun"}
                size={17}
                color={isDark ? "#4F80FF" : "#D97706"}
              />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
              <Text
                style={[styles.settingSubLabel, { color: theme.textSecondary }]}
              >
                {isDark ? "Switch to light theme" : "Switch to dark theme"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* App info */}
      <View style={styles.appInfo}>
        <View
          style={[styles.appLogoMini, { backgroundColor: theme.primaryLight }]}
        >
          <Icon name="messageCircle" size={18} color={theme.primary} />
        </View>
        <Text style={[styles.appName, { color: theme.primary }]}>
          QuickChat
        </Text>
        <Text style={[styles.appVersion, { color: theme.textSecondary }]}>
          Version 1.0.0
        </Text>
        <Text style={[styles.appStack, { color: theme.textSecondary }]}>
          React Native · Node.js · Socket.io
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.danger + "40" }]}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Icon name="logOut" size={18} color={theme.danger} />
        <Text style={[styles.logoutText, { color: theme.danger }]}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editBtnText: { fontSize: 14, fontWeight: "700" },
  heroSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    marginBottom: 12,
  },
  avatarContainer: { position: "relative", marginBottom: 8 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  avatarText: { color: "#fff", fontSize: 34, fontWeight: "800" },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  tapHint: { fontSize: 12, marginBottom: 12, fontWeight: "500" },
  heroName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroEmail: { fontSize: 14, marginBottom: 12 },
  bioPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: "80%",
  },
  bioText: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  section: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingTop: 16,
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 2,
    fontWeight: "600",
  },
  infoValue: { fontSize: 15, fontWeight: "500" },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 14 },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  settingSubLabel: { fontSize: 12 },
  appInfo: { alignItems: "center", paddingVertical: 24, gap: 4 },
  appLogoMini: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  appName: { fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
  appVersion: { fontSize: 12 },
  appStack: { fontSize: 11 },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  logoutText: { fontSize: 15, fontWeight: "700" },
});

export default ProfileScreen;
