import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function JoinBackground({ children }) {
  return (
    <LinearGradient
      colors={['#f0f8ff', '#e6e6fa', '#fff0f5']}
      style={styles.gradient}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});