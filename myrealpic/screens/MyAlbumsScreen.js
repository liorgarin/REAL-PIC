import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const albumSpacing = 10;
const sidePadding = 16;
const albumSize = (screenWidth - sidePadding * 2 - albumSpacing * 2) / 3;

const primaryColor = '#007BFF';
const darkText = '#333';
const subtleText = '#666';

const MyAlbumsScreen = () => {
  const navigation = useNavigation();
  const [arrivedAlbums, setArrivedAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'albums'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const arrived = [];
      querySnapshot.forEach((d) => {
        const album = { id: d.id, ...d.data() };
        if (album.status === 'Arrived') {
          arrived.push(album);
        }
      });
      setArrivedAlbums(arrived);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderAlbum = ({ item }) => (
    <TouchableOpacity
      style={styles.gridAlbumContainer}
      onPress={() => navigation.navigate('Gallery', { albumId: item.id, albumName: item.name })}
      accessible
      accessibilityLabel={`Open album ${item.name}`}
    >
      <Image
        source={{ uri: item.coverImage }}
        style={styles.albumCoverImage}
        resizeMode="cover"
      />
      <Text style={styles.albumGridTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>No arrived albums available.</Text>
      <Text style={styles.emptyStateSubtext}>
        Your printed albums will appear here once they’ve arrived.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Arrived Albums</Text>
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={arrivedAlbums}
          renderItem={renderAlbum}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          numColumns={3}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 20 }}
          accessible
          accessibilityLabel="Arrived Albums List"
        />
      )}
    </View>
  );
};

export default MyAlbumsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF1F0',
    paddingHorizontal: sidePadding,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: darkText,
    textAlign: 'center',
    marginBottom: 16,
  },
  gridAlbumContainer: {
    width: albumSize,
    marginBottom: 10,
    alignItems: 'center',
  },
  albumCoverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  albumGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: darkText,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: subtleText,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: subtleText,
  },
});