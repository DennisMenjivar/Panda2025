import { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getDetalleByTicketId } from '../database/DiariaModel';
import { styles } from '../constants';
import { FlatList } from 'react-native-gesture-handler';
import { GlobalContext } from '../context/GlobalContext';

export default function DiariaTicket({ navigation, route }) {
  const { countTicketDetail, setCountTicketDetail } = useContext(GlobalContext);
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
    <View style={styles.containerDetalle}>
      <FlatList
        data={detalleList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}
