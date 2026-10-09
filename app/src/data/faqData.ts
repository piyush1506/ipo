import { FaqItem } from '../types/ipo';

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Allotment',
    question: 'How do I check IPO allotment status on my mobile phone?',
    answer: 'Add your PAN profiles in the Allotment tab. The app will clearly show when the approved automatic checking service becomes available; until then, it will not submit PAN data or create sample results.'
  },
  {
    id: 'faq-2',
    category: 'Allotment',
    question: 'Why did I not receive allotment even after applying for 10 lots in Retail?',
    answer: 'Under SEBI retail rules, whenever the retail quota is oversubscribed, a computerized lottery is conducted. Every unique PAN receives at most 1 lottery ticket. The algorithm grants 1 lot per winner. Applying for multiple lots under one PAN does not increase your winning probability. To maximize odds, submit 1 minimum lot across multiple Demat accounts of family members.'
  },
  {
    id: 'faq-3',
    category: 'Bidding & ASBA',
    question: 'What is the Cut-Off price and why should I always select it?',
    answer: 'The Cut-Off price represents the highest ceiling price discovered during book building. High-demand IPOs almost always finalize at the ceiling. If you bid at a lower price (e.g., ₹190 instead of the ₹200 cap), your application is immediately rejected as non-competitive.'
  },
  {
    id: 'faq-4',
    category: 'Refunds & Mandates',
    question: 'When will my blocked money (ASBA) get unblocked if not allotted?',
    answer: 'Under the mandatory SEBI T+3 timeline, bank unblocking instructions are generally processed by T+2. If your UPI mandate or bank lien remains blocked beyond the expected timeline, contact your bank or file a grievance through SEBI SCORES.'
  },
  {
    id: 'faq-5',
    category: 'Market & GMP',
    question: 'What is Grey Market Premium (GMP) and how accurate is it?',
    answer: 'GMP is the unofficial over-the-counter premium buyers are willing to pay for IPO shares before listing. While it indicates short-term market hype and demand sentiment, it is unregulated and volatile. Always cross-check company fundamentals, P/E valuations, and DRHP risk factors before making bidding decisions.'
  },
  {
    id: 'faq-6',
    category: 'SME IPOs',
    question: 'What is the main difference between Mainboard and SME IPOs?',
    answer: 'Mainboard IPOs have a minimum retail ticket of ~₹14,000–₹15,000 and trade in single share units once listed. SME IPOs have a higher minimum ticket of ~₹1,00,000–₹1,40,000, are reviewed directly by the exchange, and must be bought and sold in fixed block lots (e.g., 1,000 or 2,000 shares) even post-listing.'
  },
  {
    id: 'faq-7',
    category: 'Taxation',
    question: 'How are IPO listing gains taxed in India?',
    answer: 'If you sell allotted shares within 12 months (e.g. on listing day), the profit is taxed as Short Term Capital Gain (STCG) at a flat 20% under Section 111A. If held for more than 12 months, Long Term Capital Gain (LTCG) is tax-free up to ₹1.25 Lakhs per financial year and 12.5% on amounts above that.'
  }
];
