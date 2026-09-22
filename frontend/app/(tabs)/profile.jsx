import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (e) {
      console.error(e);
    }
  };

  const pickImage = async () => {
    // Demander uniquement l'accès à la galerie
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("L'accès à la galerie est nécessaire pour changer la photo de profil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const updatedUser = { ...user, avatar: uri };
      setUser(updatedUser);
      // Sauvegarder l'avatar localement
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Profil" />
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
              <Feather name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.nom || 'Nom Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          {user?.role === 'administrateur' && (
            <Text style={styles.roleBadge}>Administrateur</Text>
          )}
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={pickImage}>
          <Text style={styles.btnPrimaryText}>Changer de photo</Text>
        </TouchableOpacity>

        {user?.role === 'administrateur' && (
          <TouchableOpacity 
            style={[styles.btnPrimary, { backgroundColor: Colors.expense, marginTop: 15 }]}
            onPress={() => router.push('/admin')}
          >
            <Text style={styles.btnPrimaryText}>Espace Administration</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.btnPrimary, { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.expense, marginTop: 30 }]}
          onPress={async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            router.replace('/login');
          }}
        >
          <Text style={[styles.btnPrimaryText, { color: Colors.expense }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, alignItems: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.border },
  editAvatarBtn: {
    position: 'absolute', right: 0, bottom: 5,
    backgroundColor: Colors.primary, width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: Colors.background
  },
  name: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textSecondary },
  roleBadge: {
    marginTop: 8,
    backgroundColor: Colors.expense,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden'
  },
  btnPrimary: {
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, width: '100%', alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
