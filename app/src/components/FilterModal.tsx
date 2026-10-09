import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'SIZE_DESC' | 'SUB_DESC' | 'NAME_ASC';
export type TypeOption = 'ALL' | 'MAINBOARD' | 'SME';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedType: TypeOption;
  onSelectType: (type: TypeOption) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  onReset?: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  selectedType,
  onSelectType,
  selectedSort,
  onSelectSort,
  onReset,
}) => {
  const typeOptions: { id: TypeOption; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      id: 'ALL',
      label: 'All Issues',
      desc: 'Mainboard + BSE SME & NSE Emerge',
      icon: 'apps-outline',
    },
    {
      id: 'MAINBOARD',
      label: 'Mainboard Only',
      desc: 'Regular public issues on BSE & NSE',
      icon: 'business-outline',
    },
    {
      id: 'SME',
      label: 'SME Platform',
      desc: 'High-growth small & medium enterprises',
      icon: 'rocket-outline',
    },
  ];

  const sortOptions: { id: SortOption; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    {
      id: 'DATE_DESC',
      label: 'Closing Date (Latest / Active)',
      desc: 'Show IPOs closing soonest at the top',
      icon: 'calendar-outline',
    },
    {
      id: 'SUB_DESC',
      label: 'Subscription Demand (Highest)',
      desc: 'Most subscribed & hot retail issues',
      icon: 'flame-outline',
    },
    {
      id: 'SIZE_DESC',
      label: 'Issue Size (High to Low)',
      desc: 'Mega-cap & large public offerings first',
      icon: 'bar-chart-outline',
    },
    {
      id: 'DATE_ASC',
      label: 'Closing Date (Earliest)',
      desc: 'Chronological timeline order',
      icon: 'time-outline',
    },
    {
      id: 'NAME_ASC',
      label: 'Company Name (A to Z)',
      desc: 'Alphabetical sorting',
      icon: 'text-outline',
    },
  ];

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onSelectType('ALL');
      onSelectSort('DATE_DESC');
    }
  };

  const isFilterActive = selectedType !== 'ALL' || selectedSort !== 'DATE_DESC';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Top Handle Bar */}
          <View style={styles.handleBarWrapper}>
            <View style={styles.handleBar} />
          </View>

          {/* Sheet Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter & Sort</Text>
              <Text style={styles.subtitle}>Refine IPO market view</Text>
            </View>

            <View style={styles.headerActions}>
              {isFilterActive && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={14} color={colors.primary} />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Exchange Segment */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>MARKET SEGMENT</Text>
              <Text style={styles.sectionBadge}>
                {selectedType === 'ALL' ? 'All' : selectedType === 'MAINBOARD' ? 'Mainboard' : 'SME'}
              </Text>
            </View>

            <View style={styles.optionsList}>
              {typeOptions.map((opt) => {
                const isSelected = selectedType === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => onSelectType(opt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.optionTextContainer}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>

                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sort Options */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>SORT RESULTS BY</Text>
            </View>

            <View style={styles.optionsList}>
              {sortOptions.map((opt) => {
                const isSelected = selectedSort === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sortCard, isSelected && styles.sortCardActive]}
                    onPress={() => onSelectSort(opt.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                      <Ionicons
                        name={opt.icon}
                        size={18}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.sortTextContainer}>
                      <Text style={[styles.sortLabel, isSelected && styles.sortLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.sortDesc}>{opt.desc}</Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.applyBtnText}>Apply Refinements</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBarWrapper: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  sectionBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  optionsList: {
    gap: 8,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLightest,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  iconBoxActive: {
    backgroundColor: 'transparent',
    borderColor: '#C7D2FE',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  sortCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  sortCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLightest,
  },
  sortTextContainer: {
    flex: 1,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  sortLabelActive: {
    color: colors.primary,
  },
  sortDesc: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: '#FFFFFF',
  },
  applyBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
