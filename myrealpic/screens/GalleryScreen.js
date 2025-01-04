import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Dimensions, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { doc, onSnapshot, updateDoc, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const screenWidth = Dimensions.get('window').width;
const sidePadding = 16;
const albumSpacing = 10;
const albumSize = (screenWidth - sidePadding * 2 - albumSpacing * 2) / 3;

const primaryColor = '#007BFF';
const darkText = '#333';
const subtleText = '#666';

const GalleryScreen = ({ route, navigation }) => {
  const albumId = route.params?.albumId || null;
  const albumName = route.params?.albumName || 'Album Gallery';
  const canDelete = route.params?.canDelete || false;

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (albumId) {
      const albumRef = doc(db, 'albums', albumId);
      const unsubscribe = onSnapshot(albumRef, (docSnap) => {
        if (docSnap.exists()) {
          const albumData = docSnap.data();
          setPhotos(albumData?.photos || []);
        } else {
          setPhotos([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [albumId]);

  const openPhotoModal = (index) => {
    setSelectedPhotoIndex(index);
    setIsModalVisible(true);
  };

  const closePhotoModal = () => {
    setIsModalVisible(false);
    setSelectedPhotoIndex(0);
  };

  const updateAlbumStatusAfterDeletion = async (albumIdParam) => {
    try {
      const albumRef = doc(db, 'albums', albumIdParam);
      const updatedAlbumSnapshot = await getDoc(albumRef);
      const albumData = updatedAlbumSnapshot.data();

      let newStatus = 'Active';
      if (albumData.photos.length === albumData.photoLimit) {
        newStatus = 'Ready to Print';
      } else if (albumData.photos.length < albumData.photoLimit) {
        newStatus = 'Active';
      }

      await updateDoc(albumRef, { status: newStatus });
    } catch (error) {
      console.error('Error updating album status after deletion:', error);
    }
  };

  const deleteCurrentPhoto = async () => {
    if (selectedPhotoIndex < 0 || selectedPhotoIndex >= photos.length) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const photoToDelete = photos[selectedPhotoIndex];
            try {
              const albumRef = doc(db, 'albums', albumId);
              await updateDoc(albumRef, {
                photos: arrayRemove(photoToDelete)
              });

              const updatedPhotos = photos.filter((_, i) => i !== selectedPhotoIndex);
              setPhotos(updatedPhotos);

              await updateAlbumStatusAfterDeletion(albumId);

              if (updatedPhotos.length === 0) {
                closePhotoModal();
              } else {
                const newIndex = Math.min(selectedPhotoIndex, updatedPhotos.length - 1);
                setSelectedPhotoIndex(newIndex);
              }

              Alert.alert('Deleted', 'The photo has been deleted.');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const renderPhoto = ({ item, index }) => (
    <TouchableOpacity onPress={() => openPhotoModal(index)} accessible accessibilityLabel="View photo">
      <Image source={{ uri: item }} style={styles.photo} />
    </TouchableOpacity>
  );

  const renderFullPhoto = ({ item }) => (
    <View style={styles.fullPhotoContainer}>
      <Image source={{ uri: item }} style={styles.fullPhoto} resizeMode="contain" />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateTitle}>No Photos</Text>
      <Text style={styles.emptyStateSubtitle}>Add some photos to this album to view them here.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityLabel={`Viewing album: ${albumName}`}>
        {albumName}
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ paddingBottom: 20 }}
          accessible
          accessibilityLabel="Album Photos List"
        />
      )}

      <Modal visible={isModalVisible} transparent animationType="fade" onRequestClose={closePhotoModal}>
        <View style={styles.modalOverlay}>
          <FlatList
            data={photos}
            renderItem={renderFullPhoto}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            pagingEnabled
            initialScrollIndex={selectedPhotoIndex}
            onMomentumScrollEnd={(ev) => {
              const offsetX = ev.nativeEvent.contentOffset.x;
              const newIndex = Math.round(offsetX / screenWidth);
              setSelectedPhotoIndex(newIndex);
            }}
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            showsHorizontalScrollIndicator={false}
            accessible
            accessibilityLabel="Full-sized Photo Viewer"
          />

          <TouchableOpacity style={styles.closeButton} onPress={closePhotoModal} accessible accessibilityLabel="Close Photo Viewer">
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>

          {photos.length > 0 && (
            <View style={styles.photoCountIndicator}>
              <Text style={styles.photoCountText}>{selectedPhotoIndex + 1} / {photos.length}</Text>
            </View>
          )}

          {canDelete && photos.length > 0 && (
            <TouchableOpacity
              style={[styles.deleteButton, deleting && { backgroundColor: 'rgba(255,0,0,0.4)' }]}
              onPress={deleteCurrentPhoto}
              disabled={deleting}
              accessible
              accessibilityLabel="Delete Current Photo"
            >
              {deleting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default GalleryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: sidePadding,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: darkText,
    marginBottom: 16,
    textAlign: 'center',
  },
  photo: {
    width: albumSize,
    height: albumSize,
    margin: 6,
    borderRadius: 8,
    backgroundColor: '#EEE',
  },
  emptyStateContainer: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: subtleText,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: subtleText,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  fullPhotoContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(255,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '700',
  },
  photoCountIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  photoCountText: {
    color: '#FFF',
    fontWeight: '600',
  },
});