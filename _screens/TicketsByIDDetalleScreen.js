import { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDetalleByTicketId } from '../database/DiariaModel';
import { message, styles } from '../constants';
import { FlatList } from 'react-native-gesture-handler';
import { GlobalContext } from '../context/GlobalContext';
import { useFocusEffect } from '@react-navigation/native';

export default function TicketsByIDDetalleScreen({ navigation, route }) {
  const { countTicketDetail, setCountTicketDetail } = useContext(GlobalContext);
  const [detalleList, setDetalleList] = useState([]);
  const ticketId = route?.params?.ticketId || 0;
  const closure_id = route?.params?.closureId || 0;
  const total_lempiras = route?.params?.total_lempiras || 0;

  const loadData = async () => {
    const items = await getDetalleByTicketId(ticketId);
    setDetalleList(items);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [ticketId, countTicketDetail])
  );

  useEffect(() => {
    navigation.setOptions({
      title: 'Ticket #(' + closure_id + '-' + ticketId + ')',
      headerLeft: () =>
        true ? (
          <TouchableOpacity
            onPress={() => {
              setDetalleList([]);
              navigation.navigate('Tickets');
            }}
            style={{ marginLeft: 15 }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Icon name="arrow-back" size={25} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, ticketId, countTicketDetail]);

  const renderItem = ({ item }) => (
    <View style={stylesLocal.card}>
      <Text style={stylesLocal.number}>
        {item.number.toString().padStart(2, '0')}
      </Text>
      <Text style={stylesLocal.amount}>
        L.{' '}
        {item.lempiras.toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={stylesLocal.container}>
      <FlatList
        data={detalleList}
        keyExtractor={(item) => item.number.toString()}
        numColumns={3}
        renderItem={renderItem}
        contentContainerStyle={stylesLocal.list}
      />
    </SafeAreaView>
  );
}
const stylesLocal = StyleSheet.create({
  container: {
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
});
