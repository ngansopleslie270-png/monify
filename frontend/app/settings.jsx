import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import Header from '../components/Header';

export default function SettingsScreen() {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Paramètres" />
      <View style={styles.content}>
        
        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Préférences Générales</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications push</Text>
            <Switch
              trackColor={{ false: "#767577", true: Colors.primary }}
              thumbColor={isEnabled ? "#f4f3f4" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.groupTitle}>Application</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Version de l'application</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

      </View>
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
