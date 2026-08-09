import type { Section } from '../lib/links';

/**
 * One meta description per host (decision 6). The single global string it
 * replaces was "A small experiment in sustainable living" — one of the four
 * phrases build doc §9 bans from `kaaya.org` and `gallery.kaaya.org`, rendered
 * on every page of every host, including the shared 404 the gallery serves.
 * Per-host defaults remove the class of problem rather than patching a string.
 *
 * A page that passes its own description still wins; this is the default for
 * the ones that do not.
 *
 * KAAYA-PROXY(T4.6): interim copy, written from what the site already says
 * about itself rather than invented. Owed: five real per-host strings from the
 * Kaaya team. None may use the four banned phrases on home or gallery, which
 * `gate:vocab` enforces independently of this file.
 */
export const SECTION_DESCRIPTION: Record<Section, string> = {
  home: 'An art space on a mud-built campus in Tilwari, Dehradun, where the work and the place it comes from are the same thing.',
  gallery:
    'Original work by emerging artists of the Himalayan region, shown and sold by enquiry at the Kaaya campus in Tilwari, Dehradun.',
  place:
    'Stay, eat and take part on a working mud-built campus in the Himalayan foothills — rooms, activities and how to arrange a visit.',
  community:
    'Learning, incubation and exchange between the Kaaya campus and the villages around it, in Tilwari, Dehradun.',
  events:
    'Exhibitions, workshops and talks at the Kaaya campus in Tilwari, Dehradun. Everything is contact-only; nothing is ticketed.',
  happenings: 'Writing from the Kaaya campus in Tilwari, Dehradun — what is being built, grown and shown.',
};
