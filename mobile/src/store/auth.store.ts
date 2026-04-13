import AsyncStorage from '@react-native-async-storage/async-storage';

export async function setAccessToken(token: string) {
  await AsyncStorage.setItem('access_token', token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem('access_token');
}

export async function clearAccessToken() {
  await AsyncStorage.removeItem('access_token');
}