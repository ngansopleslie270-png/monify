import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'trending-up',
    iconLib: 'feather',
    color: '#9C5216',
    bgColor: '#FDF3E9',
    badge: '📊 Tableau de bord',
    title: 'Pilotez votre\ncaisse en temps réel',
    description:
      "Visualisez vos ventes, dépenses et solde du jour en un coup d'œil. Toujours au courant de l'état de votre commerce.",
    highlights: ['Solde instantané', 'Graphiques clairs', 'Historique complet'],
  },
  {
    id: '2',
    icon: 'account-credit-card-outline',
    iconLib: 'material',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    badge: '🤝 Crédits clients',
    title: 'Gérez vos crédits\nsans stress',
    description:
      'Enregistrez les achats à crédit de vos clients et suivez leurs remboursements facilement. Fini les impayés oubliés.',
    highlights: ['Suivi des dettes', 'Rappels automatiques', 'Historique client'],
  },
  {
    id: '3',
    icon: 'package',
    iconLib: 'feather',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    badge: '📦 Stock',
    title: 'Maîtrisez votre\nstock intelligemment',
    description:
      "Soyez alerté quand un produit manque. Gérez vos inventaires sans feuille de papier ni Excel compliqué.",
    highlights: ['Alertes rupture', 'Gestion facile', 'Export possible'],
  },
  {
    id: '4',
    icon: 'bar-chart-2',
    iconLib: 'feather',
    color: '#6A1B9A',
    bgColor: '#F3E5F5',
    badge: '📈 Rapports',
    title: 'Des rapports\npour mieux décider',
    description:
      'Analysez vos performances semaine après semaine. Identifiez vos meilleurs produits et prenez les bonnes décisions.',
    highlights: ['Rapport hebdo', 'Meilleurs produits', 'Comparatif'],
  },
  {
    id: '5',
    icon: 'wifi-off',
    iconLib: 'feather',
    color: '#00838F',
    bgColor: '#E0F7FA',
    badge: '📴 Hors ligne',
    title: 'Fonctionne même\nsans internet',
    description:
      "Votre commerce ne s'arrête pas quand la connexion est mauvaise. Monify sauvegarde tout et synchronise dès que possible.",
    highlights: ['100% Hors ligne', 'Sync automatique', 'Données sécurisées'],
  },
];

function SlideCard({ item, index, scrollX }) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const scale = scrollX.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: 'clamp',
  });

  const opacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.6, 1, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.slide, { opacity, transform: [{ scale }] }]}>
      {/* Icon Area */}
      <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
        {item.iconLib === 'feather' ? (
          <Feather name={item.icon} size={56} color={item.color} />
        ) : (
          <MaterialCommunityIcons name={item.icon} size={62} color={item.color} />
        )}
      </View>

      {/* Badge */}
      <View style={[styles.badgeContainer, { borderColor: item.color + '40', backgroundColor: item.bgColor }]}>
        <Text style={[styles.badgeText, { color: item.color }]}>{item.badge}</Text>
      </View>

      {/* Title */}
      <Text style={styles.slideTitle}>{item.title}</Text>

      {/* Description */}
      <Text style={styles.slideDescription}>{item.description}</Text>

      {/* Highlights */}
      <View style={styles.highlightsRow}>
        {item.highlights.map((h, i) => (
          <View key={i} style={[styles.highlightChip, { backgroundColor: item.bgColor, borderColor: item.color + '30' }]}>
            <Feather name="check" size={12} color={item.color} />
            <Text style={[styles.highlightText, { color: item.color }]}>{h}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false, // false requis car on anime width et backgroundColor (non supporté par le driver natif)
      listener: (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
      },
    }
  );

  const goToNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push('/(auth)/login');
    }
  };

  const skip = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />



      {/* Hero tagline */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>{"L'allié financier de\nvotre commerce 🏪"}</Text>
        <Text style={styles.heroSub}>Simple · Rapide · Fiable</Text>
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <SlideCard item={item} index={index} scrollX={scrollX} />
        )}
        style={styles.flatList}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const dotColor = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [Colors.border, Colors.primary, Colors.border],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
            />
          );
        })}
      </View>

      {/* Bottom CTAs */}
      <View style={styles.bottomSection}>
        <Text style={styles.progressText}>
          {activeIndex + 1} / {SLIDES.length}
        </Text>

        <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
          <Text style={styles.nextButtonText}>
            {activeIndex < SLIDES.length - 1 ? 'Suivant' : 'Se connecter'}
          </Text>
          <Feather
            name={activeIndex < SLIDES.length - 1 ? 'arrow-right' : 'log-in'}
            size={20}
            color={Colors.surface}
          />
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  logo: {
    height: 34,
    width: 115,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.primary + '50',
    backgroundColor: Colors.surface,
  },
  skipText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: '500',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width: width,
    paddingHorizontal: 24,
    paddingTop: 10,
    alignItems: 'center',
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeContainer: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  slideDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
  },
  nextButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginPrompt: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
  },
});
