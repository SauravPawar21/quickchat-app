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
} from "react-native";
import { useSelector } from "react-redux";
import api from "../utils/api";
import { getToken } from "../utils/storage";
import { Ionicons } from "@expo/vector-icons";

const UsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [search, setSearch] = useState("");

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
  const renderAvatar = (firstName, lastName, isOnline) => (
    <View style={styles.avatarContainer}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {firstName[0]}
          {lastName[0]}
        </Text>
      </View>

      <View
        style={[
          styles.onlineDot,
          { backgroundColor: isOnline ? "#16A085" : "#ccc" },
        ]}
      />
    </View>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() =>
        navigation.navigate("Chat", {
          receiverId: item._id,
          receiverName: `${item.firstName} ${item.lastName}`,
        })
      }
    >
      {renderAvatar(item.firstName, item.lastName, item.isOnline)}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.userBio}>
          {item.bio || "Hey there! I am using QuickChat"}
        </Text>
      </View>
      <Text
        style={[
          styles.statusText,
          { color: item.isOnline ? "#16A085" : "#999" },
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>People</Text>
        <Text style={styles.headerSubtitle}>
          {displayedUsers.length} users available
        </Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" />

          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={searchUsers}
            style={styles.searchInput}
          />

          {search.length > 0 && (
            <TouchableOpacity onPress={() => searchUsers("")}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {displayedUsers.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Be the first to invite friends!
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedUsers}
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
});

export default UsersScreen;
