import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const primaryColor = '#007BFF';
const darkText = '#333';
const subtleText = '#666';

export default function SignupScreen() {
  const [firstName, setFirstName]             = useState('');
  const [lastName, setLastName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSecure, setIsSecure]               = useState(true);
  const [isSecureConfirm, setIsSecureConfirm] = useState(true);
  const [loading, setLoading]                 = useState(false);

  const navigation = useNavigation();

  // Evaluate password requirements:
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit     = /[0-9]/.test(password);
  const hasLength    = password.length >= 8;
  const isPasswordStrong = hasUpperCase && hasLowerCase && hasDigit && hasLength;

  // Show match status only if confirmPassword isn't empty
  const showMatchIndicator = confirmPassword.length > 0;
  const doPasswordsMatch   = showMatchIndicator && password === confirmPassword;

  const handleSignup = async () => {
    Keyboard.dismiss();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields to continue.');
      return;
    }
    if (!isPasswordStrong) {
      Alert.alert('Weak Password', 'Your password must meet all listed requirements.');
      return;
    }
    if (!doPasswordsMatch) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }

    setLoading(true);
    try {
      // Create user
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Update displayName with first name
      await updateProfile(userCred.user, { displayName: firstName.trim() });

      navigation.navigate('Home');
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Signup Failed', 'Unable to create account. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9F9F9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <Image
          source={require('../assets/icon.png')}
          style={styles.icon}
          accessible
          accessibilityLabel="App Icon"
        />
        
        <Text style={styles.title}>Create Your Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* First Name */}
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Last Name */}
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          returnKeyType="next"
        />

        {/* Email */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          returnKeyType="next"
        />

        {/* Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={isSecure}
            textContentType="newPassword"
            returnKeyType="next"
          />
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.toggleVisibilityButton}
          >
            <Text style={{ color: primaryColor, fontWeight: '600' }}>
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password Requirements (always shown) */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementItem}>
            • At least one uppercase: {hasUpperCase ? '✅' : '❌'}
          </Text>
          <Text style={styles.requirementItem}>
            • At least one lowercase: {hasLowerCase ? '✅' : '❌'}
          </Text>
          <Text style={styles.requirementItem}>
            • At least one digit: {hasDigit ? '✅' : '❌'}
          </Text>
          <Text style={styles.requirementItem}>
            • Minimum 8 characters: {hasLength ? '✅' : '❌'}
          </Text>
        </View>

        {/* Confirm Password */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={isSecureConfirm}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => setIsSecureConfirm(!isSecureConfirm)}
            style={styles.toggleVisibilityButton}
          >
            <Text style={{ color: primaryColor, fontWeight: '600' }}>
              {isSecureConfirm ? 'Show' : 'Hide'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password match indicator (only if confirm is not empty) */}
        {showMatchIndicator && (
          <Text style={styles.matchIndicator}>
            {doPasswordsMatch ? 'Passwords match ✅' : 'Passwords do not match ❌'}
          </Text>
        )}

        {/* Sign Up button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Navigate to Login */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={{ color: primaryColor }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Styles
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
  requirementsContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  requirementItem: {
    fontSize: 14,
    color: subtleText,
  },
  matchIndicator: {
    fontSize: 14,
    color: subtleText,
    marginBottom: 16,
    paddingLeft: 4,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent:'center',
    alignItems:'center',
    marginVertical: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    color: darkText,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});