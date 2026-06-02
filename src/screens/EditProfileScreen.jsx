import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { getToken, saveUser } from "../utils/storage";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icons";

const EditProfileScreen = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name are required");
      return;
    }
    if (bio.length > 200) {
      Alert.alert("Error", "Bio must be less than 200 characters");
      return;
    }
    try {
      setLoading(true);
      const token = await getToken();
      const response = await api.patch(
        "/api/users/profile",
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const updatedUser = response.data.user;
      dispatch(setUser({ user: updatedUser, token }));
      await saveUser(updatedUser);
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const bioPercentage = (bio.length / 200) * 100;
  const bioColor =
    bioPercentage > 90
      ? theme.danger
      : bioPercentage > 70
        ? "#F97316"
        : theme.primary;

  const inputBorderColor = (field) =>
    focusedField === field ? theme.primary : theme.inputBorder;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.innerContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.headerBg,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.cancelBtn, { backgroundColor: theme.inputBg }]}
          >
            <Icon name="arrowLeft" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Profile
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <Text
            style={[styles.formSectionLabel, { color: theme.textSecondary }]}
          >
            Personal Info
          </Text>

          {/* First Name */}
          <View style={[styles.fieldWrap, { borderBottomColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              First Name
            </Text>
            <View
              style={[
                styles.fieldInputWrap,
                {
                  borderColor: inputBorderColor("fn"),
                  backgroundColor: theme.inputBg,
                },
              ]}
            >
              <Icon
                name="user"
                size={16}
                color={
                  focusedField === "fn" ? theme.primary : theme.textSecondary
                }
              />
              <TextInput
                style={[styles.fieldInput, { color: theme.text }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={theme.placeholder}
                maxLength={50}
                onFocus={() => setFocusedField("fn")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={[styles.fieldWrap, { borderBottomColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Last Name
            </Text>
            <View
              style={[
                styles.fieldInputWrap,
                {
                  borderColor: inputBorderColor("ln"),
                  backgroundColor: theme.inputBg,
                },
              ]}
            >
              <Icon
                name="user"
                size={16}
                color={
                  focusedField === "ln" ? theme.primary : theme.textSecondary
                }
              />
              <TextInput
                style={[styles.fieldInput, { color: theme.text }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={theme.placeholder}
                maxLength={50}
                onFocus={() => setFocusedField("ln")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Bio */}
          <View
            style={[styles.fieldWrap, { borderBottomColor: "transparent" }]}
          >
            <View style={styles.bioLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Bio
              </Text>
              <Text style={[styles.charCount, { color: bioColor }]}>
                {bio.length}/200
              </Text>
            </View>
            <View
              style={[
                styles.fieldInputWrap,
                styles.bioInputWrap,
                {
                  borderColor: inputBorderColor("bio"),
                  backgroundColor: theme.inputBg,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.fieldInput,
                  styles.bioInput,
                  { color: theme.text },
                ]}
                value={bio}
                onChangeText={setBio}
                placeholder="Write something about yourself…"
                placeholderTextColor={theme.placeholder}
                multiline
                maxLength={200}
                onFocus={() => setFocusedField("bio")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            {/* Progress bar */}
            <View
              style={[styles.progressBar, { backgroundColor: theme.border }]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${bioPercentage}%`, backgroundColor: bioColor },
                ]}
              />
            </View>
          </View>
        </View>

        <View
          style={[styles.hintCard, { backgroundColor: theme.primaryLight }]}
        >
          <Icon name="info" size={15} color={theme.primary} />
          <Text style={[styles.hint, { color: theme.primary }]}>
            Your name and bio are visible to all QuickChat users
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  cancelBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  saveText: { fontSize: 14, color: "#fff", fontWeight: "700" },
  form: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  formSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    paddingTop: 16,
    paddingBottom: 12,
  },
  fieldWrap: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  fieldLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "700",
    marginBottom: 10,
  },
  fieldInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  bioInputWrap: { alignItems: "flex-start", paddingTop: 12 },
  fieldInput: { flex: 1, fontSize: 15 },
  bioInput: { height: 72, textAlignVertical: "top" },
  bioLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  charCount: { fontSize: 12, fontWeight: "700" },
  progressBar: {
    height: 3,
    borderRadius: 2,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 2 },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  hint: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
    fontWeight: "500",
  },
});

export default EditProfileScreen;
