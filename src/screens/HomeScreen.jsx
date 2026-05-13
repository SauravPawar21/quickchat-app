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

const HomeScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, []),
  );

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      console.log("TOKEN:", token);
      const response = await api.get("/api/users/conversations/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Logged In User:", response.data);
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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() =>
        navigation.navigate("Chat", {
          receiverId: item.user._id,
          receiverName: `${item.user.firstName} ${item.user.lastName}`,
          receiverPhoto: item.user.photoUrl,
        })
      }
    >
      {renderAvatar(item.user)}
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={styles.conversationTime}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        <View style={styles.lastMessageRow}>
          <Text
            style={[styles.lastMessage, !item.isRead && styles.unreadMessage]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {!item.isRead && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>●</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>💬 Chats</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Go to People tab to find someone to chat with!
          </Text>
          <TouchableOpacity
            style={styles.findButton}
            onPress={() => navigation.navigate("Users")}
          >
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
    paddingHorizontal: 24,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  conversationItem: {
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
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  conversationTime: {
    fontSize: 12,
    color: "#999",
  },
  lastMessage: {
    fontSize: 13,
    color: "#999",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  findButton: {
    backgroundColor: "#1A73E8",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  findButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  lastMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unreadMessage: {
    color: "#1A1A2E",
    fontWeight: "600",
  },
  unreadBadge: {
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#1A73E8",
    fontSize: 16,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});

export default HomeScreen;
