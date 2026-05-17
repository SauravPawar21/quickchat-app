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
  Image,
} from "react-native";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";
import { getToken } from "../utils/storage";
import api from "../utils/api";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from "expo-image-picker";

const ChatScreen = ({ route, navigation }) => {
  const { receiverId, receiverName, receiverPhoto } = route.params;
  const { user } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    try {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {receiverPhoto &&
            !receiverPhoto.includes("avatar.iran.liara.run") ? (
              <Image
                source={{ uri: receiverPhoto }}
                style={{ width: 36, height: 36, borderRadius: 18 }}
              />
            ) : (
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#1A73E8",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {receiverName[0]}
                </Text>
              </View>
            )}
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: theme.text }}
            >
              {receiverName}
            </Text>
          </View>
        ),
        headerStyle: { backgroundColor: theme.headerBg },
        headerTintColor: theme.text,
      });
      fetchMessages();

      const socket = getSocket();
      if (socket) {
        socket.on("receiveMessage", handleReceiveMessage);
        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);
        socket.on("messagesRead", handleMessagesRead);
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
          socket.off("messagesRead", handleMessagesRead);
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

  const handleMessagesRead = ({ readBy }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.senderId === user._id || msg.senderId?._id === user._id) {
          return { ...msg, isRead: true };
        }
        return msg;
      }),
    );
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

  const uploadImage = async () => {
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
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled) return;

      const imageAsset = result.assets[0];
      setUploading(true);

      const token = await getToken();

      const formData = new FormData();
      formData.append("photo", {
        uri: imageAsset.uri,
        type: "image/jpeg",
        name: "chat-image.jpg",
      });

      const response = await api.post("/api/upload/chat-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { imageUrl } = response.data;

      const socket = getSocket();
      if (!socket) {
        Alert.alert("Error", "Not connected to server");
        return;
      }

      socket.emit("sendMessage", {
        senderId: user._id,
        receiverId,
        text: "",
        imageUrl,
        messageType: "image",
      });
    } catch (err) {
      console.log("Image upload error:", err.message);
      Alert.alert("Error", "Failed to send image");
    } finally {
      setUploading(false);
    }
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

      const renderTicks = () => {
        if (!isMine) return null;
        if (item.isRead) {
          return <Text style={styles.readTick}>✓✓</Text>;
        } else {
          return <Text style={styles.sentTick}>✓</Text>;
        }
      };

      // Image message
      if (item.messageType === "image" && item.imageUrl) {
        return (
          <View
            style={[
              styles.messageWrapper,
              isMine ? styles.myWrapper : styles.theirWrapper,
            ]}
          >
            <View
              style={[
                styles.imageBubble,
                isMine ? styles.myImageBubble : styles.theirImageBubble,
              ]}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.chatImage}
                resizeMode="cover"
              />
            </View>
            <View
              style={[
                styles.messageFooter,
                isMine ? styles.myFooter : styles.theirFooter,
              ]}
            >
              <Text
                style={[
                  styles.messageTime,
                  isMine ? styles.myMessageTime : styles.theirMessageTime,
                  { color: theme.textSecondary },
                ]}
              >
                {messageTime}
              </Text>
              {renderTicks()}
            </View>
          </View>
        );
      }

      // Text message
      return (
        <View
          style={[
            styles.messageWrapper,
            isMine ? styles.myWrapper : styles.theirWrapper,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMine
                ? styles.myMessage
                : [
                    styles.theirMessage,
                    { backgroundColor: theme.messageBubbleOther },
                  ],
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMine
                  ? styles.myMessageText
                  : [
                      styles.theirMessageText,
                      { color: theme.messageTextOther },
                    ],
              ]}
            >
              {item.text}
            </Text>
          </View>
          <View
            style={[
              styles.messageFooter,
              isMine ? styles.myFooter : styles.theirFooter,
            ]}
          >
            <Text
              style={[
                styles.messageTime,
                isMine
                  ? styles.myMessageTime
                  : [styles.theirMessageTime, { color: theme.textSecondary }],
              ]}
            >
              {messageTime}
            </Text>
            {renderTicks()}
          </View>
        </View>
      );
    } catch (err) {
      console.log("renderMessage ERROR:", err.message);
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
      style={[styles.container, { backgroundColor: theme.chatBg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
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
            <Text
              style={[styles.emptyChatText, { color: theme.textSecondary }]}
            >
              No messages yet. Say hello! 👋
            </Text>
          </View>
        }
      />

      {isTyping && (
        <View style={[styles.typingContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            {receiverName} is typing...
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.card, borderTopColor: theme.border },
        ]}
      >
        {/* Image upload button */}
        <TouchableOpacity
          style={styles.imageButton}
          onPress={uploadImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#1A73E8" />
          ) : (
            <Text style={styles.imageButtonText}>📷</Text>
          )}
        </TouchableOpacity>

        {/* Text input */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.placeholder}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />

        {/* Send button */}
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
  messageWrapper: {
    marginVertical: 4,
    maxWidth: "75%",
  },
  myWrapper: {
    alignSelf: "flex-end",
  },
  theirWrapper: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: "#1A73E8",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
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
  },
  myMessageTime: {
    color: "#999",
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
  myFooter: {
    justifyContent: "flex-end",
  },
  theirFooter: {
    justifyContent: "flex-start",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  sentTick: {
    fontSize: 12,
    color: "#999",
  },
  readTick: {
    fontSize: 12,
    color: "#1A73E8",
    fontWeight: "bold",
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  imageButtonText: {
    fontSize: 24,
  },
  imageBubble: {
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 2,
  },
  myImageBubble: {
    alignSelf: "flex-end",
  },
  theirImageBubble: {
    alignSelf: "flex-start",
  },
  chatImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
  },
});

export default ChatScreen;
