import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { Defines } from './../constants/Defines';

import FoodImage from './../assets/graphics/hero.png';
import AccentImage from './../assets/graphics/accent.png';

const LoginPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Accent Image in the Background */}
      <ImageBackground source={AccentImage} style={styles.accentImage}>
        {/* Overlay Content */}
        <View style={styles.content}>
          {/* Rectangle Accent in Top Right */}
          <View style={styles.rectangleAccent}></View>

          {/* Food Image */}
          <Image style={styles.image} source={FoodImage} />

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Food and grocery delivery from restaurants and stores!
          </Text>

          {/* Button */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignIn')} 
            style={styles.button}
          >
            <Text style={styles.buttonText}>START USING</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.Black,
  },
  accentImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 20,
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
  image: {
    padding: 50,
    zIndex: 2, // Ensures it stays above the background accent
  },
  subtitle: {
    color: Defines.Colors.TextColorWhite,
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: Defines.Fonts.Regular,
    zIndex: 2,
  },
  button: {
    backgroundColor: Defines.Colors.ButtonColor,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    zIndex: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: Defines.Fonts.Bold,
  },
});

export default LoginPage;
