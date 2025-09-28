import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Defines } from '../../constants/Defines';
import { db } from './../../configs/FirebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function MenuPage({ route }) {
  const navigation = useNavigation();

  const flatListRef = useRef(null);
  const { index } = route.params || { index: 0 };
  const [scrollIndex, setScrollIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'FoodItems'), (snapshot) => {
      const foodItems = snapshot.docs.map((doc) => {
        const foodData = doc.data();
        return {
          id: doc.id,
          name: foodData.name,
          image: foodData.imageRef || 'https://via.placeholder.com/150',
          price: foodData.price,
          category: foodData.category
        };
      });
  
      // Group items by category
      const groupedCategories = foodItems.reduce((acc, currentItem) => {
        const { category } = currentItem;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(currentItem);
        return acc;
      }, {});
  
      // Convert to an array and sort categories alphabetically
      const categoryArray = Object.keys(groupedCategories).map((category) => ({
        category,
        items: groupedCategories[category],
      })).sort((a, b) => a.category.localeCompare(b.category)); // Sort alphabetically
  
      setCategories(categoryArray);
      setLoading(false);
  
      if (index !== undefined && categoryArray.length > 0 && flatListRef.current) {
        setScrollIndex(index);
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
      
    });
  
    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [index]);

  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });

  const onScrollToIndexFailed = (info) => {
    flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
  };

  // Render each food item
  const renderFoodItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('PlaceOrder', { item })}>
      <View style={styles.foodCard}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>{'₹' + item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render each category and its items
  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <FlatList
        data={item.items}  // Display items in the category
        renderItem={renderFoodItem}
        keyExtractor={(food) => food.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.foodList}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Defines.Colors.TextColorBlack} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={categories}
        renderItem={renderCategory}
        keyExtractor={item => item.category} // Key by category
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        initialScrollIndex={index < categories.length ? index : 0} 
        style={styles.flatList}
        contentContainerStyle={styles.scrollViewContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
  flatList: {
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
  scrollViewContent: {
    padding: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 25,
    fontFamily: Defines.Fonts.Bold,
    color: Defines.Colors.TextColorBlack,
    marginBottom: 10,
  },
  foodList: {
    marginBottom: 10,
  },
  foodCard: {
    backgroundColor: Defines.Colors.TextColorWhite,
    borderRadius: 10,
    padding: 15, // Slightly increased padding
    marginRight: 15, // Increased margin between food cards
    alignItems: 'center',
    shadowColor: Defines.Colors.TextColorBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  foodImage: {
    width: 150, // Increased image width
    height: 150, // Increased image height
    borderRadius: 10,
    resizeMode: 'cover',
  },
  foodName: {
    fontSize: 16, // Slightly increased font size
    fontFamily: Defines.Fonts.Regular,
    color: Defines.Colors.TextColorBlack,
    textAlign: 'center',
    marginTop: 5,
  },
  foodPrice: {
    fontSize: 18,
    color: Defines.Colors.TextColorBlack,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Defines.Colors.PrimaryWhite,
  },
});
