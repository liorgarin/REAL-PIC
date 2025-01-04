import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerToggleButton
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';

import { auth } from './firebase';
import { signOut } from 'firebase/auth';

import MyAlbumsScreen from './screens/MyAlbumsScreen'; 
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import GalleryScreen from './screens/GalleryScreen';
import PurchaseFilmScreen from './screens/PurchaseFilmScreen';
import EnterCouponScreen from './screens/EnterCouponScreen';
import WelcomeScreen from './screens/WelcomeScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function CustomDrawerContent(props) {
  // Extract displayName from the currently signed-in user, if available
  const user = auth.currentUser;
  const displayName = user?.displayName || '';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      props.navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={stylesDrawer.logoContainer}>
        <Image source={require('./assets/icon.png')} style={stylesDrawer.logo} />
        {displayName ? (
          <Text style={stylesDrawer.greetingText}>Hello, {displayName}</Text>
        ) : null}
      </View>

      {/* Normal drawer items */}
      <DrawerItemList {...props} />

      {/* Logout button at bottom */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#FF3B30',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: '#FFF', fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function BottomTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Active':
              iconName = focused ? 'film' : 'film-outline';
              break;
            case 'Ready to Print':
              iconName = focused ? 'print' : 'print-outline';
              break;
            case 'On the Way':
              iconName = focused ? 'airplane' : 'airplane-outline';
              break;
            case 'Arrived':
              iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen
        name="Active"
        component={(props) => <HomeScreen {...props} tab="Active" />}
      />
      <Tab.Screen
        name="Ready to Print"
        component={(props) => <HomeScreen {...props} tab="Ready to Print" />}
      />
      <Tab.Screen
        name="On the Way"
        component={(props) => <HomeScreen {...props} tab="On the Way" />}
      />
      <Tab.Screen
        name="Arrived"
        component={(props) => <HomeScreen {...props} tab="Arrived" />}
      />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Home" component={BottomTabsNavigator} />
      <Drawer.Screen name="My Albums" component={MyAlbumsScreen} />
      {/*
        Specifying drawerLabel ensures the text remains visible in the menu,
        no matter the route usage.
      */}
      <Drawer.Screen
        name="PurchaseFilm"
        component={PurchaseFilmScreen}
        options={{ drawerLabel: 'Purchase Film' }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* The initial welcome screen */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* Auth-related screens */}
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Main Home is the drawer */}
        <Stack.Screen
          name="Home"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />

        {/* PurchaseFilm with a custom header */}
        <Stack.Screen
          name="PurchaseFilm"
          component={PurchaseFilmScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: '',
            headerTitle: () => null,
            headerBackTitleVisible: false,
            headerBackVisible: false,
            headerLeft: () => (
              <DrawerToggleButton />
            ),
            headerRight: () => (
              <TouchableOpacity
                style={{ marginRight: 16 }}
                onPress={() => navigation.navigate('Home')}
              >
                <Ionicons name="home" size={24} color="black" />
              </TouchableOpacity>
            ),
          })}
        />

        {/* Albums gallery + optional coupon screen */}
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="EnterCoupon" component={EnterCouponScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const stylesDrawer = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  greetingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});