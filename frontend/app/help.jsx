import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';
import Header from '../components/Header';
import { Feather } from '@expo/vector-icons';

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Aide & Support" />
      <ScrollView style={styles.content}>
        
        <View style={styles.infoCard}>
          <Feather name="info" size={24} color={Colors.primary} style={styles.icon} />
          <Text style={styles.title}>Comment fonctionne l'application ?</Text>
          <Text style={styles.description}>
            Monify est conçue pour vous aider à suivre vos finances personnelles ou celles de votre entreprise. 
            Voici les fonctionnalités principales :
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureHeader}>
            <Feather name="pie-chart" size={20} color={Colors.expense} />
            <Text style={styles.featureTitle}>1. Suivi des Dépenses</Text>
          </View>
          <Text style={styles.featureDesc}>
            Enregistrez chaque sortie d'argent. Catégorisez-les pour savoir exactement où part votre budget mensuel.
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureHeader}>
            <Feather name="trending-up" size={20} color={Colors.income} />
            <Text style={styles.featureTitle}>2. Suivi des Ventes / Revenus</Text>
          </View>
          <Text style={styles.featureDesc}>
            Ajoutez vos rentrées d'argent, qu'il s'agisse de salaires ou de ventes. Suivez l'évolution de vos revenus au fil du temps.
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureHeader}>
            <Feather name="bar-chart-2" size={20} color={Colors.primary} />
            <Text style={styles.featureTitle}>3. Tableaux de Bord et Rapports</Text>
          </View>
          <Text style={styles.featureDesc}>
            L'écran principal et la section d'analyse dans "Historique" vous permettent de filtrer vos transactions par jour, semaine, mois et année. Vous pouvez également générer des rapports PDF complets pour votre comptabilité.
          </Text>
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
  infoCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featureItem: {
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 15,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 10,
  },
  featureDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  }
});
