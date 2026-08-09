export const SITE = {
  title: 'Kaaya Learning Centre',
  // INTERIM. The single global description is retired by TDD decision 6 in
  // favour of one string per host; this value only has to survive until then.
  // The previous text used a phrase build doc §9 bans from kaaya.org and
  // gallery.kaaya.org, and it renders wherever a page passes no description of
  // its own — including 404.astro, which is reachable on the gallery host.
  description: 'An art space on a mud-built campus in Tilwari, Dehradun.',
  url: 'https://kaaya.org',
  author: 'Kaaya Centre',
  phone: ['8077264976', '8279959201'],
  address: 'Village Tilwari, Dehradun 248197, Himalayan Foothills, India',
  managedBy: 'K-Green Life Pvt Ltd',
  social: {
    twitter: '',
    instagram: '',
  },
  locale: 'en-US',
} as const;
