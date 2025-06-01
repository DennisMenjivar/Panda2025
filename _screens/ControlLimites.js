import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';

import {
  createTables,
  insertDefaultPedazos,
  getAllPedazos,
  updateLempirasByRange,
} from '../database/DiariaModel';
import { message } from '../constants';

export default function HomeScreen() {
  const startInputRef = useRef(null);
  const [pedazos, setPedazos] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [lempiras, setLempiras] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const loadData = async () => {
    await createTables();
    const inserted = await insertDefaultPedazos();
    const items = await getAllPedazos();
    setPedazos(items);

    if (inserted !== 0) {
      message(
        'success',
        'Todo bien',
        'Límites configurados correctamente!',
        'top',
        1300
      );
    }
  };

  const update = async () => {
    await insertDefaultPedazos();
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
        `Actualizado L.${amount}.00 desde ${startNum} hasta ${endNum}`,
        'top',
        3000
      );
      setStart('');
      setEnd('');
      setLempiras('');
      startInputRef.current?.focus();
    } else {
      alert('❌ Error: Update failed. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        const numberStr = item.number.toString().padStart(2, '0');
        setStart(numberStr);
        setEnd(numberStr);
        setLempiras(item.lempiras.toString());
      }}
    >
      <Text style={styles.number}>
        {item.number.toString().padStart(2, '0')}
      </Text>
      <Text style={styles.amount}>
        L.{' '}
        {item.lempiras.toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.inputContainer}>
          <TextInput
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            ref={startInputRef}
            style={styles.input}
            placeholder="Desde"
            keyboardType="numeric"
            value={start}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 2) setStart(cleaned);
            }}
            maxLength={2}
          />
          <TextInput
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            style={styles.input}
            placeholder="Hasta"
            keyboardType="numeric"
            value={end}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '');
              if (cleaned.length <= 2) setEnd(cleaned);
            }}
            maxLength={2}
          />
          <TextInput
            onFocus={() => setIsTyping(true)}
            onBlur={() => setIsTyping(false)}
            style={styles.inputLempiras}
            placeholder="Lempiras"
            keyboardType="numeric"
            value={lempiras}
            onChangeText={setLempiras}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            disabled={!start || !end || !lempiras}
          >
            <Text style={styles.buttonText}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.listContainer}>
        <View style={{ flex: 1, position: 'relative' }}>
          <FlatList
            data={pedazos}
            keyExtractor={(item) => item.number.toString()}
            numColumns={3}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            style={{ opacity: isTyping ? 0.3 : 1 }} // dim when typing
          />
          {isTyping && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: 'rgba(255,255,255,0.5)',
                zIndex: 1,
              }}
              pointerEvents="none"
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#d7d7d7',
  },
  list: {
    padding: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  number: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  amount: {
    fontSize: 16,
    color: '#488aff',
    marginTop: 5,
  },
  inputContainer: {
    paddingHorizontal: '5%',
    paddingTop: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonContainer: {
    paddingHorizontal: '5%',
    paddingBottom: 10,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 6,
    fontSize: 18,
    borderRadius: 8,
    width: '30%',
    textAlign: 'center',
    marginHorizontal: 4,
    marginBottom: 15,
  },
  inputLempiras: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 6,
    fontSize: 18,
    borderRadius: 8,
    width: '40%',
    textAlign: 'center',
    marginHorizontal: 4,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#488aff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
