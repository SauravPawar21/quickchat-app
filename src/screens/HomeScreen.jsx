import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getToken } from "../utils/storage";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import Icon from "./Icons";

const HomeScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, []),
  );

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await api.get("/api/users/conversations/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.conversations || []);
    } catch (err) {
      Alert.alert("Error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    else if (days === 1) return "Yesterday";
    else if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
    else return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationItem, { backgroundColor: theme.card }]}
      onPress={() =>
        navigation.navigate("Chat", {
          receiverId: item.user._id,
          receiverName: `${item.user.firstName} ${item.user.lastName}`,
          receiverPhoto: item.user.photoUrl,
        })
      }
      activeOpacity={0.7}
    >
      {renderAvatar(item.user)}
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text
            style={[styles.conversationName, { color: theme.text }]}
            numberOfLines={1}
          >
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text
            style={[styles.conversationTime, { color: theme.textSecondary }]}
          >
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.lastMessageRow}>
          <Text
            style={[
              styles.lastMessage,
              { color: theme.textSecondary },
              !item.isRead && { color: theme.text, fontWeight: "600" },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {!item.isRead && (
            <View
              style={[styles.unreadDot, { backgroundColor: theme.primary }]}
            />
          )}
        </View>
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
            Messages
          </Text>
          {conversations.length > 0 && (
            <Text
              style={[styles.headerSubtitle, { color: theme.textSecondary }]}
            >
              {conversations.length} conversation
              {conversations.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
        <View
          style={[
            styles.headerIconWrap,
            { backgroundColor: theme.primaryLight },
          ]}
        >
          <Icon name="messageCircle" size={20} color={theme.primary} />
        </View>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.centered}>
          <View
            style={[
              styles.emptyIllustration,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <Icon name="messageCircle" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No messages yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Start a conversation by finding people in the People tab
          </Text>
          <TouchableOpacity
            style={[styles.findButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("Users")}
            activeOpacity={0.85}
          >
            <Icon name="users" size={16} color="#fff" />
            <Text style={styles.findButtonText}>Find People</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.user._id}
          renderItem={renderConversation}
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
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: { padding: 12, paddingTop: 16 },
  conversationItem: {
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
  conversationInfo: { flex: 1 },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  conversationTime: { fontSize: 12, fontWeight: "500" },
  lastMessageRow: { flexDirection: "row", alignItems: "center" },
  lastMessage: { fontSize: 13, flex: 1 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 8,
  },
  emptyIllustration: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  findButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 13,
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  findButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default HomeScreen;
