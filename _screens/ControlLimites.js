import {
  View,
  Text,
  RefreshControl,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { FlatList, TextInput } from 'react-native-gesture-handler';

import {
  createTables,
  insertDefaultPedazos,
  getAllPedazos,
  updateLempirasByRange,
} from '../database/DiariaModel';
import { message } from '../constants';

export default function HomeScreen({ navigation }) {
  const startInputRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pedazos, setPedazos] = useState([]);

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [lempiras, setLempiras] = useState('');

  const loadData = async () => {
    await createTables();
    const insertPedazos = await insertDefaultPedazos();
    const items = await getAllPedazos();

    setPedazos(items);

    if (insertPedazos !== 0)
      message(
        'success',
        'Todo bien',
        'Limites configurados correctamente!',
        'top',
        1300
      );
  };

  const update = async () => {
    const insertPedazos = await insertDefaultPedazos();
    const items = await getAllPedazos();
    setPedazos(items);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async () => {
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    const amount = parseInt(lempiras);
    const success = await updateLempirasByRange(startNum, endNum, amount);

    if (success) {
      update();
      message(
        'success',
        'Actualizado',
        `Actualizado Lps. ${amount} desde ${startNum} hasta ${endNum}`,
        'top',
        3000
      );
      setStart('');
      setEnd('');
      setLempiras('');
      startInputRef.current?.focus();
    } else {
      Alert.alert('❌ Error', 'Update failed. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={stylesCurrent.card}>
      <Text style={stylesCurrent.bigNumber}>
        {item.number.toString().padStart(2, '0')}
      </Text>
      <Text style={stylesCurrent.currency}>
        Limite: Lps.{' '}
        {Number(item.lempiras).toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={stylesCurrent.currencyRed}>
        Vendido: Lps.{' '}
        {Number(item.spent).toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={stylesCurrent.currencyAvailable}>
        Disponible: Lps.{' '}
        {Number(item.lempiras - item.spent).toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={stylesCurrent.container}>
      <View style={stylesCurrent.containerBox}>
        <TextInput
          ref={startInputRef}
          style={stylesCurrent.inputBox}
          placeholder="Desde (número)"
          keyboardType="numeric"
          value={start}
          onChangeText={(text) => {
            // Allow only digits and max 2 characters
            const cleaned = text.replace(/[^0-9]/g, ''); // remove non-numeric chars

            if (cleaned.length <= 2) {
              setStart(cleaned);
            }
          }}
          maxLength={2}
        />
        <TextInput
          style={stylesCurrent.inputBox}
          placeholder="Hasta (número)"
          keyboardType="numeric"
          value={end}
          onChangeText={(text) => {
            // Allow only digits and max 2 characters
            const cleaned = text.replace(/[^0-9]/g, ''); // remove non-numeric chars

            if (cleaned.length <= 2) {
              setEnd(cleaned);
            }
          }}
          maxLength={2}
        />
        <TextInput
          style={stylesCurrent.inputBox}
          placeholder="Cantidad (Lempiras)"
          keyboardType="numeric"
          value={lempiras}
          onChangeText={setLempiras}
        />

        <TouchableOpacity
          style={stylesCurrent.buttonBox}
          onPress={handleUpdate}
          disabled={
            start.length <= 0 || end.length <= 0 || lempiras.length <= 0
          }
        >
          <Text style={stylesCurrent.buttonTextBox}>Actualizar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={pedazos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
        contentContainerStyle={{ padding: 10 }}
      />
    </SafeAreaView>
  );
}

const stylesCurrent = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 60,
    color: '#000',
    // fontWeight: 'bold',
  },
  currency: {
    fontSize: 19,
    color: '#488aff',
  },
  currencyRed: {
    fontSize: 15,
    color: 'red',
  },
  currencyAvailable: { fontSize: 15 },
  // BOX
  containerBox: {
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  headingBox: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#2d2b2d',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    marginBottom: 15,
    padding: 6,
    fontSize: 18,
    borderRadius: 8,
  },
  buttonBox: {
    backgroundColor: '#488aff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonTextBox: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
