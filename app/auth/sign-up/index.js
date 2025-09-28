import Feather from '@expo/vector-icons/Feather';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { auth, db } from './../../../configs/FirebaseConfig';
import { Defines } from './../../../constants/Defines';

import AccentImage from '../../../assets/graphics/accent.png';

const SignUpPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rePasswordVisible, setRePasswordVisible] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !name || !rePassword || !address) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    if (password !== rePassword) {
      ToastAndroid.show('Passwords do not match.', ToastAndroid.SHORT);
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      ToastAndroid.show('Please enter a valid phone number.', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user || !user.uid) {
        throw new Error('User ID is unavailable.');
      }

      await setDoc(doc(db, 'UserDetails', user.uid), {
        name: name,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      });

      navigation.replace('Home');
    } catch (error) {
      let errorMessage = 'An unknown error occurred.';
  
      // Map Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please try again.';
          break;
      }
  
      setError(errorMessage);  
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground source={AccentImage} style={styles.accentImage}>

      <View style={styles.rectangleAccent}></View>

      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
          
          <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={name}
          onChangeText={setName}
          />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={email}
          onChangeText={setEmail}
          />
        <TextInput
          style={styles.input}
          placeholder="Address"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={address}
          onChangeText={setAddress}
          />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
          value={phoneNumber}
          onChangeText={(text) => {
            const formattedText = text.replace(/[^0-9]/g, '');
            setPhoneNumber(formattedText);
          }}
          keyboardType="phone-pad"
          />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
            />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
            >
            <Feather
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="black"
              />
          </TouchableOpacity>
        </View>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Re-enter Password"
            placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
            secureTextEntry={!rePasswordVisible}
            value={rePassword}
            onChangeText={setRePassword}
            />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setRePasswordVisible(!rePasswordVisible)}
            >
            <Feather
              name={rePasswordVisible ? 'eye' : 'eye-off'}
              size={24}
              color="black"
              />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSignUp} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.replace('SignIn')}>
            Sign In
          </Text>
        </Text>
      </View>
              </ImageBackground>
      </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: Defines.Colors.Black,
  },
  accentImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    padding: 20,
    backgroundColor: Defines.Colors.White,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 10,
  },
  rectangleAccent: {
    position: 'absolute',
    top: 10,
    right: -130,
    width: 250,
    height: 150,
    borderWidth: 15,
    borderRadius: 60,
    borderColor: Defines.Colors.White,
    opacity: 0.2,
  },
  title: {
    fontSize: 28,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Defines.Colors.TextColorWhite,
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
  },
  errorText: {
    color: Defines.Colors.Red,
    marginTop: 10,
    textAlign: 'center',
  },
  footerText: {
    marginTop: 20,
    fontSize: 14,
    color: Defines.Colors.TextColorBlack,
    fontFamily: Defines.Fonts.Regular,
    textAlign: 'center',
  },
  link: {
    color: Defines.Colors.ButtonColor,
    fontFamily: Defines.Fonts.Regular,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
});

export default SignUpPage;
