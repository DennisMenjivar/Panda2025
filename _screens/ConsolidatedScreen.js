import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getSumLempirasByNumber } from '../database/DiariaModel';
import { useFocusEffect } from '@react-navigation/native';

const ConsolidatedScreen = ({ navigation }) => {
  const [numberSums, setNumberSums] = useState([]);
  const [total, setTotal] = useState(0);
  const [closureDate, setClosureDate] = useState();
  const [closureId, setClosureId] = useState();

  const loadData = async () => {
    const { numbers, total, date, closureId } = await getSumLempirasByNumber();
    setTotal(total);
    setNumberSums(numbers);
    setClosureDate(date);
    setClosureId(closureId);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        true ? (
          <TouchableOpacity
            style={{ marginRight: 15 }}
            // onPress={() =>
            //   navigation.navigate('DiariaTicket', {
            //     ticketId: ticketID,
            //     total_lempiras,
            //   })
            // }
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Icon name="navigate-outline" size={25} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : null,
    });
  }, [numberSums]);

  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'row' }}>
      <ScrollView style={{ width: '50%', height: '100%' }}>
        <View
          style={{
            flexDirection: 'row', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            backgroundColor: 'white',
            padding: 10,
            marginBottom: 2,
          }}
        >
          <Text style={{ color: 'black', fontWeight: 'bold' }}>Número</Text>
          <Text style={{ color: 'black', fontWeight: 'bold' }}>Lempiras</Text>
        </View>
        {numberSums.map((num, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: index % 2 === 0 ? '#ffffff' : '#f0f0f0', // Alternate colors
              padding: 10,
              marginBottom: 2,
            }}
          >
            <Text style={{ flex: 1, fontWeight: 'bold' }}>
              {num.number.toString().padStart(2, '0')}
            </Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>
              Lps.{' '}
              {num.lempiras.toLocaleString('en-HN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        ))}
      </ScrollView>
      {/* RIGHT VIEWS */}
      <View
        style={{
          width: '49%',
          height: '100%',
          borderLeftWidth: 1,
          borderColor: 'black',
        }}
      >
        {/* DATE */}
        <View
          style={{
            flexDirection: 'column', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            paddingVertical: 10,
            marginBottom: 2,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              // paddingTop: 5,
              textAlign: 'center',
            }}
          >
            {closureDate}
          </Text>
        </View>
        {/* CLOSURE ID */}
        <View
          style={{
            flexDirection: 'column', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 1,
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            Cierre: # {closureId}
          </Text>
        </View>
        {/* TOTAL */}
        <View
          style={{
            flexDirection: 'column', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            padding: 10,
            marginBottom: 2,
          }}
        >
          <Text
            style={{
              color: '#488aff',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 20,
              borderBottomWidth: 1,
              borderColor: '#488aff',
            }}
          >
            TOTAL
          </Text>
          <Text
            style={{
              color: '#488aff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 5,
              textAlign: 'center',
            }}
          >
            L.
            {total.toLocaleString('en-HN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
        {/* COUNTER */}
        <View
          style={{
            flexDirection: 'column', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            // backgroundColor: '#545454',
            padding: 10,
            marginBottom: 2,
            borderBottomWidth: 1,
          }}
        >
          <Text
            style={{
              color: 'orange',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 20,
              borderBottomWidth: 1,
              borderColor: 'orange',
            }}
          >
            Cantidad
          </Text>
          <Text
            style={{
              color: 'orange',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 5,
              textAlign: 'center',
            }}
          >
            {numberSums.length}
          </Text>
        </View>
        {/* GAIN */}
        <View
          style={{
            flexDirection: 'column', // 🔄 Set to row to align texts horizontally
            justifyContent: 'space-between',
            // backgroundColor: '#16951c',
            padding: 10,
            marginBottom: 2,
            borderBottomWidth: 1,
          }}
        >
          <Text
            style={{
              color: '#16951c',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: 20,
              borderBottomWidth: 1,
              borderColor: '#16951c',
            }}
          >
            Ganancia <Text style={{ fontSize: 15 }}>x 15%</Text>
          </Text>
          <Text
            style={{
              color: '#16951c',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 5,
              textAlign: 'center',
            }}
          >
            L.
            {(total * 0.15).toLocaleString('en-HN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ConsolidatedScreen;
