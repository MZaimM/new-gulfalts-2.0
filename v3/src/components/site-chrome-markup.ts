/*
 * Header, menu and contact drawer markup shared by every page, rendered at build time into the
 * `<!-- site:chrome -->` slot (see vite.config.ts). Behaviour lives in components/site-chrome.ts
 * and components/contact.ts. On the homepage the links are anchors into its chapters; on a venue
 * page they lead back to the homepage or across to the other venue pages.
 */
import { destinationById } from '../content/destinations';
import { href, page } from './markup';

interface ChromeLinks {
  home: string;
  creativePark: string;
  fintechDistrict: string;
  allDestinations: string;
  approach: string;
}

const homeLinks: ChromeLinks = {
  home: '#h01-brand-reveal',
  creativePark: '#h05-creative-park',
  fintechDistrict: '#h08-fintech-district',
  allDestinations: '#h13-dubai-pull-out',
  approach: '#h11-raw-to-destination'
};

const venueLinks = (): ChromeLinks => ({
  home: page(),
  creativePark: href(destinationById('creative-park').url),
  fintechDistrict: href(destinationById('fintech-district').url),
  allDestinations: page(homeLinks.allDestinations),
  approach: page(homeLinks.approach)
});

/** Homepage anchors double as keys for initNavState; venue pages mark their own link instead. */
const navAttrs = (link: string, current: boolean) =>
  `href="${link}"${link.startsWith('#') ? ` data-nav="${link}"` : ''}${current ? ' aria-current="page"' : ''}`;

const header = (links: ChromeLinks, venue?: string) => `
  <header class="site-header is-waiting" aria-label="Main navigation">
    <a href="${links.home}" class="brand" aria-label="Gulfalts home">
      <img class="brand_logo is-light" src="/media/images/logo-light.svg" alt="Gulfalts" width="132" height="28" />
      <img class="brand_logo is-dark" src="/media/images/logo-dark.svg" alt="" width="132" height="28" />
    </a>
    <nav class="desktop-nav" aria-label="Primary">
      <div class="nav-dropdown">
        <button class="nav-dropdown_toggle" type="button" aria-expanded="false" aria-controls="nav-destinations" data-nav="destinations"${venue ? ' aria-current="true"' : ''}>
          Destinations
          <svg class="nav-dropdown_chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <ul class="nav-dropdown_panel" id="nav-destinations">
          <li><a class="nav-dropdown_link" ${navAttrs(links.creativePark, venue === 'creative-park')}><span>Creative Park</span><span class="nav-dropdown_meta">01</span></a></li>
          <li><a class="nav-dropdown_link" ${navAttrs(links.fintechDistrict, venue === 'fintech-district')}><span>Fintech District</span><span class="nav-dropdown_meta">02</span></a></li>
          <li><a class="nav-dropdown_link is-all" ${navAttrs(links.allDestinations, false)}><span>All destinations</span><span class="link-arrow" aria-hidden="true">→</span></a></li>
        </ul>
      </div>
      <button type="button" class="button nav-cta" data-contact-open aria-haspopup="dialog" aria-controls="contact-dialog">Inquire</button>
    </nav>
    <button class="menu-toggle" aria-expanded="false" aria-controls="menu-dialog"><span class="menu-glyph" aria-hidden="true"></span><span>Menu</span></button>
  </header>`;

const menu = (links: ChromeLinks) => `
  <dialog id="menu-dialog" class="menu-dialog" aria-labelledby="menu-title">
    <div class="menu-body">
      <div class="menu-top"><span id="menu-title">Explore Gulfalts</span><button class="menu-close" aria-label="Close menu">Close <span aria-hidden="true">×</span></button></div>
      <nav aria-label="Expanded navigation">
        <a href="${links.home}" style="--i:0">Home</a>
        <a href="${links.allDestinations}" style="--i:1">Destinations</a>
        <a href="${links.approach}" style="--i:2">Our approach</a>
      </nav>
      <a class="menu-contact" href="mailto:info@gulfalts.com">info@gulfalts.com <span aria-hidden="true">↗</span></a>
    </div>
  </dialog>`;

const contactDrawer = () => `
  <dialog id="contact-dialog" class="contact-drawer" aria-labelledby="contact-title" aria-describedby="contact-intro">
    <div class="contact-drawer_body">
      <button type="button" class="contact-drawer_close" aria-label="Close contact form">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4 4 20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
      </button>
      <h2 class="contact-drawer_title" id="contact-title">Get in Touch</h2>
      <p class="contact-drawer_intro" id="contact-intro">We work with institutions, family offices, and qualified investors seeking exposure to Dubai’s commercial real estate market. Reach out to discuss tailored investment solutions.</p>
      <h3 class="contact-drawer_subtitle">Contact Form</h3>
      <form class="contact-form" name="contact" method="post" novalidate>
        <div class="contact-form_row">
          <div class="contact-field">
            <label class="visually-hidden" for="contact-name">Full name (required)</label>
            <input id="contact-name" name="full-name" type="text" placeholder="Full Name" autocomplete="name" required aria-describedby="contact-name-error" />
            <p class="contact-field_error" id="contact-name-error" hidden>Please enter your full name.</p>
          </div>
          <div class="contact-field">
            <label class="visually-hidden" for="contact-phone">Phone number (optional)</label>
            <input id="contact-phone" name="phone" type="tel" placeholder="Phone Number" autocomplete="tel" inputmode="tel" />
          </div>
        </div>
        <div class="contact-field">
          <label class="visually-hidden" for="contact-email">Email address (required)</label>
          <input id="contact-email" name="email" type="email" placeholder="Email Address" autocomplete="email" required aria-describedby="contact-email-error" />
          <p class="contact-field_error" id="contact-email-error" hidden>Please enter a valid email address.</p>
        </div>
        <div class="contact-field">
          <label class="visually-hidden" for="contact-type">Inquiry type (required)</label>
          <select id="contact-type" name="inquiry-type" required aria-describedby="contact-type-error">
            <option value="">Select one...</option>
            <option value="Investment Solutions">Investment Solutions</option>
            <option value="Development Partnership / JV">Development Partnership / JV</option>
            <option value="Land Opportunity / Site Request">Land Opportunity / Site Request</option>
            <option value="Leasing / Tenant Enquiries">Leasing / Tenant Enquiries</option>
            <option value="Media / Press">Media / Press</option>
          </select>
          <p class="contact-field_error" id="contact-type-error" hidden>Please choose an inquiry type.</p>
        </div>
        <button type="submit" class="contact-form_submit">
          <span class="contact-form_submit-label">Submit Inquiry</span>
          <span class="contact-form_progress" aria-hidden="true"></span>
        </button>
        <p class="contact-form_status" role="status" aria-live="polite"></p>
      </form>
    </div>
  </dialog>`;

/** `venue` is the destination id of a venue page; leave it out for the homepage. */
export const renderSiteChrome = (venue?: string) => {
  const links = venue ? venueLinks() : homeLinks;
  return [header(links, venue), menu(links), contactDrawer()].join('\n');
};
