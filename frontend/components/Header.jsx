import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import Colors from '../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function Header({ title }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').width)).current;
  const router = useRouter();

  const fetchUnreadCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://10.175.14.80:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      // Silencieux pour ne pas gêner
    }
  };

  const fetchUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    } catch (e) {}
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchUser();
    }, [])
  );

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDrawerOpen(false);
    });
  };

  const navigateTo = (path) => {
    closeDrawer();
    router.push(path);
  };

  const handleLogout = async () => {
    closeDrawer();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      {/* Logo image */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <View style={styles.rightContainer}>
        {/* Optional Screen Title */}
        {title && <Text style={styles.screenTitle}>{title}</Text>}
        
        <TouchableOpacity style={styles.profileContainer} onPress={openDrawer}>
          <Feather name="menu" size={28} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            
            <View style={styles.drawerHeader}>
              <View style={styles.drawerAvatarContainer}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.drawerAvatar} />
                ) : (
                  <View style={styles.drawerAvatarPlaceholder}>
                    <Feather name="user" size={32} color={Colors.surface} />
                  </View>
                )}
              </View>
              <Text style={styles.drawerName}>{user?.nom || 'Utilisateur'}</Text>
              <Text style={styles.drawerEmail}>{user?.email || ''}</Text>
            </View>

            <View style={styles.drawerMenu}>
              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => navigateTo('/profile')}>
                <Feather name="user" size={20} color={Colors.text} style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Mon Profil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => navigateTo('/notifications')}>
                <Feather name="bell" size={20} color={Colors.text} style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.drawerBadge}>
                    <Text style={styles.drawerBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => navigateTo('/settings')}>
                <Feather name="settings" size={20} color={Colors.text} style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Paramètres</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem} onPress={() => navigateTo('/help')}>
                <Feather name="help-circle" size={20} color={Colors.text} style={styles.drawerMenuIcon} />
                <Text style={styles.drawerMenuText}>Aide & Support</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={Colors.expense} style={styles.drawerMenuIcon} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  logo: {
    height: 36,
    width: 120,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: 15,
  },
  profileContainer: {
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerContainer: {
    width: Dimensions.get('window').width * 0.65,
    backgroundColor: Colors.surface,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    paddingTop: 50,
  },
  drawerHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  drawerAvatarContainer: {
    marginBottom: 10,
  },
  drawerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  drawerAvatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  drawerEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 15,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  drawerMenuIcon: {
    marginRight: 15,
  },
  drawerMenuText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  drawerBadge: {
    backgroundColor: Colors.expense,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  drawerBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.expense,
  }
});
