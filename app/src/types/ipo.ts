export interface PriceBand {
  min: number;
  max: number;
}

export interface SubscriptionData {
  qib?: number;
  nii?: number;
  retail?: number;
  total?: number | string;
}

export interface GmpData {
  price?: number;
  percentage?: number;
  lastupdated?: string;
  source?: string;
}

export interface IpoItem {
  ipoId: string;
  Symbol: string;
  companyName: string;
  ipoName?: string;
  logoUrl?: string;
  logo?: string;
  isin?: string;
  industry?: string;
  issueType: 'Mainboard' | 'SME' | string;
  exchange: string[];
  priceband?: PriceBand;
  lotsize: number;
  minimumQuantity?: number;
  cutoffPrice?: number;
  faceValue?: number;
  opendate?: string;
  closedate?: string;
  allotmentdate?: string;
  refunddate?: string;
  listingdate?: string;
  mandatedate?: string;
  issuesize?: number | string;
  totalSubscription?: string | number;
  subscription?: SubscriptionData;
  gmp?: GmpData;
  rhpUrl?: string;
  status: 'OPEN' | 'UPCOMING' | 'CLOSED' | string;
  source?: string;
  lastupdated?: string;
  leadManager?: string;
}

export interface LotTier {
  application: string;
  lots: number;
  shares: number;
  amount: number;
}

export interface CategoryReservation {
  category: string;
  allocation: string;
}


export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
