export const metadata = {
  title: 'IPO Blog & Investor Guides | pkctechs',
  description: 'Expert guides, allotment strategies, taxation rules, listing day tips, and regulatory insights on Indian Mainboard & SME IPOs by pkctechs.',
  alternates: {
    canonical: 'https://pkctechs.in/blog',
  },
  openGraph: {
    title: 'IPO Blog & Investor Guides | pkctechs',
    description: 'Expert guides, allotment strategies, and regulatory insights on Indian Primary Equity Markets.',
    url: 'https://pkctechs.in/blog',
    type: 'website',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://pkctechs.in' },
    { '@type': 'ListItem', 'position': 2, 'name': 'IPO Blog', 'item': 'https://pkctechs.in/blog' },
  ],
};

export default function BlogLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
