import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDetalleByTicketId } from '../database/DiariaModel';
import { styles } from '../constants';
import { FlatList } from 'react-native-gesture-handler';
import { GlobalContext } from '../context/GlobalContext';

export default function DiariaTicket({ navigation, route }) {
  const { countTicketDetail, setCountTicketDetail } = useContext(GlobalContext);
  const [totalLempiras, setTotalLempiras] = useState(0);
  const [detalleList, setDetalleList] = useState([]);
  const ticketId = route?.params?.ticketId || 0;
  const total_lempiras = route?.params?.total_lempiras || 0;

  const loadData = async () => {
    const items = await getDetalleByTicketId(ticketId);
    setDetalleList(items);
  };

  useEffect(() => {
    loadData();
  }, [ticketId, total_lempiras]);

  useEffect(() => {
    const Temp = detalleList.reduce((sum, item) => sum + item.lempiras, 0);
    setTotalLempiras(Temp);
  }, [detalleList]);

  useEffect(() => {
    navigation.setOptions({
      title: 'Ticket (' + ticketId + ')',
      headerRight: () =>
        true ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Panda')}
            style={{ marginRight: 15 }}
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
              <Icon name="add-outline" size={25} color="#fff" />
            </View>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, ticketId, countTicketDetail]);

  const handleDeleteItem = async (detalleId) => {
    const db = await getDBConnection();
    try {
      await db.executeSql(`DELETE FROM diaria_detalle WHERE id = ?`, [
        detalleId,
      ]);
      // Refresh the list
      const updatedList = await getDetalleByTicketId(db, ticketId);
      setDetalleList(updatedList);
    } catch (error) {
      console.error('❌ Error deleting item:', error);
    }
  };

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

      <TouchableOpacity
        style={styles.trashButtonDetalle}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Icon name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
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
          Total: L.{' '}
          {totalLempiras.toLocaleString('en-HN', {
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
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingVertical: 10,
          backgroundColor: '#2d2b2d',
          position: 'absolute',
          bottom: 0,
          height: 100,
          width: '100%',
          borderTopColor: '#488aff',
          borderTopWidth: 2,
        }}
      >
        {/* Trash Button (15%) */}
        <TouchableOpacity
          style={{
            backgroundColor: '#ff3b30',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            width: '15%',
            marginRight: 10,
          }}
          onPress={() => console.log('🗑 Delete Ticket pressed')}
        >
          <Icon name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Finalizar Ticket Button (70%) */}
        <TouchableOpacity
          style={{
            backgroundColor: '#488aff',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            width: '70%',
          }}
          onPress={() => console.log('✅ Finalize Ticket')}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                marginRight: 8,
              }}
            >
              Finalizar Ticket
            </Text>
            <Icon name="send" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
