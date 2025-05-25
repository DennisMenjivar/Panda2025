import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function DiariaTicket({ navigation }) {
  useEffect(() => {
    navigation.setOptions({
      title: 'Ticket #',
      headerLeft: () =>
        true ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Panda')}
            style={{ marginLeft: 15 }}
          >
            <Icon
              name="arrow-back-outline"
              size={25}
              color="#fff"
              onPress={() => navigation.navigate('Panda')}
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation]);
  return (
    <View>
      <Text>DiariaTicket</Text>
    </View>
  );
}
