import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { getToken } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const UsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await api.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data.users);
    } catch (err) {
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (text) => {
    try {
      setSearch(text);
      if (!text.trim()) {
        setSearchedUsers([]);
        return;
      }
      const token = await getToken();
      const response = await api.get(`/api/users/search?query=${text}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchedUsers(response.data);
    } catch (error) {
      console.log("Search error:", error.message);
    }
  };
  const renderAvatar = (user) => (
    <View style={styles.avatarContainer}>
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
      <View
        style={[
          styles.onlineDot,
          { backgroundColor: user?.isOnline ? "#16A085" : "#ccc" },
        ]}
      />
    </View>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { borderBottomColor: theme.border }]}
      onPress={() =>
        navigation.navigate("Chat", {
          receiverId: item._id,
          receiverName: `${item.firstName} ${item.lastName}`,
          receiverPhoto: item.photoUrl,
        })
      }
    >
      {renderAvatar(item)}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.userBio, { color: theme.textSecondary }]}>
          {item.bio || "Hey there! I am using QuickChat"}
        </Text>
      </View>
      <Text
        style={[
          styles.statusText,
          { color: item.isOnline ? "#16A085" : theme.textSecondary },
        ]}
      >
        {item.isOnline ? "Online" : "Offline"}
      </Text>
    </TouchableOpacity>
  );

  const displayedUsers = search ? searchedUsers : users;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>People</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {users.length} users available
        </Text>
      </View>

      {users.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No users found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Be the first to invite friends!
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1A73E8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  userBio: {
    fontSize: 13,
    color: "#999",
  },
  onlineText: {
    fontSize: 12,
    color: "#16A085",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    backgroundColor: "#F7F9FC",
    borderWidth: 1,
    borderColor: "#E8ECF4",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#1A1A2E",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});

export default UsersScreen;
