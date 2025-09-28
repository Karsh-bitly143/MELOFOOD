import Feather from '@expo/vector-icons/Feather';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from './../../../configs/FirebaseConfig';
import { Defines } from './../../../constants/Defines';

import AccentImage from '../../../assets/graphics/accent.png';

const SignInPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Track password visibility

  const handleSignIn = async () => {
    if (!email || !password) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Signed in:', user);
      navigation.replace('Home'); // Navigate to the home page after successful sign in
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Incorrect email.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please try again.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
          break;
      }
      setError(errorMessage); // Display the appropriate error message
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground source={AccentImage} style={styles.accentImage}>
          <View style={styles.rectangleAccent}></View>

        <View style={styles.container}>
          <Text style={styles.title}>Sign In</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
            value={email}
            onChangeText={(text) => setEmail(text)}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Defines.Colors.PlaceHolderTextColor}
              secureTextEntry={!passwordVisible} // Toggle visibility
              value={password}
              onChangeText={(text) => setPassword(text)}
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

          <TouchableOpacity onPress={handleSignIn} style={styles.button}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.footerText}>
            Don't have an account?{' '}
            <Text style={styles.link} onPress={() => navigation.replace('SignUp')}>
              Sign Up
            </Text>
          </Text>

          <Text style={styles.terms}>
            By signing in, you agree to our{' '}
            <Text style={styles.link}>Terms & Conditions</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>.
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
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
  },
  eyeIcon: {
    marginLeft: 10,
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
  terms: {
    marginTop: 10,
    fontSize: 12,
    color: Defines.Colors.PlaceHolderTextColor,
    textAlign: 'center',
    fontFamily: Defines.Fonts.Regular,
  },
  link: {
    color: Defines.Colors.ButtonColor,
    fontFamily: Defines.Fonts.Regular,
  },
});

export default SignInPage;
