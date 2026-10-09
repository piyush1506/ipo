import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Linking,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { CompanyLogo } from '../components/CompanyLogo';
import { IpoItem } from '../types/ipo';
import { colors } from '../theme/colors';
import { AllotmentCheckerModal } from '../components/AllotmentCheckerModal';
import { AdBanner } from '../components/AdBanner';
import {
  formatCurrency,
  formatCrores,
  formatDate,
  getDaysRemainingBadge,
  getCategoryReservations,
  generateIpoEditorial,
} from '../utils/ipoHelpers';

interface IpoDetailScreenProps {
  ipo: IpoItem;
  onBack: () => void;
  onCheckAllotment?: (ipo: IpoItem) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const IpoDetailScreen: React.FC<IpoDetailScreenProps> = ({
  ipo,
  onBack,
  onCheckAllotment,
  isSaved = false,
  onToggleSave,
}) => {
  // Allotment Modal State
  const [isAllotmentModalVisible, setIsAllotmentModalVisible] = useState<boolean>(false);

  const statusBadge = useMemo(() => getDaysRemainingBadge(ipo), [ipo]);
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';

  const normStatus = (ipo.status || '').toUpperCase();
  const isUpcoming = normStatus === 'UPCOMING';
  const isClosed = normStatus === 'CLOSED' || (ipo.closedate ? new Date(ipo.closedate).getTime() < new Date().setHours(0, 0, 0, 0) : false);
  const isOpen = !isUpcoming && !isClosed;

  const minP = ipo.priceband?.min || 0;
  const maxP = ipo.priceband?.max || ipo.cutoffPrice || minP || 0;
  const lotSize = ipo.lotsize || 1;
  const baseInvestment = maxP > 0 && lotSize > 0 ? maxP * lotSize : 0;
  const issueSizeStr = ipo.issuesize ? formatCrores(ipo.issuesize) : 'TBA';

  // Interactive Lot Calculator State
  const [selectedLots, setSelectedLots] = useState<number>(1);
  const [copiedIsin, setCopiedIsin] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscriptions calculation
  const subData = ipo.subscription || {};
  const totalSubVal = typeof ipo.totalSubscription === 'number'
    ? ipo.totalSubscription
    : parseFloat(String(ipo.totalSubscription || subData.total || '0')) || 0;
  const qibVal = typeof subData.qib === 'number' ? subData.qib : 0;
  const niiVal = typeof subData.nii === 'number' ? subData.nii : 0;
  const retailVal = typeof subData.retail === 'number' ? subData.retail : 0;

  // GMP values from API
  const rawGmp = ipo.gmp;
  const gmpPrice = typeof rawGmp === 'number'
    ? rawGmp
    : typeof rawGmp?.price === 'number'
    ? rawGmp.price
    : parseFloat(String(rawGmp?.price || '0')) || 0;

  const gmpPercent = typeof rawGmp?.percentage === 'number'
    ? rawGmp.percentage
    : (maxP > 0 && gmpPrice > 0 ? parseFloat(((gmpPrice / maxP) * 100).toFixed(1)) : 0);

  const estimatedListingPrice = maxP + gmpPrice;

  // Reservations & Editorial summary
  const reservations = useMemo(() => getCategoryReservations(ipo), [ipo]);
  const editorial = useMemo(() => generateIpoEditorial(ipo), [ipo]);

  // Max lots based on category
  const maxRetailLots = Math.max(1, Math.floor(200000 / (baseInvestment || 1)));

  // Interactive calculations
  const totalShares = selectedLots * lotSize;
  const totalAmount = selectedLots * (maxP * lotSize);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareText = `🚀 ${ipo.companyName || ipo.ipoName} IPO\n` +
        `• Price Band: ${minP > 0 ? `₹${minP} - ₹${maxP}` : 'TBA'}\n` +
        `• Lot Size: ${lotSize} Shares (${formatCurrency(baseInvestment)})\n` +
        `• Subscription: ${totalSubVal > 0 ? `${totalSubVal}x` : 'Open'}\n` +
        `• Allotment Date: ${formatDate(ipo.allotmentdate)}\n\n` +
        `Track live IPO allotment & GMP details on Groww IPO Checker!`;
      await Share.share({
        message: shareText,
        title: `${ipo.companyName} IPO Details`,
      });
    } catch {
      // ignore
    }
  };

  const handleCopyIsin = async () => {
    if (!ipo.isin) return;
    await Clipboard.setStringAsync(ipo.isin);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopiedIsin(true);
    showToast('ISIN copied to clipboard');
    setTimeout(() => setCopiedIsin(false), 2000);
  };

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

  const adjustLots = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLots((prev) => {
      const next = prev + delta;
      return next >= 1 ? next : 1;
    });
  };

  return (
    <View style={styles.container}>
      {/* Groww Top Navigation Bar with Prominent Back Button */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <View style={styles.backIconCircle}>
            <Ionicons name="arrow-back" size={18} color={colors.text} />
          </View>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.topNavCenter}>
          <Text style={styles.topNavTitle} numberOfLines={1}>
            {ipo.companyName || ipo.ipoName || 'IPO Details'}
          </Text>
        </View>

        <View style={styles.navActionButtons}>
          <TouchableOpacity
            style={styles.iconCircleBtn}
            onPress={handleShare}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
          </TouchableOpacity>

          {onToggleSave && (
            <TouchableOpacity
              style={styles.iconCircleBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onToggleSave();
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isSaved ? colors.primaryDark : colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Product Detail Scroll Feed */}
      <ScrollView
        style={styles.scrollFeed}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Header Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <CompanyLogo
              companyName={ipo.companyName || ipo.ipoName || 'IPO'}
              symbol={ipo.Symbol}
              logoUrl={ipo.logoUrl || ipo.logo}
              size={52}
            />

            <View style={styles.heroMetaBox}>
              <Text style={styles.companyTitle}>{ipo.companyName || ipo.ipoName}</Text>
              <View style={styles.tagRow}>
                <View style={[styles.badge, isSME ? styles.smeBadge : styles.mainboardBadge]}>
                  <Text style={[styles.badgeText, isSME ? styles.smeBadgeText : styles.mainboardBadgeText]}>
                    {isSME ? 'SME Platform' : 'Mainboard'}
                  </Text>
                </View>
                {ipo.Symbol ? (
                  <View style={styles.symbolPill}>
                    <Text style={styles.symbolPillText}>{ipo.Symbol}</Text>
                  </View>
                ) : null}
                {ipo.industry ? (
                  <Text style={styles.industryText} numberOfLines={1}>
                    • {ipo.industry}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Status & Deadline Banner */}
          <View style={styles.statusBannerRow}>
            <View style={[styles.statusPill, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
              <Text style={[styles.statusPillText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
            <Text style={styles.issueSizeNotice}>
              Total Issue: <Text style={styles.boldText}>{issueSizeStr}</Text>
            </Text>
          </View>
        </View>

        {/* Groww Grey Market Premium (GMP) Card */}
        {maxP > 0 && (
          <View style={styles.gmpCard}>
            <View style={styles.gmpHeader}>
              <View style={styles.gmpTitleBox}>
                <View style={styles.gmpIconCircle}>
                  <Ionicons name="trending-up" size={18} color={colors.primaryDark} />
                </View>
                <View>
                  <Text style={styles.gmpCardTitle}>Grey Market Premium (GMP)</Text>
                  <Text style={styles.gmpCardSubtitle}>Estimated listing price & market sentiment</Text>
                </View>
              </View>
              {gmpPrice > 0 ? (
                <View style={styles.gmpGainPill}>
                  <Ionicons name="arrow-up" size={13} color={colors.primaryDark} />
                  <Text style={styles.gmpGainText}>+{gmpPercent}%</Text>
                </View>
              ) : (
                <View style={[styles.gmpGainPill, { backgroundColor: colors.surfaceLight }]}>
                  <Text style={[styles.gmpGainText, { color: colors.textMuted }]}>TBA</Text>
                </View>
              )}
            </View>

            <View style={styles.gmpValuesRow}>
              <View style={styles.gmpCol}>
                <Text style={styles.gmpColLabel}>Current GMP</Text>
                <Text style={gmpPrice > 0 ? styles.gmpColValGreen : styles.gmpColVal}>
                  {gmpPrice > 0 ? `+₹${gmpPrice}` : 'TBA'}
                </Text>
              </View>
              <View style={styles.gmpDivider} />
              <View style={styles.gmpCol}>
                <Text style={styles.gmpColLabel}>Issue Price</Text>
                <Text style={styles.gmpColVal}>₹{maxP}</Text>
              </View>
              <View style={styles.gmpDivider} />
              <View style={styles.gmpCol}>
                <Text style={styles.gmpColLabel}>Est. Listing</Text>
                <Text style={gmpPrice > 0 ? styles.gmpColValGreen : styles.gmpColVal}>
                  {gmpPrice > 0 ? `₹${estimatedListingPrice}` : `₹${maxP}`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Groww Bento Key Metrics Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Key IPO Highlights</Text>
          <View style={styles.bentoGrid}>
            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Price Band</Text>
              <Text style={styles.bentoValue}>
                {minP > 0 && maxP > 0
                  ? minP === maxP
                    ? `₹${minP}`
                    : `₹${minP} - ₹${maxP}`
                  : 'TBA'}
              </Text>
              <Text style={styles.bentoSub}>Per Equity Share</Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Min. Investment</Text>
              <Text style={[styles.bentoValue, { color: colors.primaryDark }]}>
                {baseInvestment > 0 ? formatCurrency(baseInvestment) : 'TBA'}
              </Text>
              <Text style={styles.bentoSub}>1 Lot ({lotSize} Shares)</Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Issue Size</Text>
              <Text style={styles.bentoValue}>{issueSizeStr}</Text>
              <Text style={styles.bentoSub}>Total Offering</Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Market Lot</Text>
              <Text style={styles.bentoValue}>{lotSize} Shares</Text>
              <Text style={styles.bentoSub}>Min Application</Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Face Value</Text>
              <Text style={styles.bentoValue}>₹{ipo.faceValue || 10}</Text>
              <Text style={styles.bentoSub}>Per Share</Text>
            </View>

            <View style={styles.bentoCard}>
              <Text style={styles.bentoLabel}>Listing At</Text>
              <Text style={styles.bentoValue}>
                {Array.isArray(ipo.exchange) ? ipo.exchange.join(', ') : (isSME ? 'BSE SME' : 'NSE, BSE')}
              </Text>
              <Text style={styles.bentoSub}>Stock Exchanges</Text>
            </View>
          </View>
        </View>

        {/* Live Bidding & Subscription Pulse */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Subscription Demand Details</Text>
            {totalSubVal > 0 && (
              <View style={styles.subHighlightBadge}>
                <Ionicons name="flame" size={13} color="#B45309" />
                <Text style={styles.subHighlightText}>{totalSubVal.toFixed(2)}x Overall</Text>
              </View>
            )}
          </View>

          <View style={styles.subGridContainer}>
            <View style={styles.subGridRow}>
              <View style={styles.subGridItem}>
                <Text style={styles.subGridLabel}>Total Subscription</Text>
                <Text style={[styles.subGridValue, styles.highlightTotal]}>
                  {totalSubVal > 0 ? `${totalSubVal.toFixed(2)}x` : 'Bidding in Progress'}
                </Text>
              </View>
              <View style={styles.subGridDivider} />
              <View style={styles.subGridItem}>
                <Text style={styles.subGridLabel}>QIB (Institutions)</Text>
                <Text style={styles.subGridValue}>
                  {qibVal > 0 ? `${qibVal.toFixed(2)}x` : '—'}
                </Text>
              </View>
            </View>

            <View style={styles.subGridRowDivider} />

            <View style={styles.subGridRow}>
              <View style={styles.subGridItem}>
                <Text style={styles.subGridLabel}>NII / HNI</Text>
                <Text style={styles.subGridValue}>
                  {niiVal > 0 ? `${niiVal.toFixed(2)}x` : '—'}
                </Text>
              </View>
              <View style={styles.subGridDivider} />
              <View style={styles.subGridItem}>
                <Text style={styles.subGridLabel}>Retail (RII)</Text>
                <Text style={styles.subGridValue}>
                  {retailVal > 0 ? `${retailVal.toFixed(2)}x` : '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Groww IPO Timeline Calendar */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>IPO Bidding & Allotment Schedule</Text>
          <View style={styles.timelineCard}>
            {/* Step 1: Open */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineIconActive}>
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineStageName}>Offer Starts</Text>
                <Text style={styles.timelineDateText}>{formatDate(ipo.opendate)}</Text>
              </View>
            </View>

            <View style={styles.verticalConnector} />

            {/* Step 2: Close */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineIconActive}>
                <Ionicons name="time-outline" size={13} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineStageName}>Offer Ends</Text>
                <Text style={styles.timelineDateText}>{formatDate(ipo.closedate)}</Text>
              </View>
            </View>

            <View style={styles.verticalConnector} />

            {/* Step 3: Allotment */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIconActive, { backgroundColor: colors.primaryDark }]}>
                <Ionicons name="search" size={13} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={[styles.timelineStageName, styles.boldDark]}>Allotment Finalization</Text>
                <Text style={[styles.timelineDateText, { color: colors.primaryDark, fontWeight: '700' }]}>
                  {formatDate(ipo.allotmentdate)}
                </Text>
              </View>
            </View>

            <View style={styles.verticalConnector} />

            {/* Step 4: Refunds */}
            <View style={styles.timelineStep}>
              <View style={styles.timelineIconMuted}>
                <Ionicons name="arrow-undo-outline" size={13} color={colors.textSecondary} />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={styles.timelineStageName}>Refund Initiation & Mandate Release</Text>
                <Text style={styles.timelineDateText}>{formatDate(ipo.refunddate || ipo.allotmentdate)}</Text>
              </View>
            </View>

            <View style={styles.verticalConnector} />

            {/* Step 5: Listing */}
            <View style={styles.timelineStep}>
              <View style={[styles.timelineIconActive, { backgroundColor: '#10B981' }]}>
                <Ionicons name="rocket-outline" size={13} color="#FFFFFF" />
              </View>
              <View style={styles.timelineTextBox}>
                <Text style={[styles.timelineStageName, styles.boldDark]}>Listing on NSE / BSE</Text>
                <Text style={[styles.timelineDateText, { color: '#059669', fontWeight: '700' }]}>
                  {formatDate(ipo.listingdate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Interactive In-line Groww Lot & Bid Amount Calculator */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interactive Bid & Lot Calculator</Text>
          <View style={styles.calculatorCard}>
            <View style={styles.calcHeader}>
              <Text style={styles.calcTitle}>Calculate Application Amount</Text>
              <Text style={styles.calcSubtitle}>1 Lot = {lotSize} Shares @ ₹{maxP || minP || 0} / share</Text>
            </View>

            {/* Interactive Counter Row */}
            <View style={styles.calcCounterRow}>
              <View>
                <Text style={styles.counterLabel}>Number of Lots</Text>
                <Text style={styles.counterNote}>
                  {selectedLots === 1
                    ? 'Minimum Retail Application'
                    : selectedLots > maxRetailLots
                    ? 'HNI / NII Tier'
                    : 'Retail Category'}
                </Text>
              </View>

              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, selectedLots <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => adjustLots(-1)}
                  disabled={selectedLots <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={18} color={selectedLots <= 1 ? colors.textMuted : colors.text} />
                </TouchableOpacity>

                <View style={styles.stepperValueBox}>
                  <Text style={styles.stepperValueText}>{selectedLots}</Text>
                </View>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => adjustLots(1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Calculated Breakdown Box */}
            <View style={styles.calcResultsBox}>
              <View style={styles.calcResultRow}>
                <Text style={styles.calcResultLabel}>Total Shares</Text>
                <Text style={styles.calcResultVal}>{totalShares} Shares</Text>
              </View>
              <View style={styles.calcResultRow}>
                <Text style={styles.calcResultLabel}>Cut-off Bid Price</Text>
                <Text style={styles.calcResultVal}>₹{maxP}</Text>
              </View>
              <View style={[styles.calcResultRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Funds to Block (UPI)</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
              </View>
              {gmpPrice > 0 && (
                <View style={[styles.calcResultRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
                  <Text style={styles.calcResultLabel}>Est. Listing Gain (Pre-Tax)</Text>
                  <Text style={[styles.calcResultVal, { color: colors.successDark, fontWeight: '800' }]}>
                    +{formatCurrency(totalShares * gmpPrice)} (+{gmpPercent}%)
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* SEBI Category Quotas & Reservations */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Category Quota Allocations</Text>
          <View style={styles.quotaTable}>
            {reservations.map((item, idx) => (
              <View
                key={idx}
                style={[styles.quotaRow, idx % 2 === 1 && styles.quotaRowAlt]}
              >
                <Text style={styles.quotaCategory}>{item.category}</Text>
                <Text style={styles.quotaAllocation}>{item.allocation}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* About Company & Editorial Insights */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About {ipo.companyName || 'Company'}</Text>
          <View style={styles.aboutCard}>
            {editorial.paragraphs.map((p, i) => (
              <Text key={i} style={styles.aboutParagraph}>
                {p}
              </Text>
            ))}

            {/* Official ISIN & RHP Box */}
            <View style={styles.prospectusBox}>
              {ipo.isin ? (
                <View style={styles.isinRow}>
                  <View>
                    <Text style={styles.isinLabel}>ISIN Identifier</Text>
                    <Text style={styles.isinValue}>{ipo.isin}</Text>
                  </View>
                  <TouchableOpacity style={styles.copyIsinBtn} onPress={handleCopyIsin}>
                    <Ionicons
                      name={copiedIsin ? 'checkmark-circle' : 'copy-outline'}
                      size={16}
                      color={colors.primaryDark}
                    />
                    <Text style={styles.copyIsinText}>{copiedIsin ? 'Copied' : 'Copy'}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {ipo.rhpUrl && (
                <TouchableOpacity
                  style={styles.rhpFullBtn}
                  onPress={handleOpenRhp}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document-text" size={17} color="#FFFFFF" />
                  <Text style={styles.rhpFullBtnText}>Download Red Herring Prospectus (RHP)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* AdMob Banner Slot */}
        <AdBanner style={{ marginVertical: 14 }} />

        {/* Space for sticky bottom bar */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Toast Confirmation */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Sticky Groww Floating Bottom Action Bar */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerInfoBox}>
          <Text style={styles.footerMinLabel}>{isUpcoming ? 'Expected Min. Bid' : 'Minimum Bid'}</Text>
          <Text style={styles.footerMinPrice}>{baseInvestment > 0 ? formatCurrency(baseInvestment) : 'TBA'}</Text>
          <Text style={styles.footerMinLot}>1 Lot ({lotSize} Shares)</Text>
        </View>

        {isClosed ? (
          <TouchableOpacity
            style={styles.footerPrimaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setIsAllotmentModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
            <Text style={styles.footerPrimaryBtnText}>Check Allotment Status</Text>
          </TouchableOpacity>
        ) : isOpen ? (
          <TouchableOpacity
            style={[styles.footerPrimaryBtn, styles.footerPrimaryBtnOpen]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast('Bidding is live! Apply via your broker (Groww, Zerodha, etc.)');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="flame" size={18} color="#FFFFFF" />
            <Text style={styles.footerPrimaryBtnText}>Live Bidding Open</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerPrimaryBtn, styles.footerPrimaryBtnUpcoming]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              showToast(`Opens on ${formatDate(ipo.opendate)}`);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            <Text style={styles.footerPrimaryBtnText}>
              {ipo.opendate ? `Opens ${formatDate(ipo.opendate)}` : 'Upcoming IPO'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Permission-gated allotment verification */}
      <AllotmentCheckerModal
        visible={isAllotmentModalVisible}
        onClose={() => setIsAllotmentModalVisible(false)}
        selectedIpo={ipo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  topNavCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  topNavTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textHeading,
  },
  navActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollFeed: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroMetaBox: {
    flex: 1,
  },
  companyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 5,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mainboardBadgeText: {
    color: colors.primaryDark,
  },
  smeBadgeText: {
    color: colors.growwPurple,
  },
  symbolPill: {
    backgroundColor: 'transparent',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  symbolPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  industryText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  issueSizeNotice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  boldDark: {
    fontWeight: '700',
    color: colors.text,
  },
  gmpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  gmpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  gmpTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gmpIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gmpCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  gmpCardSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  gmpGainPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 3,
  },
  gmpGainText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  gmpValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLightest,
    padding: 12,
    borderRadius: 12,
  },
  gmpCol: {
    alignItems: 'center',
    flex: 1,
  },
  gmpColLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  gmpColVal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  gmpColValGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  gmpDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1FAE5',
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textHeading,
  },
  subHighlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  subHighlightText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  bentoCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bentoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  bentoValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  bentoSub: {
    fontSize: 10,
    color: colors.textMuted,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  subGridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subGridItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  subGridDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  subGridRowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  subGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  subGridValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  highlightTotal: {
    color: colors.primaryDark,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timelineIconActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconMuted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineTextBox: {
    flex: 1,
  },
  timelineStageName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  timelineDateText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  verticalConnector: {
    width: 2,
    height: 18,
    backgroundColor: colors.border,
    marginLeft: 13,
    marginVertical: 2,
  },
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  calcHeader: {
    gap: 2,
  },
  calcTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  calcSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  calcCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
  },
  counterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  counterNote: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepperBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperBtnDisabled: {
    opacity: 0.4,
  },
  stepperValueBox: {
    paddingHorizontal: 14,
  },
  stepperValueText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  calcResultsBox: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  calcResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcResultLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  calcResultVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  quotaTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quotaRowAlt: {
    backgroundColor: colors.surfaceLight,
  },
  quotaCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  quotaAllocation: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  aboutParagraph: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  prospectusBox: {
    marginTop: 4,
    gap: 10,
  },
  isinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: 12,
    borderRadius: 10,
  },
  isinLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  isinValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  copyIsinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyIsinText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  rhpFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDark,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  rhpFullBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toast: {
    position: 'absolute',
    bottom: 95,
    alignSelf: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  footerInfoBox: {
    flex: 1,
  },
  footerMinLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerMinPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  footerMinLot: {
    fontSize: 10,
    color: colors.textMuted,
  },
  footerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footerPrimaryBtnUpcoming: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
  },
  footerPrimaryBtnOpen: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  footerPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
