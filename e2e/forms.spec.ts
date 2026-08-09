import { test, expect } from '@playwright/test';
import { ACCESS_KEYS, type Inbox } from '../src/data/inboxes';

/**
 * The four enquiry forms (T10.4). Each renders, carries its honeypot and its
 * on-site redirect, posts the subject its inbox expects, and posts with the key
 * belonging to that inbox.
 *
 * The key assertion is the one worth having: a form pointing at the wrong
 * access key does not fail, it delivers somewhere else silently, and no build
 * or link check can see it. `ACCESS_KEYS` is imported rather than restated so
 * the test moves with T4.3 step 2 when the real keys are issued.
 */

interface FormCase {
  name: string;
  host: string;
  url: string;
  subject: string;
  enquiry: string;
  inbox: Inbox;
  /** Field names that must exist, per decision 17's per-section field sets. */
  fields: string[];
  hidden?: string[];
}

const FORMS: FormCase[] = [
  {
    name: 'incubate',
    host: 'community.kaaya.org',
    url: '/incubate',
    subject: 'Incubate Inquiry',
    enquiry: 'incubate',
    inbox: 'connect',
    // Decision 12: the live field set, carried over unchanged. No Age field.
    fields: ['name', 'phone', 'about', 'idea', 'doc'],
  },
  {
    name: 'exchange',
    host: 'community.kaaya.org',
    url: '/exchange',
    subject: 'Partnership Inquiry',
    enquiry: 'exchange',
    inbox: 'connect',
    fields: ['org', 'contact', 'email', 'message'],
  },
  {
    name: 'booking',
    host: 'place.kaaya.org',
    url: '/booking',
    subject: 'Booking Enquiry',
    enquiry: 'booking',
    inbox: 'info',
    fields: ['name', 'email', 'phone', 'arrival', 'nights', 'guests', 'roomType', 'purpose'],
  },
  {
    name: 'shop',
    host: 'gallery.kaaya.org',
    url: '/shop/chromatic-metanoia',
    subject: 'Shop Enquiry — Chromatic metanoia',
    enquiry: 'shop',
    inbox: 'gallery',
    fields: ['name', 'email', 'phone', 'message'],
    hidden: ['work', 'workTitle'],
  },
];

for (const form of FORMS) {
  test(`${form.name}: posts the right subject, key and redirect`, async ({ request }) => {
    const response = await request.get(form.url, {
      headers: { Host: form.host },
      maxRedirects: 0,
    });
    expect(response.status(), `${form.host}${form.url} should serve`).toBe(200);
    const html = await response.text();
    const start = html.indexOf('<form');
    expect(start, 'no form on the page').toBeGreaterThan(-1);
    const markup = html.slice(start, html.indexOf('</form>', start));

    expect(markup).toContain('action="https://api.web3forms.com/submit"');
    expect(markup).toContain(`name="subject" value="${form.subject}"`);
    expect(markup).toContain(`name="access_key" value="${ACCESS_KEYS[form.inbox]}"`);

    // Decision 19: one thank-you page, on the apex, reached by absolute URL
    // because Web3Forms redirects the browser from its own origin.
    expect(markup).toContain(
      `name="redirect" value="https://kaaya.org/thank-you?enquiry=${form.enquiry}"`,
    );

    // Web3Forms discards a submission with botcheck set, so its absence is a
    // spam hole rather than a cosmetic gap.
    expect(markup).toContain('name="botcheck"');

    for (const field of form.fields) {
      expect(markup, `missing field ${field}`).toContain(`name="${field}"`);
    }
    for (const hidden of form.hidden ?? []) {
      expect(markup, `missing hidden field ${hidden}`).toMatch(
        new RegExp(`<input type="hidden" name="${hidden}"`),
      );
    }
  });
}

test('the homepage carries no form', async ({ request }) => {
  // Decision 16: kaaya.org prints an address instead. A form appearing here
  // would also be a fifth destination nobody provisioned a key for.
  const response = await request.get('/', { headers: { Host: 'kaaya.org' } });
  expect(await response.text()).not.toContain('api.web3forms.com');
});
