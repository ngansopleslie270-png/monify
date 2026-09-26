import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const statsRes = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsRes.data);

      const usersRes = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
      
    } catch (error) {
      console.error('Erreur admin fetchData:', error);
      Alert.alert("Erreur", "Impossible de charger les données administrateur.");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_URL}/admin/users/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, actif: response.data.actif } : u));
    } catch (error) {
      console.error('Erreur toggle user:', error);
      Alert.alert("Erreur", "Impossible de modifier le statut de l'utilisateur.");
    }
  };

  const deleteUser = (id) => {
    Alert.alert(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API_URL}/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setUsers(users.filter(u => u.id !== id));
            } catch (error) {
              console.error('Erreur suppression:', error);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Admin */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Espace Administration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Vue d'ensemble */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Feather name="users" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Utilisateurs</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="layers" size={24} color={Colors.expense} />
              <Text style={styles.statValue}>{stats?.totalCategories || 0}</Text>
              <Text style={styles.statLabel}>Catégories</Text>
            </View>
          </View>
        </View>

        {/* Liste des utilisateurs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gestion des Utilisateurs</Text>
          {users.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.nom} {user.role === 'administrateur' && <Feather name="star" size={14} color="#FFC107" />}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={[styles.userStatus, { color: user.actif ? 'green' : 'red' }]}>
                  {user.actif ? 'Actif' : 'Désactivé'}
                </Text>
              </View>
              
              {user.role !== 'administrateur' && (
                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: user.actif ? Colors.expense : 'green' }]}
                    onPress={() => toggleUserStatus(user.id, user.actif)}
                  >
                    <Feather name={user.actif ? "slash" : "check"} size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#333' }]}
                    onPress={() => deleteUser(user.id)}
                  >
                    <Feather name="trash-2" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.expense,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backBtn: { padding: 5 },
  headerTitle: { color: Colors.surface, fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 15 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 15 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: Colors.surface, flex: 1, marginHorizontal: 5, padding: 20,
    borderRadius: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 10, color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 5 },
  userCard: {
    backgroundColor: Colors.surface, padding: 15, borderRadius: 12, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.textSecondary, marginVertical: 3 },
  userStatus: { fontSize: 12, fontWeight: 'bold' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }
});
