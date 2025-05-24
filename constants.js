import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { StyleSheet } from 'react-native';

export const DiariaStatus = {
  DRAFT: 0,
  PUBLISHED: 1,
  ARCHIVED: 2,
  DELETED: 3,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 0,
    margin: 0,
  },
  totalTicket: {
    textAlign: 'left',
    color: '#488aff',
    padding: 10,
    fontSize: 18,
  },
  underlineNumber: {
    textAlign: 'center',
    color: 'gray',
    textDecorationLine: 'underline',
    fontSize: 30,
  },
  mainNumber: {
    textAlign: 'center',
    color: 'black',
    fontSize: 100,
  },
  optionNumber: {
    textAlign: 'center',
    color: 'black',
    fontSize: 16,
  },
  optionLempiras: {
    textAlign: 'center',
    color: '#488aff',
    fontSize: 16,
  },
  buttonCell: {
    width: '33.33%',
    height: '22%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.9,
    borderColor: '#eee',
  },
  buttonText: {
    color: 'black',
    fontSize: 28,
  },
  top_labels_view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    width: '100%',
    position: 'absolute',
  },
  total_amount: {
    textAlign: 'left',
    color: '#488aff',
    padding: 10,
    fontSize: 18,
  },
  available_per_number: {
    textAlign: 'left',
    color: 'red',
    padding: 10,
    fontSize: 18,
  },
  // TOAST
  successToast: {
    borderLeftColor: 'green',
    backgroundColor: '#e6ffed',
    width: '95%',
  },
  errorToast: {
    borderLeftColor: 'red',
    backgroundColor: '#ffe6e6',
    width: '95%',
  },
  infoToast: {
    borderLeftColor: '#3b82f6',
    backgroundColor: '#e6f0ff',
    width: '95%',
  },
  text1: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  text2: {
    fontSize: 17,
    color: '#333',
  },
});

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={styles.infoToast}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

export const message = async (type, text1, text2, position, visibilityTime) => {
  await Toast.show({
    type, // 'success' | 'error' | 'info'
    text1,
    text2,
    position, // or 'top'
    visibilityTime,
    autoHide: true,
    topOffset: 15,
  });
};
