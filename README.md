# Manjunatha Towing Service — Website Documentation

Modern, fast, mobile-first website for **Manjunatha Towing Service**, a car towing and car recovery business serving selected locations in Karnataka, India.

Built specifically for high Google Ads conversion rates, organic local SEO, and rapid mobile lead generation (Direct Phone Calls & WhatsApp enquiries).

---

## 1. Business Profile & Verified Information

- **Business Name:** Manjunatha Towing Service
- **Live Domain:** `https://manjunathatowingservice.in`
- **GitHub Repository:** `https://github.com/Karthik-mohandoss/manjunathatowingservice`
- **Primary Phone:** `98453 84726` (tel:9845384726)
- **WhatsApp:** `+91 98453 84726` (https://wa.me/919845384726)
- **Base Business Address:** `#5, Kumbalgodu, Thagachaguppe, Near KBM Bakery, Bengaluru, Karnataka – 560074`
- **Service Scope:** Passenger Cars Only (Hatchbacks, Sedans, SUVs).
- **Strict Exclusions:** We do **NOT** tow or advertise towing for two-wheelers/motorcycles, commercial trucks, buses, or heavy industrial machinery.
- **Operating Policy:** Service availability, dispatch time, and pricing depend on distance and vehicle conditions and must be confirmed directly with the business. No unverified claims or fake guarantees are made.

---

## 2. Page & URL Architecture

All landing pages are structured with unique URLs, semantic HTML5, individual meta tags, breadcrumbs, JSON-LD schema, and local content:

| Page / Location | Clean Directory URL | Direct File Alias | Target Service Area |
| :--- | :--- | :--- | :--- |
| **Homepage** | `/` | `index.html` | Core Brand & Service Overview |
| **Kengeri** | `/car-towing-service-kengeri/` | `car-towing-service-kengeri.html` | Kengeri, Metro, Mysore Rd & NICE Rd |
| **Kumbalgodu** | `/car-towing-service-kumbalgodu/` | `car-towing-service-kumbalgodu.html` | Base Address, Industrial Area, Highway |
| **Ramanagara** | `/car-towing-service-ramanagara/` | `car-towing-service-ramanagara.html` | Silk City, Expressway Bypass, NH 275 |
| **Channapatna** | `/car-towing-service-channapatna/` | `car-towing-service-channapatna.html` | Toy Town Corridor, Expressway Overpass |
| **Maddur** | `/car-towing-service-maddur/` | `car-towing-service-maddur.html` | Shimsha River Bridge, Bypass Rest Stops |
| **Mandya** | `/car-towing-service-mandya/` | `car-towing-service-mandya.html` | Sugar City, Sugar Factory Circle, NH 275 |
| **Privacy Policy** | `/privacy-policy.html` | `privacy-policy.html` | Google Ads Compliant Data Policy |
| **Terms & Disclaimer**| `/terms.html` | `terms.html` | Service Terms & Vehicle Restrictions |

---

## 3. Google Ads & Analytics Tracking Setup

Live Google Ads conversion tracking is installed across all HTML pages and configured in `js/analytics.js`:

- **Google Ads Account ID:** `AW-18518049268`
- **Google Tag:** Placed in `<head>` of all 10 pages (`index.html`, 6 location pages, `privacy-policy.html`, `terms.html`, `thank-you.html`).
- **Contact Conversion Event Snippet:** Placed on `/thank-you.html` (`AW-18518049268/iHYtCNGv1aQdEPSDjP5E`).
- **Configured Tracking Object (`js/analytics.js`):**

```javascript
window.TRACKING_CONFIG = {
  gtmId: '',                                 // Optional GTM container ID
  ga4MeasurementId: '',                      // Optional GA4 measurement ID
  googleAdsId: 'AW-18518049268',             // Live Google Ads Account ID
  googleAdsCallConversionLabel: '',          // Optional dedicated Call Conversion Label
  googleAdsLeadConversionLabel: 'iHYtCNGv1aQdEPSDjP5E', // Contact Conversion Label
  debug: false                               // Set to true to inspect tracking events in console
};
```

### Tracked Conversion Events:
- `gtag('event', 'conversion', {'send_to': 'AW-18518049268/iHYtCNGv1aQdEPSDjP5E'})`: Fires automatically on `/thank-you.html` for Contact conversions.
- `phone_call_click`: Triggered when any `tel:` link is tapped. Captures `cta_placement` (header, hero, floating, sticky bar, footer) and `service_location`.
- `whatsapp_click`: Triggered when any WhatsApp button is clicked. Captures `cta_placement` and pre-filled message context.
- `enquiry_form_start`: Fires once per session upon initial user input into any form field.
- `enquiry_form_submit`: Fires when user clicks "Request Car Towing".
- `enquiry_form_whatsapp_handoff`: Fires when an enquiry is handed off to WhatsApp. Strictly records the outbound customer handoff without claiming a confirmed booking or lead.
- `enquiry_form_success`: Fires **strictly and only** when an enquiry is confirmed delivered to a verified backend endpoint (HTTP 200). Deduplicated to prevent double-counting.

*Note: No personal customer information (PII) is sent to analytics.*

---

## 4. Quick Car Towing Enquiry Form Integration

The form logic in `js/main.js` provides both a live API integration pathway and an honest zero-drop fallback:

1. **Configuring a Backend API (REST / Webhook / Firebase / Zapier):**
   Open `js/main.js` and set:
   ```javascript
   var FORM_CONFIG = {
     apiEndpoint: 'https://your-api-domain.com/api/enquiry', // Your endpoint URL
     businessPhone: '9845384726',
     whatsappNumber: '919845384726'
   };
   ```

2. **Honest Placeholder Mode (Default):**
   If `apiEndpoint` is left blank, the form validates the customer's name, phone number, and pickup location, presents a clear message, and automatically formats the exact breakdown details into WhatsApp (`+91 98453 84726`), ensuring the customer is immediately connected to Manjunatha Towing Service without any stranded leads or false delivery claims.

---

## 5. Local SEO & Structured Data

- **Schema.org Structured Data:** Implemented in `index.html` and all location pages using `LocalBusiness`, `AutomotiveBusiness`, `EmergencyService`, and `BreadcrumbList`.
- **Target Keywords:** All 4 required keyword themes are naturally woven into every location page:
  1. `"Car towing service in [Location]"`
  2. `"Roadside assistance near me"`
  3. `"Vehicle recovery service"`
  4. `"Tow truck near me"`
- **Indexability:** Includes `sitemap.xml` with canonical URLs, valid `robots.txt`, mobile viewport tags, descriptive Open Graph images, and zero broken links.

---

## 6. Validation & Quality Checks

Run the automated test suite locally:

```bash
# Run unit & schema validation suite (211 checks)
npm test

# Run headless browser audit across desktop & mobile viewports (Puppeteer)
npm run test:browser
```

The test suites verify:
- 100% presence of all HTML, CSS, JS, and vector graphics.
- Title, meta description, and H1 uniqueness across all 9 pages.
- Natural presence of all 4 keyword themes across all 6 location pages.
- Strict consistency of phone numbers (`tel:9845384726`) and WhatsApp URLs (`919845384726`).
- Compliance with negative business rules (no bike/truck/bus towing ads, no fake 24/7 promises).
- Valid JSON-LD Schema syntax and removal of unverified price tiers (`priceRange`).
- Canonical URLs point to `https://manjunathatowingservice.in` and sitemap integrity.
- Real browser inspection of responsive layouts (zero horizontal overflow), CTA visibility (sticky header, desktop floating buttons, mobile sticky bar), form validation, duplicate click prevention, and WhatsApp message handoff encoding.

---

## 7. Hostinger Deployment Guide

The website is fully optimized for **Hostinger Web Hosting / Cloud Hosting** with an Apache/LiteSpeed `.htaccess` setup.

### Option A: Direct Git Deployment (Recommended)
1. Log in to **Hostinger hPanel** -> Select your website `manjunathatowingservice.in`.
2. In the sidebar, search for **Git** under Advanced.
3. Enter Repository URL: `https://github.com/Karthik-mohandoss/manjunathatowingservice.git`.
4. Set Branch to `main`.
5. Set Directory to `/public_html`.
6. Click **Create** or **Deploy**.
7. Enable **Auto Deployment** so future commits pushed to GitHub are automatically deployed!

### Option B: File Manager Upload
1. In hPanel, go to **Files** -> **File Manager**.
2. Open the `public_html` directory of `manjunathatowingservice.in`.
3. Upload all files and folders from this repository (including `.htaccess`, `css/`, `images/`, `js/`, and location directories).
4. Verify SSL is active under **Security** -> **SSL** (Hostinger provides free Lifetime Let's Encrypt SSL).

