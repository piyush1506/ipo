const DEFAULT_AUTHOR = {
  name: "Piyush Kumar Choudhary",
  role: "Lead Financial Data Analyst & Primary Market Researcher",
  bio: "Specializing in Indian primary capital markets, SEBI regulatory frameworks, and registrar status systems with deep experience analyzing DRHP filings and primary market mechanics.",
  avatar: "PK"
};

export const BLOG_POSTS = [
  {
    slug: "how-to-increase-ipo-allotment-chances",
    title: "How to Increase IPO Allotment Chances: 7 Proven SEBI-Compliant Strategies",
    summary: "Discover how the SEBI retail allotment lottery works and 7 practical, legal strategies to maximize your chances of getting IPO share allotments.",
    category: "Allotment Strategy",
    readTime: "6 min read",
    publishDate: "October 2, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["IPO Allotment", "SEBI Lottery", "Retail Bidding", "ASBA UPI"],
    featured: true,
    tableOfContents: [
      { id: "sebi-lottery-mechanism", title: "1. Understanding the SEBI Lottery Mechanism" },
      { id: "strategy-multiple-pan", title: "2. Apply Through Multiple Family Demat Accounts" },
      { id: "strategy-cutoff-price", title: "3. Always Bid at the Cut-Off Price" },
      { id: "strategy-avoid-last-minute", title: "4. Avoid Last-Hour Bidding Rushes" },
      { id: "strategy-shni-vs-retail", title: "5. Retail (RII) vs Small HNI (sHNI) Allocation" },
      { id: "strategy-shareholder-quota", title: "6. Utilize Parent Company Shareholder Quotas" },
      { id: "strategy-verify-upi-mandate", title: "7. Timely UPI Mandate Authorization" },
      { id: "common-allotment-myths", title: "Common IPO Allotment Myths Debunked" }
    ],
    sections: [
      {
        id: "sebi-lottery-mechanism",
        heading: "1. Understanding the SEBI Lottery Mechanism",
        content: "Many retail investors mistakenly believe that applying for multiple lots (e.g., bidding 200000 for 14 lots) increases their chances of receiving an allotment in an oversubscribed IPO. Under SEBI regulations, this is completely false.\n\nWhen the Retail Individual Investor (RII) category is oversubscribed, SEBI mandates a computerized, randomized lottery system. In this lottery:\n- Every unique, valid applicant is entered exactly once.\n- The algorithm randomly picks lucky applicants until the available retail lots are exhausted.\n- Each allotted applicant receives exactly one minimum lot (approx. 14000-15000), regardless of whether they bid for 1 lot or 14 lots.\n\nTherefore, applying for more than one lot under a single PAN in an oversubscribed IPO only blocks extra funds without improving your mathematical probability of winning."
      },
      {
        id: "strategy-multiple-pan",
        heading: "2. Apply Through Multiple Family Demat Accounts",
        content: "Because the SEBI lottery is based on unique PAN numbers, the most effective legitimate way to increase your allotment probability is to distribute your bids across family members.\n\nIf you have a budget of 60000:\n- Ineffective Method: Submitting 1 application of 4 lots (60000) under your single PAN gives you exactly 1 lottery entry.\n- Effective Method: Submitting 4 separate applications of 1 minimum lot (15000 each) using Demat accounts belonging to yourself, spouse, parent, and sibling gives you 4 independent lottery entries, multiplying your odds fourfold.\n\nImportant Compliance Rule: Ensure that each Demat account is linked to the individual's own PAN, bank account, and UPI ID. Applying with multiple Demat accounts linked to the same PAN will result in technical rejection of all bids."
      },
      {
        id: "strategy-cutoff-price",
        heading: "3. Always Bid at the Cut-Off Price",
        content: "When filling out your IPO application form, always select the Cut-off Price checkbox (or explicitly bid at the highest ceiling of the price band).\n\nBook-building IPOs have a price band (e.g., 185 to 197 per share). If a high-demand IPO gets heavily oversubscribed, the final issue price is universally settled at the ceiling price (197). If you entered a custom bid below the cap (e.g., 190), your application will be instantly rejected as non-competitive during price discovery."
      },
      {
        id: "strategy-avoid-last-minute",
        heading: "4. Avoid Last-Hour Bidding Rushes",
        content: "The bidding window closes at 5:00 PM on Day 3. However, banking gateways and exchange servers experience massive traffic congestion between 3:00 PM and 5:00 PM.\n\nSubmitting your bid on Day 1 or Day 2 (or before 1:00 PM on Day 3) ensures that:\n- Your bid is successfully registered with BSE/NSE.\n- The UPI mandate request arrives in your UPI app well before the deadline.\n- You have ample time to retry if your bank's server faces temporary downtime."
      },
      {
        id: "strategy-shni-vs-retail",
        heading: "5. Retail (RII) vs Small HNI (sHNI) Allocation",
        content: "For investors with higher capital, SEBI introduced the Small HNI (sHNI) category (bids between 2 Lakh and 10 Lakh):\n- In sHNI, allotment is also based on a lottery system for a minimum lot size of 2 Lakhs.\n- Depending on the subscription figures, sometimes the sHNI subscription is significantly lower than the Retail subscription (or vice-versa).\n- Tracking live subscription data on Day 3 can help you decide whether placing a 15000 retail bid or a 205000 sHNI bid offers superior mathematical odds."
      },
      {
        id: "strategy-shareholder-quota",
        heading: "6. Utilize Parent Company Shareholder Quotas",
        content: "When a subsidiary of an already-listed parent company launches an IPO (e.g., Tata Technologies by Tata Motors, or Bajaj Housing Finance by Bajaj Finance / Finserv), a dedicated Shareholder Reservation Portion (often 10%) is reserved.\n\nKey Advantages:\n- Eligible investors can apply under both the Retail Category and the Shareholder Category from the same PAN.\n- The shareholder quota often experiences much lower oversubscription rates compared to general retail."
      },
      {
        id: "strategy-verify-upi-mandate",
        heading: "7. Timely UPI Mandate Authorization",
        content: "Placing an IPO bid through your broker is only step 1. Your bid is invalid until you approve the UPI mandate in your UPI application (Google Pay, PhonePe, BHIM, Paytm, or Net Banking ASBA).\n\nAlways confirm the mandate approval status in your bank app. If the mandate is not authorized before 5:00 PM on the closing day, your bid will be marked as Failed Mandate and excluded from the allotment basis."
      }
    ]
  },
  {
    slug: "ipo-listing-day-trading-strategy",
    title: "IPO Listing Day Strategy: When to Sell for Listing Gains vs Hold for Long Term",
    summary: "Master the 9:00 AM pre-open call auction, trailing stop-losses, the 50/50 profit booking rule, and how to trade bumper vs discount listings.",
    category: "Listing & Trading",
    readTime: "8 min read",
    publishDate: "October 3, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["Listing Day Strategy", "Pre-Open Session", "Profit Booking", "Stop Loss", "Listing Gains"],
    featured: true,
    tableOfContents: [
      { id: "pre-open-auction", title: "1. What Happens in the 9:00 AM Pre-Open Call Auction?" },
      { id: "when-to-sell-listing-gains", title: "2. When Should You Book 100% Listing Gains?" },
      { id: "the-50-50-rule", title: "3. The 50/50 Capital Protection Strategy" },
      { id: "handling-discount-listings", title: "4. What to Do if an IPO Lists at a Discount (Loss?)" },
      { id: "trailing-stoploss-technique", title: "5. Trailing Stop-Loss for Riding Super-Rallies" },
      { id: "checklist-before-listing-bell", title: "6. The 8:45 AM Listing Morning Checklist" }
    ],
    sections: [
      {
        id: "pre-open-auction",
        heading: "1. What Happens in the 9:00 AM Pre-Open Call Auction?",
        content: "On listing morning, normal trading does not start at 915 AM like other stocks. Instead, SEBI conducts a special Pre-Open Call Auction Session:\n- 9:00 AM to 9:45 AM (Order Collection): Institutional and retail traders place buy/sell orders. You can place a market order or limit order to sell your allotted shares.\n- 9:45 AM to 10:00 AM (Order Matching & Price Discovery): The exchange algorithms calculate the single equilibrium opening price where maximum quantity matches.\n- 10:00 AM: Normal continuous market trading begins on NSE and BSE.\n\nPro Tip: If you want to sell at whatever price the stock opens, place a Market Sell Order between 9:00 AM and 9:40 AM in your broker app (Zerodha, Groww, Upstox, Angel One)."
      },
      {
        id: "when-to-sell-listing-gains",
        heading: "2. When Should You Book 100% Listing Gains?",
        content: "Selling immediately on listing day is the smartest move when:\n1. OFS Heavy Issue: The IPO was mostly Offer For Sale (promoters/PE funds cashing out) rather than Fresh Capital.\n2. Expensive Valuation: The listing price P/E ratio is substantially higher than industry leaders (e.g., trading at 80x P/E while peers trade at 30x).\n3. Fading Grey Market Sentiment: The GMP was falling consistently in the final 48 hours before listing.\n4. General Market Weakness: Benchmark indices (Nifty 50 / Sensex) are experiencing heavy broad-based selling."
      },
      {
        id: "the-50-50-rule",
        heading: "3. The 50/50 Capital Protection Strategy",
        content: "For high-quality businesses that double on listing day (100% gain):\n- Step 1: Sell 50% of your allotted shares at the opening bell. This retrieves your entire principal capital (100% of your investment).\n- Step 2: Hold the remaining 50% of shares completely risk-free for multi-year compounding.\n\nThis eliminates emotional stress while keeping you invested in high-growth companies."
      },
      {
        id: "handling-discount-listings",
        heading: "4. What to Do if an IPO Lists at a Discount (Loss?)" ,
        content: "Do NOT average down blindly: Averaging losing IPOs is one of the most common retail investor mistakes.\n- Set a Pre-defined Stop Loss: If the company fundamentals are weak, cut losses at 5% to 8% below issue price to protect capital.\n- Hold only if Business Quality is Superior: If the discount occurred purely due to broader market crash rather than company-specific issues, strong institutional buying often recovers the price within 2-4 weeks."
      }
    ]
  },
  {
    slug: "why-no-ipo-allotment-common-mistakes",
    title: "Why You Never Get IPO Allotment: 5 Hidden Mistakes Retail Investors Make",
    summary: "Applied for 10 IPOs and received zero shares? Learn the 5 subtle technical errors causing rejection and how to fix your application profile.",
    category: "Allotment Strategy",
    readTime: "7 min read",
    publishDate: "October 3, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["Zero Allotment", "PAN Mismatch", "ASBA Errors", "Third Party UPI", "Allotment Tricks"],
    featured: true,
    tableOfContents: [
      { id: "third-party-upi-trap", title: "1. Mistake 1: Using Third-Party Bank or UPI Accounts" },
      { id: "multiple-bids-same-pan", title: "2. Mistake 2: Applying via Multiple Brokers with the Same PAN" },
      { id: "bidding-below-cutoff", title: "3. Mistake 3: Entering a Bid Price Below the Price Band Cap" },
      { id: "upi-mandate-ghost-failures", title: "4. Mistake 4: Unapproved or Ghost UPI Mandates" },
      { id: "dp-id-name-mismatch", title: "5. Mistake 5: Minor Spurious Name Mismatches with Bank" },
      { id: "checklist-for-guaranteed-validity", title: "6. The 5-Point Valid Bid Checklist" }
    ],
    sections: [
      {
        id: "third-party-upi-trap",
        heading: "1. Mistake 1: Using Third-Party Bank or UPI Accounts",
        content: "The 1 reason applications are silently disqualified by the registrar without informing the user: Third-Party Payment Rejection.\n\nSEBI regulations strictly require that the PAN on the Demat account MUST MATCH the PAN of the Bank Account / UPI ID used for payment:\n- Rejected: Applying from your wife's Demat account but entering your own Google Pay UPI ID.\n- Accepted: Applying from your wife's Demat account using her own linked UPI ID / Bank account.\n\nEven if the bank accepts the UPI block, the registrar's automated audit matches PAN numbers and permanently discards the bid from the lottery."
      },
      {
        id: "multiple-bids-same-pan",
        heading: "2. Mistake 2: Applying via Multiple Brokers with the Same PAN",
        content: "Many investors have accounts across multiple stockbrokers (e.g. Zerodha + Groww + Angel One). They place 1 bid from Zerodha and another from Groww under the same PAN, hoping for double chances.\n\nWhat Actually Happens:\nRegistrars de-duplicate applications by PAN. If multiple retail applications are detected for the same PAN, all applications are instantly marked as Multiple / Invalid, leaving you with 0% chance of allotment."
      },
      {
        id: "bidding-below-cutoff",
        heading: "3. Mistake 3: Entering a Bid Price Below the Price Band Cap",
        content: "If an IPO price band is 450 to 475:\n- Entering 450 or 460 will cause immediate rejection during final book-building whenever the IPO is oversubscribed.\n- Always check the Cut-off Price checkbox so your bid automatically matches the final price discovered by institutional book runners."
      },
      {
        id: "upi-mandate-ghost-failures",
        heading: "4. Mistake 4: Unapproved or Ghost UPI Mandates",
        content: "Submitting a bid on a broker app creates a mandate request. However:\n- If you dont receive the notification, you must manually open your UPI app (GPay / PhonePe / Paytm / BHIM) > Autopay / Mandates section > Approve Mandate with UPI PIN.\n- Verify that the mandate status displays Successful / Active Lien. If it says Pending or Expired, your bid never entered the lottery."
      }
    ]
  },
  {
    slug: "ipo-taxation-rules-stcg-ltcg-india",
    title: "IPO Listing Gains Tax in India: STCG, LTCG & Capital Gains Rules Explained",
    summary: "Complete guide to income tax on IPO listing gains: Updated 20 STCG rates under Section 111A, 12.5 LTCG rules, and how to offset listing losses.",
    category: "Analysis & Valuation",
    readTime: "6 min read",
    publishDate: "October 2, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["IPO Taxation", "STCG 20", "LTCG 12.5", "Listing Gains Tax", "ITR-2 Filing"],
    featured: false,
    tableOfContents: [
      { id: "stcg-on-listing-gains", title: "1. Short-Term Capital Gains (STCG) on Listing Day Sales" },
      { id: "ltcg-after-12-months", title: "2. Long-Term Capital Gains (LTCG) Holding Rules" },
      { id: "stt-and-charges-deduction", title: "3. Security Transaction Tax (STT) & Deductible Expenses" },
      { id: "tax-loss-harvesting-ipo", title: "4. How to Set Off IPO Listing Losses Against Other Gains" },
      { id: "which-itr-form-to-file", title: "5. Which ITR Form Should IPO Investors File?" }
    ],
    sections: [
      {
        id: "stcg-on-listing-gains",
        heading: "1. Short-Term Capital Gains (STCG) on Listing Day Sales",
        content: "When you receive shares in an IPO allotment and sell them on listing day (or anytime within 12 months of allotment), the profit is classified as Short-Term Capital Gains (STCG) under Section 111A of the Income Tax Act.\n\nCurrent Applicable Rate:\n- STCG on equity shares where STT is paid is taxed at a flat rate of 20% (plus applicable surcharge and 4% health and education cess).\n- Your income tax slab rate does not apply here; it is taxed at the flat statutory 20% rate irrespective of whether your normal income is in the 10%, 20%, or 30% slab."
      },
      {
        id: "ltcg-after-12-months",
        heading: "2. Long-Term Capital Gains (LTCG) Holding Rules",
        content: "If you hold your allotted IPO shares for more than 12 months (365 days) from the date of allotment before selling:\n- Gains up to 125000 per financial year are completely Tax-Free.\n- Gains exceeding 125000 are taxed at a flat rate of 12.5% (without indexation benefits)."
      },
      {
        id: "tax-loss-harvesting-ipo",
        heading: "3. How to Set Off IPO Listing Losses Against Other Gains",
        content: "If an IPO lists at a discount and you sell at a loss:\n- Short-term capital losses (STCL) from IPOs can be set off against both STCG and LTCG from other stocks or mutual funds in the same financial year.\n- Any unadjusted short-term loss can be carried forward for up to 8 subsequent assessment years, provided you file your ITR before the due date."
      },
      {
        id: "which-itr-form-to-file",
        heading: "4. Which ITR Form Should IPO Investors File?",
        content: "If you booked listing gains or traded IPO shares:\n- ITR-1 (Sahaj): Cannot be used if you have capital gains from equity.\n- ITR-2: Must be filed by salaried or individual investors with capital gains income.\n- ITR-3: Must be filed if you trade intraday or classify IPO trading as business income (F O / professional trading)."
      }
    ]
  },
  {
    slug: "how-to-apply-ipo-netbanking-asba-vs-upi",
    title: "NetBanking ASBA vs Broker UPI: Step-by-Step Guide for HDFC, SBI, ICICI & Zerodha",
    summary: "Compare NetBanking ASBA against broker UPI apps. Learn why HNI investors prefer ASBA and follow step-by-step instructions for top Indian banks.",
    category: "Banking & ASBA",
    readTime: "7 min read",
    publishDate: "September 29, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["NetBanking ASBA", "HDFC ASBA", "SBI IPO", "ICICI Direct", "Zerodha UPI", "Groww IPO"],
    featured: false,
    tableOfContents: [
      { id: "asba-vs-upi-comparison", title: "1. NetBanking ASBA vs Broker UPI: Key Differences" },
      { id: "why-hni-use-asba", title: "2. Why HNI & Big Bidders Always Use NetBanking ASBA" },
      { id: "step-by-step-hdfc-asba", title: "3. Step-by-Step: Applying via HDFC NetBanking" },
      { id: "step-by-step-sbi-asba", title: "4. Step-by-Step: Applying via SBI NetBanking (YONO / Portal)" },
      { id: "step-by-step-icici-asba", title: "5. Step-by-Step: Applying via ICICI NetBanking" },
      { id: "how-to-find-dp-id", title: "6. How to Locate Your 16-Digit Demat DP ID" }
    ],
    sections: [
      {
        id: "asba-vs-upi-comparison",
        heading: "1. NetBanking ASBA vs Broker UPI: Key Differences",
        content: "| Parameter | Broker UPI (Zerodha / Groww) | NetBanking ASBA (HDFC / SBI / ICICI) |\n| :--- | :--- | :--- |\n| Transaction Limit | Up to 500000 max via UPI | Up to 5000000+ (High Networth) |\n| Mandate Latency | Can take up to 2 hours for UPI alert | Instant lien block directly in bank |\n| Failure Rate | 3-5% due to third-party UPI apps | <0.1% Direct core-banking lock |\n| Category Support | Retail & Small HNI (5L) | Retail, sHNI, Big HNI, Shareholder |"
      },
      {
        id: "why-hni-use-asba",
        heading: "2. Why HNI & Big Bidders Always Use NetBanking ASBA",
        content: "For applications above 5 Lakhs (Big HNI / bHNI quota), UPI cannot be used due to NPCI limit restrictions. NetBanking ASBA is the only authorized electronic channel for large-ticket bids.\n\nFurthermore, NetBanking ASBA blocks the amount inside your bank immediately without relying on external UPI push notifications, eliminating mandate approval delays entirely."
      },
      {
        id: "step-by-step-hdfc-asba",
        heading: "3. Step-by-Step: Applying via HDFC NetBanking",
        content: "1. Log into HDFC Bank NetBanking > Navigate to Request > IPO / Rights Issue.\n2. Select your account number and click Continue.\n3. Choose the active IPO from the list > Select Investor Category (Retail / HNI).\n3. Enter your 16-Digit Demat Account Number (NSDL / CDSL DP ID + Client ID).\n4. Enter Cut-off price and Lot size > Accept statutory terms and Submit.\n4. The funds are instantly marked as lien in your HDFC savings account."
      },
      {
        id: "step-by-step-sbi-asba",
        heading: "4. Step-by-Step: Applying via SBI NetBanking (YONO / Portal)",
        content: "1. Log into SBI NetBanking (YONO Portal) > Navigate to IPO Application.\n2. Select your account number and click Apply.\n3. Choose the active IPO from the list > Select Investor Category (Retail / HNI).\n3. Enter your 16-Digit Demat Account Number (NSDL / CDSL DP ID + Client ID).\n4. Enter Cut-off price and Lot size > Accept statutory terms and Submit.\n5. The funds are instantly marked as lien in your SBI savings account."
      },
      {
        id: "step-by-step-icici-asba",
        heading: "5. Step-by-Step: Applying via ICICI NetBanking",
        content: "1. Log into ICICI Bank NetBanking > Navigate to IPO Application.\n2. Select your account number and click Apply.\n3. Choose the active IPO from the list > Select Investor Category (Retail / HNI).\n3. Enter your 16-Digit Demat Account Number (NSDL / CDSL DP ID + Client ID).\n4. Enter Cut-off price and Lot size > Accept statutory terms and Submit.\n4. The funds are instantly marked as lien in your ICICI savings account."
      },
      {
        id: "how-to-find-dp-id",
        heading: "6. How to Locate Your 16-Digit Demat DP ID",
        content: "To apply via NetBanking ASBA, you need your 16-digit Demat Account Number:\n- Zerodha: Profile > Demat > 16-digit BO ID (e.g. 12081600).\n- Groww: Profile > Account Details > Demat Account Number (BO ID).\n- Upstox: Account > Profile > 16-digit Demat Account ID.\n- Angel One: Profile > DP ID (12033200) + Account number."
      }
    ]
  },
  {
    slug: "top-ipo-red-flags-to-avoid-losses",
    title: "7 Critical Red Flags in an IPO: How to Spot Bad Issues and Avoid Losing Money",
    summary: "Protect your hard-earned capital by learning to identify aggressive promoter exits, window-dressed balance sheets, and toxic debt covenants in DRHP filings.",
    category: "Analysis & Valuation",
    readTime: "8 min read",
    publishDate: "September 27, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["IPO Red Flags", "DRHP Warning Signs", "OFS Traps", "Forensic Accounting", "Avoid Losses"],
    featured: false,
    tableOfContents: [
      { id: "red-flag-100-percent-ofs", title: "1. Red Flag 1: 100% Offer for Sale (Zero Fresh Capital)" },
      { id: "red-flag-pre-ipo-profit-spike", title: "2. Red Flag 2: Sudden Spike in Profits Right Before IPO" },
      { id: "red-flag-valuation-irrationality", title: "3. Red Flag 3: Sky-High P/E Multiples vs Industry Peers" },
      { id: "red-flag-weak-lead-managers", title: "4. Red Flag 4: Poor Track Record of Lead Merchant Bankers" }
    ],
    sections: [
      {
        id: "red-flag-100-percent-ofs",
        heading: "1. Red Flag 1: 100% Offer for Sale (Zero Fresh Capital)",
        content: "When 100% of the issue is an Offer for Sale (OFS), existing shareholders (promoters, PE funds, VCs) are cashing out their entire stake. No fresh capital is raised by the company. This is a major red flag because: 1) The company's balance sheet does not grow, 2) There is no guarantee of business expansion, 3) Promoters are exiting their entire position, which may signal a lack of confidence in future growth."
      },
      {
        id: "red-flag-pre-ipo-profit-spike",
        heading: "2. Red Flag 2: Sudden Spike in Profits Right Before IPO",
        content: "If a company shows a sudden, artificial spike in profits just before filing the DRHP, it may be a window-dressing exercise. Promoters might be manipulating revenue recognition, delaying expense recognition, or one-time windfalls (e.g., sale of a non-core asset) are being shown as recurring income. Always examine the profit trend over the last 3-5 years to identify such anomalies."
      },
      {
        id: "red-flag-valuation-irrationality",
        heading: "3. Red Flag 3: Sky-High P/E Multiples vs Industry Peers",
        content: "Compare the IPO's P/E ratio with established peers in the same industry. If the IPO is trading at 80x P/E while listed competitors trade at 20-30x, it suggests either extreme growth expectations that may not materialize, or the issue is overvalued. High P/E without corresponding earnings growth is a classic trap for retail investors."
      },
      {
        id: "red-flag-weak-lead-managers",
        heading: "4. Red Flag 4: Poor Track Record of Lead Merchant Bankers",
        content: "The lead merchant banker plays a critical role in the IPO's success. A poor track record of poor post-listing performance in previous issues managed by the same banker is a warning sign. Research the lead merchant's historical IPO allotment performance, listing gains, and 1-year post-listing returns. Well-known bankers like HDFC Bank, Kotak Mahindra, and ICICI Securities generally have stronger track records."
      }
    ]
  },
  {
    slug: "sme-ipo-vs-mainboard-ipo-differences",
    title: "SME IPO vs Mainboard IPO: Complete Comparison of Risk, Lot Sizes & Listing Process",
    summary: "Everything retail investors must understand before entering the high-risk, high-reward SME IPO segment versus traditional Mainboard IPOs.",
    category: "SME vs Mainboard",
    readTime: "8 min read",
    publishDate: "September 28, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["SME IPO", "Mainboard", "BSE SME", "NSE Emerge", "Lot Size", "Risk Management"],
    featured: false,
    tableOfContents: [
      { id: "overview-sme-mainboard", title: "1. Overview of Indian IPO Segments" },
      { id: "comparison-table", title: "2. Comprehensive Comparison Table" },
      { id: "minimum-investment-barrier", title: "3. Minimum Investment & Lot Size Rules" },
      { id: "liquidity-and-trading-mechanics", title: "4. Post-Listing Liquidity & Fixed Lot Trading" },
      { id: "regulatory-scrutiny-differences", title: "5. SEBI Scrutiny & Underwriting Requirements" },
      { id: "who-should-invest-in-sme", title: "6. Who Should Invest in SME IPOs?" }
    ],
    sections: [
      {
        id: "overview-sme-mainboard",
        heading: "1. Overview of Indian IPO Segments",
        content: "In India, companies can raise public equity capital through two distinct exchange platforms:\n- Mainboard: For established mid-cap and large-cap enterprises listing on the main platforms of BSE and NSE.\n- SME Platform (BSE SME & NSE Emerge): Launched in 2012 by SEBI to facilitate growth capital for small and medium-sized enterprises with relaxed eligibility criteria."
      },
      {
        id: "comparison-table",
        heading: "2. Comprehensive Comparison Table",
        content: "| Feature | Mainboard IPO | SME Platform IPO |\n| :--- | :--- | :--- |\n| Exchange Platforms | BSE Mainboard & NSE Mainboard | BSE SME & NSE Emerge |\n| Minimum Ticket Size | 14000 - 15000 | 100000 - 150000 |\n| Post-Issue Capital | Minimum 10 Crore | Up to 25 Crore max |\n| Underwriting | Optional | 100% Mandatory (15% by Lead Merchant) |\n| Market Maker | Not required | Mandatory for minimum 3 years |\n| Post-Listing Trading | Single share (Lot size = 1) | Fixed block lot size (e.g. 1000/2000 shares) |\n| Financial Reporting | Quarterly results | Half-yearly results |\n| SEBI Vetting | Directly reviewed by SEBI | Reviewed primarily by Stock Exchanges |"
      },
      {
        id: "minimum-investment-barrier",
        heading: "3. Minimum Investment & Lot Size Rules",
        content: "To safeguard small retail investors from extreme volatility, SEBI mandates a higher minimum ticket size for SME IPOs.\n\nWhile a mainboard IPO requires bidding for approximately 14000-15000 for 1 lot, an SME IPO requires a minimum application amount of 100000 to 140000. If you receive allotment, you are allotted the full lot (e.g., 1200 shares or 2000 shares)."
      },
      {
        id: "liquidity-and-trading-mechanics",
        heading: "4. Post-Listing Liquidity & Fixed Lot Trading",
        content: "A crucial difference that many retail investors overlook is how shares trade post-listing:\n- On Mainboard, once listed, you can buy or sell even 1 single share at any time.\n- On SME platforms, shares must continue to be traded in standard lot sizes (e.g., 1000 shares). If the share price rises from 100 to 300, a buyer must commit 300000 in a single transaction to purchase your lot.\n\nThis fixed lot size constraint can cause liquidity bottlenecks during market downturns, making it harder to exit positions quickly."
      },
      {
        id: "who-should-invest-in-sme",
        heading: "6. Who Should Invest in SME IPOs?",
        content: "SME IPOs can deliver substantial multi-bagger returns when identifying high-growth niche businesses early. However, due to lower liquidity, lighter disclosure requirements, and higher capital exposure per application, SME issues are best suited for:\n- Experienced investors with high risk tolerance.\n- Portfolios that can afford to hold positions for multi-year horizons.\n- Investors who conduct thorough fundamental due diligence on promoter background and balance sheets."
      }
    ]
  },
  {
    slug: "how-to-read-drhp-rhp-ipo-prospectus",
    title: "How to Read an IPO Prospectus (DRHP/RHP): 6 Critical Sections to Analyze Before Bidding",
    summary: "A step-by-step masterclass on reading Red Herring Prospectuses (RHP) to uncover promoter background, debt covenants, revenue quality, and hidden risks.",
    category: "Analysis & Valuation",
    readTime: "9 min read",
    publishDate: "September 25, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["DRHP", "RHP", "Fundamental Analysis", "Promoter Holding", "OFS vs Fresh Issue"],
    featured: false,
    tableOfContents: [
      { id: "what-is-drhp-rhp", title: "1. What is DRHP vs RHP?" },
      { id: "fresh-issue-vs-ofs", title: "2. Fresh Issue vs Offer for Sale (OFS)" },
      { id: "objects-of-issue", title: "3. Objects of the Issue (Where is Money Going?)" },
      { id: "promoter-shareholding", title: "4. Promoter Background & Post-Issue Holding" },
      { id: "key-financial-metrics", title: "5. Key Financial Ratios (RoNW, EBITDA, P/E)" }
    ],
    sections: [
      {
        id: "what-is-drhp-rhp",
        heading: "1. What is DRHP vs RHP?",
        content: "Before issuing shares to the public, every company must submit statutory documents to SEBI:\n- Draft Red Herring Prospectus (DRHP): The preliminary document submitted to SEBI and stock exchanges for review and public feedback. It contains complete business operations and financials but excludes the final price band and issue dates.\n- Red Herring Prospectus (RHP): The final updated prospectus approved by SEBI containing the exact price band, lot size, issue dates, and updated anchor investor commitments."
      },
      {
        id: "fresh-issue-vs-ofs",
        heading: "2. Fresh Issue vs Offer for Sale (OFS)" ,
        content: "Always check the breakdown between Fresh Issue and Offer for Sale (OFS):\n- Fresh Issue: New shares created by the company. The proceeds flow directly into the company's bank account for expansion, debt repayment, or working capital. This expands the company's balance sheet.\n- Offer for Sale (OFS): Existing shareholders (promoters, private equity funds, venture capitalists) sell their shares to the public. The proceeds go to the selling shareholders, not into the company.\n\nA high percentage of Fresh Issue is generally preferable because the raised funds are reinvested directly into business growth."
      },
      {
        id: "objects-of-issue",
        heading: "3. Objects of the Issue (Where is Money Going?)" ,
        content: "Examine the Objects of the Offer chapter carefully. Highly favorable uses of fresh funds include:\n- Repaying high-interest debt to reduce finance costs and boost net margins.\n- Capital expenditure (building new manufacturing plants, upgrading tech infrastructure).\n- Setting up distribution networks in new geographic markets.\n\nBe cautious if a disproportionate amount is allocated to General Corporate Purposes (GCP) without defined milestones."
      },
      {
        id: "key-financial-metrics",
        heading: "4. Key Financial Ratios (RoNW, EBITDA, P/E)" ,
        content: "Focus on these core operational metrics over the last 3-5 financial years:\n- Revenue & PAT CAGR: Consistent year-on-year growth trajectory.\n- Return on Net Worth (RoNW) / RoE: Efficiency in generating profit from shareholder equity (ideally >15%).\n- EBITDA Margins: Operating profitability resilience.\n- P/E Ratio vs Peers: Compare the IPO's implied Price-to-Earnings multiple against established listed competitors."
      }
    ]
  },
  {
    slug: "upi-mandate-failed-asba-unblock-guide",
    title: "IPO Money Blocked or UPI Mandate Failed? Step-by-Step Guide to Unblock Bank Lien",
    summary: "Encountering delayed refunds or frozen bank liens after IPO allotment? Here is how to resolve stuck ASBA funds with your bank, UPI app, and registrar.",
    category: "Banking & ASBA",
    readTime: "5 min read",
    publishDate: "September 20, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["UPI Mandate", "ASBA Refund", "Bank Lien", "SEBI Redressal", "Link Intime", "KFintech"],
    featured: false,
    tableOfContents: [
      { id: "why-funds-remain-blocked", title: "1. Why Do IPO Funds Remain Blocked?" },
      { id: "asba-lien-vs-debit", title: "2. Lien Marked vs Debited: The Difference" },
      { id: "step-by-step-unblock", title: "3. 4 Steps to Manually Unblock Stuck Funds" },
      { id: "contacting-registrar", title: "4. Reaching Out to Registrar & Bank Branch" },
      { id: "sebi-scores-complaint", title: "3. Filing a SEBI SCORES Complaint for Delays" }
    ],
    sections: [
      {
        id: "why-funds-remain-blocked",
        heading: "1. Why Do IPO Funds Remain Blocked?" ,
        content: "Under the ASBA (Application Supported by Blocked Amount) system, your application money is never transferred to the company until allotment is confirmed. Instead, a temporary legal hold (lien) is placed on the funds in your savings account.\n\nOccasionally, due to communication latency between the registrar, the sponsor bank, and your beneficiary bank, the lien revocation message is delayed."
      },
      {
        id: "step-by-step-unblock",
        heading: "2. 4 Steps to Manually Unblock Stuck Funds" ,
        content: "If your funds are not released by the official Refund Initiation Date:\n1. Check Allotment Status: First verify on the registrar portal that you were indeed not allotted shares.\n2. Check Mandate Expiry Date: Open your UPI application (GPay / PhonePe / BHIM) > Autopay / Mandates > Select the IPO mandate > View the Mandate End Date.\n3. Contact Bank Customer Care: Call your bank's helpline or visit your home branch with your Application Number (BID Reference number). Ask the banking officer to query the ASBA lien status and release the hold.\n4. Email the Registrar: Send an email to the official IPO registrar support desk with your PAN, Demat Client ID, Application Number, and Bank Account statement."
      },
      {
        id: "sebi-scores-complaint",
        heading: "3. Filing a SEBI SCORES Complaint for Delays" ,
        content: "SEBI has mandated strict compensation rules for unblocking delays. Under SEBI circulars, if an investor's blocked money is not unblocked within the mandated timeline post-allotment, the responsible entity must pay interest at the rate of 15% per annum for the period of delay.\n\nYou can file an automated grievance online via SEBI's official portal: SCORES (SEBI Complaints Redress System)."
      }
    ]
  },
  {
    slug: "t3-listing-timeline-sebi-rules-explained",
    title: "SEBI T+3 IPO Listing Timeline: Step-by-Step Process from Bidding to Listing Day",
    summary: "How SEBI revolutionized the Indian capital markets with the mandatory T+3 listing cycle—making IPOs faster, safer, and highly liquid.",
    category: "Market Concepts",
    readTime: "6 min read",
    publishDate: "September 15, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["T+3 Timeline", "SEBI Regulations", "Basis of Allotment", "Listing Ceremony"],
    featured: false,
    tableOfContents: [
      { id: "evolution-of-ipo-timeline", title: "1. Evolution from T+6 to Mandatory T+3" },
      { id: "t3-day-by-day-breakdown", title: "2. The 3-Day Execution Calendar" },
      { id: "benefits-for-retail-investors", title: "3. Key Benefits for Retail Bidders" },
      { id: "listing-day-trading-hours", title: "4. What Happens on Listing Morning (9:00 AM – 10:00 AM)" }
    ],
    sections: [
      {
        id: "evolution-of-ipo-timeline",
        heading: "1. Evolution from T+6 to Mandatory T+3",
        content: "Historically, Indian IPOs required up to 12-21 days between issue closure and listing. SEBI steadily compressed this window to T+6 (6 working days) in 2018, and finally made T+3 mandatory for all public issues.\n\nT represents the Issue Closing Date. T+3 means the company must be fully listed and actively trading on the stock exchange on the 3rd working day following issue closure."
      },
      {
        id: "t3-day-by-day-breakdown",
        heading: "2. The 3-Day Execution Calendar",
        content: "| Day | Stage | What Happens Behind the Scenes |\n| :--- | :--- | :--- |\n| Day T (Closure) | Bidding Closes | Bidding closes at 5:00 PM. UPI mandate authorizations finalized. |\n| Day T+1 | Basis of Allotment | Exchange and Registrar validate bids, run lottery algorithm, and finalize basis of allotment. |\n| Day T+2 | Credit & Unblock | Shares credited to Demat accounts of allotted investors. Unblocking / refund requests sent to banks. |\n| Day T+3 (Listing) | Ringing the Bell | Special Pre-open price discovery session from 9:00 AM to 9:45 AM. Normal equity trading starts at 10:00 AM. |"
      },
      {
        id: "listing-day-trading-hours",
        heading: "3. What Happens on Listing Morning (9:00 AM – 10:00 AM)" ,
        content: "On Listing Day:\n- 9:00 AM to 9:45 AM (Call Auction Session): Orders are placed and modified to discover the equilibrium opening price.\n- 9:45 AM to 10:00 AM (Order Matching): The opening price is calculated, and matched orders are executed.\n- 10:00 AM: Regular continuous trading commences on NSE and BSE."
      }
    ]
  },
  {
    slug: "anchor-investor-quota-lockin-impact",
    title: "Anchor Investors in IPOs: What They Mean and How the 30/90-Day Lock-in Period Impacts Stock Prices",
    summary: "Learn why institutional anchor book allocations signal institutional confidence and how the phased 30-day and 90-day anchor lock-in expiry affects stock price volatility.",
    category: "Analysis & Valuation",
    readTime: "7 min read",
    publishDate: "September 10, 2026",
    author: DEFAULT_AUTHOR,
    tags: ["Anchor Investors", "QIB Quota", "Lock-in Expiry", "Price Volatility", "Institutional Book"],
    featured: false,
    tableOfContents: [
      { id: "who-are-anchor-investors", title: "1. Who Are Anchor Investors in an IPO?" },
      { id: "allocation-and-pricing-rules", title: "2. Allocation and Pricing Regulations" },
      { id: "why-anchor-book-matters", title: "3. Why the Anchor Book is a Vital Confidence Indicator" },
      { id: "the-30-and-90-day-lockin", title: "4. The 30-Day and 90-Day Lock-in Expiry Rule" },
      { id: "how-to-trade-around-lockin", title: "5. Strategic Tips for Retail Investors Around Lock-in Dates" }
    ],
    sections: [
      {
        id: "who-are-anchor-investors",
        heading: "1. Who Are Anchor Investors in an IPO?",
        content: "Anchor investors are qualified institutional buyers (QIBs) who apply for an IPO before the public opening. SEBI mandates that at least 60% of the QIB portion must be allocated to anchor investors. These investors typically include mutual funds, insurance companies, foreign portfolio investors, and other large financial institutions."
      },
      {
        id: "allocation-and-pricing-rules",
        heading: "2. Allocation and Pricing Regulations",
        content: "Anchor investors are allocated a minimum of 10% and a maximum of 60% of the QIB portion. The final allotment price is usually the same as the IPO price band ceiling, ensuring price stability. Early allocation to anchors provides price discovery and signals institutional confidence to the market."
      },
      {
        id: "why-anchor-book-matters",
        heading: "3. Why the Anchor Book is a Vital Confidence Indicator",
        content: "The anchor book size and the list of anchor investors are disclosed to the stock exchange before the IPO opens. A strong anchor book with reputable investors often leads to positive listing day sentiment. Conversely, a weak or unknown anchor book can result in listing at a discount."
      },
      {
        id: "the-30-and-90-day-lockin",
        heading: "4. The 30-Day and 90-Day Lock-in Expiry Rule",
        content: "SEBI regulations require that 50% of anchor investor shares have a 30-day lock-in period, while the remaining 50% have a 90-day lock-in period. This means these shares cannot be sold on the listing day and must be held for at least 30-90 days. The gradual expiry of lock-in periods can impact stock price volatility."
      },
      {
        id: "how-to-trade-around-lockin",
        heading: "5. Strategic Tips for Retail Investors Around Lock-in Dates",
        content: "For retail investors, anchor lock-in expiry dates can create trading opportunities. When the 30-day lock-in expires, some anchor investors may start selling, potentially putting downward pressure on the stock price. Similarly, the 90-day lock-in expiry can lead to increased volatility. Retail investors should monitor these dates and adjust their strategies accordingly."
      }
    ]
  }
];

export function getAllBlogPosts() {
  return BLOG_POSTS;
}

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export function getRelatedBlogPosts(currentSlug, limit = 3) {
  return BLOG_POSTS
    .filter((p) => p.slug.toLowerCase() !== currentSlug.toLowerCase())
    .slice(0, limit);
}