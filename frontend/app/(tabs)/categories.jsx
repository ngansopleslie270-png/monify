import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function CategoriesScreen() {
  const [stats, setStats] = useState({
    totalVentes: 0,
    totalDepenses: 0,
    categoriesVentes: [],
    categoriesDepenses: [],
    actives: 0
  });
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur de chargement du dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Catégories & Statistiques" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header Top */}
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.badgePrimary}>
              <Text style={styles.badgePrimaryText}>REGISTRE</Text>
            </View>
            <View style={styles.badgeSecondary}>
              <Text style={styles.badgeSecondaryText}>{stats.actives} actives</Text>
            </View>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>En direct</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Catégories</Text>
        <Text style={styles.subtitle}>Gérez vos flux de ventes et de dépenses quotidiennes.</Text>

        {/* Global Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryBoxHeader}>
              <View style={styles.dotIncome} />
              <Text style={styles.summaryBoxTitle}>VENTES</Text>
            </View>
            <Text style={styles.summaryBoxAmount}>{stats.totalVentes} F</Text>
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryBoxHeader}>
              <View style={styles.dotExpense} />
              <Text style={styles.summaryBoxTitle}>DÉPENSES</Text>
            </View>
            <Text style={styles.summaryBoxAmount}>{stats.totalDepenses} F</Text>
          </View>
        </View>

        {/* New Category Button */}
        <TouchableOpacity style={styles.newCategoryBtn}>
          <Feather name="plus-circle" size={18} color={Colors.surface} />
          <Text style={styles.newCategoryBtnText}>Nouvelle catégorie</Text>
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={16} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une catégorie..."
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={[styles.filterBtn, styles.filterBtnActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>Toutes (15)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Ventes (7)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Dépenses (8)</Text>
          </TouchableOpacity>
        </View>

        {/* --- SALES CATEGORIES --- */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Catégories de ventes</Text>
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>RECETTES</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Classez vos ventes afin de mieux analyser les produits ou services qui génèrent vos revenus.</Text>
          <TouchableOpacity style={styles.simulateBtn}>
            <Feather name="eye" size={12} color={Colors.primary} />
            <Text style={styles.simulateBtnText}>Simuler état vide</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {stats.categoriesVentes.map((cat, index) => (
            <CategoryCard 
              key={index}
              icon="shopping-cart" 
              iconColor="#00E676" 
              iconBg="rgba(0, 230, 118, 0.2)" 
              title={cat.nom} 
              count={`${cat.count} ventes`} 
              amount={`${cat.total} FCFA`} 
              amountColor={Colors.income}
            />
          ))}
          {stats.categoriesVentes.length === 0 && !loading && (
            <Text style={{color: Colors.textSecondary, marginLeft: 10}}>Aucune vente enregistrée.</Text>
          )}
        </View>

        {/* --- EXPENSE CATEGORIES --- */}
        <View style={[styles.sectionHeader, {marginTop: 10}]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Catégories de dépenses</Text>
            <View style={styles.badgeDanger}>
              <Text style={styles.badgeDangerText}>CHARGES</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Classez vos dépenses afin d'identifier les principales charges et préserver votre trésorerie.</Text>
          <TouchableOpacity style={styles.simulateBtn}>
            <Feather name="eye" size={12} color={Colors.primary} />
            <Text style={styles.simulateBtnText}>Simuler état vide</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {stats.categoriesDepenses.map((cat, index) => (
            <CategoryCard 
              key={index}
              icon="package" 
              iconColor="#FFAB91" 
              iconBg="rgba(255, 171, 145, 0.2)" 
              title={cat.nom} 
              count={`${cat.count} opérations`} 
              amount={`${cat.total} FCFA`} 
              amountColor={Colors.text}
            />
          ))}
          {stats.categoriesDepenses.length === 0 && !loading && (
            <Text style={{color: Colors.textSecondary, marginLeft: 10}}>Aucune dépense enregistrée.</Text>
          )}
        </View>

        <View style={styles.footerSync}>
          <Feather name="cloud" size={12} color={Colors.income} />
          <Text style={styles.footerSyncText}>Sauvegarde cloud active • Mode hors-ligne prêt</Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

// Composant Carte Catégorie
const CategoryCard = ({ icon, iconColor, iconBg, title, count, amount, amountColor }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconWrapper, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <TouchableOpacity>
        <Feather name="more-vertical" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSubtitle}>{count}</Text>
    <Text style={[styles.cardAmount, { color: amountColor }]}>{amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 15,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePrimary: {
    backgroundColor: 'rgba(156, 82, 22, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgePrimaryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  badgeSecondary: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeSecondaryText: {
    fontSize: 10,
    color: Colors.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.income,
  },
  liveText: {
    fontSize: 10,
    color: Colors.income,
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#F5F2EC',
    padding: 12,
    borderRadius: 12,
  },
  summaryBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dotIncome: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.income,
  },
  dotExpense: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  summaryBoxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  summaryBoxAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  newCategoryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginBottom: 15,
  },
  newCategoryBtnText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 12,
    color: Colors.text,
  },
  filtersRow: {
    flexDirection: 'row',
    backgroundColor: '#EAE6DF',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  filterBtnActive: {
    backgroundColor: Colors.surface,
  },
  filterText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.text,
    fontWeight: 'bold',
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badgeSuccess: {
    backgroundColor: Colors.incomeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSuccessText: {
    fontSize: 9,
    color: Colors.income,
    fontWeight: 'bold',
  },
  badgeDanger: {
    backgroundColor: 'rgba(156, 82, 22, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDangerText: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 16,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  simulateBtnText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerSync: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F2EC',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  footerSyncText: {
    fontSize: 10,
    color: Colors.textSecondary,
  }
});
