import {
  View,
  Text,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createTables,
  insertDiariaTicketIfNotExists,
  insertDetalleAndUpdateTicket,
  getTotalLempirasFromDraftTicket,
  checkAvailabilityByNumber,
  getAvailabilityAmountByNumber,
  getDetalleCountByDraftTicket,
  getCurrentActiveUser,
  saveUserToSQLite,
} from '../database/DiariaModel';
import * as Clipboard from 'expo-clipboard';
import { message, styles } from '../constants';
import { GlobalContext } from '../context/GlobalContext'; // adjust path
import { useFocusEffect } from '@react-navigation/native';
import { getUserById } from '../firebaseController';
import { Pressable } from 'react-native';

const screenHeight = Dimensions.get('window').height;

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState();
  const [userIdInput, setUserIdInput] = useState('');
  const { countTicketDetail, setCountTicketDetail } = useContext(GlobalContext);
  const [total_lempiras, setTotal_lempiras] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketID, setTicketID] = useState(0);
  const [numberSelected, setNumberSelected] = useState({
    number: 0,
    lempiras: 0,
  });
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [totalAvailablePerNumber, setTotalAvailablePerNumber] = useState(0);
  const [option, setOption] = useState('Numero'); //Lempira, Numero
  const [principalButtons, setPrincipalButtons] = useState([
    { value: 1, name: '1' },
    { value: 2, name: '2' },
    { value: 3, name: '3' },
    { value: 4, name: '4' },
    { value: 5, name: '5' },
    { value: 6, name: '6' },
    { value: 7, name: '7' },
    { value: 8, name: '8' },
    { value: 9, name: '9' },
    { value: -1, name: 'AC' },
    { value: 0, name: '0' },
    { value: -2, name: '>' },
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setOption('Numero');
      setNumberSelected({ number: 0, lempiras: 0 });

      const fetchData = async () => {
        const tables = await createTables();
        const cuser = await getCurrentActiveUser();
        if (tables && cuser) {
          if (!isActive) return;
          setUser(cuser);

          const tid = await insertDiariaTicketIfNotExists();
          if (tid && isActive) setTicketID(tid);

          const tl = await getTotalLempirasFromDraftTicket();
          if (isActive) setTotal_lempiras(tl || 0);

          const count = await getDetalleCountByDraftTicket();
          if (isActive) setCountTicketDetail(count || 0);

          // if (cuser) {
          //   message(
          //     'success',
          //     'Bienvenido',
          //     'Buen día ' + cuser.name,
          //     'top',
          //     2000
          //   );
          // }
        }
      };

      fetchData();

      return () => {
        isActive = false; // Cleanup in case screen unmounts early
      };
    }, [countTicketDetail])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setNumberSelected({
      number: 0,
      lempiras: 0,
    });
    setOption('Numero');
    setPrincipalButtons((prev) =>
      prev.map((button) =>
        button.value === -2 ? { ...button, name: '>' } : button
      )
    );
    setRefreshing(false);
  };

  const handleClick = async (btn) => {
    if (btn.value === -1) {
      if (option === 'Numero') {
        setNumberSelected((prev) => ({
          ...prev,
          number: 0,
        }));
      }
      if (option === 'Lempiras') {
        setNumberSelected((prev) => ({
          ...prev,
          lempiras: 0,
        }));
      }
    } else if (btn.value === -2) {
      if (option === 'Numero') {
        const tempAva = await getAvailabilityAmountByNumber(
          numberSelected.number
        );
        setTotalAvailablePerNumber(tempAva.amount);
        setOption('Lempiras');
        setPrincipalButtons((prev) =>
          prev.map((button) =>
            button.value === -2 ? { ...button, name: '+' } : button
          )
        );
      } else if (option === 'Lempiras') {
        if (numberSelected.lempiras <= 0) return;
        const numberTemp =
          numberSelected.number <= 9
            ? '0' + String(numberSelected.number)
            : String(numberSelected.number);

        const availability = await checkAvailabilityByNumber(
          numberSelected.number,
          numberSelected.lempiras
        );
        if (availability.success === false) {
          message(
            'error',
            'Número ' + numberSelected.number,
            'No tiene saldo suficiente!',
            'top',
            1300
          );
          return;
        }

        const temp = await insertDetalleAndUpdateTicket(
          numberSelected.number,
          numberSelected.lempiras
        );
        const tl = await getTotalLempirasFromDraftTicket();
        if (tl) setTotal_lempiras(tl);
        await onRefresh();
        if (temp) {
          message(
            'success',
            'Agregado',
            'Número ' +
              numberTemp +
              ' con L. ' +
              numberSelected.lempiras.toLocaleString() +
              '.00',
            'top',
            1300
          );
          setPrincipalButtons((prev) =>
            prev.map((button) =>
              button.value === -2 ? { ...button, name: '>' } : button
            )
          );
          setCountTicketDetail((prev) => prev + 1);
        }
      }
    } else {
      if (option === 'Numero') {
        if (numberSelected.number.toFixed(0).length < 2) {
          setNumberSelected((prev) => ({
            ...prev,
            number: parseInt(prev.number.toString() + btn.name), //(prev.lempiras += btn.name), // <-- your new value here
          }));
        }
      }
      if (option === 'Lempiras') {
        if (numberSelected.lempiras.toFixed(0).length < 6) {
          setNumberSelected((prev) => ({
            ...prev,
            lempiras: parseInt(prev.lempiras.toString() + btn.name), //(prev.lempiras += btn.name), // <-- your new value here
          }));
        } else {
          message(
            'error',
            'Error',
            'No puede ingresar más de 6 digitos.',
            'top',
            1300
          );
        }
      }
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        total_lempiras ? (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            onPress={() =>
              navigation.navigate('DiariaTicket', {
                ticketId: ticketID,
                total_lempiras,
              })
            }
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ paddingRight: 5, color: 'white' }}>
                {countTicketDetail}
              </Text>
              <Icon name="cash-outline" size={25} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, total_lempiras, countTicketDetail]);

  const handleSubmitUser = async () => {
    if (!userIdInput.trim())
      return Alert.alert('Campo vacío', 'Por favor ingrese un ID válido.');
    const user = await getUserById(userIdInput.trim());

    if (user) {
      const cuser = await saveUserToSQLite(user);
      if (cuser) {
        setUser(cuser);
        message('success', 'Bienvenido', 'Buen día ' + cuser.name, 'top', 2000);
      }
    }
  };

  const pasteUserFromClipboard = async () => {
    try {
      if (!userIdInput) {
        const clipboardText = await Clipboard.getStringAsync();

        if (!clipboardText) {
          Alert.alert('Clipboard vacío', 'No hay texto copiado.');
          return;
        }

        setUserIdInput(clipboardText);
      } else {
        setUserIdInput('');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al pegar el usuario.');
    }
  };

  return (
    <>
      <Modal visible={user ? false : true} transparent animationType="slide">
        {!user && (
          <View style={stylesLocal.overlay}>
            <View style={stylesLocal.container}>
              <Text style={stylesLocal.title}>Ingrese el ID del Usuario</Text>
              <TextInput
                style={stylesLocal.input}
                placeholder="Panda User ID"
                value={userIdInput}
                onChangeText={setUserIdInput}
              />
              <View style={stylesLocal.buttonRow}>
                <Button
                  title={userIdInput ? 'Borrar' : 'Pegar'}
                  onPress={() => pasteUserFromClipboard()}
                />
                {userIdInput.length > 18 && (
                  <Button title="Confirmar" onPress={handleSubmitUser} />
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
      {user && (
        <ScrollView
          scrollEnabled={scrollEnabled} // 👈 control scroll here
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* TOTAL & Disponible */}
          <View style={styles.top_labels_view}>
            {/* TOTAL L TICKET */}
            <Text style={styles.total_amount}>
              L. {total_lempiras.toFixed(2)}
            </Text>
            {/* AVAILABLE */}
            {option === 'Lempiras' && (
              <Text style={styles.available_per_number}>
                Disp. {totalAvailablePerNumber.toFixed(2)}
              </Text>
            )}
          </View>
          <View
            style={{
              height: screenHeight * 0.3,
              maxWidth: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {option === 'Lempiras' && (
              <Text style={styles.underlineNumber}>
                {numberSelected.number <= 9 && <Text>0</Text>}
                {numberSelected.number}
              </Text>
            )}
            {option === 'Numero' && (
              <Text style={styles.mainNumber}>
                {numberSelected.number <= 9 && <Text>0</Text>}
                {numberSelected.number}
              </Text>
            )}
            {option === 'Lempiras' && (
              <Text style={styles.mainNumber}>
                {numberSelected.lempiras.toLocaleString()}
              </Text>
            )}
            <Text
              style={
                option === 'Numero'
                  ? styles.optionNumber
                  : styles.optionLempiras
              }
            >
              {option === 'Numero' ? 'Número' : 'Lempiras'}
            </Text>
          </View>
          {/* NUMBERS */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              height: screenHeight * 0.55,
              backgroundColor: 'transparent',
            }}
          >
            {principalButtons.map((b, index) => (
              <Pressable
                key={index}
                onPressIn={() => setScrollEnabled(false)}
                onPressOut={() => setScrollEnabled(true)}
                onPress={() => handleClick(b)}
                style={({ pressed }) => [
                  styles.buttonCell,
                  pressed && {
                    backgroundColor: '#e0e0e0',
                    transform: [{ scale: 0.95 }],
                    elevation: 3,
                  },
                ]}
              >
                <Text style={styles.buttonText}>{b.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </>
  );
}

const stylesLocal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
