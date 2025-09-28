import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Defines } from '../../constants/Defines';

// Screens
import CartPage from '../tabs/cart';
import HomePage from '../tabs/home';

const Tab = createBottomTabNavigator();

const tabBarOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: Defines.Colors.PrimaryWhite,
    height: 80,
    paddingBottom: 10,
    paddingTop: 10,
    borderTopWidth: 0, // Remove the border line at the top of the tab bar
    elevation: 0, // Android: Remove shadow
    shadowOpacity: 0, // iOS: Remove shadow
  },
  tabBarLabelStyle: {
    fontSize: 15,
    fontFamily: Defines.Fonts.Bold,
  },
  tabBarActiveTintColor: Defines.Colors.Black,
  tabBarInactiveTintColor: Defines.Colors.tabBarInactiveTintColor,
};

const TabNavigator = () => {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'Food',
          tabBarIcon: ({ color, size }) => (
            <View style={{ marginTop: 6 }}>
              <FontAwesome6 name="bowl-food" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={{
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View style={{ marginTop: 6 }}>
              <AntDesign name="shoppingcart" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
