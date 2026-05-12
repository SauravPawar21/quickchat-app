import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";
import { getToken } from "../utils/storage";
import api from "../utils/api";

const ChatScreen = ({ route, navigation }) => {
  const { receiverId, receiverName } = route.params;
  const { user } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    try {
      navigation.setOptions({ title: receiverName });
      fetchMessages();

      const socket = getSocket();
      if (socket) {
        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);
      }
    } catch (err) {
      console.log("useEffect ERROR:", err.message);
    }

    return () => {
      try {
        const socket = getSocket();
        if (socket) {
          socket.off("receiveMessage", handleReceiveMessage);
          socket.off("typing", handleTyping);
          socket.off("stopTyping", handleStopTyping);
        }
      } catch (err) {
        console.log("cleanup ERROR:", err.message);
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await api.get(`/api/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages || response.data.message || []);

      await api.patch(
        `/api/messages/read/${receiverId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      setMessages([]);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveMessage = (message) => {
    setMessages((prev) => {
      const prevMessages = prev || [];
      return [...prevMessages, message];
    });
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = ({ senderId }) => {
    if (senderId === receiverId) {
      setIsTyping(true);
    }
  };

  const handleStopTyping = ({ senderId }) => {
    if (senderId === receiverId) {
      setIsTyping(false);
    }
  };

  const handleTextChange = (value) => {
    setText(value);

    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", {
      senderId: user._id,
      receiverId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        senderId: user._id,
        receiverId,
      });
    }, 1000);
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    const socket = getSocket();
    if (!socket) {
      Alert.alert("Error", "Not connected to server");
      return;
    }

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: text.trim(),
    });

    setText("");

    socket.emit("stopTyping", {
      senderId: user._id,
      receiverId,
    });
  };

  const renderMessage = ({ item }) => {
    try {
      if (!item) return null;

      const isMine =
        item.senderId === user._id || item.senderId?._id === user._id;

      const messageTime = item.createdAt
        ? new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      return (
        <View
          style={[
            styles.messageBubble,
            isMine ? styles.myMessage : styles.theirMessage,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMine ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMine ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {messageTime}
          </Text>
        </View>
      );
    } catch (err) {
      console.log("renderMessage ERROR:", err.message, err.stack);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) =>
          item._id ? item._id.toString() : index.toString()
        }
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              No messages yet. Say hello! 👋
            </Text>
          </View>
        }
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{receiverName} is typing...</Text>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!text.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#1A73E8",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  theirMessageTime: {
    color: "#999",
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  typingText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    backgroundColor: "#f9f9f9",
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#1A73E8",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyChatText: {
    fontSize: 16,
    color: "#999",
  },
});

export default ChatScreen;
