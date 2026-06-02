import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getToken } from "../utils/storage";
import api from "../utils/api";
import Icon from "./Icons";

const UsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
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
      setFilteredUsers(response.data.users);
    } catch (err) {
      Alert.alert("Error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const bio = user.bio?.toLowerCase() || "";
      const query = text.toLowerCase();
      return fullName.includes(query) || bio.includes(query);
    });
    setFilteredUsers(filtered);
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

  const renderAvatar = (user) => (
    <View style={styles.avatarContainer}>
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
      <View
        style={[
          styles.onlineDot,
          { backgroundColor: user?.isOnline ? theme.success : theme.border },
          { borderColor: theme.card },
        ]}
      />
    </View>
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("Chat", {
          receiverId: item._id,
          receiverName: `${item.firstName} ${item.lastName}`,
          receiverPhoto: item.photoUrl,
        })
      }
      activeOpacity={0.7}
    >
      {renderAvatar(item)}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: theme.text }]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text
          style={[styles.userBio, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.bio || "Hey there! I am using QuickChat"}
        </Text>
      </View>
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: item.isOnline
              ? theme.success + "18"
              : theme.surface,
          },
        ]}
      >
        <View
          style={[
            styles.statusDotSmall,
            {
              backgroundColor: item.isOnline
                ? theme.success
                : theme.textSecondary,
            },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: item.isOnline ? theme.success : theme.textSecondary },
          ]}
        >
          {item.isOnline ? "Online" : "Offline"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.surface }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            People
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "person" : "people"} available
          </Text>
        </View>
        <View
          style={[
            styles.headerIconWrap,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Icon name="users" size={20} color={theme.primary} />
        </View>
      </View>

      {/* Search bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: theme.inputBg,
              borderColor: searchFocused ? theme.primary : theme.inputBorder,
            },
          ]}
        >
          <View style={styles.searchIconWrap}>
            <Icon
              name="search"
              size={17}
              color={searchFocused ? theme.primary : theme.textSecondary}
            />
          </View>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name or bio…"
            placeholderTextColor={theme.placeholder}
            value={searchText}
            onChangeText={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch("")}
              style={styles.clearBtn}
            >
              <Icon name="x" size={15} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredUsers.length === 0 ? (
        <View style={styles.centered}>
          <View
            style={[
              styles.emptyIllustration,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Icon name="users" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {searchText ? `No results for "${searchText}"` : "No users found"}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            {searchText
              ? "Try a different search term"
              : "Be the first to invite friends!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, fontWeight: "500", marginTop: 2 },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchIconWrap: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  clearBtn: { padding: 4 },
  listContainer: { padding: 12, paddingTop: 16 },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: { position: "relative", marginRight: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  userBio: { fontSize: 13 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "600" },
  emptyIllustration: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },
});

export default UsersScreen;
