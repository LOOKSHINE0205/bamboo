import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('../(init)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#4a9960',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});