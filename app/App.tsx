import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { IpoDetailScreen } from './src/screens/IpoDetailScreen';
import { AllotmentScreen } from './src/screens/AllotmentScreen';
import { FloatingBottomNav, NavigationTab } from './src/components/FloatingBottomNav';
import { AllotmentCheckerModal } from './src/components/AllotmentCheckerModal';
import { IpoItem } from './src/types/ipo';
import { useWatchlist } from './src/hooks/useWatchlist';
import { colors } from './src/theme/colors';

import { AuthProvider } from './src/hooks/useAuth';
import { useNotifications } from './src/hooks/useNotifications';

function AppContent() {
  useNotifications();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('HOME');
  const [selectedIpo, setSelectedIpo] = useState<IpoItem | null>(null);
  const [allotmentIpo, setAllotmentIpo] = useState<IpoItem | null>(null);
  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState<boolean>(false);
  const { isSaved, toggleWatchlist } = useWatchlist();

  const handleTabPress = (tab: NavigationTab) => {
    setSelectedIpo(null);
    setCurrentTab(tab);
  };

  const renderActiveScreen = () => {
    if (selectedIpo && currentTab === 'HOME') {
      return (
        <IpoDetailScreen
          ipo={selectedIpo}
          onBack={() => setSelectedIpo(null)}
          onCheckAllotment={() => {
            setSelectedIpo(null);
            setCurrentTab('ALLOTMENT');
          }}
          isSaved={isSaved(selectedIpo.ipoId)}
          onToggleSave={() => toggleWatchlist(selectedIpo.ipoId)}
        />
      );
    }

    switch (currentTab) {
      case 'HOME':
        return (
          <HomeScreen
            onSelectIpo={(ipo) => setSelectedIpo(ipo)}
            onOpenAllotment={(ipo) => {
              setAllotmentIpo(ipo);
              setIsQuickCheckOpen(true);
            }}
          />
        );
      case 'ALLOTMENT':
        return <AllotmentScreen />;
      default:
        return <HomeScreen onSelectIpo={(ipo) => setSelectedIpo(ipo)} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />

        {/* Active Screen View */}
        <View style={styles.screenContainer}>
          {renderActiveScreen()}
        </View>

        {/* Floating Capsule Bottom Navigation */}
        {!selectedIpo && (
          <FloatingBottomNav
            currentTab={currentTab}
            onTabChange={handleTabPress}
            onQuickActionPress={() => setIsQuickCheckOpen(true)}
          />
        )}

        {/* Global Instant Allotment Checker (Triggered by ⚡ Golden Button) */}
        <AllotmentCheckerModal
          visible={isQuickCheckOpen}
          onClose={() => {
            setIsQuickCheckOpen(false);
            setAllotmentIpo(null);
          }}
          selectedIpo={allotmentIpo}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
});
