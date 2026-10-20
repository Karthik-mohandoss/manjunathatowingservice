const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const ROOT_DIR = __dirname;
const PORT = 8899;

// MIME types for static server
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

// Start a lightweight static HTTP server
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath.endsWith('/')) {
        reqPath += 'index.html';
      }
      let filePath = path.join(ROOT_DIR, reqPath);

      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not Found: ${reqPath}`);
        return;
      }

      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`500 Server Error: ${err.message}`);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`[Static Server] Running at http://127.0.0.1:${PORT}`);
      resolve(server);
    });

    server.on('error', reject);
  });
}

async function runBrowserTests() {
  let server;
  let browser;
  let failures = [];

  try {
    server = await startServer();

    console.log('[Puppeteer] Launching headless browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const pagesToTest = [
      { name: 'Homepage', url: `http://127.0.0.1:${PORT}/` },
      { name: 'Kengeri Page', url: `http://127.0.0.1:${PORT}/car-towing-service-kengeri/` },
      { name: 'Kumbalgodu Page', url: `http://127.0.0.1:${PORT}/car-towing-service-kumbalgodu/` },
      { name: 'Ramanagara Page', url: `http://127.0.0.1:${PORT}/car-towing-service-ramanagara/` },
      { name: 'Channapatna Page', url: `http://127.0.0.1:${PORT}/car-towing-service-channapatna/` },
      { name: 'Maddur Page', url: `http://127.0.0.1:${PORT}/car-towing-service-maddur/` },
      { name: 'Mandya Page', url: `http://127.0.0.1:${PORT}/car-towing-service-mandya/` },
      { name: 'Privacy Policy', url: `http://127.0.0.1:${PORT}/privacy-policy.html` },
      { name: 'Terms of Service', url: `http://127.0.0.1:${PORT}/terms.html` }
    ];

    const viewports = [
      { name: 'Desktop (1280x800)', width: 1280, height: 800, isMobile: false },
      { name: 'Mobile (375x667)', width: 375, height: 667, isMobile: true }
    ];

    for (const vp of viewports) {
      console.log(`\n======================================================`);
      console.log(`  TESTING VIEWPORT: ${vp.name}`);
      console.log(`======================================================`);

      for (const p of pagesToTest) {
        console.log(`\n--- Inspecting ${p.name} (${p.url}) ---`);
        const page = await browser.newPage();
        await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        page.on('pageerror', err => {
          consoleErrors.push(err.message);
        });

        const response = await page.goto(p.url, { waitUntil: 'domcontentloaded' });
        const status = response.status();
        if (status !== 200) {
          failures.push(`${p.name} returned status ${status} at ${vp.name}`);
          console.error(`  ✗ HTTP Status Error: ${status}`);
        } else {
          console.log(`  ✓ HTTP Status 200 OK`);
        }

        // Check console errors
        if (consoleErrors.length > 0) {
          failures.push(`${p.name} had console errors: ${consoleErrors.join('; ')}`);
          console.error(`  ✗ Console Errors:`, consoleErrors);
        } else {
          console.log(`  ✓ 0 Console Errors`);
        }

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
          };
        });

        if (overflow.hasOverflow) {
          failures.push(`${p.name} has horizontal overflow at ${vp.name}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`);
          console.error(`  ✗ Horizontal Overflow detected:`, overflow);
        } else {
          console.log(`  ✓ Responsive layout OK: No horizontal overflow (scrollWidth=${overflow.scrollWidth} <= clientWidth=${overflow.clientWidth})`);
        }

        // Check Call Now and WhatsApp links
        const linkAudit = await page.evaluate(() => {
          const telLinks = Array.from(document.querySelectorAll('a[href^="tel:"]')).map(a => a.href);
          const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me"]')).map(a => a.href);
          return { telLinks, waLinks };
        });

        const invalidTel = linkAudit.telLinks.filter(href => href !== 'tel:9845384726');
        if (invalidTel.length > 0) {
          failures.push(`${p.name} has invalid tel links: ${invalidTel.join(', ')}`);
          console.error(`  ✗ Invalid tel links found:`, invalidTel);
        } else {
          console.log(`  ✓ All ${linkAudit.telLinks.length} tel links strictly use tel:9845384726`);
        }

        const invalidWa = linkAudit.waLinks.filter(href => !href.includes('919845384726'));
        if (invalidWa.length > 0) {
          failures.push(`${p.name} has invalid WhatsApp links: ${invalidWa.join(', ')}`);
          console.error(`  ✗ Invalid WhatsApp links found:`, invalidWa);
        } else if (linkAudit.waLinks.length > 0) {
          console.log(`  ✓ All ${linkAudit.waLinks.length} WhatsApp links target +91 98453 84726`);
        }

        // Check floating buttons and mobile bottom bar visibility
        const ctaVisibility = await page.evaluate((isMobile) => {
          const mobileBar = document.querySelector('.mobile-sticky-bar');
          const floatCall = document.querySelector('.floating-btn-call');
          const floatWa = document.querySelector('.floating-btn-whatsapp');
          const header = document.querySelector('.site-header');

          function isVisible(el) {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          }

          return {
            mobileBarPresent: !!mobileBar,
            mobileBarVisible: isVisible(mobileBar),
            floatCallPresent: !!floatCall,
            floatCallVisible: isVisible(floatCall),
            floatWaPresent: !!floatWa,
            floatWaVisible: isVisible(floatWa),
            headerPresent: !!header
          };
        }, vp.isMobile);

        if (vp.isMobile) {
          if (p.name !== 'Privacy Policy' && p.name !== 'Terms of Service') {
            if (!ctaVisibility.mobileBarVisible) {
              failures.push(`${p.name} mobile bottom bar is not visible at ${vp.name}`);
              console.error(`  ✗ Mobile bottom CTA bar is hidden`);
            } else {
              console.log(`  ✓ Mobile bottom CTA bar is active and visible`);
            }
          }
        } else {
          if (p.name !== 'Privacy Policy' && p.name !== 'Terms of Service') {
            if (!ctaVisibility.floatCallVisible || !ctaVisibility.floatWaVisible) {
              failures.push(`${p.name} floating CTA buttons not visible at ${vp.name}`);
              console.error(`  ✗ Floating CTA buttons not visible on desktop`);
            } else {
              console.log(`  ✓ Floating Call & WhatsApp buttons are visible on desktop`);
            }
          }
        }

        await page.close();
      }
    }

    // Interactive Enquiry Form Audit
    console.log(`\n======================================================`);
    console.log(`  TESTING ENQUIRY FORM VALIDATION & WHATSAPP HANDOFF`);
    console.log(`======================================================`);

    const formPage = await browser.newPage();
    await formPage.setViewport({ width: 375, height: 667, isMobile: true });
    await formPage.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'domcontentloaded' });

    console.log('\n1. Testing empty form submission...');
    const submitBtn = await formPage.$('#main-towing-enquiry-form button[type="submit"]');
    if (!submitBtn) {
      failures.push('Submit button not found on homepage');
      console.error('  ✗ Submit button missing');
    } else {
      await submitBtn.click();
      const validationState = await formPage.evaluate(() => {
        const phone = document.querySelector('#cust-phone');
        const pickup = document.querySelector('#cust-pickup');
        return {
          phoneInvalid: phone ? phone.classList.contains('is-invalid') : false,
          pickupInvalid: pickup ? pickup.classList.contains('is-invalid') : false
        };
      });

      if (!validationState.phoneInvalid || !validationState.pickupInvalid) {
        failures.push('Empty form submission failed to trigger validation error classes');
        console.error('  ✗ Form validation failed on empty fields', validationState);
      } else {
        console.log('  ✓ Empty form prevented submission and added is-invalid classes correctly');
      }

      console.log('\n2. Testing invalid phone number (e.g. 12345)...');
      await formPage.type('#cust-phone', '12345');
      await submitBtn.click();
      const phoneValid = await formPage.evaluate(() => {
        const phone = document.querySelector('#cust-phone');
        return !phone.classList.contains('is-invalid');
      });
      if (phoneValid) {
        failures.push('Invalid phone 12345 was incorrectly accepted');
        console.error('  ✗ Invalid phone was accepted');
      } else {
        console.log('  ✓ Invalid phone number 12345 was correctly rejected');
      }

      console.log('\n3. Testing valid submission & WhatsApp handoff...');
      await formPage.$eval('#cust-name', el => el.value = 'Ramesh Kumar');
      await formPage.$eval('#cust-phone', el => el.value = '9845384726');
      await formPage.$eval('#cust-pickup', el => el.value = 'Near Kengeri Bus Terminal');
      await formPage.$eval('#cust-dest', el => el.value = 'Authorised Service Center, Nayandahalli');
      await formPage.$eval('#cust-car', el => el.value = 'Hyundai i20');
      await formPage.$eval('#cust-issue', el => el.value = 'Clutch failure, car immobilised on road shoulder');

      // Hook window.open to intercept WhatsApp redirect
      await formPage.evaluate(() => {
        window.__interceptedWaUrl = null;
        window.open = function(url) {
          window.__interceptedWaUrl = url;
          return null;
        };

        const form = document.querySelector('#main-towing-enquiry-form');
        form.requestSubmit();
      });

      // Wait for handoff timeout (600ms + 800ms)
      await new Promise(r => setTimeout(r, 2000));

      const handoffResult = await formPage.evaluate(() => {
        const btn = document.querySelector('#main-towing-enquiry-form button[type="submit"]');
        const alert = document.querySelector('.form-alert-success');
        const interceptedUrl = window.__interceptedWaUrl;
        const analyticsEvents = window.__mts_tracked_events || [];

        return {
          btnText: btn ? btn.innerText.trim() : '',
          alertVisible: alert ? alert.classList.contains('is-visible') : false,
          alertHtml: alert ? alert.innerHTML : '',
          interceptedUrl: interceptedUrl,
          analyticsEvents: analyticsEvents
        };
      });

      console.log(`  ✓ Button state after handoff: "${handoffResult.btnText}"`);
      console.log(`  ✓ Status alert displayed: ${handoffResult.alertVisible}`);
      console.log(`  ✓ Intercepted WhatsApp URL: ${handoffResult.interceptedUrl ? handoffResult.interceptedUrl.substring(0, 70) + '...' : 'NONE'}`);

      if (!handoffResult.interceptedUrl || !handoffResult.interceptedUrl.includes('wa.me/919845384726')) {
        failures.push('WhatsApp handoff did not open wa.me/919845384726 with correct format');
        console.error('  ✗ WhatsApp handoff URL missing or incorrect');
      } else {
        console.log('  ✓ WhatsApp handoff URL targets +91 98453 84726 with encoded car details');
      }

      // Check URL parameters in interceptedUrl
      const decodedWa = decodeURIComponent(handoffResult.interceptedUrl);
      if (decodedWa.includes('Ramesh Kumar') && decodedWa.includes('Hyundai i20') && decodedWa.includes('Near Kengeri Bus Terminal')) {
        console.log('  ✓ All car breakdown details cleanly encoded in WhatsApp message string');
      } else {
        failures.push('Encoded WhatsApp message missing customer data');
        console.error('  ✗ Missing customer details in WhatsApp text:', decodedWa);
      }
    }

    await formPage.close();

  } catch (err) {
    failures.push(`Browser test execution error: ${err.message}`);
    console.error('[Puppeteer Error]', err);
  } finally {
    if (browser) await browser.close();
    if (server) server.close();
  }

  console.log(`\n======================================================`);
  console.log(`  BROWSER AUDIT SUMMARY: ${failures.length === 0 ? 'ALL PASSED' : failures.length + ' FAILURES'}`);
  console.log(`======================================================\n`);

  if (failures.length > 0) {
    failures.forEach(f => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('ALL BROWSER AUDIT INSPECTIONS PASSED WITH 0 DEFECTS!\n');
    process.exit(0);
  }
}

runBrowserTests();
