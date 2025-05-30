import { Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db as firestoreDb } from './firebase';

export const getUserById = async (userId) => {
  try {
    const docRef = doc(firestoreDb, 'Users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      Alert.alert('No se encontró', 'ID de usuario no encontrado.');
      return null;
    }

    const user = { id: docSnap.id, ...docSnap.data() };

    // ✅ Convert Firestore timestamp to YYYY-MM-DD string
    const toDateString = (timestamp) => {
      if (!timestamp?.seconds) return null;
      const date = new Date(timestamp.seconds * 1000);
      return date.toISOString().split('T')[0];
    };

    const expirationDate = toDateString(user.expiration_license);
    const today = new Date().toISOString().split('T')[0];

    // ✅ Check if the license is still valid
    if (!expirationDate || expirationDate < today) {
      Alert.alert('Licencia expirada', 'La licencia del usuario ha vencido.');
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error:', error);
    Alert.alert('Error', 'No se pudo obtener el usuario!');
    return null;
  }
};
