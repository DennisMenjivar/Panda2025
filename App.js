import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../Panda/_screens/Home';
import { Button, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useEffect, useState } from 'react';
import { getTotalLempirasFromDraftTicket } from './database/DiariaModel';
function NotificationsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button onPress={navigation.openDrawer} title="Open navigation drawer" />
      <Button onPress={() => navigation.goBack()} title="Go back home" />
    </View>
  );
}

const Drawer = createDrawerNavigator();

export default function App() {
  const [total_lempiras, setTotal_lempiras] = useState(0);

  const loadData = async () => {
    const tl = await getTotalLempirasFromDraftTicket();
    if (tl) setTotal_lempiras(tl);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2d2b2d', // 🔵 Top header background color
          },
          headerTintColor: '#ffffff', // ⚪ Text and icon color
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
        initialRouteName="Home"
      >
        <Drawer.Screen
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="home-outline" // change this to any icon name you want
                size={size}
                color={color}
              />
            ),
            headerRight: () => (
              <View style={{ marginRight: 15 }}>
                {total_lempiras > 0 && (
                  <Icon
                    name="cash-outline"
                    size={25}
                    color="#fff"
                    onPress={() => {
                      // 👉 Do something here
                      console.log('Right button pressed!');
                      // Or navigate: navigation.navigate('SomeScreen')
                    }}
                  />
                )}
              </View>
            ),
          }}
          name="Panda"
          component={HomeScreen}
        />
        <Drawer.Screen
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="book-outline" // change this to any icon name you want
                size={size}
                color={color}
              />
            ),
          }}
          name="Tickets"
          component={NotificationsScreen}
        />
        <Drawer.Screen
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="bar-chart-outline" // change this to any icon name you want
                size={size}
                color={color}
              />
            ),
          }}
          name="Consolidado"
          component={NotificationsScreen}
        />
        <Drawer.Screen
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="code-outline" // change this to any icon name you want
                size={size}
                color={color}
              />
            ),
          }}
          name="Control limites"
          component={NotificationsScreen}
        />
        <Drawer.Screen
          options={{
            drawerIcon: ({ focused, color, size }) => (
              <Icon
                name="file-tray-stacked-outline" // change this to any icon name you want
                size={size}
                color={color}
              />
            ),
          }}
          name="Cierres"
          component={NotificationsScreen}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
