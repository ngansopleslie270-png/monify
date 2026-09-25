import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useFocusEffect, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const API_URL = 'http://10.175.14.80:5000/api';

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Erreur notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Erreur markAllAsRead:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Erreur markAsRead:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Feather name="check-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="bell-off" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>Aucune notification</Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <TouchableOpacity 
                key={notif.id} 
                style={[styles.notifCard, !notif.lu && styles.notifCardUnread]}
                onPress={() => markAsRead(notif.id)}
              >
                <View style={styles.notifIcon}>
                  <Feather name={notif.type === 'ALERTE_BUDGET' ? 'alert-triangle' : 'bell'} size={24} color={notif.type === 'ALERTE_BUDGET' ? Colors.expense : Colors.primary} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifMessage, !notif.lu && styles.textUnread]}>
                    {notif.message}
                  </Text>
                  <Text style={styles.notifDate}>
                    {new Date(notif.created_at).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </Text>
                </View>
                {!notif.lu && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifCardUnread: {
    backgroundColor: '#FFF0ED', // Light tint for unread
    borderColor: '#FFD5CC',
  },
  notifIcon: {
    marginRight: 15,
  },
  notifContent: {
    flex: 1,
  },
  notifMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 5,
  },
  textUnread: {
    fontWeight: 'bold',
  },
  notifDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.expense,
    marginLeft: 10,
  }
});
