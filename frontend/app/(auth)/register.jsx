import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';

export default function RegisterScreen() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [commerce, setCommerce] = useState('');
  const [typeActivite, setTypeActivite] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Remplace localhost par l'IP de ton ordinateur
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleRegister = async () => {
    if (!nom.trim() || !commerce.trim() || !typeActivite.trim() || !email.trim() || !telephone.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (!acceptTerms) {
      Alert.alert('Erreur', 'Veuillez accepter les conditions de confidentialité.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        nom,
        commerce,
        typeActivite,
        email,
        telephone,
        motDePasse: password
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.utilisateur || response.data.user));
        Alert.alert('Succès', 'Inscription réussie !');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error(error);
      let message = 'Erreur de connexion au serveur.';
      if (error.response?.data) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          message = error.response.data.errors.map(e => e.msg || e.message).join('\n');
        } else if (error.response.data.message) {
          message = error.response.data.message;
        } else if (error.response.data.error) {
          message = error.response.data.error;
        }
      } else if (error.message) {
        message = error.message;
      }
      Alert.alert('Échec de l\'inscription', message);
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
          
          <Text style={styles.topText}>L'allié financier de votre commerce</Text>
          
          <Text style={styles.mainTitle}>Créez votre compte Monify</Text>
          <Text style={styles.mainSubtitle}>Suivez votre caisse, vos ventes et vos crédits clients simplement au quotidien.</Text>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            {/* Inputs */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="user" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Amina Kamga"
                  value={nom}
                  onChangeText={setNom}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom du commerce <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="storefront" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Épicerie Moderne, Prêt-à-porter..."
                  value={commerce}
                  onChangeText={setCommerce}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Type d'activité <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="grid" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Restauration, Prêt-à-porter..."
                  value={typeActivite}
                  onChangeText={setTypeActivite}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse e-mail <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="votre nom@gmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Numéro de téléphone <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>CM +237</Text>
                </View>
                <View style={[styles.inputContainer, {flex: 1, marginLeft: 10}]}>
                  <Feather name="smartphone" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="6XX XXX XXX"
                    value={telephone}
                    onChangeText={setTelephone}
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.textSecondary}
                  />
                </View>
              </View>
              <Text style={styles.inputHint}>Utile pour l'encaissement mobile et les alertes de caisse.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={Colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Feather name={showPassword ? "eye" : "eye-off"} size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe <Text style={styles.asterisk}>*</Text></Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor={Colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAcceptTerms(!acceptTerms)}>
              <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                {acceptTerms && <Feather name="check" size={14} color={Colors.surface} />}
              </View>
              <Text style={styles.checkboxText}>J'accepte les <Text style={styles.linkTextInline}>conditions de confidentialité</Text> et d'utilisation</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>{loading ? 'Création...' : 'Créer mon compte'}</Text>
              <Feather name="arrow-right" size={20} color={Colors.surface} />
            </TouchableOpacity>
            
            <View style={styles.loginPromptRow}>
              <Text style={styles.loginPrompt}>Vous avez déjà un compte ? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Connectez-vous</Text>
              </TouchableOpacity>
            </View>
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
    padding: 15,
  },
  topText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  logoHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 15,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    height: 42,
    width: 140,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  mainSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 15,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  photoSubLabel: {
    fontWeight: 'normal',
    color: Colors.textSecondary,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(156, 82, 22, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    gap: 6,
  },
  photoButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 14,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 12,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePrefix: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  phonePrefixText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: Colors.text,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  linkTextInline: {
    color: Colors.expense,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  securityBadgeText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.income,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  footerBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 10,
  },
  footerBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBadgeText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  cloudSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  cloudSyncText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  footerDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
