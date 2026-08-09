/**
 * A Web3Forms access key binds to one verified destination, so an inbox is
 * chosen by which key a form posts with (TDD §14, T4.3). Naming the inbox at
 * the call site rather than pasting a key keeps the destination reviewable:
 * `inbox="info"` says where a Booking enquiry goes, where a hex string says
 * nothing and cannot be checked by eye.
 *
 * Which enquiry goes where: Incubate and Exchange to `connect@` (decision 5's
 * partnership route), Booking to `info@` (decision 9), Shop to `gallery@`
 * (decision 10, which overrides build doc §9's `art@` for this host). `art@`
 * receives no submissions at all — decision 16 leaves the homepage without a
 * form — so it has no key and does not appear here.
 */
export type Inbox = 'connect' | 'info' | 'gallery';

/**
 * KAAYA-PROXY(T4.3): all three names resolve to the one live key today. Two
 * of the three destinations do not exist yet — `info@kaaya.org` is owed by the
 * Kaaya team and `gallery@kaaya.org` is published on the retired gallery site
 * but unverified against this account — and a Web3Forms key cannot be issued
 * for an address nobody has confirmed. Owed: one verified key per destination,
 * and a live submission through each form.
 */
const LIVE_KEY = 'f8b67b4c-e134-42e6-98a0-bcf9b7998bcd';

export const ACCESS_KEYS: Record<Inbox, string> = {
  connect: LIVE_KEY,
  info: LIVE_KEY,
  gallery: LIVE_KEY,
};
