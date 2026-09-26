import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import { BarChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';

const screenWidth = Dimensions.get("window").width;

export default function SalesScreen() {
  const router = useRouter();
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [solde, setSolde] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // UI and Filter States
  const [viewMode, setViewMode] = useState('liste'); // 'liste' ou 'analyses'
  const [timeframe, setTimeframe] = useState('mois'); // 'jour', 'semaine', 'mois', 'annee'
  const [filterType, setFilterType] = useState('all'); // 'all', 'vente', 'depense'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date Picker States
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reports States
  const [generating, setGenerating] = useState(false);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [salesByDay, setSalesByDay] = useState({ labels: [], datasets: [{ data: [] }] });
  
  // Totals States
  const [totalVentes, setTotalVentes] = useState(0);
  const [totalDepenses, setTotalDepenses] = useState(0);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
      setSolde(response.data.solde);
    } catch (error) {
      console.error('Erreur de chargement des transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Supprimer la transaction",
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API_URL}/transactions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchTransactions();
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer la transaction.");
            }
          }
        }
      ]
    );
  };

  const getWeekBounds = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0,0,0,0);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    return { monday, sunday };
  };

  // Main filter logic for both Lists and Reports
  useEffect(() => {
    const selYear = selectedDate.getFullYear();
    const selMonth = selectedDate.getMonth();
    const selDay = selectedDate.getDate();
    const { monday, sunday } = getWeekBounds(selectedDate);

    // 1. Filtrer par date (timeframe)
    let timeFiltered = transactions.filter(t => {
      const txDate = new Date(t.date_operation);
      if (timeframe === 'annee') {
        return txDate.getFullYear() === selYear;
      } else if (timeframe === 'mois') {
        return txDate.getFullYear() === selYear && txDate.getMonth() === selMonth;
      } else if (timeframe === 'semaine') {
        return txDate >= monday && txDate <= sunday;
      } else {
        return txDate.getFullYear() === selYear && txDate.getMonth() === selMonth && txDate.getDate() === selDay;
      }
    });

    // --- Génération des données pour les Rapports (Analyses) ---
    const catMap = {};
    const dayMap = {};
    let rev = 0;
    let exp = 0;

    timeFiltered.forEach(t => {
      const montant = parseFloat(t.montant_total) || 0;
      const txDateObj = new Date(t.date_operation);
      const dayStr = txDateObj.toLocaleDateString('fr-FR', { weekday: 'short' });

      if (t.type === 'vente' || t.type === 'revenu') {
        rev += montant;
        if (!dayMap[dayStr]) dayMap[dayStr] = 0;
        dayMap[dayStr] += montant;
      } else if (t.type === 'depense' || t.type === 'achat') {
        exp += montant;
        const cat = t.categorie_nom || 'Autre';
        if (!catMap[cat]) catMap[cat] = 0;
        catMap[cat] += montant;
      }
    });

    setTotalVentes(Math.round(rev));
    setTotalDepenses(Math.round(exp));

    const chartColors = ['#FF5722', '#03A9F4', '#8BC34A', '#FFC107', '#3F51B5', '#00BCD4', '#FF9800', '#9E9E9E'];
    const sortedCats = Object.keys(catMap)
      .map((cat, index) => ({ 
        name: cat, 
        population: catMap[cat], 
        color: chartColors[index % chartColors.length], 
        legendFontColor: '#7F7F7F', 
        legendFontSize: 12 
      }))
      .sort((a, b) => b.population - a.population);
      
    setExpensesByCategory(sortedCats);

    const days = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
    const chartData = days.map(d => dayMap[d] || 0);
    setSalesByDay({
      labels: days,
      datasets: [{ data: chartData }]
    });

    // --- Filtres additionnels pour la liste uniquement (Type, Recherche) ---
    let finalFiltered = timeFiltered;
    
    if (filterType === 'vente') {
      finalFiltered = finalFiltered.filter(t => t.type === 'vente' || t.type === 'revenu');
    } else if (filterType === 'depense') {
      finalFiltered = finalFiltered.filter(t => t.type === 'depense');
    } else if (filterType === 'achat') {
      finalFiltered = finalFiltered.filter(t => t.type === 'achat');
    }
    
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      finalFiltered = finalFiltered.filter(t => 
        (t.produit_service && t.produit_service.toLowerCase().includes(lowerQuery)) ||
        (t.categorie_nom && t.categorie_nom.toLowerCase().includes(lowerQuery)) ||
        (t.reference && t.reference.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredTransactions(finalFiltered);

  }, [transactions, selectedDate, timeframe, filterType, searchQuery]);

  const handleDateChange = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const token = await AsyncStorage.getItem('token');
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Rapport_Financier_${dateStr}.pdf`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const response = await fetch(`${API_URL}/rapports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ periode: timeframe })
      });

      if (!response.ok) {
        throw new Error('Erreur de génération');
      }

      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        await FileSystem.writeAsStringAsync(fileUri, base64data, { encoding: FileSystem.EncodingType.Base64 });
        
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert("Succès", "Rapport téléchargé mais le partage n'est pas disponible sur cet appareil.");
        }
        setGenerating(false);
      };

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      Alert.alert("Erreur", "Impossible de générer le rapport PDF.");
      setGenerating(false);
    }
  };


  const displayDateLabel = () => {
    if (timeframe === 'jour') {
      return selectedDate.toLocaleDateString('fr-FR');
    } else if (timeframe === 'semaine') {
      const { monday, sunday } = getWeekBounds(selectedDate);
      return `${monday.getDate()}/${monday.getMonth()+1} - ${sunday.getDate()}/${sunday.getMonth()+1}`;
    } else if (timeframe === 'mois') {
      return selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    } else {
      return selectedDate.getFullYear().toString();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Historique & Analyses" />
      
      <View style={styles.topContainer}>
        {/* Toggle Liste / Analyses */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'liste' && styles.segmentActive]} 
            onPress={() => setViewMode('liste')}
          >
            <Text style={[styles.segmentText, viewMode === 'liste' && styles.segmentTextActive]}>Liste</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentBtn, viewMode === 'analyses' && styles.segmentActive]} 
            onPress={() => setViewMode('analyses')}
          >
            <Text style={[styles.segmentText, viewMode === 'analyses' && styles.segmentTextActive]}>Analyses</Text>
          </TouchableOpacity>
        </View>

        {/* Timeframe Filters */}
        <View style={styles.timeframeRow}>
          {['jour', 'semaine', 'mois', 'annee'].map(tf => (
            <TouchableOpacity 
              key={tf}
              style={[styles.tfBtn, timeframe === tf && styles.tfBtnActive]}
              onPress={() => setTimeframe(tf)}
            >
              <Text style={[styles.tfText, timeframe === tf && styles.tfTextActive]}>
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Date Picker Button */}
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
          <Feather name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.datePickerText}>{displayDateLabel()}</Text>
          <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {viewMode === 'liste' ? (
          <>
            {/* Liste Mode */}
            <View style={styles.summaryRow}>
              <View style={styles.salesCard}>
                <Text style={styles.cardTitleDark}>TOTAL VENTES ({displayDateLabel()})</Text>
                <Text style={styles.salesAmount}>{totalVentes.toLocaleString('fr-FR')} <Text style={styles.currencyDark}>FCFA</Text></Text>
                <View style={styles.salesFooter}>
                  <Feather name="trending-up" size={12} color={Colors.income} />
                  <Text style={styles.trendText}>Dépenses : {totalDepenses.toLocaleString('fr-FR')} FCFA</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher (produit, catégorie...)"
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              <TouchableOpacity style={[styles.filterPill, filterType === 'all' && styles.filterPillActive]} onPress={() => setFilterType('all')}>
                <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>Toutes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, filterType === 'vente' && styles.filterPillActive]} onPress={() => setFilterType('vente')}>
                <Text style={[styles.filterText, filterType === 'vente' && styles.filterTextActive]}>Ventes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, filterType === 'depense' && styles.filterPillActive]} onPress={() => setFilterType('depense')}>
                <Text style={[styles.filterText, filterType === 'depense' && styles.filterTextActive]}>Dépenses</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.filterPill, filterType === 'achat' && styles.filterPillActive]} onPress={() => setFilterType('achat')}>
                <Text style={[styles.filterText, filterType === 'achat' && styles.filterTextActive]}>Achats</Text>
              </TouchableOpacity>
            </ScrollView>

            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} />
            ) : filteredTransactions.length === 0 ? (
              <Text style={{textAlign: 'center', marginTop: 20, color: Colors.textSecondary}}>
                {searchQuery.trim() !== '' ? 'Aucune transaction ne correspond.' : 'Aucune transaction trouvée pour cette période.'}
              </Text>
            ) : (
              filteredTransactions.map((trx) => {
                const isVente = trx.type === 'vente' || trx.type === 'revenu';
                const isAchat = trx.type === 'achat';
                
                let color = Colors.expense;
                let bg = Colors.expenseBg;
                let sign = '-';
                let label = 'Dépense';
                let icon = 'arrow-up-right';

                if (isVente) {
                  color = Colors.income;
                  bg = Colors.incomeBg;
                  sign = '+';
                  label = 'Vente';
                  icon = 'arrow-down-left';
                } else if (isAchat) {
                  color = '#1565C0';
                  bg = '#E3F2FD';
                  sign = '-';
                  label = 'Achat';
                  icon = 'box';
                }
                
                return (
                  <View key={trx.id} style={styles.transactionCard}>
                    <View style={styles.trxHeader}>
                      <View style={[styles.trxTypeBadgeIncome, {backgroundColor: bg}]}>
                        <Feather name={icon} size={12} color={color} />
                        <Text style={[styles.trxTypeTextIncome, {color}]}>{label}</Text>
                      </View>
                      <View style={styles.trxCategoryBadge}>
                        <Text style={styles.trxCategoryText}>{trx.categorie_nom || 'Non catégorisé'}</Text>
                      </View>
                      <View style={{ flex: 1 }} />
                      <Text style={styles.trxDate}>{new Date(trx.date_operation).toLocaleDateString('fr-FR')}</Text>
                      <TouchableOpacity onPress={() => handleDelete(trx.id)} style={{ marginLeft: 12, padding: 4 }}>
                        <Feather name="trash-2" size={16} color={Colors.expense} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.trxBody}>
                      <View style={styles.trxDetails}>
                        <Text style={styles.trxName}>{trx.produit_service}</Text>
                        <Text style={styles.trxRef}>{trx.reference} • {trx.quantite} pièce(s)</Text>
                        <View style={styles.trxPaymentRow}>
                          <MaterialCommunityIcons name="cash" size={14} color={Colors.primary} />
                          <Text style={styles.trxPaymentText}>{trx.mode_paiement}</Text>
                        </View>
                      </View>
                      <View style={styles.trxAmounts}>
                        <Text style={[styles.trxAmountIncome, {color}]}>{sign} {trx.montant_total} FCFA</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        ) : (
          <>
            {/* Analyses Mode */}
            <TouchableOpacity 
              style={styles.generateBtn} 
              onPress={handleGenerateReport}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color={Colors.surface} />
              ) : (
                <>
                  <Feather name="file-text" size={18} color={Colors.surface} />
                  <Text style={styles.generateBtnText}>Générer Rapport PDF</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Résumé ({displayDateLabel()})</Text>
              
              <View style={styles.summaryBox}>
                <View style={styles.summaryItemBox}>
                  <Text style={styles.summaryLabel}>Revenus</Text>
                  <Text style={[styles.summaryValue, {color: Colors.income}]}>{totalVentes.toLocaleString('fr-FR')} <Text style={styles.currencySmall}>FCFA</Text></Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItemBox}>
                  <Text style={styles.summaryLabel}>Dépenses</Text>
                  <Text style={[styles.summaryValue, {color: Colors.expense}]}>{totalDepenses.toLocaleString('fr-FR')} <Text style={styles.currencySmall}>FCFA</Text></Text>
                </View>
              </View>
              
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>Solde Net Période</Text>
                <Text style={styles.balanceValue}>{(totalVentes - totalDepenses).toLocaleString('fr-FR')} <Text style={{fontSize: 14}}>FCFA</Text></Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Évolution des Ventes</Text>
              <View style={styles.chartCard}>
                {salesByDay.datasets && salesByDay.datasets[0].data.some(val => val > 0) ? (
                  <BarChart
                    data={salesByDay}
                    width={screenWidth - 70}
                    height={220}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundColor: Colors.surface,
                      backgroundGradientFrom: Colors.surface,
                      backgroundGradientTo: Colors.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(156, 82, 22, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: { borderRadius: 16 }
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                  />
                ) : (
                  <Text style={styles.emptyText}>Pas assez de données pour le graphique.</Text>
                )}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Répartition des Dépenses</Text>
              <View style={styles.categoriesCard}>
                {expensesByCategory.length === 0 ? (
                  <Text style={styles.emptyText}>Aucune dépense enregistrée.</Text>
                ) : (
                  <PieChart
                    data={expensesByCategory}
                    width={screenWidth - 70}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                  />
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  topContainer: { paddingHorizontal: 15, paddingTop: 10, backgroundColor: Colors.surface, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  scrollContainer: { padding: 15, paddingBottom: 40 },
  segmentContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 10, padding: 4, marginBottom: 15 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: Colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.primary },
  timeframeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  tfBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: Colors.border },
  tfBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tfText: { fontSize: 12, color: Colors.textSecondary },
  tfTextActive: { color: Colors.surface, fontWeight: 'bold' },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(156,82,22,0.1)', padding: 10, borderRadius: 8, gap: 8 },
  datePickerText: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
  summaryRow: { marginBottom: 15 },
  salesCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: Colors.border },
  cardTitleDark: { fontSize: 11, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 8 },
  salesAmount: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 10 },
  currencyDark: { fontSize: 12, color: Colors.textSecondary },
  salesFooter: { flexDirection: 'row', alignItems: 'center' },
  trendText: { fontSize: 12, fontWeight: 'bold', color: Colors.expense, marginLeft: 4 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 15 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: Colors.text },
  filtersScroll: { flexDirection: 'row', marginBottom: 15, maxHeight: 40 },
  filterPill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginRight: 10 },
  filterPillActive: { backgroundColor: Colors.surface, borderColor: Colors.text },
  filterText: { fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.text, fontWeight: '600' },
  transactionCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  trxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  trxTypeBadgeIncome: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8, gap: 4 },
  trxTypeTextIncome: { fontSize: 10, fontWeight: '600' },
  trxCategoryBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  trxCategoryText: { fontSize: 10, color: Colors.textSecondary },
  trxDate: { fontSize: 11, color: Colors.textSecondary },
  trxBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  trxDetails: { flex: 1, paddingRight: 10 },
  trxName: { fontSize: 14, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  trxRef: { fontSize: 11, color: Colors.textSecondary, marginBottom: 8 },
  trxPaymentRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trxPaymentText: { fontSize: 11, color: Colors.textSecondary },
  trxAmounts: { alignItems: 'flex-end' },
  trxAmountIncome: { fontSize: 15, fontWeight: 'bold', marginBottom: 6 },
  generateBtn: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 20, gap: 8 },
  generateBtnText: { color: Colors.surface, fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 12 },
  summaryBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 10 },
  summaryItemBox: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 15 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, fontWeight: '600' },
  summaryValue: { fontSize: 18, fontWeight: 'bold' },
  currencySmall: { fontSize: 12 },
  balanceContainer: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 15, alignItems: 'center' },
  balanceLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', marginBottom: 4 },
  balanceValue: { fontSize: 24, fontWeight: '900', color: Colors.text },
  chartCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  categoriesCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 15, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: Colors.textSecondary, fontSize: 14, paddingVertical: 20 },
});
