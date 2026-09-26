import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useFocusEffect } from 'expo-router';
import Header from '../../components/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [salesByDay, setSalesByDay] = useState([]);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const txs = response.data.transactions || [];
      setTransactions(txs);
      
      let rev = 0;
      let exp = 0;
      
      const catMap = {};
      const dayMap = {};

      txs.forEach(t => {
        const montant = parseFloat(t.montant_total) || 0;
        const dateObj = new Date(t.date_operation);
        const dayStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'short' }); 
        
        if (t.type === 'vente' || t.type === 'revenu') {
          rev += montant;
          if (!dayMap[dayStr]) dayMap[dayStr] = 0;
          dayMap[dayStr] += montant;
        } else if (t.type === 'depense') {
          exp += montant;
          const cat = t.categorie_nom || 'Autre';
          if (!catMap[cat]) catMap[cat] = 0;
          catMap[cat] += montant;
        }
      });
      
      setTotalRevenue(rev);
      setTotalExpense(exp);
      setBalance(rev - exp);
      
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
      
      // Fill days for chart (mocking a week if not enough data)
      const days = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
      const chartData = days.map(d => dayMap[d] || 0);
      
      setSalesByDay({
        labels: days,
        datasets: [{ data: chartData }]
      });

    } catch (error) {
      console.error('Erreur rapports:', error);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ periode: 'Ce mois-ci' })
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Rapports & Analyses" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Rapports & Analyses" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Action Button */}
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

        {/* Résumé Financier */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé Financier</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Revenus</Text>
                <Text style={[styles.summaryValue, {color: Colors.income}]}>{totalRevenue.toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text></Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Dépenses</Text>
                <Text style={[styles.summaryValue, {color: Colors.expense}]}>{totalExpense.toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text></Text>
              </View>
            </View>
            
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Solde Net</Text>
              <Text style={styles.balanceValue}>{balance.toLocaleString('fr-FR')} <Text style={{fontSize: 14}}>FCFA</Text></Text>
            </View>
          </View>
        </View>

        {/* Évolution des Ventes (BarChart) */}
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
                  style: {
                    borderRadius: 16
                  },
                  propsForBackgroundLines: {
                    strokeWidth: 1,
                    stroke: "#e3e3e3",
                    strokeDasharray: "0",
                  }
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            ) : (
              <Text style={styles.emptyText}>Pas assez de données pour afficher un graphique.</Text>
            )}
          </View>
        </View>

        {/* Répartition des Dépenses (PieChart) */}
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
                  backgroundColor: Colors.surface,
                  backgroundGradientFrom: Colors.surface,
                  backgroundGradientTo: Colors.surface,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  generateBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generateBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 12,
  },
  balanceContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
});
