import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { db } from '../../configs/FirebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Defines } from './../../constants/Defines'; // Assuming you defined Fonts and Colors in this file

export default function PlaceOrderPage({ route, navigation }) {
  const { item } = route.params;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('Delivery'); // Default is Delivery
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalPrice = item.price * quantity;

  useEffect(() => {
    const fetchUserDetails = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'UserDetails', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name || '');
          setAddress(data.address || '');
          setPhone(data.phoneNumber || '');
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handlePlaceOrder = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      Alert.alert('Error', 'Please log in to place an order.');
      return;
    }
  
    // Validate quantity again
    if (quantity <= 0 || quantity > 50 || isNaN(quantity)) {
      Alert.alert('Error', 'Quantity must be a number between 1 and 50.');
      return;
    }
  
    // Validate totalPrice
    if (!isFinite(totalPrice) || isNaN(totalPrice)) {
      Alert.alert('Error', 'Total price calculation error. Please check your input.');
      return;
    }
  
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    try {
      const orderData = {
        itemName: item.name,
        itemDescription: item.description,
        itemPrice: item.price,
        quantity,
        totalPrice,
        customerName: name,
        address,
        phone,
        userId: user.uid,
        orderType,
        orderProgress: 'Arriving Soon',
        timestamp: new Date(),
        imageRef: item.imageRef || '', // Use imageRef or fallback to an empty string
      };
  
      const orderRef = collection(db, 'Orders', user.uid, 'cart');
      await setDoc(doc(orderRef), orderData);
      Alert.alert('Success', 'Order placed successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error placing order: ', error);
      Alert.alert('Error', 'There was an issue placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };  

  return (
    
    <View style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Food Image */}
      <Image source={{ uri: item.image }} style={styles.foodImage} />

      {/* Food Details */}
      <View style={styles.foodDetails}>
        <View style={styles.foodTitleContainer}>
          <Text style={styles.foodTitle}>{item.name}</Text>
          <Text style={styles.foodPrice}>₹{item.price}</Text>
        </View>
        <Text style={styles.foodDescription}>{item.description}</Text>
      </View>

      {/* Order Details */}
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.infoText}>{name}</Text>

      <Text style={styles.label}>Address:</Text>
      <Text style={styles.infoText}>{address}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.infoText}>{phone}</Text>

      <Text style={styles.label}>Quantity:</Text>
      <TextInput
        style={styles.quantityInput}
        keyboardType="numeric"
        value={String(quantity)}
        onChangeText={(val) => {
          const parsedValue = Number(val);
          if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 50) {
            Alert.alert('Invalid Quantity', 'Quantity must be a number between 1 and 50.');
            setQuantity(1); // Reset to default valid value
          } else {
            setQuantity(parsedValue);
          }
        }}
      />

      <Text style={styles.label}>Order Type:</Text>
      <View style={styles.orderTypeContainer}>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Delivery' && styles.selectedOrderType]}
          onPress={() => setOrderType('Delivery')}
        >
          <Text style={styles.orderTypeText}>Delivery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.orderTypeButton, orderType === 'Pickup' && styles.selectedOrderType]}
          onPress={() => setOrderType('Pickup')}
        >
          <Text style={styles.orderTypeText}>Pickup</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
      {/* Place Order Button */}
      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderText}>Place Order</Text>
        <Text style={styles.totalPriceText}>₹{totalPrice}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
    padding:20
  },
  foodImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
    alignSelf: 'center',
    elevation: 10,
  },
  foodDetails: {
    marginBottom: 10,
  },
  foodTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  foodTitle: {
    fontSize: 24,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
  },
  foodPrice: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorGreen,
  },
  foodDescription: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.PlaceHolderTextColor,
  },
  label: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    marginBottom: 5,
    color: Defines.Colors.TextColorBlack,
  },
  infoText: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 15,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: Defines.Colors.PlaceHolderTextColor,
    padding: 10,
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    marginBottom: 20,
    borderRadius: 5,
    width: 100,
    alignSelf: 'flex-start',
  },
  orderTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  orderTypeButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: Defines.Colors.PlaceHolderTextColor,
    borderRadius: 5,
    marginHorizontal: 5,
    width: '45%',
    alignItems: 'center',
  },
  selectedOrderType: {
    backgroundColor: Defines.Colors.ButtonColor,
    borderColor: Defines.Colors.TextColorBlack,
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Defines.Colors.ButtonColor,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-between',
    marginTop: 20,
    elevation: 5,
  },
  placeOrderText: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
  totalPriceText: {
    fontSize: 20,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
});
