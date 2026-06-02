import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const lightTheme = {
  isDark: false,
  background: "#FAFAFA",
  surface: "#F2F3F7",
  card: "#FFFFFF",
  text: "#0D0F14",
  textSecondary: "#8A8FA3",
  border: "#ECEEF4",
  inputBg: "#F2F3F7",
  inputBorder: "#E0E3EE",
  primary: "#3B6EF8",
  primaryLight: "#EEF3FF",
  tabBar: "#FFFFFF",
  tabBarBorder: "#ECEEF4",
  headerBg: "#FFFFFF",
  messageBubbleOther: "#FFFFFF",
  messageTextOther: "#0D0F14",
  chatBg: "#F2F3F7",
  placeholder: "#B0B5C8",
  accent: "#3B6EF8",
  success: "#16A87C",
  danger: "#E5484D",
  shadow: "rgba(0,0,0,0.06)",
};

const darkTheme = {
  isDark: true,
  background: "#0C0E14",
  surface: "#13151E",
  card: "#1C1F2E",
  text: "#F0F1F6",
  textSecondary: "#6B7089",
  border: "#252838",
  inputBg: "#1C1F2E",
  inputBorder: "#252838",
  primary: "#4F80FF",
  primaryLight: "#1A2340",
  tabBar: "#1C1F2E",
  tabBarBorder: "#252838",
  headerBg: "#1C1F2E",
  messageBubbleOther: "#1C1F2E",
  messageTextOther: "#F0F1F6",
  chatBg: "#0C0E14",
  placeholder: "#4A4E66",
  accent: "#4F80FF",
  success: "#1DBF8C",
  danger: "#FF5A5E",
  shadow: "rgba(0,0,0,0.3)",
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
