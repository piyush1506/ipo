import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { TruecallerAdCard } from '../components/TruecallerAdCard';

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

  const isShowingUpcomingFallback =
    activeTab === 'OPEN' && tabCounts.OPEN === 0 && tabCounts.UPCOMING > 0;
  const displayedTab: TabType = isShowingUpcomingFallback ? 'UPCOMING' : activeTab;

  // Filtered & Sorted IPOs
  const filteredIpos = useMemo(() => {
    let list = [...ipos];

    // 1. Primary Lifecycle Tab Filter
    if (displayedTab === 'OPEN') {
      list = list.filter((i) => (i.status || '').toUpperCase() === 'OPEN');
    } else if (displayedTab === 'UPCOMING') {
      list = list.filter((i) => (i.status || '').toUpperCase() === 'UPCOMING');
    } else if (displayedTab === 'CLOSED') {
      list = list.filter((i) => (i.status || '').toUpperCase() === 'CLOSED');
    } else if (displayedTab === 'WATCHLIST') {
      list = list.filter((i) => watchlist.includes(i.ipoId));
    }

    // 2. Exchange / Market Segment Filter
    if (selectedType === 'MAINBOARD') {
      list = list.filter((i) => (i.issueType || '').toUpperCase() !== 'SME');
    } else if (selectedType === 'SME') {
      list = list.filter((i) => (i.issueType || '').toUpperCase() === 'SME');
    }

    // 3. Search Query
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

    // 4. Sorting
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
        const subA = typeof a.totalSubscription === 'number' ? a.totalSubscription : parseFloat(String(a.totalSubscription || '0')) || 0;
        const subB = typeof b.totalSubscription === 'number' ? b.totalSubscription : parseFloat(String(b.totalSubscription || '0')) || 0;
        return subB - subA;
      }
      if (selectedSort === 'NAME_ASC') {
        return (a.companyName || '').localeCompare(b.companyName || '');
      }
      return 0;
    });

    return list;
  }, [ipos, displayedTab, selectedType, searchQuery, selectedSort, watchlist]);

  const activeFilterCount = (selectedType !== 'ALL' ? 1 : 0) + (selectedSort !== 'DATE_DESC' ? 1 : 0);

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

      {/* Primary Lifecycle Status Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: 'OPEN', label: 'Live Now', count: tabCounts.OPEN, icon: 'flame' },
            { id: 'UPCOMING', label: 'Upcoming', count: tabCounts.UPCOMING, icon: 'calendar-outline' },
            { id: 'CLOSED', label: 'Closed', count: tabCounts.CLOSED, icon: 'checkmark-done-outline' },
            { id: 'WATCHLIST', label: 'Watchlist', count: tabCounts.WATCHLIST, icon: 'bookmark-outline' },
            { id: 'ALL', label: 'All Issues', count: tabCounts.ALL, icon: 'grid-outline' },
          ]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.tabsScroll}
          renderItem={({ item }) => {
            const isActive = displayedTab === item.id;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(item.id as TabType)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon as any}
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

        {/* Clean Count Pill (No icons) */}
        <View style={styles.countBadgePill}>
          <Text style={styles.countBadgePillText}>{filteredIpos.length} IPOs</Text>
        </View>
      </View>

      {isShowingUpcomingFallback && (
        <View style={styles.upcomingFallbackBanner}>
          <Ionicons name="calendar-outline" size={15} color={colors.primaryDark} />
          <Text style={styles.upcomingFallbackText}>
            No IPO is live right now. Showing upcoming IPOs instead.
          </Text>
        </View>
      )}

      {/* IPO List Feed */}
      {loading && ipos.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>Connecting to Live Market API...</Text>
          <Text style={styles.loadingSubtitle}>Fetching dynamic IPO data from Render backend</Text>
        </View>
      ) : (
        <FlatList
          data={filteredIpos}
          keyExtractor={(item) => item.ipoId || item.Symbol || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <AdBanner style={{ marginBottom: 6 }} />
              <TruecallerAdCard
                adIndex={0}
                style={{ marginHorizontal: 0, marginBottom: 8 }}
              />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item, index }) => (
            <>
              <IpoCard
                ipo={item}
                onPress={() => handleOpenDetail(item)}
                onAllotmentPress={() => handleOpenAllotment(item)}
                isSaved={isSaved(item.ipoId)}
                onToggleSave={() => toggleWatchlist(item.ipoId)}
              />
              {index === 2 && (
                <TruecallerAdCard
                  adIndex={1}
                  variant="compact"
                  style={{ marginHorizontal: 0, marginVertical: 6 }}
                />
              )}
            </>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No IPOs Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? `No IPO matches "${searchQuery}". Try different keywords.`
                  : displayedTab === 'WATCHLIST'
                  ? 'Your watchlist is empty. Tap the bookmark icon on any IPO card to save it.'
                  : 'No active offerings in this category at the moment.'}
              </Text>
              <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Refresh Live Feed</Text>
              </TouchableOpacity>
            </View>
          }
        />
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
  upcomingFallbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    backgroundColor: colors.primaryLight,
  },
  upcomingFallbackText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: '600',
    color: colors.primaryDark,
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
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
