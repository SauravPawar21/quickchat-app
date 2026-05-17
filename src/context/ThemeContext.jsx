import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightTheme = {
  isDark: false,
  background: "#ffffff",
  surface: "#f5f5f5",
  card: "#ffffff",
  text: "#1A1A2E",
  textSecondary: "#999999",
  border: "#f0f0f0",
  inputBg: "#f9f9f9",
  inputBorder: "#dddddd",
  primary: "#1A73E8",
  tabBar: "#ffffff",
  tabBarBorder: "#eeeeee",
  headerBg: "#ffffff",
  messageBubbleOther: "#ffffff",
  messageTextOther: "#333333",
  chatBg: "#f5f5f5",
  placeholder: "#999999",
};

const darkTheme = {
  isDark: true,
  background: "#1A1A2E",
  surface: "#16213E",
  card: "#16213E",
  text: "#ffffff",
  textSecondary: "#AAAAAA",
  border: "#2A2A3E",
  inputBg: "#0F3460",
  inputBorder: "#2A2A3E",
  primary: "#1A73E8",
  tabBar: "#16213E",
  tabBarBorder: "#2A2A3E",
  headerBg: "#16213E",
  messageBubbleOther: "#16213E",
  messageTextOther: "#ffffff",
  chatBg: "#1A1A2E",
  placeholder: "#666666",
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme === "dark") {
        setIsDark(true);
      }
    } catch (err) {
      console.log("Error loading theme:", err);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (err) {
      console.log("Error saving theme:", err);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export default ThemeContext;
