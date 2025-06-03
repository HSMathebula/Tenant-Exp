"use client"

import { useState } from "react"
import { View, Text, StyleSheet, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { TextInput, Button } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        "Reset Link Sent",
        "If an account exists with this email, you will receive password reset instructions.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      )
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button icon="arrow-left" onPress={() => navigation.goBack()} style={styles.backButton}>
          Back
        </Button>
      </View>

      <View style={styles.content}>
        <Ionicons name="lock-open-outline" size={60} color="#3b82f6" style={styles.icon} />

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          left={<TextInput.Icon icon="email" />}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Send Reset Link
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
  },
  backButton: {
    alignSelf: "flex-start",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  icon: {
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 24,
    backgroundColor: "#fff",
  },
  button: {
    marginBottom: 16,
    backgroundColor: "#3b82f6",
  },
  buttonContent: {
    paddingVertical: 8,
  },
})

export default ForgotPasswordScreen
