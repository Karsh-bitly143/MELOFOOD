import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { db } from '../../configs/FirebaseConfig';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Defines } from './../../constants/Defines'; // Adjust the import path as needed

export default function CartPage({ navigation }) {
  const [orders, setOrders] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      alert("Please log in to view your cart.");
      return;
    }

    const ordersRef = collection(db, 'Orders', user.uid, 'cart');

    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [user]);

  const cancelOrder = async (orderId) => {
    const orderRef = doc(db, 'Orders', user.uid, 'cart', orderId);
    try {
      await deleteDoc(orderRef);
      Alert.alert("Success", "Order has been cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling order: ", error);
      Alert.alert("Error", "There was a problem cancelling your order. Please try again.");
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.foodItemContainer}>
      {/* Food Image */}
      <Image source={{ uri: item.imageRef }} style={styles.foodImageLeft} />

      {/* Food Details */}
      <View style={styles.foodDetails}>
        <Text style={styles.foodName}>{item.itemName}</Text>
        <Text style={styles.foodQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.foodPrice}>{'₹' + item.totalPrice}</Text>
      </View>

      {/* Cancel Button */}
      <TouchableOpacity
        onPress={() => cancelOrder(item.id)}
        style={styles.cancelButton}
      >
        <Text style={styles.cancelButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {orders.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.startOrderingButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Start Ordering</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
  flatList: {
    padding: 20,
  },
  foodItemContainer: {
    flexDirection: 'row',
    backgroundColor: Defines.Colors.White,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  foodImageLeft: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  foodDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  foodName: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 5,
  },
  foodQuantity: {
    fontSize: 14,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
    fontFamily: Defines.Fonts.Regular,
  },
  foodPrice: {
    fontSize: 16,
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorGreen,
  },
  cancelButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Defines.Colors.Cancelled,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth:2,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Defines.Colors.TextColorWhite,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: Defines.Colors.TextColorBlack,
    fontFamily: Defines.Fonts.Regular,
    marginBottom: 20,
  },
  startOrderingButton: {
    backgroundColor: Defines.Colors.ButtonColor,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorWhite,
  },
});
