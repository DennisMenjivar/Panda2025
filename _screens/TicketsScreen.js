// TicketListScreen.js
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getDraftTickets } from '../database/DiariaModel';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
const TicketsScreen = ({ navigation }) => {
  const [tickets, setTickets] = useState([]);
  const [closure_id, setClosure_id] = useState(0);
  const [total_lempiras, setTotal_lempiras] = useState(0);
  const [closure_date, setClosure_date] = useState();

  const fetchDraftTickets = async () => {
    const ptickets = await getDraftTickets();
    setClosure_id(ptickets.closure_id);
    setTickets(ptickets.tickets);
    setTotal_lempiras(ptickets.sumTotal);
    setClosure_date(ptickets.closure_date);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDraftTickets();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        true ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ paddingRight: 15, color: 'white' }}>
              {closure_date}
            </Text>
          </View>
        ) : null,
    });
  }, [closure_date]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        navigation.navigate('TicketsByIDDetalle', {
          ticketId: item.id,
          closureId: closure_id,
          total_lempiras: item.total_lempiras,
        })
      }
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Ticket #{item.closure_id}-{item.id}
          </Text>
          <Text style={{ color: '#488aff', fontSize: 16 }}>
            Total: L.
            {item.total_lempiras.toLocaleString('en-HN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text>
            Creado:{' '}
            {new Date(item.created_at).toLocaleString('es-HN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
        </View>

        {/* Arrow Icon */}
        <Icon
          name="chevron-forward-outline"
          size={24}
          color="#888"
          style={{ marginLeft: 10 }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={{
          width: '100%',
          backgroundColor: '#2d2b2d',
          paddingVertical: 4,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}
      >
        <View>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              with: '100%',
              paddingHorizontal: 8,
              // marginBottom: 1,
              paddingVertical: 4,
              marginLeft: 4,
              borderColor: 'white',
              borderWidth: 1,
            }}
          >
            {'Cierre: # ' + closure_id + ''}
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
              with: '100%',
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 4,
              borderColor: 'white',
              borderWidth: 1,
            }}
          >
            {'Cant: (' + tickets.length + ')'}
          </Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text
            style={{
              color: '#488aff',
              fontSize: 20,
              fontWeight: 'bold',
              verticalAlign: 'center',
            }}
          >
            Total: L.
            {total_lempiras.toLocaleString('en-HN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        </View>
      </View>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 35 }}
        ListEmptyComponent={
          <Text
            style={{
              width: '100%',
              textAlign: 'center',
              padding: 30,
              fontSize: 17,
            }}
          >
            No hay tickets en proceso.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#d7d7d7',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default TicketsScreen;
