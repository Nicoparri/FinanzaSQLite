import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const icon = require('../../assets/img/icon-ios.png') as number;

/**
 * Logo de la aplicación "Finanzas personales".
 *
 * Variante `compact` (por defecto): icono pequeño + texto — para la cabecera.
 * Variante `large`: icono grande centrado — para pantallas de carga o presentación.
 */
interface AppLogoProps {
  variant?: 'compact' | 'large';
}

export default function AppLogo({ variant = 'compact' }: AppLogoProps) {
  if (variant === 'large') {
    return (
      <View style={styles.largeWrapper}>
        <Image source={icon} style={styles.largeImage} />
        <Text style={styles.largeTitle}>Finanzas</Text>
        <Text style={styles.largeSubtitle}>personales</Text>
      </View>
    );
  }

  return (
    <View style={styles.compactWrapper}>
      <Image source={icon} style={styles.compactImage} />
      <View style={styles.wordmark}>
        <Text style={styles.wordmarkTitle}>Finanzas</Text>
        <Text style={styles.wordmarkSub}>personales</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ── Variante compacta ─────────────────────────── */
  compactWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactImage: {
    width: 42,
    height: 42,
    borderRadius: 11,
  },
  wordmark: {
    gap: 1,
  },
  wordmarkTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b2530',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  wordmarkSub: {
    fontSize: 11,
    fontWeight: '400',
    color: '#5f6a75',
    letterSpacing: 0.2,
    lineHeight: 13,
  },

  /* ── Variante grande ───────────────────────────── */
  largeWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  largeImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b2530',
    letterSpacing: -0.5,
  },
  largeSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#5f6a75',
    letterSpacing: 0.5,
    marginTop: -4,
  },
});
