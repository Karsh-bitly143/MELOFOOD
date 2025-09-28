import * as ImagePicker from 'expo-image-picker';
import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getMetadata, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Defines } from '../../constants/Defines';
import PlaceholderProfile from './../../assets/graphics/placeholder-profile.jpg';
import { auth, db, imageDb } from './../../configs/FirebaseConfig';

const ProfilePage = ({navigation}) => {

  const [photo, setPhoto] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    fetchUserDetails();
    requestPermission();
  }, []);

  const fetchUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'UserDetails', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserDetails(data);
        setName(data.name);
        setAddress(data.address);
        setPhoneNumber(data.phoneNumber);
        setPhoto(data.profilePicture || PlaceholderProfile); // Set the profile picture
      }
    }
  };  

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your gallery to change the profile picture.');
    }
  };

  const handlePhotoSelection = () => {
    if (photo && photo !== PlaceholderProfile) {
      // Show options to change or remove the custom profile photo
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          { text: 'Change Photo', onPress: () => selectNewPhoto() },
          { text: 'Remove Photo', onPress: () => removePhoto(), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      // Show options to set a new photo
      Alert.alert(
        'Profile Photo',
        'Choose an option',
        [
          { text: 'Set New Photo', onPress: () => selectNewPhoto() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };
  
  const selectNewPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    if (!result.canceled) {
      const selectedImageUri = result.assets[0].uri; 
      setPhoto(selectedImageUri); // Set the photo locally
  
      // Upload the selected image to Firebase Storage and save the URL in Firestore
      try {
        const downloadURL = await uploadImageToFirebase(selectedImageUri);
        console.log('Image uploaded successfully. Download URL:', downloadURL);
        
        // Save the download URL in Firestore
        await saveProfilePictureUrl(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Could not upload the image.');
      }
    }
  };

  const uploadImageToFirebase = async (uri) => {
    const user = auth.currentUser; // Get the current user
    if (!user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated'); // Throw an error if no user is found
    }
  
    try {
      const response = await fetch(uri); // Fetch the file
      const blob = await response.blob(); // Convert file to blob
  
      const storageRef = ref(imageDb, `profilePictures/${user.uid}.jpg`); // Create storage reference
  
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, blob);
  
      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
  
      return downloadURL; // Return the download URL for later use
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
      throw error; // Propagate the error
    }
  };
  

  const saveProfilePictureUrl = async (downloadURL) => {
    const user = auth.currentUser;
    if (!downloadURL) {
      console.error('Invalid download URL');
      Alert.alert('Error', 'Failed to retrieve the download URL. Please try again.');
      return;
    }
  
    if (user) {
      try {
        // Save the download URL to Firestore under 'UserDetails'
        await updateDoc(doc(db, 'UserDetails', user.uid), {
          profilePicture: downloadURL, // Update the profile picture field
        });
  
        // Optionally: Fetch updated user details after saving the image
        fetchUserDetails();
  
        Alert.alert('Success', 'Profile picture updated successfully!');
      } catch (error) {
        console.error('Error saving profile picture URL to Firestore:', error);
        Alert.alert('Error', 'Could not save profile picture.');
      }
    }
  };

  const removePhoto = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
  
    try {
      // Delete the profile picture field in Firestore
      await updateDoc(doc(db, 'UserDetails', user.uid), {
        profilePicture: deleteField(), // Remove the profilePicture field
      });
  
      // Delete the photo from Firebase Storage
      await deleteProfilePictureFromStorage(`profilePictures/${user.uid}.jpg`);
  
      // Reset the photo to the placeholder
      setPhoto(PlaceholderProfile);
  
      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      Alert.alert('Error', 'Could not remove the profile picture.');
    }
  };
  
  const handleEditDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, 'UserDetails', user.uid), {
          name,
          address,
          phoneNumber,
        });
        Alert.alert('Success', 'Your details have been updated!');
        fetchUserDetails();
        setModalVisible(false);
      } catch (error) {
        Alert.alert('Error', 'Could not update your details.');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
  
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
  
    // Confirmation dialog
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Start by checking if all services can be accessed
              const storagePath = `profilePictures/${user.uid}.jpg`;
  
              // Step 1: Check Storage (if photo exists and is not the placeholder)
              if (photo && photo !== PlaceholderProfile) {
                const storage = getStorage();
                const fileRef = ref(storage, storagePath);
                try {
                  await getMetadata(fileRef); // Check if the file exists
                } catch (error) {
                  if (error.code === 'storage/object-not-found') {
                    console.warn('Profile picture does not exist in storage.');
                  } else {
                    throw new Error('Storage access failed.');
                  }
                }
              }
  
              // Step 2: Check Firestore access
              const userDoc = await getDoc(doc(db, 'UserDetails', user.uid));
              if (!userDoc.exists()) throw new Error('Firestore access failed.');
  
              // Step 3: Proceed to delete all data atomically
              // Delete the profile picture if it exists
              const deleteStoragePromise =
                photo && photo !== PlaceholderProfile
                  ? deleteProfilePictureFromStorage(storagePath)
                  : Promise.resolve();
  
              // Delete user orders from Firestore
              const ordersRef = collection(db, 'Orders', user.uid, 'cart');
              const ordersSnapshot = await getDocs(ordersRef);
              const deleteOrdersPromise = Promise.all(
                ordersSnapshot.docs.map((orderDoc) => deleteDoc(doc(ordersRef, orderDoc.id)))
              );
  
              // Delete user details from Firestore
              const deleteUserDetailsPromise = deleteDoc(doc(db, 'UserDetails', user.uid));
  
              // Execute all deletions
              await Promise.all([deleteStoragePromise, deleteOrdersPromise, deleteUserDetailsPromise]);
  
              // Step 4: Delete the user from Firebase Authentication
              await user.delete();
  
              // Notify success
              Alert.alert('Success', 'Your account has been deleted.');
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error deleting account:', error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Error', 'You need to re-login before deleting your account. Please log in and try again.');
              } else {
                Alert.alert('Error', 'Failed to delete your account. Please try again.');
              }
            }
          },
        },
      ]
    );
  };
  
  // Utility function for deleting the profile picture from Firebase Storage
  const deleteProfilePictureFromStorage = async (filePath) => {
    const storage = getStorage();
    const fileRef = ref(storage, filePath);
  
    try {
      await deleteObject(fileRef);
      console.log('Profile picture deleted successfully from storage.');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      throw new Error('Failed to delete profile picture from storage.');
    }
  };
  
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign the user out
      navigation.replace('Home', { screen: 'Login' }); // Navigate to the login screen
      Alert.alert('Success', 'You have logged out successfully.'); // Optional success alert
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Could not log out. Please try again.');
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileDetailsContainer}>
          <TouchableOpacity onPress={handlePhotoSelection} style={styles.photoContainer}>
          <Image source={photo && typeof photo === 'string' ? { uri: photo } : PlaceholderProfile} style={styles.photo}/>
          </TouchableOpacity>

          <View style={styles.nameAndEmailContainer}>
            <Text style={styles.nameText}>{userDetails.name || 'null'}</Text>
            <Text style={styles.addressAndPhoneText}>{userDetails.address || 'null'}</Text>
            <Text style={styles.addressAndPhoneText}>{userDetails.phoneNumber || 'null'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsSection}>

        <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.actionText}>Edit Details</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}
        onPress={() => { navigation.replace('Home', { screen: 'Cart' });}}>
          <Text style={styles.actionText}>Order History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
        <Text style={styles.actionText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[ 
          styles.actionButton, { backgroundColor: Defines.Colors.Red }]} 
          onPress={handleDeleteAccount}>
            <Text style={styles.actionText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <Text style={styles.modalTitle}>Edit Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

<View style={styles.modalButtonsContainer}>
  <TouchableOpacity
    style={[
      styles.modalActionButton,
      { backgroundColor: Defines.Colors.ButtonColor }
    ]}
    onPress={handleEditDetails}
  >
    <Text style={styles.modalActionText}>Update</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[
      styles.modalActionButton,
      { backgroundColor: Defines.Colors.Red }
    ]}
    onPress={() => setModalVisible(false)}
  >
    <Text style={styles.modalActionText}>Cancel</Text>
  </TouchableOpacity>
</View>

    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
    padding: 20,
    marginTop:14,
  },
  profileSection: {
    backgroundColor: Defines.Colors.TextColorWhite,
    padding: 20,
    borderRadius: 15,
    marginBottom: 40,
    marginTop: 40,
    alignItems: 'center',
    elevation: 10,
  },
  profileDetailsContainer: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: Defines.Colors.ButtonColor,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  nameAndEmailContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
  },
  addressAndPhoneText: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorGray,
    marginBottom: 10,
  },
  actionsSection: {
    marginTop: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: Defines.Colors.ButtonColor,
    padding: 15,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
    elevation:5,
  },
  actionText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: Defines.Colors.TextColorWhite,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: Defines.Fonts.Bold,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: Defines.Colors.Black,
    borderRadius:10,
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    width: '100%',
  },
  modalButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },  
  modalActionButton: {
    padding: 5,
    borderRadius: 15,
    width: '120%',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal:20,
    elevation:5,
  },
  modalActionText: {
    fontSize: 15,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
});

export default ProfilePage;
