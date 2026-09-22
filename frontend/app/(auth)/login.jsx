import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Remplace localhost par l'IP de ton ordinateur
  const API_URL = 'http://10.175.14.80:5000/api'; 

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    try {
      // Simulation de la connexion pour permettre l'accès libre aux interfaces
      await AsyncStorage.setItem('token', 'simulated_token_123');
      const fakeUser = { id: 1, nom: '', email: identifier };
      await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
      router.replace('/(tabs)');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Logo Header */}
          <View style={styles.logoHeader}>
            <View style={styles.themeLine}>
              <View style={[styles.themeSegment, { backgroundColor: Colors.income }]} />
              <View style={[styles.themeSegment, { backgroundColor: Colors.primary }]} />
              <View style={[styles.themeSegment, { backgroundColor: Colors.expense }]} />
            </View>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="storefront" size={14} color={Colors.primary} />
              <Text style={styles.badgeText}>ESPACE COMMERÇANT</Text>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.bannerTitle}>Ravi de vous revoir !</Text>
            </View>
            <Text style={styles.bannerSubtitle}>Gérez vos ventes, achats et dépenses en toute simplicité.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOM D'UTILISATEUR OU TÉL <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="nom d'utilisateur ou téléphone"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  placeholderTextColor="rgba(142,142,147,0.45)"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MOT DE PASSE <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formOptions}>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Feather name="check" size={14} color={Colors.surface} />}
                </View>
                <Text style={styles.checkboxText}>Rester connecté</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              <MaterialCommunityIcons name="cash-register" size={20} color={Colors.surface} />
              <Text style={styles.primaryButtonText}>{loading ? 'Connexion...' : 'Se connecter à ma caisse'}</Text>
              <Feather name="arrow-right" size={20} color={Colors.surface} />
            </TouchableOpacity>
          </View>

          {/* Register prompt */}
          <View style={styles.registerTopRow}>
            <Text style={styles.registerPromptTop}>Nouveau commerçant ?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLinkTop}>Créer votre compte</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  themeLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    flexDirection: 'row',
  },
  themeSegment: {
    flex: 1,
  },
  logoImage: {
    height: 45,
    width: 150,
    marginBottom: 14,
    display: 'none',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 82, 22, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bannerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
  registerTopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    marginTop: 10,
  },
  registerPromptTop: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  registerLinkTop: {
    color: Colors.income,
    fontSize: 15,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  profileInfo: {
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  roleBadge: {
    backgroundColor: 'rgba(156, 82, 22, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  roleText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 82, 22, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  changeButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  asterisk: {
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 12,
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF', // Using standard blue for generic checkbox or primary
    borderColor: '#007AFF',
  },
  checkboxText: {
    fontSize: 14,
    color: Colors.text,
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.expense,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  guaranteeSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
    marginBottom: 20,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  guaranteeCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  guaranteeCard: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guaranteeIcon: {
    marginBottom: 8,
  },
  guaranteeCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  guaranteeCardDesc: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 10,
  },
  footerLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLinkText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  copyright: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
