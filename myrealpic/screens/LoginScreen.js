import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const primaryColor = '#007BFF';
const darkText = '#333';
const subtleText = '#666';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSecure, setIsSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9F9F9' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          accessible={true}
          accessibilityLabel="App Icon"
        />

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          textContentType="username"
          autoCapitalize="none"
          returnKeyType="next"
          accessible={true}
          accessibilityLabel="Email Input"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={isSecure}
            returnKeyType="done"
            textContentType="password"
            accessible={true}
            accessibilityLabel="Password Input"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggleVisibilityButton}
            accessible={true}
            accessibilityLabel={isSecure ? "Show Password" : "Hide Password"}
          >
            <Text style={{ color: primaryColor, fontWeight: '600' }}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleLogin}
          disabled={loading}
          accessible={true}
          accessibilityLabel="Login Button"
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomLinksContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            accessible={true}
            accessibilityLabel="Go to Sign Up"
          >
            <Text style={styles.signupText}>
              Don't have an account? <Text style={{ color: primaryColor }}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            accessible={true}
            accessibilityLabel="Forgot Password"
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  icon: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: darkText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: subtleText,
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    color: darkText,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleVisibilityButton: {
    marginLeft: 8,
    padding: 8,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomLinksContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    color: darkText,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: primaryColor,
    textAlign: 'center',
    fontSize: 14,
  },
});