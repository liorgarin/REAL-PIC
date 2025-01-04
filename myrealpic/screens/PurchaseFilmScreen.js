import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const UNSPLASH_ACCESS_KEY = 'ieNut-c4yCxp7Dfaes5apXCwQXaaMA9KYQyFEmr9P9Q';

// Adjust these URLs to match your PayPal backend and success/cancel pages
const PAYPAL_SERVER_URL = 'https://ac739e552dd9.ngrok.app/create-order';
const SUCCESS_URL = 'https://ac739e552dd9.ngrok.app/success.html';
const CANCEL_URL = 'https://ac739e552dd9.ngrok.app/cancel.html';

const PurchaseFilmScreen = () => {
  const navigation = useNavigation();

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [couponAlbum, setCouponAlbum] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isNamingAlbum, setIsNamingAlbum] = useState(false);
  const [albumName, setAlbumName] = useState('');

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [showPayPalWebView, setShowPayPalWebView] = useState(false);
  const [payPalCheckoutUrl, setPayPalCheckoutUrl] = useState(null);

  const [couponCode, setCouponCode] = useState('');
  const [validCouponCode, setValidCouponCode] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerTitle: () => null,
      headerBackTitleVisible: false,
      headerLeft: () => <DrawerToggleButton />,
      headerRight: () => (
        <TouchableOpacity style={{ marginRight: 16 }} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const filmPackages = [
    {
      label: '18 photos',
      price: '$9',
      photoLimit: 18,
      description: 'Perfect for weekend trips and short events'
    },
    {
      label: '36 photos',
      price: '$18',
      photoLimit: 36,
      description: 'Perfect for a few days away and small outings',
      mostPopular: true
    },
    {
      label: '72 photos',
      price: '$27',
      photoLimit: 72,
      description: 'Perfect for extended travels and great stories'
    },
  ];

  const mostPopularPackage = filmPackages.find(pkg => pkg.mostPopular);

  const fetchRandomPhoto = async (albumName) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query: albumName, per_page: 1 },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      });
      if (response.data.results.length > 0) {
        return response.data.results[0].urls.small;
      }
      return 'https://via.placeholder.com/150';
    } catch {
      return 'https://via.placeholder.com/150';
    }
  };

  const handlePackageSelect = (pkg) => {
    if (selectedPackage && selectedPackage.label === pkg.label) {
      setSelectedPackage(null);
    } else {
      setSelectedPackage(pkg);
    }
  };

  const handlePurchaseConfirm = () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a package first.');
      return;
    }
    setDemoMode(false);
    setIsPaymentModalVisible(true);
  };

  const handleDemoConfirm = () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a package first.');
      return;
    }
    setDemoMode(true);
    setIsNamingAlbum(true);
    setAlbumName('');
  };

  const verifyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      Alert.alert('Error', 'Please enter a coupon code.');
      return;
    }
    try {
      const refData = doc(db, 'coupons', code);
      const snapshot = await getDoc(refData);
      if (snapshot.exists()) {
        setValidCouponCode(code);
        setCouponAlbum(true);
        setIsNamingAlbum(true);
      } else {
        Alert.alert('Invalid Coupon', 'This coupon code is not valid.');
      }
    } catch {
      Alert.alert('Error', 'Could not verify coupon. Try again later.');
    }
  };

  const createCouponAlbum = async () => {
    if (!albumName.trim()) {
      Alert.alert('Error', 'Please enter an album name.');
      return;
    }
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }
      const coverImage = await fetchRandomPhoto(albumName);
      const refData = collection(db, 'albums');
      await addDoc(refData, {
        userId,
        name: albumName.trim(),
        photoLimit: 6,
        photos: [],
        status: 'Active',
        coverImage,
        createdAt: new Date(),
        demoMode: 'no',
        promode: 'off',
        plusmode: 'off',
        ordernum: 'ORD' + Date.now()
      });
      if (validCouponCode) {
        await deleteDoc(doc(db, 'coupons', validCouponCode));
      }
      Alert.alert('Success', 'Your free 6-photo album has been created!');
      setIsNamingAlbum(false);
      setCouponAlbum(false);
      setValidCouponCode(null);
      setAlbumName('');
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', 'Failed to create album. Try again later.');
    }
  };

  const createNormalAlbum = async () => {
    if (!albumName.trim()) {
      Alert.alert('Error', 'Please enter an album name.');
      return;
    }
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Error', 'Not authenticated.');
        return;
      }
      const coverImage = await fetchRandomPhoto(albumName);
      const limit = selectedPackage ? selectedPackage.photoLimit : 6;
      const demo = demoMode ? 'yes' : 'no';
      await addDoc(collection(db, 'albums'), {
        userId,
        name: albumName.trim(),
        photoLimit: limit,
        photos: [],
        status: 'Active',
        coverImage,
        createdAt: new Date(),
        demoMode: demo,
        promode: 'off',
        plusmode: 'off',
        ordernum: 'ORD' + Date.now()
      });
      Alert.alert('Success', 'Album created successfully!');
      setIsNamingAlbum(false);
      setAlbumName('');
      navigation.navigate('Home');
    } catch {
      Alert.alert('Error', 'Failed to create album.');
    }
  };

  const createAlbum = () => {
    if (couponAlbum) {
      createCouponAlbum();
    } else {
      createNormalAlbum();
    }
  };

  const onWebViewNavigationStateChange = (navState) => {
    const { url } = navState;
    if (url.startsWith(SUCCESS_URL)) {
      setShowPayPalWebView(false);
      setIsPaymentModalVisible(false);
      setAlbumName('');
      setIsNamingAlbum(true);
    } else if (url.startsWith(CANCEL_URL)) {
      setShowPayPalWebView(false);
      setIsPaymentModalVisible(false);
    }
  };

  const startPaypalCheckout = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'No package selected.');
      return;
    }
    setIsPaymentModalVisible(false);
    const price = selectedPackage.price.replace('$', '').trim();
    try {
      const response = await axios.post(PAYPAL_SERVER_URL, { price });
      const { approveLink } = response.data;
      if (!approveLink) {
        Alert.alert('Error', 'No approval link from server.');
        return;
      }
      setPayPalCheckoutUrl(approveLink);
      setShowPayPalWebView(true);
    } catch {
      Alert.alert('Error', 'Unable to start PayPal checkout.');
    }
  };

  const isPackageSelected = !!selectedPackage;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.mainTitle}>Choose Your Film Package</Text>
          <Text style={styles.subtitle}>Select the number of photos that fits your needs.</Text>

          <View style={styles.packagesContainer}>
            {mostPopularPackage && (
              <View style={styles.mostPopularBadge}>
                <Text style={styles.mostPopularText}>MOST POPULAR</Text>
              </View>
            )}
            <View style={styles.packagesRow}>
              {filmPackages.map((pkg, idx) => {
                const isSelected = selectedPackage && selectedPackage.label === pkg.label;
                return (
                  <View key={idx} style={[styles.packageCard, isSelected && styles.packageSelected]}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 4 }}>
                      <Text style={styles.packageTitle}>{pkg.label}</Text>
                      <Text style={styles.packagePrice}>{pkg.price}</Text>
                      <Text style={styles.packageDescription}>{pkg.description}</Text>
                    </View>
                    <View style={{ width: '100%', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={[styles.chooseButton, isSelected && styles.chooseButtonSelected]}
                        onPress={() => handlePackageSelect(pkg)}
                      >
                        {isSelected ? (
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                        ) : (
                          <Text style={styles.chooseButtonText}>choose</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {isPackageSelected && (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#007BFF' }]}
                onPress={handlePurchaseConfirm}
              >
                <Text style={styles.buttonText}>Purchase a New Film</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#FFA500', marginTop: 12 }]}
                onPress={handleDemoConfirm}
              >
                <Text style={styles.buttonText}>Add as Demo Film</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isPackageSelected && (
            <View style={styles.couponContainer}>
              <Text style={styles.couponTitle}>Got a Coupon? Redeem it here</Text>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter coupon code"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                style={[styles.fullWidthButton, { backgroundColor: '#007BFF', marginTop: 12 }]}
                onPress={verifyCoupon}
              >
                <Text style={styles.fullWidthButtonText}>Confirm Coupon</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Payment Modal */}
          <Modal visible={isPaymentModalVisible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Complete Your Payment</Text>
                <Text style={{ marginBottom: 16 }}>
                  Price: {selectedPackage ? selectedPackage.price : ''}
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalPrimaryButton} onPress={startPaypalCheckout}>
                    <Text style={styles.modalButtonText}>Pay with PayPal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setIsPaymentModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* PayPal WebView Modal */}
          <Modal visible={showPayPalWebView} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { width: '90%', height: '80%' }]}>
                <Text style={styles.modalTitle}>Pay with PayPal</Text>
                <View style={{ flex: 1, width: '100%' }}>
                  <WebView
                    source={{ uri: payPalCheckoutUrl || CANCEL_URL }}
                    onNavigationStateChange={onWebViewNavigationStateChange}
                  />
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => setShowPayPalWebView(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Album Naming Modal */}
          <Modal visible={isNamingAlbum} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Name Your Album</Text>
                {couponAlbum && (
                  <Text style={{ marginBottom: 8, fontSize: 14, textAlign: 'center' }}>
                    You got a free 6-photo album!
                  </Text>
                )}
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter album name"
                  value={albumName}
                  onChangeText={setAlbumName}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.modalPrimaryButton} onPress={createAlbum}>
                    <Text style={styles.modalButtonText}>OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setIsNamingAlbum(false);
                      setCouponAlbum(false);
                      setValidCouponCode(null);
                      setAlbumName('');
                    }}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const primaryColor = '#007BFF';
const darkText = '#333';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ECF4F3'
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'flex-start'
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
    color: darkText
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    marginBottom: 24
  },
  packagesContainer: {
    position: 'relative',
    alignItems: 'center'
  },
  mostPopularBadge: {
    backgroundColor: '#007BFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: -10,
    zIndex: 10
  },
  mostPopularText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFF',
    textTransform: 'uppercase'
  },
  packagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30
  },
  packageCard: {
    width: '32%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    height: 220,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  packageSelected: {
    borderWidth: 2,
    borderColor: primaryColor
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: darkText,
    textAlign: 'center'
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '700',
    color: darkText,
    marginBottom: 8,
    textAlign: 'center'
  },
  packageDescription: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 12
  },
  chooseButton: {
    backgroundColor: '#CCC',
    borderRadius: 8,
    paddingVertical: 8,
    width: '95%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chooseButtonSelected: {
    backgroundColor: primaryColor
  },
  chooseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444'
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: 24
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '80%'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF'
  },
  fullWidthButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '80%'
  },
  couponContainer: {
    marginTop: 24,
    alignItems: 'center'
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkText,
    marginBottom: 8,
    textAlign: 'center'
  },
  couponInput: {
    width: '80%',
    backgroundColor: '#FFF',
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 340,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: darkText,
    textAlign: 'center'
  },
  modalInput: {
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    color: '#333'
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%'
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: primaryColor,
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center'
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: '600'
  }
});

export default PurchaseFilmScreen;