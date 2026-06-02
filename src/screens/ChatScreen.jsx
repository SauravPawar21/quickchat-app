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
import Icon from "./Icons";

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
                  backgroundColor: "#3B6EF8",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}
                >
                  {receiverName[0]}
                </Text>
              </View>
            )}
            <Text
              style={{ fontSize: 16, fontWeight: "700", color: theme.text }}
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (err) {
      setMessages([]);
      Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveMessage = (message) => {
    setMessages((prev) => [...(prev || []), message]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTyping = ({ senderId }) => {
    if (senderId === receiverId) setIsTyping(true);
  };
  const handleStopTyping = ({ senderId }) => {
    if (senderId === receiverId) setIsTyping(false);
  };

  const handleMessagesRead = ({ readBy }) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.senderId === user._id || msg.senderId?._id === user._id)
          return { ...msg, isRead: true };
        return msg;
      }),
    );
  };

  const handleTextChange = (value) => {
    setText(value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing", { senderId: user._id, receiverId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: user._id, receiverId });
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
    socket.emit("stopTyping", { senderId: user._id, receiverId });
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
        return item.isRead ? (
          <Icon name="checkCheck" size={12} color="#93C5FD" />
        ) : (
          <Icon name="check" size={12} color="rgba(255,255,255,0.55)" />
        );
      };

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
      }

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
                ? [styles.myMessage, { backgroundColor: theme.primary }]
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
      <View style={[styles.centered, { backgroundColor: theme.chatBg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
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
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Icon name="messageCircle" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.emptyChatText, { color: theme.text }]}>
              No messages yet
            </Text>
            <Text style={[styles.emptyChatSub, { color: theme.textSecondary }]}>
              Say hello to {receiverName}!
            </Text>
          </View>
        }
      />

      {isTyping && (
        <View
          style={[
            styles.typingContainer,
            { backgroundColor: theme.card, borderTopColor: theme.border },
          ]}
        >
          <View style={styles.typingBubble}>
            <View
              style={[
                styles.dot,
                styles.dot1,
                { backgroundColor: theme.textSecondary },
              ]}
            />
            <View
              style={[
                styles.dot,
                styles.dot2,
                { backgroundColor: theme.textSecondary },
              ]}
            />
            <View
              style={[
                styles.dot,
                styles.dot3,
                { backgroundColor: theme.textSecondary },
              ]}
            />
          </View>
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            {receiverName} is typing
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.card, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.imageButton, { backgroundColor: theme.inputBg }]}
          onPress={uploadImage}
          disabled={uploading}
          activeOpacity={0.7}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Icon name="image" size={20} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
              color: theme.text,
            },
          ]}
          placeholder="Message…"
          placeholderTextColor={theme.placeholder}
          value={text}
          onChangeText={handleTextChange}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: text.trim() ? theme.primary : theme.inputBg,
            },
          ]}
          onPress={sendMessage}
          disabled={!text.trim()}
          activeOpacity={0.85}
        >
          <Icon
            name="send"
            size={18}
            color={text.trim() ? "#fff" : theme.placeholder}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  messagesList: { paddingHorizontal: 14, paddingVertical: 16, flexGrow: 1 },
  messageWrapper: { marginVertical: 3, maxWidth: "78%" },
  myWrapper: { alignSelf: "flex-end" },
  theirWrapper: { alignSelf: "flex-start" },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    borderBottomRightRadius: 5,
    shadowColor: "#3B6EF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  theirMessage: {
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: { fontSize: 15, lineHeight: 21 },
  myMessageText: { color: "#fff" },
  theirMessageText: {},
  messageTime: { fontSize: 11 },
  myMessageTime: { color: "rgba(255,255,255,0.55)" },
  theirMessageTime: {},
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  myFooter: { justifyContent: "flex-end" },
  theirFooter: { justifyContent: "flex-start" },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 10,
    borderTopWidth: 1,
  },
  typingBubble: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  dot1: {},
  dot2: {},
  dot3: {},
  typingText: { fontSize: 13, fontStyle: "italic", fontWeight: "400" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  imageButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyChatText: { fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptyChatSub: { fontSize: 13 },
  imageBubble: { borderRadius: 14, overflow: "hidden", marginVertical: 2 },
  myImageBubble: { alignSelf: "flex-end" },
  theirImageBubble: { alignSelf: "flex-start" },
  chatImage: { width: 220, height: 220, borderRadius: 14 },
});

export default ChatScreen;
