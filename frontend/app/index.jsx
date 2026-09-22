import { Redirect } from 'expo-router';

export default function Index() {
  // Rediriger vers les onglets (tabs) directement pour faciliter les tests
  return <Redirect href="/(tabs)" />;
}
