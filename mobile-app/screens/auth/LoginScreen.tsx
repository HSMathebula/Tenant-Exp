"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { TextInput, Button, SegmentedButtons } from "react-native-paper"
import { Ionicons } from "@expo/vector-icons"
import useAuth from "../../hooks/useAuth"

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("tenant")
  const [secureTextEntry, setSecureTextEntry] = useState(true)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      await login(email, password, role)
    } catch (error) {
      Alert.alert("Login Failed", "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>PropertyPulse</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign In</Text>
            <Text style={styles.subtitle}>Access your account</Text>

            <SegmentedButtons
              value={role}
              onValueChange={setRole}
              buttons={[
                { value: "tenant", label: "Tenant" },
                { value: "maintenance", label: "Maintenance" },
              ]}
              style={styles.segmentedButtons}
            />

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

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={secureTextEntry}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? "eye" : "eye-off"}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
              left={<TextInput.Icon icon="lock" />}
              style={styles.input}
            />

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Sign In
            </Button>

            <View style={styles.biometricContainer}>
              <TouchableOpacity style={styles.biometricButton}>
                <Ionicons name="finger-print" size={24} color="#3b82f6" />
                <Text style={styles.biometricText}>Use Biometric Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? Contact your property manager</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#3b82f6",
  },
  button: {
    marginBottom: 16,
    backgroundColor: "#3b82f6",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  biometricContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  biometricText: {
    marginLeft: 8,
    color: "#3b82f6",
  },
  footer: {
    marginTop: "auto",
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    color: "#64748b",
    textAlign: "center",
  },
})

export default LoginScreen
