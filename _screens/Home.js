import {
  View,
  Text,
  RefreshControl,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { ScrollView } from 'react-native-gesture-handler';
import { getDBConnection } from '../database/db';
import {
  createTables,
  insertDiariaTicket,
  getDiariaTickets,
} from '../database/DiariaModel';

const screenHeight = Dimensions.get('window').height;

export default function HomeScreen({ navigation }) {
  const [entries, setEntries] = useState([]);

  const loadData = async () => {
    const db = await getDBConnection();
    const message = await createTables(db);
    const items = await getDiariaTickets(db);
    setEntries(items);
  };

  const addEntry = async () => {
    const db = await getDBConnection();
    const id = await insertDiariaTicket(db, 100);
    Toast.show({
      type: 'success', // 'success' | 'error' | 'info'
      text1: 'Agregado',
      text2: 'ID: ' + id + '!',
      position: 'top', // or 'top'
      visibilityTime: 1300,
      autoHide: true,
      topOffset: 15,
    });
    // loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  // const [principalText, setPrincipalText] = useState(0);
  const [totalTicket, setTotalTicket] = useState(0);
  const [numberSelected, setNumberSelected] = useState({
    number: 0,
    lempiras: 0,
  });
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

  const onRefresh = () => {
    setRefreshing(true);
    setNumberSelected({
      number: 0,
      lempiras: 0,
    });
    addEntry();
    setOption('Numero');
    setPrincipalButtons((prev) =>
      prev.map((button) =>
        button.value === -2 ? { ...button, name: '>' } : button
      )
    );
    setRefreshing(false);
  };

  const handleClick = (btn) => {
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
        setOption('Lempiras');
        setPrincipalButtons((prev) =>
          prev.map((button) =>
            button.value === -2 ? { ...button, name: '+' } : button
          )
        );
      } else if (option === 'Lempiras') {
        // setNumberSelected();
        const numberTemp =
          numberSelected.number <= 9
            ? '0' + String(numberSelected.number)
            : String(numberSelected.number);
        Toast.show({
          type: 'success', // 'success' | 'error' | 'info'
          text1: 'Agregado',
          text2:
            'Número ' +
            numberTemp +
            ' con L' +
            numberSelected.lempiras.toLocaleString() +
            '!',
          position: 'top', // or 'top'
          visibilityTime: 1300,
          autoHide: true,
          topOffset: 15,
        });
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
          Toast.show({
            type: 'error', // 'success' | 'error' | 'info'
            text1: 'Error',
            text2: 'No puede ingresar más de 6 digitos.',
            position: 'top', // or 'top'
            visibilityTime: 1300,
            autoHide: true,
            topOffset: 15,
          });
        }
      }
    }
  };

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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}
        >
          {/* TOTAL L TICKET */}
          <Text
            style={{
              textAlign: 'left',
              color: '#488aff',
              padding: 10,
              fontSize: 18,
            }}
          >
            L. {totalTicket.toFixed(2)}
          </Text>
          {/* AVAILABLE */}
          {option === 'Lempiras' && (
            <Text
              style={{
                textAlign: 'left',
                color: 'red',
                padding: 10,
                fontSize: 18,
              }}
            >
              Disp. {totalTicket.toFixed(2)}
            </Text>
          )}
        </View>
        <View style={styles.displaySection}>
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
            {option}
          </Text>
        </View>
        {/* NUMBERS */}
        <View style={styles.buttonGrid}>
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

const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 0,
    margin: 0,
  },
  totalTicket: {
    textAlign: 'left',
    color: '#488aff',
    padding: 10,
    fontSize: 18,
  },
  displaySection: {
    height: screenHeight * 0.3,
    maxWidth: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineNumber: {
    textAlign: 'center',
    color: 'gray',
    textDecorationLine: 'underline',
    fontSize: 30,
  },
  mainNumber: {
    textAlign: 'center',
    color: 'black',
    fontSize: 100,
  },
  optionNumber: {
    textAlign: 'center',
    color: 'black',
    fontSize: 16,
  },
  optionLempiras: {
    textAlign: 'center',
    color: '#488aff',
    fontSize: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: screenHeight * 0.55,
    backgroundColor: 'transparent',
  },
  buttonCell: {
    width: '33.33%',
    height: '22%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.9,
    borderColor: '#eee',
  },
  buttonText: {
    color: 'black',
    fontSize: 28,
  },

  // TOAST
  successToast: {
    borderLeftColor: 'green',
    backgroundColor: '#e6ffed',
    width: '95%',
  },
  errorToast: {
    borderLeftColor: 'red',
    backgroundColor: '#ffe6e6',
    width: '95%',
  },
  infoToast: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#e6f0ff',
    width: '95%',
  },
  text1: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  text2: {
    fontSize: 17,
    color: '#333',
  },
});

// Project successfully linked (ID: 0fa312af-2f13-4658-898d-caf2b157ce76) (modified app.json)
