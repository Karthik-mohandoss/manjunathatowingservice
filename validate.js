/**
 * Comprehensive Validation Script for Manjunatha Towing Service Website
 * Verifies SEO requirements, link integrity, JSON-LD schema, business rules, and keyword themes.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;

const REQUIRED_FILES = [
  'index.html',
  'car-towing-service-kengeri/index.html',
  'car-towing-service-kumbalgodu/index.html',
  'car-towing-service-ramanagara/index.html',
  'car-towing-service-channapatna/index.html',
  'car-towing-service-maddur/index.html',
  'car-towing-service-mandya/index.html',
  'privacy-policy.html',
  'terms.html',
  'thank-you.html',
  'sitemap.xml',
  'robots.txt',
  'css/style.css',
  'js/main.js',
  'js/analytics.js',
  'images/logo.svg',
  'images/favicon.svg',
  'images/hero-car-towing.svg',
  'images/service-towing.svg',
  'images/service-breakdown.svg',
  'images/service-roadside.svg',
  'images/service-winch.svg',
  'images/service-transport.svg',
  'images/corridor-map.svg'
];

const LOCATIONS = [
  { name: 'Kengeri', file: 'car-towing-service-kengeri/index.html' },
  { name: 'Kumbalgodu', file: 'car-towing-service-kumbalgodu/index.html' },
  { name: 'Ramanagara', file: 'car-towing-service-ramanagara/index.html' },
  { name: 'Channapatna', file: 'car-towing-service-channapatna/index.html' },
  { name: 'Maddur', file: 'car-towing-service-maddur/index.html' },
  { name: 'Mandya', file: 'car-towing-service-mandya/index.html' }
];

let totalChecks = 0;
let passedChecks = 0;
let errors = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    errors.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n======================================================');
console.log('  MANJUNATHA TOWING SERVICE — AUDIT & VALIDATION SUITE');
console.log('======================================================\n');

// 1. File Existence Check
console.log('1. Checking File Existence...');
REQUIRED_FILES.forEach(relPath => {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert(fs.existsSync(fullPath), `File exists: ${relPath}`);
});

// 2. Metadata & Titles Uniqueness
console.log('\n2. Verifying Title, Meta Description & H1 Uniqueness...');
const titles = new Set();
const descriptions = new Set();
const h1s = new Set();

const htmlFiles = [
  'index.html',
  ...LOCATIONS.map(l => l.file),
  'privacy-policy.html',
  'terms.html'
];

htmlFiles.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');

  // Title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  assert(titleMatch && titleMatch[1].trim().length > 0, `Page has <title>: ${relPath}`);
  if (titleMatch) {
    const title = titleMatch[1].trim();
    assert(!titles.has(title), `Title is unique for ${relPath}: "${title}"`);
    titles.add(title);
  }

  // Meta Description
  const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  assert(descMatch && descMatch[1].trim().length > 0, `Page has meta description: ${relPath}`);
  if (descMatch) {
    const desc = descMatch[1].trim();
    assert(!descriptions.has(desc), `Meta description is unique for ${relPath}`);
    descriptions.add(desc);
  }

  // H1
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/is);
  assert(h1Match && h1Match[1].trim().length > 0, `Page has <h1>: ${relPath}`);
  if (h1Match) {
    const rawH1 = h1Match[1].replace(/<[^>]+>/g, '').trim();
    assert(!h1s.has(rawH1), `H1 is unique for ${relPath}: "${rawH1}"`);
    h1s.add(rawH1);
  }
});

// 3. Location Pages Four Keyword Themes Check
console.log('\n3. Verifying All 4 Target Keyword Themes on Every Location Page...');
LOCATIONS.forEach(loc => {
  const content = fs.readFileSync(path.join(ROOT_DIR, loc.file), 'utf8');
  const lower = content.toLowerCase();

  const kw1 = `car towing service in ${loc.name.toLowerCase()}`;
  const kw2 = 'roadside assistance near me';
  const kw3 = 'vehicle recovery service';
  const kw4 = 'tow truck near me';

  assert(lower.includes(kw1), `${loc.name} contains target keyword 1: "${kw1}"`);
  assert(lower.includes(kw2), `${loc.name} contains target keyword 2: "${kw2}"`);
  assert(lower.includes(kw3), `${loc.name} contains target keyword 3: "${kw3}"`);
  assert(lower.includes(kw4), `${loc.name} contains target keyword 4: "${kw4}"`);
});

// 4. Contact Numbers & WhatsApp Consistency
console.log('\n4. Verifying Phone & WhatsApp Links Consistency...');
htmlFiles.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');

  if (content.includes('href="tel:')) {
    assert(content.includes('href="tel:9845384726"'), `Phone link is tel:9845384726 in ${relPath}`);
  }

  if (content.includes('wa.me/')) {
    assert(content.includes('wa.me/919845384726'), `WhatsApp link uses 919845384726 in ${relPath}`);
  }
});

// 5. Strict Business Restriction Checks (Negative Constraints)
console.log('\n5. Verifying Business Restrictions (Cars only, no prohibited vehicle ads)...');
const FORBIDDEN_PROMOTIONS = [
  'bike towing',
  'two-wheeler towing',
  'scooter towing',
  'motorcycle towing',
  'truck towing',
  'commercial truck towing',
  'bus towing',
  'heavy vehicle recovery'
];

htmlFiles.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
  const lower = content.toLowerCase();

  FORBIDDEN_PROMOTIONS.forEach(phrase => {
    // Exception: Explicit negative statements saying "We do not provide bike towing" are allowed and expected!
    // We check if the phrase appears without a negation like "do not", "no", "never", "strictly cars only".
    const idx = lower.indexOf(phrase);
    if (idx !== -1) {
      const surroundingSnippet = lower.substring(Math.max(0, idx - 40), Math.min(lower.length, idx + phrase.length + 40));
      const isNegated = surroundingSnippet.includes('do not') ||
                        surroundingSnippet.includes('not provide') ||
                        surroundingSnippet.includes('does not') ||
                        surroundingSnippet.includes('no ');
      assert(isNegated, `Forbidden phrase "${phrase}" in ${relPath} is properly negated / disclaimed: "...${surroundingSnippet.trim()}..."`);
    }
  });

  // Verify no 24/7 fake claims in marketing headings
  const has24x7Claim = /<h[1-4][^>]*>[^<]*24\/7[^<]*<\/h[1-4]>/i.test(content);
  assert(!has24x7Claim, `No unconfirmed 24/7 claim in headings in ${relPath}`);
});

// 6. JSON-LD Schema Validation
console.log('\n6. Validating JSON-LD Structured Data...');
const pagesWithSchema = ['index.html', ...LOCATIONS.map(l => l.file)];

pagesWithSchema.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
  const jsonLdMatch = content.match(/<script type=["']application\/ld\+json["']>(.*?)<\/script>/is);
  assert(jsonLdMatch !== null, `Page contains JSON-LD structured data: ${relPath}`);
  if (jsonLdMatch) {
    try {
      const parsed = JSON.parse(jsonLdMatch[1]);
      assert(parsed !== null, `JSON-LD parses cleanly for ${relPath}`);
    } catch (e) {
      assert(false, `JSON-LD syntax error in ${relPath}: ${e.message}`);
    }
  }
});

// 7. Sitemap & Robots Validation
console.log('\n7. Validating sitemap.xml & robots.txt...');
const LIVE_DOMAIN = 'https://manjunathatowingservice.in';
const sitemapContent = fs.readFileSync(path.join(ROOT_DIR, 'sitemap.xml'), 'utf8');
assert(sitemapContent.includes(`<loc>${LIVE_DOMAIN}/</loc>`), 'Sitemap includes live domain homepage');
LOCATIONS.forEach(loc => {
  const expectedUrl = `${LIVE_DOMAIN}/${loc.file.replace('/index.html', '/')}`;
  assert(sitemapContent.includes(`<loc>${expectedUrl}</loc>`), `Sitemap includes ${loc.name} URL (${expectedUrl})`);
});
assert(sitemapContent.includes(`<loc>${LIVE_DOMAIN}/privacy-policy.html</loc>`), 'Sitemap includes privacy policy');
assert(sitemapContent.includes(`<loc>${LIVE_DOMAIN}/terms.html</loc>`), 'Sitemap includes terms of service');

const robotsContent = fs.readFileSync(path.join(ROOT_DIR, 'robots.txt'), 'utf8');
assert(robotsContent.includes(`Sitemap: ${LIVE_DOMAIN}/sitemap.xml`), 'robots.txt references live domain sitemap.xml');

// 8. Strict Production Readiness & Domain Verification
console.log('\n8. Verifying Live Domain (manjunathatowingservice.in) & Absence of False Data...');
htmlFiles.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
  assert(!content.includes('manjunathatowing.com'), `No placeholder domain (manjunathatowing.com) found in ${relPath}`);
  assert(!content.includes('"priceRange"'), `No unverified priceRange in structured data in ${relPath}`);
  
  // Canonical check
  const canonicalMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  assert(canonicalMatch !== null, `Page has canonical tag: ${relPath}`);
  if (canonicalMatch) {
    const canonicalHref = canonicalMatch[1];
    assert(canonicalHref.startsWith(LIVE_DOMAIN), `Canonical uses live production domain (${LIVE_DOMAIN}) in ${relPath}: ${canonicalHref}`);
  }
});

assert(sitemapContent.includes(LIVE_DOMAIN), 'sitemap.xml contains live domain');
assert(robotsContent.includes(LIVE_DOMAIN), 'robots.txt contains live domain');

// 9. Analytics & Conversion Tracking Integrity Checks
console.log('\n9. Verifying Analytics Integrity & WhatsApp Handoff Delineation...');
const analyticsContent = fs.readFileSync(path.join(ROOT_DIR, 'js/analytics.js'), 'utf8');
assert(analyticsContent.includes('enquiry_form_whatsapp_handoff'), 'analytics.js defines enquiry_form_whatsapp_handoff event');
assert(analyticsContent.includes('trackFormWhatsAppHandoff'), 'analytics.js exposes trackFormWhatsAppHandoff function');
assert(analyticsContent.includes('enquiry_form_success'), 'analytics.js retains enquiry_form_success strictly for verified submission');

const mainJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js/main.js'), 'utf8');
assert(mainJsContent.includes('trackFormWhatsAppHandoff'), 'main.js dispatches trackFormWhatsAppHandoff on WhatsApp fallback');
const fallbackBlock = mainJsContent.substring(
  mainJsContent.indexOf('HONEST INTEGRATION PLACEHOLDER'),
  mainJsContent.indexOf('function handleSuccessfulDelivery')
);
assert(!fallbackBlock.includes('trackFormSuccess'), 'main.js does NOT dispatch trackFormSuccess on WhatsApp fallback');

// 10. 10-Minute Recovery Target & Qualified Messaging Verification
console.log('\n10. Verifying 10-Minute Recovery Target & Qualified Messaging...');
const homeContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
assert(homeContent.includes('Car Towing &amp; Recovery in Just 10 Minutes!') || homeContent.includes('Car Towing & Recovery in Just 10 Minutes!'), 'Homepage contains headline: "Car Towing & Recovery in Just 10 Minutes!"');
assert(homeContent.includes('10-Minute Recovery Target'), 'Homepage contains badge: "10-Minute Recovery Target"');
assert(homeContent.includes('Need urgent car towing assistance? Contact Manjunatha Towing Service for quick car recovery assistance. Call us now to check availability near your location.'), 'Homepage contains exact supporting text');
assert(homeContent.includes('Call Now &ndash; 98453 84726') || homeContent.includes('Call Now – 98453 84726'), 'Homepage primary CTA is Call Now – 98453 84726');
assert(homeContent.includes('Get Help on WhatsApp'), 'Homepage secondary CTA is Get Help on WhatsApp');
assert(homeContent.includes('Fast Car Towing Assistance &ndash; Contact Us for Availability') || homeContent.includes('Fast Car Towing Assistance – Contact Us for Availability'), 'Homepage qualifies recovery target with availability notice');

LOCATIONS.forEach(loc => {
  const locContent = fs.readFileSync(path.join(ROOT_DIR, loc.file), 'utf8');
  assert(locContent.includes('10-Minute Recovery Target'), `${loc.name} contains "10-Minute Recovery Target" badge`);
  assert(locContent.includes('Fast Car Towing Assistance &ndash; Contact Us for Availability') || locContent.includes('Fast Car Towing Assistance – Contact Us for Availability'), `${loc.name} contains "Fast Car Towing Assistance – Contact Us for Availability" message`);
});

// 11. Google Ads Tag (gtag.js) & Contact Conversion Snippet Verification
console.log('\n11. Verifying Google Ads Tag (AW-18518049268) & Conversion Snippet...');
const GOOGLE_ADS_ID = 'AW-18518049268';
const CONVERSION_SNIPPET = 'AW-18518049268/iHYtCNGv1aQdEPSDjP5E';

const pagesWithGoogleTag = [
  'index.html',
  ...LOCATIONS.map(l => l.file),
  'privacy-policy.html',
  'terms.html',
  'thank-you.html'
];

pagesWithGoogleTag.forEach(relPath => {
  const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
  assert(content.includes(GOOGLE_ADS_ID), `Google tag (${GOOGLE_ADS_ID}) present in ${relPath}`);
  assert(content.includes('https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID), `gtag.js script loader present in ${relPath}`);
});

const thankYouContent = fs.readFileSync(path.join(ROOT_DIR, 'thank-you.html'), 'utf8');
assert(thankYouContent.includes(CONVERSION_SNIPPET), `thank-you.html contains Contact conversion snippet (${CONVERSION_SNIPPET})`);
assert(thankYouContent.includes("gtag('event', 'conversion'"), 'thank-you.html invokes conversion event');

assert(analyticsContent.includes(`googleAdsId: '${GOOGLE_ADS_ID}'`), `analytics.js has live googleAdsId: ${GOOGLE_ADS_ID}`);
assert(analyticsContent.includes("googleAdsLeadConversionLabel: 'iHYtCNGv1aQdEPSDjP5E'"), 'analytics.js has live Contact conversion label');
assert(analyticsContent.includes("googleAdsCallConversionLabel: 'iHYtCNGv1aQdEPSDjP5E'"), 'analytics.js has live Call conversion label for call button clicks');
assert(analyticsContent.includes("phone_call_click") && analyticsContent.includes("transport_type': 'beacon'"), 'analytics.js dispatches Google Ads conversion on phone_call_click with beacon transport');
assert(analyticsContent.includes("whatsapp_click") && analyticsContent.includes("googleAdsWhatsAppConversionLabel"), 'analytics.js dispatches Google Ads conversion on whatsapp_click');

// Summary
console.log('\n======================================================');
console.log(`TOTAL CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${errors.length}`);
console.log('======================================================\n');

if (errors.length > 0) {
  console.error('FAILURES DETECTED:');
  errors.forEach(err => console.error(` - ${err}`));
  process.exit(1);
} else {
  console.log('ALL AUDIT CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}
