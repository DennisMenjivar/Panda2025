import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../Panda/_screens/Home';
import ControlLimites from '../Panda/_screens/ControlLimites';
import { Button, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DiariaTicket from './_screens/DiariaTicket';
import { GlobalProvider } from './context/GlobalContext';
import Toast from 'react-native-toast-message';
import { toastConfig } from './constants';
import TicketsScreen from './_screens/TicketsScreen';
import TicketsByIDDetalleScreen from './_screens/TicketsByIDDetalleScreen';

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
  return (
    <GlobalProvider>
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
          initialRouteName="Panda"
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
            component={TicketsScreen}
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
            component={ControlLimites}
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
          <Drawer.Screen
            name="DiariaTicket"
            component={DiariaTicket}
            options={{
              title: 'Ticket',
              drawerItemStyle: { display: 'none' },
              headerBackTitleVisible: false,
              headerBackVisible: true,
            }}
          />
          <Drawer.Screen
            name="TicketsByIDDetalle"
            component={TicketsByIDDetalleScreen}
            options={{
              title: 'Ticket',
              drawerItemStyle: { display: 'none' },
              headerBackTitleVisible: false,
              headerBackVisible: true,
            }}
          />
        </Drawer.Navigator>
        <Toast config={toastConfig} />
      </NavigationContainer>
    </GlobalProvider>
  );
}
