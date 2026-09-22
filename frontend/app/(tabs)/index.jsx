import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import Header from '../../components/Header';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalVentes: 0, totalDepenses: 0, solde: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://10.175.14.80:5000/api';

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const txResponse = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats({
        ...response.data,
        solde: txResponse.data.solde || 0
      });
      setRecentTransactions(txResponse.data.transactions || []);
    } catch (error) {
      console.error('Erreur dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVentes   = stats.totalVentes || 0;
  const totalDepenses = stats.totalDepenses || 0;
  const totalAchats   = 0; // Si on a un moyen de différencier achat de loyer, sinon 0
  const solde         = stats.solde || 0;
  const totalSorties  = totalDepenses;

  const getTxIcon = (type) => {
    if (type === 'vente' || type === 'revenu') return { icon: 'arrow-down-left', color: '#2E7D32', bg: '#E8F5E9' };
    return { icon: 'arrow-up-right', color: '#C62828', bg: '#FFEBEE' };
  };

  const depenseCategories = [
    { label: 'Achats Marchandises (Stock)',    amount: '0 (0%)', pct: 0, color: Colors.primary },
    { label: 'Loyers & Emplacement',           amount: '0 (0%)', pct: 0, color: '#E53935' },
    { label: 'Transports & Livraisons',        amount: '0 (0%)',   pct: 0, color: '#FB8C00' },
    { label: 'Factures & Energie (Eneo, Eau)', amount: '0 (0%)',   pct: 0, color: '#8E24AA' },
  ];

  // Tableau d'alertes et avertissements (extensible)
  const alerts = [];

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Titre de la page ── */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitleText}>Tableau de bord</Text>
        </View>

        {/* ── Salutation ── */}
        <View style={styles.greetingRow}>
          <View>
            <View style={styles.greetingNameRow}>
              <Text style={styles.greeting}>Bonjour{user?.nom ? `, ${user.nom}` : ''}</Text>
            </View>
            {user?.commerce ? (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="storefront-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.locationText}> {user.commerce} · Tresorerie saine</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── 3 Actions rapides ── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/add')}>
            <View style={[styles.qaBtnIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="cash-plus" size={26} color="#2E7D32" />
            </View>
            <Text style={[styles.qaBtnLabel, { color: '#2E7D32' }]}>+ Ajouter</Text>
            <Text style={[styles.qaBtnLabel, { color: '#2E7D32' }]}>une vente</Text>
            <Text style={styles.qaBtnSub}>Recette</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/add-purchase')}>
            <View style={[styles.qaBtnIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="package-variant-plus" size={26} color="#1565C0" />
            </View>
            <Text style={[styles.qaBtnLabel, { color: '#1565C0' }]}>+ Ajouter</Text>
            <Text style={[styles.qaBtnLabel, { color: '#1565C0' }]}>un achat</Text>
            <Text style={styles.qaBtnSub}>Marchandises</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/(tabs)/add-expense')}>
            <View style={[styles.qaBtnIcon, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="cash-minus" size={26} color="#C62828" />
            </View>
            <Text style={[styles.qaBtnLabel, { color: '#C62828' }]}>+ Ajouter</Text>
            <Text style={[styles.qaBtnLabel, { color: '#C62828' }]}>une depense</Text>
            <Text style={styles.qaBtnSub}>Charges fixes</Text>
          </TouchableOpacity>
        </View>

        {/* ── Solde de caisse ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <Text style={styles.balanceLabel}>SOLDE DE CAISSE ACTUEL</Text>
            <View style={styles.caisseBadge}>
              <MaterialCommunityIcons name="cash-register" size={12} color="#fff" />
              <Text style={styles.caisseBadgeText}>Caisse active</Text>
            </View>
          </View>
          <View style={styles.balanceAmountRow}>
            <MaterialCommunityIcons name="bank-outline" size={22} color="rgba(255,255,255,0.7)" />
            <Text style={styles.balanceAmount}>
              {' '}{solde.toLocaleString('fr-FR')}{' '}
              <Text style={styles.balanceCurrency}>FCFA</Text>
            </Text>
          </View>
          <Text style={styles.balanceSubtitle}>Liquidites nettes immediatement exploitables</Text>
        </View>

        {/* ── Stats 3 colonnes ── */}
        <View style={styles.statsRow}>
          {/* Ventes */}
          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={15} color="#2E7D32" />
            </View>
            <Text style={styles.statLabel}>VENTES</Text>
            <Text style={styles.statAmount}>{totalVentes.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statCurrency}>FCFA</Text>
            <View style={styles.statBadge}>
              <Feather name="minus" size={10} color="#2E7D32" />
              <Text style={[styles.statBadgeText, { color: '#2E7D32' }]}> 0%</Text>
            </View>
          </View>

          {/* Achats Stock */}
          <View style={[styles.statBox, styles.statBoxMid]}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="package-variant" size={15} color="#1565C0" />
            </View>
            <Text style={styles.statLabel}>{'ACHATS\nSTOCK'}</Text>
            <Text style={styles.statAmount}>{totalAchats.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statCurrency}>FCFA (0%)</Text>
            <Text style={styles.statDesc}>Marchandises</Text>
          </View>

          {/* Depenses */}
          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="receipt-text-outline" size={15} color="#C62828" />
            </View>
            <Text style={styles.statLabel}>DEPENSES</Text>
            <Text style={styles.statAmount}>{totalDepenses.toLocaleString('fr-FR')}</Text>
            <Text style={styles.statCurrency}>FCFA (0%)</Text>
            <Text style={styles.statDesc}>Loyer, cour</Text>
          </View>
        </View>

        <View style={styles.sortiesRow}>
          <Text style={styles.sortiesLabel}>
            Total sorties :{' '}
            <Text style={styles.sortiesAmount}>{totalSorties.toLocaleString('fr-FR')} FCFA</Text>
          </Text>
          <View style={styles.variationBadge}>
            <Feather name="minus" size={11} color="#C62828" />
            <Text style={styles.variationText}> 0%</Text>
          </View>
        </View>

        {/* ── Resume des operations ── */}
        <View style={styles.opsSummaryCard}>
          <View style={styles.opsSummaryLeft}>
            <MaterialCommunityIcons name="swap-horizontal" size={20} color={Colors.primary} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.opsSummaryTitle}>0 opération ce mois</Text>
              <Text style={styles.opsSummarySub}>Panier moyen : 0 FCFA</Text>
            </View>
          </View>
          <View style={styles.opsDaysBadge}>
            <Text style={styles.opsDaysText}>0 auj.</Text>
          </View>
        </View>

        {/* ── Transactions recentes ── */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Transactions recentes</Text>
            <Text style={styles.sectionSub}>Derniers flux enregistres</Text>
          </View>
          <TouchableOpacity style={styles.voirToutBtn} onPress={() => router.push('/(tabs)/sales')}>
            <Text style={styles.voirToutText}>Voir tout</Text>
            <Feather name="chevron-right" size={15} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {recentTransactions.slice(0, 5).map((tx) => {
          const { icon, color, bg } = getTxIcon(tx.type);
          const isVente = tx.type === 'vente' || tx.type === 'revenu';
          return (
            <View key={tx.id} style={styles.txCard}>
              <View style={[styles.txIcon, { backgroundColor: bg }]}>
                <Feather name={icon} size={17} color={color} />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txLabel} numberOfLines={1}>{tx.produit_service}</Text>
                <View style={styles.txTagsRow}>
                  {tx.categorie_nom && (
                    <View style={styles.txTag}>
                      <Text style={styles.txTagText}>{tx.categorie_nom}</Text>
                    </View>
                  )}
                  <Text style={styles.txSub}>{new Date(tx.date_operation).toLocaleDateString()} · {tx.mode_paiement}</Text>
                </View>
              </View>
              <Text style={[styles.txAmount, { color }]}>
                {isVente ? '+' : '-'}{tx.montant_total} FCFA
              </Text>
            </View>
          );
        })}

        {/* ── Principales depenses ── */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Principales depenses</Text>
          <View style={styles.ceMoisBadge}>
            <Text style={styles.ceMoisText}>Ce mois</Text>
          </View>
        </View>

        <View style={styles.depensesCard}>
          <View style={styles.donutRow}>
            <View style={styles.donutCircle}>
              <Text style={styles.donutPct}>0%</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.donutTitle}>Marge nette actuelle</Text>
              <Text style={styles.donutSub}>Données insuffisantes</Text>
            </View>
          </View>
          {depenseCategories.map((cat, i) => (
            <View key={i} style={styles.catRow}>
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <View style={styles.catInfo}>
                <Text style={styles.catLabel}>{cat.label}</Text>
                <View style={styles.catBarBg}>
                  <View style={[styles.catBarFill, { width: `${cat.pct * 100}%`, backgroundColor: cat.color }]} />
                </View>
              </View>
              <Text style={styles.catAmount}>{cat.amount}</Text>
            </View>
          ))}
        </View>

        {/* ── Alertes et Avertissements ── */}
        {alerts.map((alert) => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              alert.type === 'warning' ? styles.alertWarning : styles.alertDanger,
            ]}
          >
            <View style={styles.alertIconBox}>
              <Feather
                name={alert.icon}
                size={18}
                color={alert.type === 'warning' ? '#F57F17' : '#C62828'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitle, { color: alert.type === 'warning' ? '#F57F17' : '#C62828' }]}>
                {alert.text}
              </Text>
              <Text style={styles.alertSub}>{alert.sub}</Text>
            </View>
          </View>
        ))}

        {/* ── Bilan de fin de journee ── */}
        <View style={styles.bilanCard}>
          <View style={styles.bilanLeft}>
            <View style={styles.bilanIconBox}>
              <MaterialCommunityIcons name="lock-clock" size={20} color={Colors.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bilanTitle}>Bilan de fin de journee</Text>
              <Text style={styles.bilanSub}>Cloture conseillee avant 20h30</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cloturerBtn}>
            <Text style={styles.cloturerText}>Cloturer</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 50 },

  pageTitleContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2 },
  pageTitleText: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },

  // Greeting
  greetingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
  },
  greetingNameRow: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: '800', color: Colors.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  locationText: { fontSize: 11, color: Colors.textSecondary },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#2E7D32' },
  liveText: { fontSize: 12, color: '#2E7D32', fontWeight: '700' },

  // Quick actions
  quickActionsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 18 },
  qaBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', 
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
  },
  qaBtnIcon: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  qaBtnLabel: { fontSize: 13, fontWeight: '800' },
  qaBtnSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },

  // Balance card
  balanceCard: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: '#1C1C1E', borderRadius: 18, padding: 18,
  },
  balanceCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  balanceLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 0.8 },
  caisseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12,
  },
  caisseBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  balanceAmount: { fontSize: 28, fontWeight: '800', color: '#fff' },
  balanceCurrency: { fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.6)' },
  balanceSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },

  // 3-col stats
  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 10,
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  statBox: { flex: 1, padding: 12 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statIcon: {
    width: 27, height: 27, borderRadius: 7,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  statLabel: { fontSize: 9, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.3, marginBottom: 2 },
  statAmount: { fontSize: 15, fontWeight: '800', color: Colors.text },
  statCurrency: { fontSize: 9, color: Colors.textSecondary, marginBottom: 4 },
  statDesc: { fontSize: 9, color: Colors.textSecondary },
  statBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#E8F5E9', borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 2, alignSelf: 'flex-start',
  },
  statBadgeText: { fontSize: 10, fontWeight: '700' },

  // Sorties
  sortiesRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 10,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
  },
  sortiesLabel: { fontSize: 11, color: Colors.text, flex: 1 },
  sortiesAmount: { fontWeight: '700' },
  variationBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  variationText: { fontSize: 11, fontWeight: '700', color: '#C62828' },

  // Ops summary
  opsSummaryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 20,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
  },
  opsSummaryLeft: { flexDirection: 'row', alignItems: 'center' },
  opsSummaryTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  opsSummarySub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  opsDaysBadge: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  opsDaysText: { fontSize: 12, color: '#EF6C00', fontWeight: '700' },

  // Section header
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text },
  sectionSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },
  voirToutBtn: { flexDirection: 'row', alignItems: 'center' },
  voirToutText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  ceMoisBadge: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  ceMoisText: { fontSize: 11, color: '#EF6C00', fontWeight: '600' },

  // Transactions
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border,
  },
  txIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  txInfo: { flex: 1 },
  txLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  txTagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  txTag: { backgroundColor: Colors.border, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  txTagText: { fontSize: 10, color: Colors.textSecondary, fontWeight: '500' },
  txSub: { fontSize: 10, color: Colors.textSecondary },
  txAmount: { fontSize: 13, fontWeight: '800', marginLeft: 8, textAlign: 'right' },

  // Depenses breakdown
  depensesCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 16,
    backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
  },
  donutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  donutCircle: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 6, borderColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  donutPct: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  donutTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  donutSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  catDot: { width: 9, height: 9, borderRadius: 5, marginRight: 10 },
  catInfo: { flex: 1, marginRight: 8 },
  catLabel: { fontSize: 12, color: Colors.text, fontWeight: '500', marginBottom: 4 },
  catBarBg: { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  catBarFill: { height: 4, borderRadius: 2 },
  catAmount: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'right' },

  // Alertes
  alertCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 14, gap: 12,
  },
  alertWarning: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFD54F' },
  alertDanger:  { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#EF9A9A' },
  alertIconBox: { marginTop: 1 },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 17 },

  // Bilan fin de journee
  bilanCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 10, padding: 16,
    backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border,
  },
  bilanLeft: { flexDirection: 'row', alignItems: 'center' },
  bilanIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#FDF3E9', justifyContent: 'center', alignItems: 'center',
  },
  bilanTitle: { fontSize: 13, fontWeight: '700', color: Colors.text },
  bilanSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  cloturerBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  cloturerText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
