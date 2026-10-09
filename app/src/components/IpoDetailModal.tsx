import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CompanyLogo } from './CompanyLogo';
import { IpoItem } from '../types/ipo';
import { colors } from '../theme/colors';
import {
  formatCurrency,
  formatCrores,
  formatDate,
  getDaysRemainingBadge,
  getCategoryReservations,
  generateIpoEditorial,
} from '../utils/ipoHelpers';

interface IpoDetailModalProps {
  visible: boolean;
  onClose: () => void;
  ipo: IpoItem | null;
  onAllotmentPress: (ipo: IpoItem) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const IpoDetailModal: React.FC<IpoDetailModalProps> = ({
  visible,
  onClose,
  ipo,
  onAllotmentPress,
  isSaved = false,
  onToggleSave,
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'OVERVIEW' | 'RESERVATION' | 'EDITORIAL'>('OVERVIEW');

  if (!ipo) return null;

  const statusBadge = getDaysRemainingBadge(ipo);
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';

  const minP = ipo.priceband?.min || 0;
  const maxP = ipo.priceband?.max || ipo.cutoffPrice || minP || 0;
  const lotSize = ipo.lotsize || 1;
  const minInvestment = maxP > 0 && lotSize > 0 ? maxP * lotSize : 0;
  const reservations = getCategoryReservations(ipo);
  const editorial = generateIpoEditorial(ipo);

  const handleOpenRhp = async () => {
    if (!ipo.rhpUrl) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await WebBrowser.openBrowserAsync(ipo.rhpUrl, {
        toolbarColor: colors.background,
        controlsColor: colors.primary,
      });
    } catch {
      Linking.openURL(ipo.rhpUrl).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.companyRow}>
                <CompanyLogo
                  companyName={ipo.companyName || ipo.ipoName || 'IPO'}
                  symbol={ipo.Symbol}
                  logoUrl={ipo.logoUrl || ipo.logo}
                  size={44}
                />
                <View style={styles.headerTitleBox}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {ipo.companyName || ipo.ipoName}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.typeBadge, isSME ? styles.smeBadge : styles.mainboardBadge]}>
                      <Text style={[styles.typeBadgeText, isSME ? styles.smeBadgeText : styles.mainboardBadgeText]}>
                        {isSME ? 'SME Platform' : 'Mainboard'}
                      </Text>
                    </View>
                    {ipo.Symbol ? <Text style={styles.symbolText}>• {ipo.Symbol}</Text> : null}
                  </View>
                </View>
              </View>

              <View style={styles.headerActions}>
                {onToggleSave && (
                  <TouchableOpacity style={styles.actionIconBtn} onPress={onToggleSave}>
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={19}
                      color={isSaved ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionIconBtn} onPress={onClose}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sub Tabs */}
            <View style={styles.subTabBar}>
              <TouchableOpacity
                style={[styles.subTabItem, activeDetailTab === 'OVERVIEW' && styles.subTabItemActive]}
                onPress={() => setActiveDetailTab('OVERVIEW')}
              >
                <Text style={[styles.subTabText, activeDetailTab === 'OVERVIEW' && styles.subTabTextActive]}>
                  Overview
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={[styles.subTabItem, activeDetailTab === 'RESERVATION' && styles.subTabItemActive]}
                onPress={() => setActiveDetailTab('RESERVATION')}
              >
                <Text style={[styles.subTabText, activeDetailTab === 'RESERVATION' && styles.subTabTextActive]}>
                  Quotas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subTabItem, activeDetailTab === 'EDITORIAL' && styles.subTabItemActive]}
                onPress={() => setActiveDetailTab('EDITORIAL')}
              >
                <Text style={[styles.subTabText, activeDetailTab === 'EDITORIAL' && styles.subTabTextActive]}>
                  Editorial
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {activeDetailTab === 'OVERVIEW' && (
              <>
                {/* Status and Size Banner */}
                <View style={styles.bannerRow}>
                  <View style={[styles.statusPill, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
                    <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
                      {statusBadge.text}
                    </Text>
                  </View>
                  <Text style={styles.issueSizeHighlight}>
                    Issue Size: <Text style={styles.boldDark}>{ipo.issuesize ? formatCrores(ipo.issuesize) : 'TBA'}</Text>
                  </Text>
                </View>

                {/* Key Financial Matrix */}
                <Text style={styles.sectionHeading}>Financial Specs</Text>
                <View style={styles.grid}>
                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>Price Band</Text>
                    <Text style={styles.gridCardValue}>
                      {minP > 0 && maxP > 0 ? (minP === maxP ? `₹${minP}` : `₹${minP} - ₹${maxP}`) : 'TBA'}
                    </Text>
                  </View>

                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>Market Lot Size</Text>
                    <Text style={styles.gridCardValue}>{lotSize} Shares</Text>
                  </View>

                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>Min. Retail Bid</Text>
                    <Text style={[styles.gridCardValue, { color: colors.text }]}>
                      {minInvestment > 0 ? formatCurrency(minInvestment) : 'TBA'}
                    </Text>
                  </View>

                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>Face Value</Text>
                    <Text style={styles.gridCardValue}>₹{ipo.faceValue || 10} / share</Text>
                  </View>

                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>Exchange</Text>
                    <Text style={styles.gridCardValue}>
                      {Array.isArray(ipo.exchange) ? ipo.exchange.join(', ') : (isSME ? 'BSE SME' : 'NSE, BSE')}
                    </Text>
                  </View>

                  <View style={styles.gridCard}>
                    <Text style={styles.gridCardLabel}>ISIN Number</Text>
                    <Text style={styles.gridCardValue} numberOfLines={1}>{ipo.isin || 'Pending'}</Text>
                  </View>
                </View>

                {/* Dates Timeline Tracker */}
                <Text style={styles.sectionHeading}>Timeline & Execution Calendar</Text>
                <View style={styles.timelineCard}>
                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDotActive} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStage}>Issue Opens</Text>
                      <Text style={styles.timelineDate}>{formatDate(ipo.opendate)}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDotActive} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStage}>Issue Closes</Text>
                      <Text style={styles.timelineDate}>{formatDate(ipo.closedate)}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, styles.timelineDotHighlight]} />
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStage, styles.boldDark]}>Allotment Finalization</Text>
                      <Text style={[styles.timelineDate, { color: colors.primaryDark }]}>
                        {formatDate(ipo.allotmentdate)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineStage}>Refunds & Unblocking</Text>
                      <Text style={styles.timelineDate}>{formatDate(ipo.refunddate || ipo.allotmentdate)}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineLine} />

                  <View style={styles.timelineItem}>
                    <View style={[styles.timelineDot, styles.timelineDotSuccess]} />
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineStage, styles.boldDark]}>Listing on Exchange</Text>
                      <Text style={[styles.timelineDate, { color: colors.successDark }]}>
                        {formatDate(ipo.listingdate)}
                      </Text>
                    </View>
                  </View>
                </View>

              </>
            )}


            {activeDetailTab === 'RESERVATION' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>SEBI Category Quota Allocations</Text>
                <View style={styles.table}>
                  {reservations.map((res, i) => (
                    <View key={i} style={[styles.reservationRow, i % 2 === 1 && styles.tableRowAlt]}>
                      <Text style={styles.resCategory}>{res.category}</Text>
                      <Text style={styles.resAlloc}>{res.allocation}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeDetailTab === 'EDITORIAL' && (
              <View style={styles.tabContent}>
                <Text style={styles.sectionHeading}>Analytical Overview & Prospectus</Text>
                {editorial.paragraphs.map((p, idx) => (
                  <Text key={idx} style={styles.editorialParagraph}>
                    {p}
                  </Text>
                ))}

                {ipo.rhpUrl && (
                  <TouchableOpacity style={styles.rhpButton} onPress={handleOpenRhp}>
                    <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.rhpButtonText}>View Official Red Herring Prospectus (RHP PDF)</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View style={{ height: 90 }} />
          </ScrollView>

          {/* Sticky Bottom Actions with Groww Green Primary CTA */}
          <View style={styles.footerActions}>
            {ipo.rhpUrl ? (
              <TouchableOpacity style={styles.footerSecondaryBtn} onPress={handleOpenRhp}>
                <Ionicons name="document-text-outline" size={16} color={colors.text} />
                <Text style={styles.footerSecondaryText}>RHP</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.footerPrimaryBtn}
              onPress={() => {
                onClose();
                onAllotmentPress(ipo);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="search" size={17} color="#FFFFFF" />
              <Text style={styles.footerPrimaryText}>Check Allotment Status</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerTitleBox: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  mainboardBadge: {
    backgroundColor: 'transparent',
    borderColor: '#93C5FD',
  },
  smeBadge: {
    backgroundColor: 'transparent',
    borderColor: '#C4B5FD',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  mainboardBadgeText: {
    color: colors.primaryDark,
  },
  smeBadgeText: {
    color: colors.growwPurple,
  },
  symbolText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  subTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subTabItem: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabItemActive: {
    borderBottomColor: colors.primary,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  subTabTextActive: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  issueSizeHighlight: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  boldDark: {
    fontWeight: '800',
    color: colors.text,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  gridCard: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  gridCardLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  gridCardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  timelineCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.border,
  },
  timelineDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  timelineDotHighlight: {
    backgroundColor: colors.warning,
    borderColor: colors.warningBorder,
  },
  timelineDotSuccess: {
    backgroundColor: colors.success,
  },
  timelineLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  timelineContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineStage: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  infoBox: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '65%',
    textAlign: 'right',
  },
  tabContent: {
    paddingVertical: 4,
  },
  table: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  reservationRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableRowAlt: {
    backgroundColor: '#FFFFFF',
  },
  resCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  resAlloc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  editorialParagraph: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  rhpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  rhpButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footerActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  footerSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  footerSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textHeading,
  },
  footerPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  footerPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
