import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';

// ── Donnees de demo (Achat de Stock) ───────────────────────────────
const DEMO_CATEGORIES = [
  { id: 1, nom: 'Alimentation & Vivres',  icon: 'food-variant',          color: '#2E7D32', bg: '#E8F5E9' },
  { id: 2, nom: 'Textile & Habillement',  icon: 'tshirt-crew-outline',   color: '#1565C0', bg: '#E3F2FD' },
  { id: 3, nom: 'Electronique',           icon: 'cellphone',             color: '#6A1B9A', bg: '#F3E5F5' },
  { id: 4, nom: 'Beaute & Cosmetique',    icon: 'lipstick',              color: '#AD1457', bg: '#FCE4EC' },
  { id: 6, nom: 'Divers / Matériaux',     icon: 'dots-horizontal-circle-outline', color: '#546E7A', bg: '#ECEFF1' },
];

const DEMO_PRODUITS = {
  1: ['Riz 25kg', 'Cageot de Tomates', 'Farine de blé (Sac)', 'Carton de lait', 'Pain en gros'],
  2: ['Rouleau de Bazin', 'Pagne wax 6m', 'Lot de chemises', 'Balles de friperie'],
  3: ['Lot de chargeurs', 'Ecouteurs en gros', 'Ecrans de rechange'],
  4: ['Carton de savons', 'Lot de parfums', 'Mèches brésiliennes'],
  6: ['Emballages', 'Sachets plastiques'],
};

export default function AddPurchaseScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState(DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [availableStock, setAvailableStock] = useState([]);
  const [produits, setProduits] = useState([]);
  const [produit, setProduit] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [quantite, setQuantite] = useState(1);
  const [prixAchatUnitaire, setPrixAchatUnitaire] = useState(''); // Optionnel
  const [prixTotalAchat, setPrixTotalAchat] = useState(''); // Obligatoire
  const [prixVente, setPrixVente] = useState(''); // Optionnel
  const [paymentMode, setPaymentMode] = useState('cash');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const [dateAchat] = useState(
    new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  const [editMode, setEditMode] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);

  const API_URL = 'http://10.175.14.80:5000/api';

  useEffect(() => {
    fetchCategories();
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/transactions/stock`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data) setAvailableStock(res.data);
    } catch (_) {}
  };

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      }
    } catch (_) {
      // Demo fallback
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setShowCategoryPicker(false);
    setProduit('');
    
    // Obtenir uniquement les produits associés à cette catégorie dans l'historique
    const inStock = availableStock
      .filter(item => item.categorie_id === cat.id)
      .map(item => item.produit_service);
      
    // Si aucun historique pour cette catégorie, utiliser les démos, sinon utiliser l'historique
    if (inStock.length > 0) {
      setProduits(inStock);
    } else {
      setProduits(DEMO_PRODUITS[cat.id] || []);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(`${API_URL}/categories`, {
        nom: newCategoryName,
        type: 'general',
        color: '#1565C0',
        icon: 'tag'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newCat = res.data.categorie;
      setCategories([newCat, ...categories]);
      handleSelectCategory(newCat);
      setNewCategoryName('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la catégorie.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !produit || !prixTotalAchat) {
      Alert.alert('Champs requis', 'Veuillez remplir la catégorie, le produit et le prix total d\'achat.');
      return;
    }

    // Calcul du prix unitaire pour le backend (qui exige prix_unitaire et quantite)
    const prixUnitaireCalc = (parseFloat(prixTotalAchat) / quantite).toFixed(2);

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const payload = {
        categorie_id:   selectedCategory.id,
        type:           'achat',
        produit_service: produit,
        quantite:       quantite.toString(),
        prix_unitaire:  prixUnitaireCalc.toString(),
        prix_vente:     prixVente, 
        mode_paiement:  paymentMode,
        description:    description 
          + (prixAchatUnitaire ? ` [Prix Unitaire Achat: ${prixAchatUnitaire}]` : '')
          + (prixVente ? ` [Prix Vente Unitaire: ${prixVente}]` : ''),
      };

      if (editMode && currentTransactionId) {
        await axios.put(`${API_URL}/transactions/${currentTransactionId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const response = await axios.post(`${API_URL}/transactions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentTransactionId(response.data.transactionId);
      }

      setShowSummary(true);
    } catch (error) {
      Alert.alert('Erreur', `Impossible d'enregistrer l'achat. ${error.response?.data?.message || ''}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSummary = () => {
    setShowSummary(false);
    setEditMode(false);
    setCurrentTransactionId(null);
    setProduit(''); setPrixTotalAchat(''); setPrixAchatUnitaire(''); setPrixVente(''); setQuantite(1);
    setDescription(''); setSelectedCategory(null);
    router.push('/(tabs)');
  };

  const handleDelete = async () => {
    Alert.alert('Confirmation', 'Voulez-vous vraiment annuler/supprimer cet achat ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui, supprimer', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('token');
          await axios.delete(`${API_URL}/transactions/${currentTransactionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setShowSummary(false);
          setEditMode(false);
          setCurrentTransactionId(null);
          setProduit(''); setPrixTotalAchat(''); setPrixAchatUnitaire(''); setPrixVente(''); setQuantite(1);
          setDescription(''); setSelectedCategory(null);
          Alert.alert('Succès', 'Achat supprimé.');
        } catch (error) {
          Alert.alert('Erreur', 'Impossible de supprimer l\'achat.');
        }
      }}
    ]);
  };

  const handleEdit = () => {
    setShowSummary(false);
    setEditMode(true);
  };

  const paymentModes = [
    { key: 'cash',   label: 'Especes',       icon: 'cash' },
    { key: 'mobile', label: 'Mobile Money',  icon: 'cellphone-wireless' },
    { key: 'other',  label: 'Autre',         icon: 'dots-horizontal' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
            <Feather name="arrow-left" size={15} color="#1565C0" />
            <Text style={styles.backButtonText}>Retour au tableau de bord</Text>
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>Enregistrer un achat de stock</Text>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="package-variant-plus" size={12} color="#1565C0" />
              <Text style={styles.badgeText}>APPROVISIONNEMENT</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Enregistrez les articles que vous achetez pour revendre.
          </Text>

          <TouchableOpacity style={[styles.bulkBtn, { backgroundColor: '#1565C0' }]} onPress={() => router.push({ pathname: '/add-multiple', params: { type: 'achat' } })}>
            <Feather name="layers" size={16} color={Colors.surface} />
            <Text style={[styles.bulkBtnText, { color: Colors.surface }]}>+ Enregistrer plusieurs achats</Text>
          </TouchableOpacity>

          {/* ── 1. Categorie ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie du produit <Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity style={styles.dropdownInput} onPress={() => setShowCategoryPicker(true)}>
              {selectedCategory ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={selectedCategory.icon} size={18} color={selectedCategory.color} style={{ marginRight: 8 }} />
                  <Text style={styles.inputText}>{selectedCategory.nom}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Sélectionner une catégorie...</Text>
              )}
              <Feather name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── 2. Produit ── */}
          <View style={[styles.inputGroup, !selectedCategory && { opacity: 0.5 }]}>
            <Text style={styles.label}>Nom du produit <Text style={styles.asterisk}>*</Text></Text>
            <TouchableOpacity 
              style={styles.dropdownInput} 
              onPress={() => {
                if (selectedCategory) setShowProductPicker(true);
              }}
              disabled={!selectedCategory}
            >
              <Text style={produit ? styles.inputText : styles.placeholderText}>
                {produit || 'Sélectionner ou saisir le produit...'}
              </Text>
              <Feather name="chevron-down" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── Date ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date de l'achat <Text style={styles.asterisk}>*</Text></Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput style={styles.input} value={dateAchat} editable={false} />
              <Feather name="calendar" size={16} color={Colors.textSecondary} />
            </View>
          </View>

          {/* ── Quantite ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantité achetée <Text style={styles.asterisk}>*</Text></Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantite(Math.max(1, quantite - 1))}>
                <Feather name="minus" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantite}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantite(quantite + 1)}>
                <Feather name="plus" size={18} color="#1565C0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Prix unitaire d'achat (Optionnel) ── */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Prix unitaire d'achat</Text>
              <Text style={styles.labelSub}>Optionnel</Text>
            </View>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="cash-minus" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput style={styles.input} value={prixAchatUnitaire} onChangeText={setPrixAchatUnitaire} keyboardType="numeric" placeholder="S'il est connu ou pertinent" placeholderTextColor="rgba(142,142,147,0.5)" />
              <View style={styles.currencyBadge}><Text style={styles.currencyBadgeText}>FCFA</Text></View>
            </View>
          </View>

          {/* ── Prix TOTAL d'achat (Remplace le prix unitaire comme obligatoire) ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix total d'achat <Text style={styles.asterisk}>*</Text></Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="cash-multiple" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput style={styles.input} value={prixTotalAchat} onChangeText={setPrixTotalAchat} keyboardType="numeric" placeholder="Montant total payé au fournisseur" placeholderTextColor="rgba(142,142,147,0.5)" />
              <View style={styles.currencyBadge}><Text style={styles.currencyBadgeText}>FCFA</Text></View>
            </View>
          </View>

          {/* ── Prix unitaire de vente (Optionnel) ── */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Prix unitaire de vente</Text>
              <Text style={styles.labelSub}>Optionnel</Text>
            </View>
            <Text style={styles.helperText}>
              Laissez vide si l'article acheté ne se revend pas en une seule pièce (ex: cageot vendu au détail).
            </Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="tag-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput style={styles.input} value={prixVente} onChangeText={setPrixVente} keyboardType="numeric" placeholder="À combien prévoyez-vous de le revendre ?" placeholderTextColor="rgba(142,142,147,0.5)" />
              <View style={styles.currencyBadge}><Text style={styles.currencyBadgeText}>FCFA</Text></View>
            </View>
          </View>

          {/* ── Paiement ── */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Source des fonds <Text style={styles.asterisk}>*</Text></Text>
            <View style={styles.paymentModesRow}>
              {paymentModes.map((pm) => (
                <TouchableOpacity key={pm.key} style={[styles.paymentBtn, paymentMode === pm.key && styles.paymentBtnActive]} onPress={() => setPaymentMode(pm.key)}>
                  <MaterialCommunityIcons name={pm.icon} size={16} color={paymentMode === pm.key ? Colors.surface : Colors.textSecondary} />
                  <Text style={[styles.paymentBtnText, paymentMode === pm.key && styles.paymentBtnTextActive]}>{pm.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Description ── */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Fournisseur / Note</Text>
              <Text style={styles.labelSub}>Optionnel</Text>
            </View>
            <TextInput style={styles.textArea} placeholder="Nom du fournisseur ou remarque (ex: Achat au marché central)..." placeholderTextColor="rgba(142,142,147,0.5)" multiline numberOfLines={3} value={description} onChangeText={setDescription} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }, editMode && { backgroundColor: Colors.income }]} onPress={handleSubmit} disabled={loading}>
            <Feather name="check-circle" size={18} color={Colors.surface} />
            <Text style={styles.submitBtnText}>{loading ? 'Enregistrement...' : (editMode ? 'Mettre à jour le stock' : 'Enregistrer le stock')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODALS (Pickers & Summary) ── */}
      
      {/* Categorie Picker */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Feather name="x" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Ajouter une nouvelle catégorie inline */}
            <View style={styles.freeInputContainer}>
              <TextInput 
                style={styles.freeInput} 
                placeholder="Nouvelle catégorie..." 
                value={newCategoryName} 
                onChangeText={setNewCategoryName} 
              />
              <TouchableOpacity style={styles.freeInputBtn} onPress={handleAddCategory}>
                <Text style={styles.freeInputBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categories}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectCategory(item)}>
                  <View style={[styles.modalItemIcon, { backgroundColor: item.bg }]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text style={styles.modalItemText}>{item.nom}</Text>
                  {selectedCategory?.id === item.id && <Feather name="check" size={20} color="#1565C0" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Produit Picker */}
      <Modal visible={showProductPicker} animationType="slide" transparent={true} onRequestClose={() => setShowProductPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un produit</Text>
              <TouchableOpacity onPress={() => setShowProductPicker(false)}>
                <Feather name="x" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.freeInputContainer}>
              <TextInput 
                style={styles.freeInput} 
                placeholder="Ou saisissez un nouveau produit..." 
                value={produit} 
                onChangeText={setProduit} 
              />
              <TouchableOpacity style={styles.freeInputBtn} onPress={() => setShowProductPicker(false)}>
                <Text style={styles.freeInputBtnText}>Valider</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={produits}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setProduit(item); setShowProductPicker(false); }}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {produit === item && <Feather name="check" size={20} color="#1565C0" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Summary Modal (After Registration) */}
      <Modal visible={showSummary} animationType="slide" transparent={true}>
        <View style={styles.modalOverlayDark}>
          <View style={styles.summaryModalContent}>
            <View style={styles.successIconContainer}>
              <Feather name="package" size={40} color="#1565C0" />
            </View>
            <Text style={styles.summaryTitleMain}>Achat enregistré !</Text>
            <Text style={styles.summarySubtitleMain}>Votre stock a bien été approvisionné.</Text>

            <View style={styles.summaryCard}>
              {[
                { label: 'Produit', value: produit || '—', bold: true },
                { label: 'Catégorie', value: selectedCategory?.nom || '—' },
                { label: 'Quantité', value: `${quantite}` },
                { label: 'Prix Achat (Unitaire)', value: prixAchatUnitaire ? `${parseInt(prixAchatUnitaire).toLocaleString('fr-FR')} FCFA` : 'Non spécifié' },
                { label: 'Prix Vente (Unitaire)', value: prixVente ? `${parseInt(prixVente).toLocaleString('fr-FR')} FCFA` : 'Détail / Non spécifié', isVente: true },
                { label: 'Source', value: paymentModes.find(p => p.key === paymentMode)?.label || '—', expense: true },
              ].map((row, i) => (
                <View key={i} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={[
                    styles.summaryValue, 
                    row.bold && styles.summaryValueBold, 
                    row.expense && styles.summaryValueExpense,
                    row.isVente && { color: '#2E7D32', fontWeight: row.value === 'Détail / Non spécifié' ? '400' : '700' }
                  ]}>
                    {row.value}
                  </Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>TOTAL DÉCAISSÉ</Text>
                </View>
                <Text style={styles.totalAmount}>{(parseInt(prixTotalAchat) || 0).toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, width: '100%', gap: 10 }}>
              <TouchableOpacity style={[styles.submitBtn, { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.expense }]} onPress={handleDelete}>
                <Feather name="trash-2" size={16} color={Colors.expense} />
                <Text style={[styles.submitBtnText, { color: Colors.expense, marginLeft: 6 }]}>Supprimer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary }]} onPress={handleEdit}>
                <Feather name="edit-2" size={16} color={Colors.primary} />
                <Text style={[styles.submitBtnText, { color: Colors.primary, marginLeft: 6 }]}>Modifier</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.submitBtn, { marginTop: 12, width: '100%' }]} onPress={handleCloseSummary}>
              <Text style={styles.submitBtnText}>Terminer / Nouveau</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: Colors.background },
  container:       { flex: 1 },
  scrollContainer: { padding: 15, paddingBottom: 40 },

  backButton:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backButtonText: { fontSize: 12, color: '#1565C0', marginLeft: 5, fontWeight: '600' },

  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
  mainTitle: { fontSize: 21, fontWeight: '800', color: Colors.text },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  badgeText: { color: '#1565C0', fontSize: 9, fontWeight: '700' },
  subtitle:  { fontSize: 12, color: Colors.textSecondary, marginBottom: 14, lineHeight: 18 },
  helperText: { fontSize: 10, color: Colors.textSecondary, marginBottom: 6, lineHeight: 14, fontStyle: 'italic' },

  bulkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 10,
    marginBottom: 16, gap: 8,
    shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 4,
  },
  bulkBtnText: { fontSize: 14, fontWeight: '700' },

  infoPillsRow:     { flexDirection: 'row', gap: 8, marginBottom: 18 },
  infoPill:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFEFEF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 5 },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1565C0' },
  infoPillText:     { fontSize: 11, color: Colors.text, fontWeight: '500' },
  infoPillLight:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, gap: 5 },
  infoPillTextLight:{ fontSize: 11, color: Colors.textSecondary },

  inputGroup:     { marginBottom: 16 },
  labelRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 7 },
  label:          { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 7 },
  labelSub:       { fontSize: 10, color: Colors.textSecondary },
  asterisk:       { color: Colors.expense },
  
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 14, color: Colors.text },
  
  dropdownInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 13,
  },
  inputText: { fontSize: 14, color: Colors.text },
  placeholderText: { fontSize: 14, color: 'rgba(142,142,147,0.7)' },

  quantityContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
  },
  qtyBtn:   { padding: 14 },
  qtyValue: { fontSize: 17, fontWeight: '700', color: Colors.text },

  currencyBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  currencyBadgeText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },

  paymentModesRow: { flexDirection: 'row', gap: 8 },
  paymentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingVertical: 12, gap: 5,
  },
  paymentBtnActive:     { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  paymentBtnText:       { fontSize: 11, fontWeight: '600', color: Colors.text },
  paymentBtnTextActive: { color: Colors.surface },

  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, height: 80,
    textAlignVertical: 'top', fontSize: 13, color: Colors.text,
  },

  submitBtn: {
    backgroundColor: '#1565C0', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 15, borderRadius: 12,
    gap: 8, marginTop: 10, marginBottom: 15,
    shadowColor: '#1565C0', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  submitBtnText: { color: Colors.surface, fontSize: 15, fontWeight: '700' },
  cancelBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 6 },
  cancelBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // Modals Pickers
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalItemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalItemText: { flex: 1, fontSize: 15, color: Colors.text },

  freeInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  freeInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.text },
  freeInputBtn: { backgroundColor: '#1565C0', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  freeInputBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 13 },

  // Summary Modal
  modalOverlayDark: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  summaryModalContent: { width: '100%', backgroundColor: Colors.surface, borderRadius: 20, padding: 24, alignItems: 'center' },
  successIconContainer: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  summaryTitleMain: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  summarySubtitleMain: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  
  summaryCard: { width: '100%', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  summaryRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel:        { fontSize: 12, color: Colors.textSecondary },
  summaryValue:        { fontSize: 12, color: Colors.text, flex: 1, textAlign: 'right' },
  summaryValueBold:    { fontWeight: '700' },
  summaryValueExpense: { fontWeight: '700', color: '#1565C0' },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1565C0', padding: 14, borderRadius: 10, marginTop: 10,
  },
  totalLabel:  { fontSize: 11, fontWeight: '800', color: Colors.surface },
  totalAmount: { fontSize: 16, fontWeight: '800', color: Colors.surface },
});
