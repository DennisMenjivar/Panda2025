import {
  View,
  Text,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createTables,
  insertDiariaTicketIfNotExists,
  insertDetalleAndUpdateTicket,
  getTotalLempirasFromDraftTicket,
  checkAvailabilityByNumber,
  getAvailabilityAmountByNumber,
} from '../database/DiariaModel';
import { message, styles, toastConfig } from '../constants';

const screenHeight = Dimensions.get('window').height;

export default function HomeScreen({ navigation }) {
  const [total_lempiras, setTotal_lempiras] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketID, setTicketID] = useState(0);
  const [numberSelected, setNumberSelected] = useState({
    number: 0,
    lempiras: 0,
  });
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

  const loadData = async () => {
    await createTables();
    const id = await insertDiariaTicketIfNotExists();
    setTicketID(id);
    const tl = await getTotalLempirasFromDraftTicket();
    setTotal_lempiras(tl);
    if (tl) setTotal_lempiras(tl);
    if (id)
      message(
        'success',
        'Ticket: #' + id,
        'top', // or 'top'
        1200,
        true,
        15
      );
  };

  useEffect(() => {
    loadData();
  }, []);

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
          ticketID,
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
          ticketID,
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
        if (temp)
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
            onPress={() => navigation.navigate('DiariaTicket')}
            style={{ marginRight: 15 }}
          >
            <Icon
              name="cash-outline"
              size={25}
              color="#fff"
              onPress={() => navigation.navigate('DiariaTicket')}
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, total_lempiras]);

  return (
    <>
      <ScrollView
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
              option === 'Numero' ? styles.optionNumber : styles.optionLempiras
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
            <TouchableOpacity
              key={index}
              style={styles.buttonCell}
              onPress={() => handleClick(b)}
            >
              <Text style={styles.buttonText}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Toast config={toastConfig} />
    </>
  );
}
