import { IpoItem, LotTier, CategoryReservation } from '../types/ipo';

// Format Indian Currency (e.g. ₹14,950)
export function formatCurrency(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '₹0';
  const num = Number(val);
  if (isNaN(num)) return `₹${val}`;
  return '₹' + num.toLocaleString('en-IN');
}

// Format Crores (e.g. ₹1,250 Cr)
export function formatCrores(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '₹0 Cr';
  const num = Number(val);
  if (isNaN(num)) return `₹${val} Cr`;
  return `₹${num.toLocaleString('en-IN')} Cr`;
}

// Format Date nicely (e.g. 28 Sep 2026)
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBA';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr || 'TBA';
  }
}

// Days remaining badge logic
export interface StatusBadge {
  text: string;
  type: 'urgent' | 'active' | 'upcoming' | 'closed';
  bg: string;
  color: string;
  border: string;
}

export function getDaysRemainingBadge(ipo: IpoItem): StatusBadge {
  const normStatus = (ipo.status || '').toUpperCase();
  const now = new Date();

  if (normStatus === 'CLOSED') {
    return {
      text: 'Closed / Allotment',
      type: 'closed',
      bg: '#F1F5F9',
      color: '#475569',
      border: '#CBD5E1'
    };
  }

  if (ipo.closedate) {
    const close = new Date(ipo.closedate);
    const diffTime = close.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        text: '🔥 Closes Today',
        type: 'urgent',
        bg: '#FFF1F2',
        color: '#E11D48',
        border: '#FECDD3'
      };
    }
    if (diffDays === 1) {
      return {
        text: '⏳ Closes Tomorrow',
        type: 'urgent',
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A'
      };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return {
        text: `⚡ Closes in ${diffDays}d`,
        type: 'active',
        bg: '#EEF2FF',
        color: '#4F46E5',
        border: '#C7D2FE'
      };
    }
    if (diffDays < 0) {
      return {
        text: 'Bidding Closed',
        type: 'closed',
        bg: '#F1F5F9',
        color: '#64748B',
        border: '#E2E8F0'
      };
    }
  }

  if (ipo.opendate) {
    const open = new Date(ipo.opendate);
    const diffTime = open.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return {
        text: `📅 Opens in ${diffDays}d`,
        type: 'upcoming',
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE'
      };
    }
  }

  return {
    text: normStatus === 'OPEN' ? 'Bidding Open' : 'Upcoming',
    type: 'active',
    bg: '#EFF6FF',
    color: '#2563EB',
    border: '#BFDBFE'
  };
}

// Brand pastel color palette based on company name (matching website Groww / Chittorgarh style)
export function getBrandPalette(name: string = '') {
  const palettes = [
    { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' }, // Blue
    { bg: '#F1F5F9', border: '#E2E8F0', text: '#334155' }, // Slate
    { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' }, // Purple
    { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' }, // Amber
    { bg: '#ECFEFF', border: '#A5F3FC', text: '#0E7490' }, // Cyan
    { bg: '#FDF2F8', border: '#FBCFE8', text: '#BE185D' }, // Pink
  ];

  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return palettes[sum % palettes.length];
}

// Get initials
export function getCompanyInitials(name: string): string {
  if (!name) return 'IP';
  const clean = name.replace(/IPO|Limited|Ltd|Pvt|Private|\./gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase() || 'IP';
}

// Calculate lot tiers (Retail, sHNI, bHNI)
export function calculateLotTiers(ipo: IpoItem): LotTier[] {
  if (!ipo) return [];

  const maxPrice = ipo.priceband?.max || ipo.cutoffPrice || ipo.priceband?.min || 100;
  const lotSize = ipo.lotsize || 1;
  const baseLotCost = maxPrice * lotSize;
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';

  if (isSME) {
    return [
      { application: 'Retail (Min)', lots: 1, shares: lotSize, amount: baseLotCost },
      { application: 'Retail (Max)', lots: 1, shares: lotSize, amount: baseLotCost },
      { application: 'HNI (Min)', lots: 2, shares: lotSize * 2, amount: baseLotCost * 2 }
    ];
  }

  const maxRetailLots = Math.max(1, Math.floor(200000 / baseLotCost));
  const minSniiLots = maxRetailLots + 1;
  const maxSniiLots = Math.max(minSniiLots, Math.floor(1000000 / baseLotCost));
  const minBniiLots = maxSniiLots + 1;

  return [
    {
      application: 'Retail (Min)',
      lots: 1,
      shares: lotSize,
      amount: baseLotCost
    },
    {
      application: 'Retail (Max)',
      lots: maxRetailLots,
      shares: maxRetailLots * lotSize,
      amount: maxRetailLots * baseLotCost
    },
    {
      application: 'Small HNI (Min)',
      lots: minSniiLots,
      shares: minSniiLots * lotSize,
      amount: minSniiLots * baseLotCost
    },
    {
      application: 'Small HNI (Max)',
      lots: maxSniiLots,
      shares: maxSniiLots * lotSize,
      amount: maxSniiLots * baseLotCost
    },
    {
      application: 'Big HNI (Min)',
      lots: minBniiLots,
      shares: minBniiLots * lotSize,
      amount: minBniiLots * baseLotCost
    }
  ];
}

// Category reservations
export function getCategoryReservations(ipo: IpoItem): CategoryReservation[] {
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';

  if (isSME) {
    return [
      { category: 'Retail Shares Offered', allocation: 'Not less than 50.00% of Net Issue' },
      { category: 'Other / Non-Retail Shares Offered', allocation: 'Not less than 50.00% of Net Issue' },
      { category: 'Market Maker Shares', allocation: 'Up to 5.00% of Total Issue' }
    ];
  }

  return [
    { category: 'Qualified Institutional (QIB)', allocation: 'Not more than 50.00% of Net Issue' },
    { category: 'Non-Institutional (HNI)', allocation: 'Not less than 15.00% (sHNI: 5%, bHNI: 10%)' },
    { category: 'Retail Individual (RII)', allocation: 'Not less than 35.00% of Net Issue' },
    { category: 'Employee Reservation', allocation: 'Eligible employees with standard discount' }
  ];
}

// Editorial summary
export function generateIpoEditorial(ipo: IpoItem) {
  if (!ipo) return { paragraphs: [], highlights: [] };

  const companyName = ipo.companyName || ipo.ipoName || 'The Company';
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minP = ipo.priceband?.min || 0;
  const maxP = ipo.priceband?.max || ipo.cutoffPrice || minP || 0;
  const lotSize = ipo.lotsize || (isSME ? 1200 : 1);
  const minInvestment = maxP > 0 && lotSize > 0 ? maxP * lotSize : 0;
  
  const issueSizeVal = Number(ipo.issuesize || 0);
  const issueSizeStr = issueSizeVal > 0 ? formatCrores(issueSizeVal) : '₹100+ Cr';
  const issueStructure = minP === maxP && minP > 0 ? 'Fixed Price Issue' : 'Book Build Issue';

  const exchanges = Array.isArray(ipo.exchange) && ipo.exchange.length > 0
    ? ipo.exchange.join(' & ')
    : (isSME ? 'BSE SME / NSE Emerge' : 'NSE and BSE');

  const openDateStr = formatDate(ipo.opendate);
  const closeDateStr = formatDate(ipo.closedate);
  const allotmentDateStr = formatDate(ipo.allotmentdate);
  const listingDateStr = formatDate(ipo.listingdate);
  const faceValueStr = ipo.faceValue ? `₹${ipo.faceValue}` : '₹10';

  const leadManager = ipo.leadManager || 'Lead Merchant Bankers';

  const p1 = `${companyName} IPO is a ${issueStructure} raising ${issueSizeStr} with ${leadManager} as lead manager. Face value is ${faceValueStr} per equity share.`;
  const p2 = `Bidding opened for subscription on ${openDateStr} and closes on ${closeDateStr}. Allotment is expected to be finalized on ${allotmentDateStr} with tentative listing on ${exchanges} scheduled for ${listingDateStr}.`;
  const p3 = minP > 0 && maxP > 0
    ? `The issue price band is set at ₹${minP} to ₹${maxP} per share with a lot size of ${lotSize} shares. The minimum investment for retail investors is ${formatCurrency(minInvestment)}.`
    : `The lot size is ${lotSize} shares with final price discovery through book building.`;

  return {
    paragraphs: [p1, p2, p3],
    highlights: [
      { label: 'Issue Type', value: `${isSME ? 'SME' : 'Mainboard'} ${issueStructure}` },
      { label: 'Total Issue Size', value: issueSizeStr },
      { label: 'Face Value', value: `${faceValueStr} per share` },
      { label: 'Price Band', value: minP > 0 && maxP > 0 ? (minP === maxP ? `₹${minP}` : `₹${minP} - ₹${maxP}`) : 'TBA' },
      { label: 'Retail Min. Investment', value: `${formatCurrency(minInvestment)} (${lotSize} Shares)` },
      { label: 'Listing At', value: exchanges }
    ]
  };
}
