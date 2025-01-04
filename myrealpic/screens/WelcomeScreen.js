import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const logoSource = require('../assets/icon.png');
const cameraHandSource = require('../assets/camera-hand.png');
const boxHandSource = require('../assets/box-hand.png');
const photosSource = require('../assets/photos.png');

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const startButtonOpacity = useRef(new Animated.Value(1)).current;
  const startButtonTranslateY = useRef(new Animated.Value(0)).current;

  const cameraHandTranslateX = useRef(new Animated.Value(-screenWidth)).current;
  const cameraTextOpacity = useRef(new Animated.Value(0)).current;

  const boxHandTranslateX = useRef(new Animated.Value(screenWidth)).current;
  const boxTextOpacity = useRef(new Animated.Value(0)).current;

  const photosTranslateY = useRef(new Animated.Value(screenHeight)).current;
  const photosTextOpacity = useRef(new Animated.Value(0)).current;

  const actionButtonsOpacity = useRef(new Animated.Value(0)).current;

  const handleStart = () => {
    Animated.parallel([
      Animated.timing(logoTranslateY, {
        toValue: -screenHeight * 0.30,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(startButtonTranslateY, {
        toValue: 100,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(startButtonOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      animateSecondPhase();
    });
  };

  const animateSecondPhase = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cameraHandTranslateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cameraTextOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(boxHandTranslateX, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(boxTextOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(photosTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(photosTextOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.timing(actionButtonsOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.initialContent}>
        <Animated.Image
          source={logoSource}
          style={[
            styles.logo,
            {
              transform: [
                { translateY: logoTranslateY },
                { scale: logoScale },
              ],
            },
          ]}
          resizeMode="contain"
        />

        <Animated.View
          style={{
            opacity: startButtonOpacity,
            transform: [{ translateY: startButtonTranslateY }],
          }}
        >
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Let's start</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.cameraContainer,
          { transform: [{ translateX: cameraHandTranslateX }] },
        ]}
      >
        <Image
          source={cameraHandSource}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
        <Animated.Text
          style={[styles.infoTextCamera, { opacity: cameraTextOpacity }]}
        >
          CAPTURE YOUR SPECIAL MOMENTS
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.boxContainer,
          { transform: [{ translateX: boxHandTranslateX }] },
        ]}
      >
        <Animated.Text style={[styles.infoTextBox, { opacity: boxTextOpacity }]}>
          Get photos or albums delivered to you
        </Animated.Text>
        <Image
          source={boxHandSource}
          style={styles.illustrationImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.photosContainer,
          { transform: [{ translateY: photosTranslateY }] },
        ]}
      >
        <Image
          source={photosSource}
          style={styles.illustrationImageLarge}
          resizeMode="contain"
        />
        <Animated.Text
          style={[styles.infoTextCenter, { opacity: photosTextOpacity }]}
        >
          Rediscover your moments, relive joy.
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[styles.actionsContainer, { opacity: actionButtonsOpacity }]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007BFF' }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.actionButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#DDD', marginLeft: 16 }]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={[styles.actionButtonText, { color: '#333' }]}>Signup</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  initialContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#0019FF',
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cameraContainer: {
    position: 'absolute',
    top: screenHeight * 0.2,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth,
  },
  boxContainer: {
    position: 'absolute',
    top: screenHeight * 0.38,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth,
    justifyContent: 'flex-end',
  },
  photosContainer: {
    position: 'absolute',
    top: screenHeight * 0.55,
    width: screenWidth,
    alignItems: 'center',
  },
  illustrationImage: {
    width: 200,
    height: 200,
  },
  illustrationImageLarge: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  infoTextCamera: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    maxWidth: screenWidth * 0.4,
    marginLeft: 5,
    textAlign: 'center',
  },
  infoTextBox: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    maxWidth: screenWidth * 0.35,
    marginRight: 25,
    textAlign: 'center',
  },
  infoTextCenter: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    maxWidth: screenWidth * 0.5,
    lineHeight: 20,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    width: screenWidth,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 50,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});