import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type NavigationTab = 'HOME' | 'ALLOTMENT';

interface TabItemConfig {
  id: NavigationTab;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItemConfig[] = [
  {
    id: 'HOME',
    label: 'Home',
    activeIcon: 'business',
    inactiveIcon: 'business-outline',
  },
  {
    id: 'ALLOTMENT',
    label: 'Allotment',
    activeIcon: 'shield-checkmark',
    inactiveIcon: 'shield-checkmark-outline',
  },
];

interface FloatingBottomNavProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onQuickActionPress?: () => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  onTabChange,
  onQuickActionPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + (Platform.OS === 'ios' ? 8 : 10);

  const handleTabPress = (tab: NavigationTab) => {
    if (tab === currentTab) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onTabChange(tab);
  };

  const handleActionPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Haptics fallback
    }
    if (onQuickActionPress) {
      onQuickActionPress();
    }
  };

  return (
    <View
      style={[styles.floatingWrapper, { bottom: bottomOffset }]}
      pointerEvents="box-none"
    >
      <View style={styles.navCapsule}>
        {/* Navigation Tabs */}
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;

          if (isActive) {
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.activeChip}
                activeOpacity={0.85}
                onPress={() => handleTabPress(tab.id)}
              >
                <Ionicons
                  name={tab.activeIcon}
                  size={19}
                  color="#18191B"
                />
                <Text style={styles.activeLabel}>{tab.label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.inactiveButton}
              activeOpacity={0.7}
              onPress={() => handleTabPress(tab.id)}
            >
              <Ionicons
                name={tab.inactiveIcon}
                size={22}
                color="#8E9297"
              />
            </TouchableOpacity>
          );
        })}

        {/* Golden Action Button (⚡ Quick Allotment Check / Boost) */}
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleActionPress}
        >
          <Ionicons name="flash" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  navCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 6,
    // Outer Border & Subtle Highlight
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    // Premium Soft Floating Ambient Drop Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 12,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF2',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 24,
    gap: 7,
  },
  activeLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#18191B',
    letterSpacing: -0.2,
  },
  inactiveButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F5B731',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    // Golden Glow Ambient Shadow
    shadowColor: '#F5B731',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.48,
    shadowRadius: 10,
    elevation: 8,
  },
});
