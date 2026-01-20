import { StyleSheet } from "react-native";
import { COLORS, SHADOWS } from "./index";

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginVertical: 10,
  },

  inputField: {
    borderWidth: 1,
    borderColor: COLORS.primary, // Recommended: Use the variable instead of hardcoding #f3a712
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#f9f9f9",
    fontSize: 16,
    marginBottom: 15,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
