import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, Modal, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const DEMO_PRODUITS = {
  1: ['Riz 25kg', 'Huile 5L', 'Farine de ble', 'Sucre 10kg', 'Lait concentre', 'Tomate concentree'],
  2: ['Robe bazin', 'Boubou homme', 'Pagne wax 6m', 'Jupe longue', 'Chemise en lin', 'Pagne dentelle'],
  3: ['Telephone Android', 'Chargeur rapide', 'Ecouteurs', 'Batterie externe', 'Coque de protection'],
  4: ['Creme hydratante', 'Parfum femme', 'Savon de Marseille', 'Huile de coco', 'Fond de teint'],
  5: ['Coiffure', 'Couture', 'Reparation', 'Livraison', 'Installation'],
  6: ['Autre produit', 'Article divers'],
};

export default function AddMultipleScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams(); // 'vente', 'achat', ou 'depense'

  // ----- Configuration du theme selon le type -----
  let themeColor = Colors.primary;
  let title = "Saisie Multiple";
  let apiType = 'revenu'; // pour le backend
  let emptyCartMessage = "Aucun article ajouté.";

  if (type === 'vente') {
    themeColor = Colors.primary;
    title = "Facture Globale (Ventes)";
    apiType = 'revenu';
    emptyCartMessage = "Ajoutez des produits pour créer la facture de vente.";
  } else if (type === 'achat') {
    themeColor = '#1565C0';
    title = "Approvisionnement Multiple";
    apiType = 'depense';
    emptyCartMessage = "Ajoutez des articles pour créer la facture d'achat.";
  } else if (type === 'depense') {
    themeColor = Colors.expense;
    title = "Dépenses Multiples";
    apiType = 'depense';
    emptyCartMessage = "Ajoutez les charges pour enregistrer le décaissement global.";
  }

  // ----- Etats du panier -----
  const [cart, setCart] = useState([]);
  
  // ----- Etats du formulaire d'ajout rapide -----
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [produit, setProduit] = useState('');
  const [produits, setProduits] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [quantite, setQuantite] = useState(1);
  const [prixTotal, setPrixTotal] = useState(''); // Prix total pour cette ligne

  // ----- Etats de validation finale -----
  const [paymentMode, setPaymentMode] = useState('cash');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      } else {
        // Fallback demo simple si DB vide
        setCategories([
          { id: 1, nom: 'Alimentation & Vivres', icon: 'food-variant', color: '#2E7D32', bg: '#E8F5E9' },
          { id: 2, nom: 'Textile & Habillement', icon: 'tshirt-crew-outline', color: '#1565C0', bg: '#E3F2FD' },
          { id: 3, nom: 'Divers', icon: 'dots-horizontal', color: '#546E7A', bg: '#ECEFF1' },
        ]);
      }
    } catch (_) {
      // Fallback
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === '') return;
    const newCat = {
      id: Date.now(), 
      nom: newCategoryName,
      icon: 'tag-outline',
      color: themeColor,
      bg: '#F0F0F0'
    };
    setCategories([newCat, ...categories]);
    setSelectedCategory(newCat);
    setProduits(DEMO_PRODUITS[newCat.id] || []);
    setShowCategoryPicker(false);
    setNewCategoryName('');
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setProduit('');
    setProduits(DEMO_PRODUITS[cat.id] || []);
    setShowCategoryPicker(false);
  };

  const handleAddToCart = () => {
    if (!selectedCategory || !produit || !prixTotal) {
      Alert.alert('Champs requis', 'Veuillez remplir la catégorie, le produit et le prix total de cet article.');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      categorie: selectedCategory,
      produit: produit,
      quantite: quantite,
      prixTotal: parseFloat(prixTotal)
    };

    setCart([newItem, ...cart]);
    
    // Reset form for next item
    setProduit('');
    setPrixTotal('');
    setQuantite(1);
    // On garde selectedCategory pour faciliter la saisie du prochain produit de la même catégorie
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const globalTotal = cart.reduce((sum, item) => sum + item.prixTotal, 0);

  const handleSubmitGlobal = async () => {
    if (cart.length === 0) {
      Alert.alert('Erreur', 'Le panier est vide.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Enregistrement de chaque ligne comme une transaction distincte
      // On utilise Promise.all pour tout envoyer en parallèle
      await Promise.all(cart.map(async (item) => {
        const prixUnitaireCalc = (item.prixTotal / item.quantite).toFixed(2);
        
        return axios.post(`${API_URL}/transactions`, {
          categorie_id:   item.categorie.id,
          type:           apiType, 
          produit_service: item.produit,
          quantite:       item.quantite.toString(),
          prix_unitaire:  prixUnitaireCalc.toString(),
          mode_paiement:  paymentMode,
          description:    description + ' (Lot Multi-saisie)'
        }, { headers: { Authorization: `Bearer ${token}` } });
      }));

      setShowSummary(true);
    } catch (error) {
      Alert.alert('Erreur', "Certaines transactions n'ont pas pu être enregistrées.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCart([]);
    setDescription('');
    router.push('/(tabs)');
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
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={15} color={themeColor} />
            <Text style={[styles.backButtonText, { color: themeColor }]}>Retour</Text>
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Text style={styles.mainTitle}>{title}</Text>
            <View style={[styles.badge, { backgroundColor: themeColor + '20' }]}>
              <MaterialCommunityIcons name="format-list-checks" size={12} color={themeColor} />
              <Text style={[styles.badgeText, { color: themeColor }]}>MULTI-SAISIE</Text>
            </View>
          </View>

          {/* ── FORMULAIRE D'AJOUT RAPIDE ── */}
          <View style={styles.quickAddCard}>
            <Text style={styles.cardTitle}>1. Ajouter un article</Text>
            
            <View style={styles.rowInputs}>
              <TouchableOpacity style={[styles.dropdownInput, { flex: 1, marginRight: 8 }]} onPress={() => setShowCategoryPicker(true)}>
                <Text style={selectedCategory ? styles.inputText : styles.placeholderText} numberOfLines={1}>
                  {selectedCategory ? selectedCategory.nom : 'Catégorie...'}
                </Text>
                <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.dropdownInput, { flex: 1.5 }, !selectedCategory && { opacity: 0.5 }]} 
                onPress={() => {
                  if (selectedCategory) setShowProductPicker(true);
                }}
                disabled={!selectedCategory}
              >
                <Text style={produit ? styles.inputText : styles.placeholderText} numberOfLines={1}>
                  {produit || 'Produit...'}
                </Text>
                <Feather name="chevron-down" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.rowInputs, { marginTop: 10 }]}>
              <View style={[styles.quantityContainer, { flex: 1, marginRight: 8 }]}>
                <TouchableOpacity style={styles.qtyBtnMini} onPress={() => setQuantite(Math.max(1, quantite - 1))}>
                  <Feather name="minus" size={14} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.qtyValueMini}>{quantite}</Text>
                <TouchableOpacity style={styles.qtyBtnMini} onPress={() => setQuantite(quantite + 1)}>
                  <Feather name="plus" size={14} color={themeColor} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { flex: 1.5 }]}>
                <TextInput style={styles.input} value={prixTotal} onChangeText={setPrixTotal} keyboardType="numeric" placeholder="Prix Total (FCFA)" placeholderTextColor="rgba(142,142,147,0.5)" />
              </View>
            </View>

            <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColor }]} onPress={handleAddToCart}>
              <Feather name="plus-circle" size={16} color={Colors.surface} />
              <Text style={styles.addBtnText}>Ajouter au tableau</Text>
            </TouchableOpacity>
          </View>

          {/* ── LE PANIER / TABLEAU ── */}
          <View style={styles.cartCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>2. Tableau récapitulatif</Text>
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{cart.length}</Text>
              </View>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={40} color="#E0E0E0" />
                <Text style={styles.emptyCartText}>{emptyCartMessage}</Text>
              </View>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 2 }]}>Article</Text>
                  <Text style={[styles.th, { flex: 0.8, textAlign: 'center' }]}>Qté</Text>
                  <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>Total</Text>
                  <Text style={[styles.th, { width: 30 }]}></Text>
                </View>
                {cart.map((item) => (
                  <View key={item.id} style={styles.tr}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.tdTitle} numberOfLines={1}>{item.produit}</Text>
                      <Text style={styles.tdSub} numberOfLines={1}>{item.categorie.nom}</Text>
                    </View>
                    <Text style={[styles.td, { flex: 0.8, textAlign: 'center', fontWeight: '700' }]}>{item.quantite}</Text>
                    <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: themeColor }]}>
                      {item.prixTotal.toLocaleString('fr-FR')}
                    </Text>
                    <TouchableOpacity style={{ width: 30, alignItems: 'flex-end' }} onPress={() => removeItem(item.id)}>
                      <Feather name="trash-2" size={16} color={Colors.expense} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <View style={[styles.tableFooter, { borderTopColor: themeColor }]}>
                  <Text style={styles.tfLabel}>MONTANT GLOBAL</Text>
                  <Text style={[styles.tfAmount, { color: themeColor }]}>{globalTotal.toLocaleString('fr-FR')} FCFA</Text>
                </View>
              </View>
            )}
          </View>

          {/* ── PAIEMENT ET VALIDATION ── */}
          {cart.length > 0 && (
            <View style={styles.checkoutSection}>
              <Text style={styles.cardTitle}>3. Finalisation</Text>
              
              <Text style={styles.label}>Mode de paiement global</Text>
              <View style={styles.paymentModesRow}>
                {paymentModes.map((pm) => (
                  <TouchableOpacity key={pm.key} style={[styles.paymentBtn, paymentMode === pm.key && { backgroundColor: themeColor, borderColor: themeColor }]} onPress={() => setPaymentMode(pm.key)}>
                    <MaterialCommunityIcons name={pm.icon} size={16} color={paymentMode === pm.key ? Colors.surface : Colors.textSecondary} />
                    <Text style={[styles.paymentBtnText, paymentMode === pm.key && { color: Colors.surface }]}>{pm.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 15 }]}>Note globale (Optionnel)</Text>
              <TextInput style={styles.textArea} placeholder="Ajouter une remarque pour toute la facture..." placeholderTextColor="rgba(142,142,147,0.5)" multiline numberOfLines={2} value={description} onChangeText={setDescription} />

              <TouchableOpacity style={[styles.submitGlobalBtn, { backgroundColor: themeColor }, loading && { opacity: 0.7 }]} onPress={handleSubmitGlobal} disabled={loading}>
                <MaterialCommunityIcons name="content-save-all" size={20} color={Colors.surface} />
                <Text style={styles.submitBtnText}>{loading ? 'Enregistrement...' : `Enregistrer la facture (${globalTotal.toLocaleString('fr-FR')} FCFA)`}</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── MODAL CATEGORIE ── */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent={true} onRequestClose={() => setShowCategoryPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une catégorie</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Feather name="x" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.freeInputContainer}>
              <TextInput style={styles.freeInput} placeholder="Nouvelle catégorie..." value={newCategoryName} onChangeText={setNewCategoryName} />
              <TouchableOpacity style={[styles.freeInputBtn, { backgroundColor: themeColor }]} onPress={handleAddCategory}>
                <Text style={styles.freeInputBtnText}>Créer</Text>
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
                  {selectedCategory?.id === item.id && <Feather name="check" size={20} color={themeColor} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── MODAL PRODUIT ── */}
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
              <TouchableOpacity style={[styles.freeInputBtn, { backgroundColor: themeColor }]} onPress={() => setShowProductPicker(false)}>
                <Text style={styles.freeInputBtnText}>Valider</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={produits}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setProduit(item); setShowProductPicker(false); }}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {produit === item && <Feather name="check" size={20} color={themeColor} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* ── MODAL FACTURE GENERALE (SUCCESS) ── */}
      <Modal visible={showSummary} animationType="slide" transparent={true}>
        <View style={styles.modalOverlayDark}>
          <View style={styles.summaryModalContent}>
            <View style={[styles.successIconContainer, { backgroundColor: themeColor + '20' }]}>
              <Feather name="check-circle" size={40} color={themeColor} />
            </View>
            <Text style={styles.summaryTitleMain}>Facture Enregistrée !</Text>
            <Text style={styles.summarySubtitleMain}>{cart.length} article(s) enregistré(s) avec succès.</Text>

            <View style={styles.summaryCard}>
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {cart.map((item, i) => (
                  <View key={i} style={styles.summaryRowItem}>
                    <Text style={styles.summaryItemTitle}>{item.quantite}x {item.produit}</Text>
                    <Text style={styles.summaryItemPrice}>{item.prixTotal.toLocaleString('fr-FR')} FCFA</Text>
                  </View>
                ))}
              </ScrollView>
              
              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mode paiement</Text>
                <Text style={[styles.summaryValue, { fontWeight: '700', color: themeColor }]}>
                  {paymentModes.find(p => p.key === paymentMode)?.label || '—'}
                </Text>
              </View>

              <View style={[styles.totalRow, { backgroundColor: themeColor }]}>
                <Text style={styles.totalLabel}>TOTAL FACTURE</Text>
                <Text style={styles.totalAmount}>{globalTotal.toLocaleString('fr-FR')} FCFA</Text>
              </View>
            </View>

            <TouchableOpacity style={[styles.submitGlobalBtn, { backgroundColor: themeColor, width: '100%', marginTop: 0 }]} onPress={handleCloseSummary}>
              <Text style={styles.submitBtnText}>Retour au tableau de bord</Text>
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
  backButtonText: { fontSize: 12, marginLeft: 5, fontWeight: '600' },

  titleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  mainTitle: { fontSize: 21, fontWeight: '800', color: Colors.text },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 9, fontWeight: '700' },

  quickAddCard: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 15, marginBottom: 20 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  
  rowInputs: { flexDirection: 'row', alignItems: 'center' },
  
  dropdownInput: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, height: 42,
  },
  inputContainer: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 10, height: 42, justifyContent: 'center',
  },
  input: { flex: 1, fontSize: 13, color: Colors.text },
  inputText: { fontSize: 13, color: Colors.text },
  placeholderText: { fontSize: 13, color: 'rgba(142,142,147,0.7)' },

  quantityContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, height: 42,
  },
  qtyBtnMini: { paddingHorizontal: 10, paddingVertical: 8 },
  qtyValueMini: { fontSize: 14, fontWeight: '700', color: Colors.text },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 8, gap: 8, marginTop: 15,
  },
  addBtnText: { color: Colors.surface, fontSize: 14, fontWeight: '700' },

  cartCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cartCountBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  cartCountText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  
  emptyCart: { alignItems: 'center', paddingVertical: 30 },
  emptyCartText: { fontSize: 13, color: Colors.textSecondary, marginTop: 10, textAlign: 'center' },

  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 8, marginBottom: 8 },
  th: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  tdTitle: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 2 },
  tdSub: { fontSize: 10, color: Colors.textSecondary },
  td: { fontSize: 13, color: Colors.text },
  
  tableFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 2 },
  tfLabel: { fontSize: 12, fontWeight: '800', color: Colors.text },
  tfAmount: { fontSize: 18, fontWeight: '800' },

  checkoutSection: { paddingBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.text, marginBottom: 7 },
  paymentModesRow: { flexDirection: 'row', gap: 8 },
  paymentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, paddingVertical: 12, gap: 5,
  },
  paymentBtnText: { fontSize: 11, fontWeight: '600', color: Colors.text },
  
  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12, height: 60,
    textAlignVertical: 'top', fontSize: 13, color: Colors.text,
  },

  submitGlobalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 12, gap: 8, marginTop: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  submitBtnText: { color: Colors.surface, fontSize: 15, fontWeight: '700' },

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
  freeInputBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
  freeInputBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 13 },

  // Summary Modal
  modalOverlayDark: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 },
  summaryModalContent: { width: '100%', backgroundColor: Colors.surface, borderRadius: 20, padding: 24, alignItems: 'center' },
  successIconContainer: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  summaryTitleMain: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  summarySubtitleMain: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  
  summaryCard: { width: '100%', backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 20 },
  summaryRowItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryItemTitle: { fontSize: 13, color: Colors.text, flex: 1 },
  summaryItemPrice: { fontSize: 13, fontWeight: '600', color: Colors.text },
  
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  summaryValue: { fontSize: 12, color: Colors.text, flex: 1, textAlign: 'right' },

  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 10, marginTop: 10,
  },
  totalLabel:  { fontSize: 11, fontWeight: '800', color: Colors.surface },
  totalAmount: { fontSize: 16, fontWeight: '800', color: Colors.surface },
});
