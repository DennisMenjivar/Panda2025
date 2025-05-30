import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import * as Print from 'expo-print';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  deleteAllDetalleByTicketId,
  finalizeTicket,
  getDetalleByTicketId,
} from '../database/DiariaModel';
import { message, styles } from '../constants';
import { FlatList } from 'react-native-gesture-handler';
import { GlobalContext } from '../context/GlobalContext';
import { getDBConnection } from '../database/db';

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
  }, []);

  useEffect(() => {
    loadData();
  }, [ticketId, total_lempiras, countTicketDetail]);

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

  const handleDeleteItem = async (item) => {
    const db = await getDBConnection();
    try {
      const temp = await db.executeSql(
        `DELETE FROM diaria_detalle WHERE id = ?`,
        [item.id]
      );
      if (temp) {
        await db.executeSql(
          `UPDATE diaria_ticket 
       SET total_lempiras = total_lempiras - ? 
       WHERE id = ?`,
          [item.lempiras, ticketId] // Make sure item includes ticket_id
        );

        // Refresh the list
        await loadData();
        // setCountTicketDetail(detalleList.length);
        setCountTicketDetail((prev) => prev - 1);
        await message(
          'success',
          'Eliminado',
          'Número ' + item.number + ' eliminado correctamente!',
          'top',
          1700
        );
        if (detalleList.length === 1) navigation.navigate('Panda');
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
    }
  };

  const handleDeleteAllTicket = async () => {
    const temp = await deleteAllDetalleByTicketId(ticketId);
    if (temp) {
      await message(
        'success',
        'Eliminado',
        'Números eliminados correctamente!',
        'top',
        1700
      ).then(() => {
        setDetalleList([]);
        navigation.navigate('Panda');
      });
    }
  };

  const showDeleteNumberMessage = (item) => {
    const newNumber = item.number <= 9 ? '0' + item.number : item.number;

    Alert.alert(
      '¿Estás seguro?', // title
      '¿Eliminar el número ' +
        newNumber +
        ' con L.' +
        item.lempiras.toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        '?', // message
      [
        {
          text: 'No',
          style: 'cancel',
          onPress: () => console.log('❌ Cancelado'),
        },
        {
          text: 'Sí',
          onPress: () => handleDeleteItem(item),
        },
      ],
      { cancelable: true }
    );
  };

  const showDeleteAllTicketMessage = () => {
    Alert.alert(
      '¿Estás seguro?', // title
      '¿Eliminar todo el ticket #' + ticketId + '?', // message
      [
        {
          text: 'No',
          style: 'cancel',
          onPress: () => console.log('❌ Cancelado'),
        },
        {
          text: 'Sí',
          onPress: () => {
            handleDeleteAllTicket();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const showConfirmTicketMessage = (phone) => {
    Alert.alert(
      '¿Estás seguro?', // title
      '¿Desea confirmar y enviar el ticket #' + ticketId + '?', // message
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('❌ Cancelado'),
        },
        {
          text: '💬 Enviar por SMS',
          onPress: () => {
            sendTicketSummary(phone, 'sms');
          },
        },
        {
          text: '🚀 Enviar por WhatsApp',
          onPress: () => {
            sendTicketSummary(phone);
          },
        },
        // {
        //   text: '🖨️ Imprimir',
        //   onPress: () => {
        //     printTicket();
        //   },
        // },
        {
          text: '💾 Solo Guardar',
          onPress: () => {
            sendTicketSummary(phone, 'save');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const sendTicketSummary = async (phone, type = 'whatsapp') => {
    const temp = await finalizeTicket(ticketId, navigation);
    if (temp === 1) {
      if (!detalleList.length) {
        alert('No hay datos para enviar.');
        return;
      }

      let message = `🎟️ *Ticket #${ticketId}*\n\n`;

      detalleList.forEach((item, index) => {
        const num = item.number.toString().padStart(2, '0');
        const amount = item.lempiras.toLocaleString('en-HN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        message += `• Número ${num}: Lps. ${amount}\n`;
      });

      message += `\n💰 *Total:* Lps. ${totalLempiras.toLocaleString('en-HN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      // Send message
      if (type === 'whatsapp') {
        sendWhatsApp(phone, message);
      } else if (type === 'sms') {
        sendSMS(phone, message);
      } else if (type === 'save') {
      }
    }
  };

  const printTicket = async () => {
    const html = generateHTML(detalleList, totalLempiras);
    await Print.printAsync({ html });
  };

  const generateHTML = (detalleList, totalLempiras) => {
    const rows = detalleList
      .map(
        (item) => `
    <tr>
      <td>${item.number.toString().padStart(2, '0')}</td>
      <td>Lps. ${item.lempiras.toLocaleString('en-HN', {
        minimumFractionDigits: 2,
      })}</td>
    </tr>
  `
      )
      .join('');

    return `
    <html>
      <body>
        <h1>Ticket #${ticketId}</h1>
        <table border="1" style="width:100%; text-align:left; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Number</th>
              <th>Lempiras</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <h2>Total: Lps. ${totalLempiras.toLocaleString('en-HN', {
          minimumFractionDigits: 2,
        })}</h2>
      </body>
    </html>
  `;
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
        onPress={() => showDeleteNumberMessage(item)}
      >
        <Icon name="trash-outline" size={24} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );

  const sendWhatsApp = (phone, message) => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() =>
      alert('Make sure WhatsApp is installed on your device')
    );
  };

  const sendSMS = (phone, message) => {
    const url = `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => alert('Could not open SMS app'));
  };

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
          onPress={() => showDeleteAllTicketMessage()}
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
          onPress={() => showConfirmTicketMessage('+18138122373')}
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
