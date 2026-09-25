import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [commerce, setCommerce] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const API_URL = 'http://10.175.14.80:5000/api';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        setUser(u);
        setNom(u.nom || '');
        setEmail(u.email || '');
        setTelephone(u.telephone || '');
        setCommerce(u.commerce || '');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // Mettre à jour le backend
      const response = await axios.put(`${API_URL}/auth/profile`, {
        nom, commerce, telephone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Mettre à jour le stockage local
      const updatedUser = { ...user, ...response.data.utilisateur };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
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
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
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
            <TouchableOpacity onPress={pickImage}>
              <Text style={{color: Colors.primary, fontWeight: 'bold', marginBottom: 10}}>Changer de photo</Text>
            </TouchableOpacity>
            {user?.role === 'administrateur' && (
              <Text style={styles.roleBadge}>Administrateur</Text>
            )}
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput style={[styles.input, !isEditing && styles.inputDisabled]} value={nom} onChangeText={setNom} editable={isEditing} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.helpText}>L'email ne peut pas être modifié.</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput style={[styles.input, !isEditing && styles.inputDisabled]} value={telephone} onChangeText={setTelephone} editable={isEditing} keyboardType="phone-pad" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du commerce</Text>
              <TextInput style={[styles.input, !isEditing && styles.inputDisabled]} value={commerce} onChangeText={setCommerce} editable={isEditing} />
            </View>

            {isEditing ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={[styles.btnPrimary, { flex: 1, marginRight: 10 }]} onPress={saveProfile}>
                  <Text style={styles.btnPrimaryText}>Enregistrer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btnSecondary, { flex: 1 }]} onPress={() => { setIsEditing(false); loadUser(); }}>
                  <Text style={[styles.btnPrimaryText, { color: Colors.primary }]}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsEditing(true)}>
                <Feather name="edit-2" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>Modifier le profil</Text>
              </TouchableOpacity>
            )}
          </View>

          {user?.role === 'administrateur' && (
            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: Colors.expense, marginTop: 15 }]}
              onPress={() => router.push('/admin')}
            >
              <Text style={styles.btnPrimaryText}>Espace Administration</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.btnPrimary, { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.expense, marginTop: 30, marginBottom: 20 }]}
            onPress={async () => {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              router.replace('/(auth)/login');
            }}
          >
            <Text style={[styles.btnPrimaryText, { color: Colors.expense }]}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 15, borderRadius: 10, width: '100%', alignItems: 'center'
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  formContainer: { width: '100%', marginBottom: 10 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 5, fontWeight: '600' },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text
  },
  inputDisabled: {
    backgroundColor: '#F0F0F0',
    color: Colors.textSecondary
  },
  helpText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  btnSecondary: {
    backgroundColor: 'transparent', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary
  }
});
