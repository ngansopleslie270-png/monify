import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useFocusEffect } from 'expo-router';
import Header from '../../components/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [clotures, setClotures] = useState([]);
  const [filteredClotures, setFilteredClotures] = useState([]);
  const [filter, setFilter] = useState('tous'); // 'tous', 'semaine', 'mois', 'annee'
  
  const [selectedCloture, setSelectedCloture] = useState(null);
  const [dayTransactions, setDayTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useFocusEffect(
    React.useCallback(() => {
      fetchClotures();
    }, [])
  );

  useEffect(() => {
    applyFilter(filter, clotures);
  }, [filter, clotures]);

  const fetchClotures = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const cloturesRes = await axios.get(`${API_URL}/dashboard/clotures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClotures(cloturesRes.data.clotures || []);
    } catch (error) {
      console.error('Erreur rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (f, list) => {
    if (f === 'tous') {
      setFilteredClotures(list);
      return;
    }
    
    const now = new Date();
    const filtered = list.filter(c => {
      const d = new Date(c.date_cloture);
      if (f === 'semaine') {
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      if (f === 'mois') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (f === 'annee') {
        return d.getFullYear() === now.getFullYear();
      }
      return true;
    });
    setFilteredClotures(filtered);
  };

  const openClotureDetails = async (cloture) => {
    setSelectedCloture(cloture);
    try {
      setLoadingTransactions(true);
      const token = await AsyncStorage.getItem('token');
      // Format date to YYYY-MM-DD
      const dateStr = new Date(cloture.date_cloture).toISOString().split('T')[0];
      const res = await axios.get(`${API_URL}/transactions?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDayTransactions(res.data.transactions || []);
    } catch (error) {
      console.error("Erreur details cloture:", error);
      Alert.alert("Erreur", "Impossible de charger les transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setSelectedCloture(null)}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
        <Text style={styles.backText}>Retour aux rapports</Text>
      </TouchableOpacity>
      
      <View style={styles.detailsHeaderCard}>
        <Text style={styles.detailsDate}>
          {new Date(selectedCloture.date_cloture).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
        <Text style={[styles.detailsSolde, { color: selectedCloture.solde_final >= 0 ? Colors.income : Colors.expense }]}>
          Solde Final : {parseFloat(selectedCloture.solde_final).toLocaleString('fr-FR')} FCFA
        </Text>
      </View>

      <Text style={styles.tableTitle}>Opérations de la journée</Text>
      
      {loadingTransactions ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} />
      ) : dayTransactions.length === 0 ? (
        <Text style={styles.emptyText}>Aucune opération enregistrée ce jour-là.</Text>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.tableHeaderCell, {flex: 2}]}>Produit/Service</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, {flex: 1}]}>Type</Text>
            <Text style={[styles.tableCell, styles.tableHeaderCell, {flex: 1, textAlign: 'right'}]}>Montant</Text>
          </View>
          {dayTransactions.map((tx, idx) => (
            <View key={tx.id || idx} style={styles.tableRow}>
              <Text style={[styles.tableCell, {flex: 2}]}>{tx.produit_service}</Text>
              <Text style={[styles.tableCell, {
                flex: 1, 
                color: tx.type === 'depense' || tx.type === 'achat' ? Colors.expense : Colors.income,
                fontWeight: '600'
              }]}>{tx.type}</Text>
              <Text style={[styles.tableCell, {flex: 1, textAlign: 'right', fontWeight: 'bold'}]}>
                {parseFloat(tx.montant_total).toLocaleString('fr-FR')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  if (loading && clotures.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Rapports Journaliers" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Rapports Journaliers" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {selectedCloture ? (
          renderDetails()
        ) : (
          <>
            {/* Filtres */}
            <View style={{ marginBottom: 20 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
              >
                {['tous', 'semaine', 'mois', 'annee'].map(f => (
                  <TouchableOpacity 
                    key={f} 
                    style={[styles.filterButton, filter === f && styles.filterButtonActive]}
                    onPress={() => setFilter(f)}
                  >
                    <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                      {f === 'tous' ? 'Tous' : f === 'semaine' ? 'Cette semaine' : f === 'mois' ? 'Ce mois' : 'Cette année'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Liste des Clôtures */}
            {filteredClotures.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="file-text" size={48} color={Colors.border} />
                <Text style={styles.emptyText}>Aucun rapport trouvé pour cette période.</Text>
              </View>
            ) : (
              filteredClotures.map((cloture, index) => (
                <TouchableOpacity 
                  key={cloture.id || index} 
                  style={styles.clotureCard}
                  onPress={() => openClotureDetails(cloture)}
                >
                  <View style={styles.clotureHeader}>
                    <Text style={styles.clotureDate}>
                      Fichier de clôture - {new Date(cloture.date_cloture).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </Text>
                    <Feather name="chevron-right" size={20} color={Colors.textSecondary} />
                  </View>
                  <View style={styles.clotureDetailsRow}>
                    <View style={styles.clotureStat}>
                      <Text style={styles.statLabel}>Ventes</Text>
                      <Text style={[styles.statValue, {color: Colors.income}]}>{parseFloat(cloture.total_ventes).toLocaleString('fr-FR')}</Text>
                    </View>
                    <View style={styles.clotureStat}>
                      <Text style={styles.statLabel}>Dépenses</Text>
                      <Text style={[styles.statValue, {color: Colors.expense}]}>{parseFloat(cloture.total_depenses).toLocaleString('fr-FR')}</Text>
                    </View>
                    <View style={styles.clotureStat}>
                      <Text style={styles.statLabel}>Solde</Text>
                      <Text style={[styles.statValue, {fontWeight: 'bold'}]}>{parseFloat(cloture.solde_final).toLocaleString('fr-FR')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}

      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20, // To allow scrolling completely to the right edge
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.surface,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 15,
  },
  clotureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  clotureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  clotureDate: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  clotureDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clotureStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Details view styles
  detailsContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
  },
  detailsHeaderCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  detailsDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  detailsSolde: {
    fontSize: 20,
    fontWeight: '900',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  tableContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: Colors.textSecondary,
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableCell: {
    fontSize: 13,
    color: Colors.text,
  },
});
