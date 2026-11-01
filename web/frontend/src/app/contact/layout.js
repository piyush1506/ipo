export const metadata = {
  title: 'Contact Us | pkctechs IPO Support',
  description: 'Get in touch with pkctechs for IPO allotment queries, partnership inquiries, data corrections, or general support. We typically respond within 24 hours.',
  alternates: {
    canonical: 'https://pkctechs.in/contact',
  },
  openGraph: {
    title: 'Contact Us | pkctechs IPO Support',
    description: 'Reach out to pkctechs for IPO queries, feedback, or support.',
    url: 'https://pkctechs.in/contact',
    type: 'website',
  },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': [
    { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://pkctechs.in' },
    { '@type': 'ListItem', 'position': 2, 'name': 'Contact Us', 'item': 'https://pkctechs.in/contact' },
  ],
};

export default function ContactLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
