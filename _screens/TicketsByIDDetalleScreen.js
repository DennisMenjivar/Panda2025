import { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
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
    <View style={styles.cardRowDetalle}>
      <View style={styles.cardContentDetalle}>
        <Text style={styles.bigNumberDetalle}>
          {item.number.toString().padStart(2, '0')}
        </Text>
        <Text style={styles.lempirasDetalle}>
          Lps.{' '}
          {item.lempiras.toLocaleString('en-HN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={{ height: '100%', top: 1, backgroundColor: '#d7d7d7' }}
    >
      <View style={{ width: '100%' }}>
        <Text
          style={{
            textAlign: 'center',
            paddingVertical: 10,
            backgroundColor: '#2d2b2d',
            color: 'white',
            fontSize: 22,
            fontWeight: 'bold',
          }}
        >
          Total: L.
          {total_lempiras.toLocaleString('en-HN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
      <View>
        <FlatList
          data={detalleList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10, paddingBottom: 120 }}
        />
      </View>
    </SafeAreaView>
  );
}
