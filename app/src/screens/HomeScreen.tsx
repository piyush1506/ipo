import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useIpos } from '../hooks/useIpos';
import { useWatchlist } from '../hooks/useWatchlist';
import { IpoItem } from '../types/ipo';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { IpoCard } from '../components/IpoCard';
import { IpoDetailModal } from '../components/IpoDetailModal';
import { AllotmentCheckerModal } from '../components/AllotmentCheckerModal';
import { FilterModal, SortOption, TypeOption } from '../components/FilterModal';
import { AdBanner } from '../components/AdBanner';

type TabType = 'OPEN' | 'UPCOMING' | 'CLOSED' | 'WATCHLIST' | 'ALL';

interface HomeScreenProps {
  onSelectIpo?: (ipo: IpoItem) => void;
  onOpenAllotment?: (ipo: IpoItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectIpo,
  onOpenAllotment,
}) => {
  const { ipos, loading, refreshing, refresh } = useIpos();
  const { watchlist, toggleWatchlist, isSaved } = useWatchlist();
  const { width } = useWindowDimensions();

  // Search & Filters State
  const [activeTab, setActiveTab] = useState<TabType>('OPEN');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<TypeOption>('ALL');
  const [selectedSort, setSelectedSort] = useState<SortOption>('DATE_DESC');

  // Modals
  const [selectedIpo, setSelectedIpo] = useState<IpoItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);

  // Pager & Tab Bar Refs
  const pagerRef = useRef<ScrollView>(null);
  const tabBarRef = useRef<FlatList>(null);
  const activeTabRef = useRef<TabType>('OPEN');
  const isTappingRef = useRef<boolean>(false);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { OPEN: 0, UPCOMING: 0, CLOSED: 0, WATCHLIST: watchlist.length, ALL: ipos.length };
    ipos.forEach((item) => {
      const st = (item.status || '').toUpperCase();
      if (st === 'OPEN') counts.OPEN++;
      else if (st === 'UPCOMING') counts.UPCOMING++;
      else if (st === 'CLOSED') counts.CLOSED++;
    });
    return counts;
  }, [ipos, watchlist]);

  // Tabs definition
  const LIFECYCLE_TABS = useMemo(
    () => [
      { id: 'OPEN' as TabType, label: 'Live Now', count: tabCounts.OPEN, icon: 'flame' as const },
      { id: 'UPCOMING' as TabType, label: 'Upcoming', count: tabCounts.UPCOMING, icon: 'calendar-outline' as const },
      { id: 'CLOSED' as TabType, label: 'Closed', count: tabCounts.CLOSED, icon: 'checkmark-done-outline' as const },
      { id: 'WATCHLIST' as TabType, label: 'Watchlist', count: tabCounts.WATCHLIST, icon: 'bookmark-outline' as const },
      { id: 'ALL' as TabType, label: 'All Issues', count: tabCounts.ALL, icon: 'grid-outline' as const },
    ],
    [tabCounts]
  );

  // Filter & Sort per tab
  const filterAndSort = useCallback(
    (targetTab: TabType) => {
      let list = [...ipos];

      if (targetTab === 'OPEN') {
        list = list.filter((i) => (i.status || '').toUpperCase() === 'OPEN');
      } else if (targetTab === 'UPCOMING') {
        list = list.filter((i) => (i.status || '').toUpperCase() === 'UPCOMING');
      } else if (targetTab === 'CLOSED') {
        list = list.filter((i) => (i.status || '').toUpperCase() === 'CLOSED');
      } else if (targetTab === 'WATCHLIST') {
        list = list.filter((i) => watchlist.includes(i.ipoId));
      }

      if (selectedType === 'MAINBOARD') {
        list = list.filter((i) => (i.issueType || '').toUpperCase() !== 'SME');
      } else if (selectedType === 'SME') {
        list = list.filter((i) => (i.issueType || '').toUpperCase() === 'SME');
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (i) =>
            (i.companyName || '').toLowerCase().includes(q) ||
            (i.ipoName || '').toLowerCase().includes(q) ||
            (i.Symbol || '').toLowerCase().includes(q) ||
            (i.industry || '').toLowerCase().includes(q)
        );
      }

      list.sort((a, b) => {
        if (selectedSort === 'DATE_DESC') {
          const da = a.closedate ? new Date(a.closedate).getTime() : 0;
          const db = b.closedate ? new Date(b.closedate).getTime() : 0;
          return db - da;
        }
        if (selectedSort === 'DATE_ASC') {
          const da = a.closedate ? new Date(a.closedate).getTime() : Infinity;
          const db = b.closedate ? new Date(b.closedate).getTime() : Infinity;
          return da - db;
        }
        if (selectedSort === 'SIZE_DESC') {
          return Number(b.issuesize || 0) - Number(a.issuesize || 0);
        }
        if (selectedSort === 'SUB_DESC') {
          const subA =
            typeof a.totalSubscription === 'number'
              ? a.totalSubscription
              : parseFloat(String(a.totalSubscription || '0')) || 0;
          const subB =
            typeof b.totalSubscription === 'number'
              ? b.totalSubscription
              : parseFloat(String(b.totalSubscription || '0')) || 0;
          return subB - subA;
        }
        if (selectedSort === 'NAME_ASC') {
          return (a.companyName || '').localeCompare(b.companyName || '');
        }
        return 0;
      });

      return list;
    },
    [ipos, selectedType, searchQuery, selectedSort, watchlist]
  );

  const tabDataMap = useMemo(() => {
    return {
      OPEN: filterAndSort('OPEN'),
      UPCOMING: filterAndSort('UPCOMING'),
      CLOSED: filterAndSort('CLOSED'),
      WATCHLIST: filterAndSort('WATCHLIST'),
      ALL: filterAndSort('ALL'),
    };
  }, [filterAndSort]);

  const activeFilterCount = (selectedType !== 'ALL' ? 1 : 0) + (selectedSort !== 'DATE_DESC' ? 1 : 0);
  const activeListCount = tabDataMap[activeTab]?.length || 0;

  // Instant Tab Click: Immediately updates state and scrolls pager
  const handleSelectTab = (tabId: TabType, index: number) => {
    isTappingRef.current = true;
    activeTabRef.current = tabId;
    setActiveTab(tabId);
    Haptics.selectionAsync();
    pagerRef.current?.scrollTo({ x: index * width, animated: true });
    try {
      tabBarRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    } catch {}
    setTimeout(() => {
      isTappingRef.current = false;
    }, 350);
  };

  // Instant Swipe Tracker: updates the top bar in real-time as finger slides
  const handlePagerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isTappingRef.current || width <= 0) return;
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    if (newIndex >= 0 && newIndex < LIFECYCLE_TABS.length) {
      const newTab = LIFECYCLE_TABS[newIndex].id;
      if (newTab !== activeTabRef.current) {
        activeTabRef.current = newTab;
        setActiveTab(newTab);
        Haptics.selectionAsync();
        try {
          tabBarRef.current?.scrollToIndex({ index: newIndex, animated: true, viewPosition: 0.5 });
        } catch {}
      }
    }
  };

  // Auto center active tab chip on orientation/width changes
  useEffect(() => {
    const idx = LIFECYCLE_TABS.findIndex((t) => t.id === activeTab);
    if (idx >= 0) {
      pagerRef.current?.scrollTo({ x: idx * width, animated: false });
      try {
        tabBarRef.current?.scrollToIndex({ index: idx, animated: false, viewPosition: 0.5 });
      } catch {}
    }
  }, [width]);

  const handleOpenDetail = (ipo: IpoItem) => {
    if (onSelectIpo) {
      onSelectIpo(ipo);
    } else {
      setSelectedIpo(ipo);
      setIsDetailModalOpen(true);
    }
  };

  const handleOpenAllotment = (ipo: IpoItem) => {
    if (onOpenAllotment) {
      onOpenAllotment(ipo);
    } else {
      setSelectedIpo(ipo);
      setIsAllotmentModalOpen(true);
    }
  };

  const renderEmptyState = (tabId: TabType) => {
    let message = 'No active offerings in this category at the moment.';
    if (tabId === 'OPEN') {
      message = 'No IPO is currently open for bidding today. Swipe left to explore upcoming offerings.';
    } else if (tabId === 'WATCHLIST') {
      message = 'Your watchlist is empty. Tap the bookmark icon on any IPO card to save it.';
    } else if (searchQuery) {
      message = `No IPO matches "${searchQuery}". Try different keywords.`;
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open-outline" size={42} color={colors.textMuted} />
        <Text style={styles.emptyTitle}>No IPOs Found</Text>
        <Text style={styles.emptySubtitle}>{message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* High-End Fintech Header with Integrated Search */}
      <Header
        title="Groww IPOs"
        subtitle="NSE • BSE Primary Market Live"
        watchlistCount={watchlist.length}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchPress={() => {
          setIsSearchActive(!isSearchActive);
          if (isSearchActive) setSearchQuery('');
        }}
        onFilterPress={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Primary Lifecycle Status Tabs (Instant WhatsApp-style Top Swipe Bar) */}
      <View style={styles.tabsContainer}>
        <FlatList
          ref={tabBarRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          data={LIFECYCLE_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabsScroll}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item, index }) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => handleSelectTab(item.id, index)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                  {item.label}
                </Text>
                <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Clean Professional Refinement Toolbar */}
      <View style={styles.toolbar}>
        {/* Segment Capsule Switcher: All | Mainboard | SME */}
        <View style={styles.segmentControl}>
          {(
            [
              { id: 'ALL', label: 'All' },
              { id: 'MAINBOARD', label: 'Mainboard' },
              { id: 'SME', label: 'SME' },
            ] as const
          ).map((seg) => {
            const isSelected = selectedType === seg.id;
            return (
              <TouchableOpacity
                key={seg.id}
                style={[styles.segmentItem, isSelected && styles.segmentItemActive]}
                onPress={() => setSelectedType(seg.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentItemText, isSelected && styles.segmentItemTextActive]}>
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Clean Count Pill */}
        <View style={styles.countBadgePill}>
          <Text style={styles.countBadgePillText}>{activeListCount} IPOs</Text>
        </View>
      </View>

      {/* Swipeable Horizontal Pager (Instant Real-time Finger Slider) */}
      {loading && ipos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>Connecting to Live Market API...</Text>
          <Text style={styles.loadingSubtitle}>Fetching dynamic IPO data from Render backend</Text>
        </View>
      ) : (
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={handlePagerScroll}
          keyboardShouldPersistTaps="handled"
          style={styles.pager}
        >
          {LIFECYCLE_TABS.map((tab, tabIndex) => {
            const list = tabDataMap[tab.id];
            return (
              <View key={tab.id} style={[styles.pageContainer, { width }]}>
                <FlatList
                  data={list}
                  keyExtractor={(item) => `${tab.id}-${item.ipoId || item.Symbol || Math.random().toString()}`}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  ListHeaderComponent={
                    tabIndex === 0 ? (
                      <AdBanner style={{ marginBottom: 6 }} />
                    ) : null
                  }
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={refresh}
                      tintColor={colors.primary}
                      colors={[colors.primary]}
                    />
                  }
                  renderItem={({ item }) => (
                    <IpoCard
                      ipo={item}
                      onPress={() => handleOpenDetail(item)}
                      onAllotmentPress={() => handleOpenAllotment(item)}
                      isSaved={isSaved(item.ipoId)}
                      onToggleSave={() => toggleWatchlist(item.ipoId)}
                    />
                  )}
                  ListEmptyComponent={() => renderEmptyState(tab.id)}
                />
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Detail Modal */}
      <IpoDetailModal
        visible={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        ipo={selectedIpo}
        onAllotmentPress={(ipo) => handleOpenAllotment(ipo)}
        isSaved={selectedIpo ? isSaved(selectedIpo.ipoId) : false}
        onToggleSave={selectedIpo ? () => toggleWatchlist(selectedIpo.ipoId) : undefined}
      />

      {/* Allotment Checker Modal */}
      <AllotmentCheckerModal
        visible={isAllotmentModalOpen}
        onClose={() => setIsAllotmentModalOpen(false)}
        selectedIpo={selectedIpo}
      />

      {/* Filter & Sort Bottom Sheet Drawer */}
      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        onReset={() => {
          setSelectedType('ALL');
          setSelectedSort('DATE_DESC');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 2,
    gap: 2,
  },
  segmentItem: {
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  segmentItemActive: {
    backgroundColor: 'transparent',
  },
  segmentItemText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentItemTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  countBadgePill: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  countBadgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pager: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  loadingSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
