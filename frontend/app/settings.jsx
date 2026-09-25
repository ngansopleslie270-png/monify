import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import Header from '../components/Header';
import { Feather } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Paramètres" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Compte</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="lock" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Changer le mot de passe</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="shield" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Sécurité</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Préférences Générales</Text>
          
          <View style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="bell" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Notifications push</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: Colors.primary }}
              thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="globe" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Langue</Text>
            </View>
            <Text style={styles.settingValue}>Français</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="dollar-sign" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Devise</Text>
            </View>
            <Text style={styles.settingValue}>FCFA</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Support et Aide</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="help-circle" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Centre d'aide</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="message-square" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Nous contacter</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Application</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="file-text" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Conditions d'utilisation</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.border} />
          </TouchableOpacity>
          <View style={styles.settingItem}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="info" size={20} color={Colors.textSecondary} style={{marginRight: 10}} />
              <Text style={styles.settingText}>Version de l'application</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  settingGroup: {
    marginBottom: 30,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.textSecondary,
  }
});
