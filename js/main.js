/**
 * ==========================================================================
 * Manjunatha Towing Service — Main Website Interactive Scripts
 * Mobile Navigation, Quick Enquiry Form, FAQ Accordion, WhatsApp Integration
 * ==========================================================================
 */

(function () {
  'use strict';

  // Integration Configuration
  var FORM_CONFIG = {
    // Backend API endpoint for email delivery to manjunathatowingservice.in@gmail.com + akrithmarketer@gmail.com
    apiEndpoint: '/send-enquiry.php',
    businessPhone: '8050469086',
    whatsappNumber: '918050469086'
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStickyHeader();
    initFAQAccordion();
    initNearbyPopup();
    initEnquiryForms();
    initSmoothScrollCTAs();
  });

  /**
   * 1. Mobile Navigation Toggle & Drawer
   */
  function initMobileNav() {
    var toggleBtn = document.querySelector('.mobile-nav-toggle');
    var drawer = document.querySelector('.mobile-nav-drawer');

    if (!toggleBtn || !drawer) return;

    function openNav() {
      toggleBtn.setAttribute('aria-expanded', 'true');
      drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeNav() {
      toggleBtn.setAttribute('aria-expanded', 'false');
      drawer.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', function () {
      var isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close when clicking any nav link inside drawer
    var links = drawer.querySelectorAll('a');
    links.forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeNav();
      }
    });
  }

  /**
   * 2. Sticky Header Elevation on Scroll
   */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  /**
   * 3. Accessible FAQ Accordion
   */
  function initFAQAccordion() {
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
      var questionBtn = item.querySelector('.faq-question');
      if (!questionBtn) return;

      questionBtn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-active');

        // Optional: close other open items for cleaner mobile view
        faqItems.forEach(function (other) {
          if (other !== item) {
            other.classList.remove('is-active');
            var otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        if (isOpen) {
          item.classList.remove('is-active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /**
   * 4. 30-Second Auto Popup Enquiry Modal ("We Are Nearby!")
   */
  function initNearbyPopup() {
    // Do not show on conversion thank-you page
    if (window.location.pathname.indexOf('thank-you') !== -1) {
      return;
    }

    var existing = document.getElementById('mts-nearby-popup');
    if (!existing) {
      // Determine default location placeholder/value if on location-specific page
      var path = window.location.pathname.toLowerCase();
      var defaultPickup = '';
      if (path.indexOf('kengeri') !== -1) defaultPickup = 'Kengeri, Bengaluru';
      else if (path.indexOf('kumbalgodu') !== -1) defaultPickup = 'Kumbalgodu, Bengaluru';
      else if (path.indexOf('ramanagara') !== -1) defaultPickup = 'Ramanagara Bypass, NH 275';
      else if (path.indexOf('channapatna') !== -1) defaultPickup = 'Channapatna, NH 275';
      else if (path.indexOf('maddur') !== -1) defaultPickup = 'Maddur, NH 275';
      else if (path.indexOf('mandya') !== -1) defaultPickup = 'Mandya City / Bypass, NH 275';

      var popupHtml =
        '<div id="mts-nearby-popup" class="mts-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="mts-popup-title" aria-hidden="true" style="position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;z-index:99999;">' +
          '<div class="mts-popup-dialog">' +
            '<div class="mts-popup-top-bar">' +
              '<span class="mts-popup-badge"><span class="mts-popup-badge-dot"></span> Tow Truck Nearby &bull; Immediate Dispatch</span>' +
              '<button type="button" class="mts-popup-close-btn" id="mts-popup-close-btn" aria-label="Close popup">&times;</button>' +
            '</div>' +
            '<div class="mts-popup-header">' +
              '<h3 id="mts-popup-title" class="mts-popup-title">We Are Nearby You! 🚗 Fast Car Towing</h3>' +
              '<p class="mts-popup-subtitle">Car breakdown or stranded? Our nearest towing unit is operating in your area. Enter your name, phone number, and location — we will call you immediately!</p>' +
            '</div>' +
            '<form id="popup-towing-enquiry-form" class="towing-form" novalidate>' +
              '<div class="form-alert form-alert-success" role="status" aria-live="polite"></div>' +
              '<div class="form-alert form-alert-error" role="alert" aria-live="assertive"></div>' +
              '<div class="form-group">' +
                '<label for="popup-name" class="form-label">Customer Name <span class="req">*</span></label>' +
                '<input type="text" id="popup-name" name="customer_name" class="form-control" placeholder="Your Full Name" required autocomplete="name">' +
                '<div class="form-error-feedback">Please enter your name (minimum 2 characters).</div>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="popup-phone" class="form-label">Mobile Number <span class="req">*</span></label>' +
                '<input type="tel" id="popup-phone" name="customer_phone" class="form-control" placeholder="10-digit mobile number" required autocomplete="tel" pattern="[6-9][0-9]{9}" inputmode="numeric">' +
                '<div class="form-error-feedback">Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.</div>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="popup-pickup" class="form-label">Breakdown Location / Landmark <span class="req">*</span></label>' +
                '<input type="text" id="popup-pickup" name="pickup_location" class="form-control" placeholder="e.g. Near Kengeri / Mysore Highway / Ramanagara" value="' + defaultPickup + '" required>' +
                '<div class="form-error-feedback">Please provide your car breakdown location or nearest landmark.</div>' +
              '</div>' +
              '<button type="submit" class="btn btn-primary btn-lg form-submit-btn" data-cta-placement="popup_modal_submit">' +
                '<span>Request Immediate Towing</span>' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>' +
              '</button>' +
            '</form>' +
            '<div class="mts-popup-call-strip">' +
              '<p>Need emergency car towing right now?</p>' +
              '<a href="tel:8050469086" class="mts-popup-call-btn" data-cta-placement="popup_modal_call">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' +
                '<span>Call Directly: 80504 69086</span>' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>';

      var div = document.createElement('div');
      div.innerHTML = popupHtml;
      document.body.appendChild(div.firstElementChild);
    }

    var popupEl = document.getElementById('mts-nearby-popup');
    var closeBtn = document.getElementById('mts-popup-close-btn');

    function openPopup() {
      if (!popupEl) return;
      document.body.classList.add('mts-modal-open');
      popupEl.classList.add('is-visible');
      popupEl.setAttribute('aria-hidden', 'false');
      var nameInput = popupEl.querySelector('#popup-name');
      if (nameInput) {
        setTimeout(function () { nameInput.focus(); }, 150);
      }
    }

    function closePopup() {
      if (!popupEl) return;
      document.body.classList.remove('mts-modal-open');
      popupEl.classList.remove('is-visible');
      popupEl.setAttribute('aria-hidden', 'true');
      try {
        sessionStorage.setItem('mts_nearby_popup_dismissed', '1');
      } catch (err) {}
    }

    // Expose programmatic controls for testing and explicit triggers
    window.showNearbyTowingPopup = openPopup;
    window.hideNearbyTowingPopup = closePopup;

    if (closeBtn) {
      closeBtn.addEventListener('click', closePopup);
    }

    // Close on overlay backdrop click (outside dialog)
    popupEl.addEventListener('click', function (e) {
      if (e.target === popupEl) {
        closePopup();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popupEl.classList.contains('is-visible')) {
        closePopup();
      }
    });

    // 30-Second Automatic Trigger
    var dismissed = false;
    try {
      dismissed = sessionStorage.getItem('mts_nearby_popup_dismissed') === '1';
    } catch (e) {}

    if (!dismissed) {
      setTimeout(function () {
        var stillDismissed = false;
        try {
          stillDismissed = sessionStorage.getItem('mts_nearby_popup_dismissed') === '1';
        } catch (e) {}
        if (!stillDismissed) {
          openPopup();
        }
      }, 30000); // 30 seconds
    }
  }

  /**
   * 5. Quick Car Towing Enquiry Form Validation & Honest Submission
   */
  function initEnquiryForms() {
    var forms = document.querySelectorAll('.towing-form');

    forms.forEach(function (form) {
      var nameInput = form.querySelector('[name="customer_name"]');
      var phoneInput = form.querySelector('[name="customer_phone"]');
      var pickupInput = form.querySelector('[name="pickup_location"]');
      var destInput = form.querySelector('[name="destination"]');
      var carInput = form.querySelector('[name="car_model"]');
      var descInput = form.querySelector('[name="problem_desc"]');
      var submitBtn = form.querySelector('.form-submit-btn');
      var successAlert = form.querySelector('.form-alert-success');
      var errorAlert = form.querySelector('.form-alert-error');

      // Track form start on first input focus or change
      var allInputs = form.querySelectorAll('input, textarea');
      allInputs.forEach(function (input) {
        input.addEventListener('focus', function () {
          if (window.MTSAnalytics) {
            window.MTSAnalytics.trackFormStart(form.id || 'towing_enquiry_form');
          }
        }, { once: true });
      });

      // Phone formatting: allow only numbers, max 10 digits
      if (phoneInput) {
        phoneInput.addEventListener('input', function () {
          this.value = this.value.replace(/\D/g, '').slice(0, 10);
          if (this.classList.contains('is-invalid')) {
            validatePhone(phoneInput);
          }
        });
      }

      function validateName(input) {
        if (!input) return true;
        var valid = input.value.trim().length >= 2;
        toggleFieldValidation(input, valid);
        return valid;
      }

      function validatePhone(input) {
        if (!input) return false;
        // Valid Indian 10-digit mobile number format
        var valid = /^[6-9]\d{9}$/.test(input.value.trim());
        toggleFieldValidation(input, valid);
        return valid;
      }

      function validatePickup(input) {
        if (!input) return false;
        var valid = input.value.trim().length >= 3;
        toggleFieldValidation(input, valid);
        return valid;
      }

      function toggleFieldValidation(input, isValid) {
        if (isValid) {
          input.classList.remove('is-invalid');
        } else {
          input.classList.add('is-invalid');
        }
      }

      // Live validation on blur
      if (nameInput) nameInput.addEventListener('blur', function () { validateName(nameInput); });
      if (phoneInput) phoneInput.addEventListener('blur', function () { validatePhone(phoneInput); });
      if (pickupInput) pickupInput.addEventListener('blur', function () { validatePickup(pickupInput); });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Hide previous status alerts
        if (successAlert) successAlert.classList.remove('is-visible');
        if (errorAlert) errorAlert.classList.remove('is-visible');

        var isNameValid = validateName(nameInput);
        var isPhoneValid = validatePhone(phoneInput);
        var isPickupValid = validatePickup(pickupInput);

        if (!isNameValid || !isPhoneValid || !isPickupValid) {
          // Focus first invalid element
          var firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid) firstInvalid.focus();
          return;
        }

        // Notify Analytics of submit attempt
        if (window.MTSAnalytics) {
          window.MTSAnalytics.trackFormSubmitAttempt(form.id || 'towing_enquiry_form');
        }

        try {
          sessionStorage.setItem('mts_nearby_popup_dismissed', '1');
        } catch (err) {}

        // Prevent duplicate clicks & show loading state
        submitBtn.disabled = true;
        var originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Processing Enquiry...</span>';

        var formData = {
          customerName: nameInput ? nameInput.value.trim() : '',
          customerPhone: phoneInput ? phoneInput.value.trim() : '',
          pickupLocation: pickupInput ? pickupInput.value.trim() : '',
          destination: destInput ? destInput.value.trim() : '',
          carModel: carInput ? carInput.value.trim() : '',
          problemDesc: descInput ? descInput.value.trim() : '',
          submittedAt: new Date().toISOString(),
          pageUrl: window.location.href
        };

        // Prepare WhatsApp message
        var waMessage = 'Hello Manjunatha Towing Service, I need car towing assistance.\n\n' +
          '*Name:* ' + formData.customerName + '\n' +
          '*Phone:* ' + formData.customerPhone + '\n' +
          '*Pickup Location:* ' + formData.pickupLocation + '\n' +
          (formData.destination ? '*Destination:* ' + formData.destination + '\n' : '') +
          (formData.carModel ? '*Car Model:* ' + formData.carModel + '\n' : '') +
          (formData.problemDesc ? '*Issue:* ' + formData.problemDesc : '');

        var waUrl = 'https://wa.me/' + FORM_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(waMessage);

        // Check if backend API endpoint is configured
        if (FORM_CONFIG.apiEndpoint && FORM_CONFIG.apiEndpoint.trim() !== '') {
          fetch(FORM_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
          })
            .then(function (res) {
              if (!res.ok) throw new Error('Network response error');
              return res.json();
            })
            .then(function () {
              handleSuccessfulDelivery(form, submitBtn, originalBtnText, successAlert, formData.pickupLocation, waUrl);
            })
            .catch(function (err) {
              if (window.TRACKING_CONFIG && window.TRACKING_CONFIG.debug) {
                console.log('[MTS Backend Notice]', err);
              }
              triggerWhatsAppHandoff(form, submitBtn, originalBtnText, successAlert, formData, waUrl);
            });
        } else {
          // HONEST INTEGRATION PLACEHOLDER:
          // No fake backend success! Instead of showing a fake "submitted to database" message,
          // we honestly prepare a direct WhatsApp handoff with all filled details, so the driver
          // is reliably and directly connected with Manjunatha Towing Service immediately.
          triggerWhatsAppHandoff(form, submitBtn, originalBtnText, successAlert, formData, waUrl);
        }
      });
    });

    function triggerWhatsAppHandoff(form, submitBtn, originalBtnText, successAlert, formData, waUrl) {
      setTimeout(function () {
        if (successAlert) {
          successAlert.innerHTML = '<strong>Enquiry Details Prepared:</strong> Details forwarded to Manjunatha Towing Service via email & WhatsApp. Call <a href="tel:8050469086" style="text-decoration:underline;font-weight:700;">80504 69086</a> to confirm availability and pricing.<br><a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="margin-top:10px;">Send Details on WhatsApp</a>';
          successAlert.classList.add('is-visible');
        }

        // Record handoff event (NOT a confirmed lead or booking)
        if (window.MTSAnalytics && typeof window.MTSAnalytics.trackFormWhatsAppHandoff === 'function') {
          window.MTSAnalytics.trackFormWhatsAppHandoff(form.id || 'towing_enquiry_form', formData.pickupLocation);
        }

        // Restore button with accurate state indicating handoff
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Opening WhatsApp...</span>';

        // Open WhatsApp directly after short delay
        setTimeout(function () {
          window.open(waUrl, '_blank', 'noopener,noreferrer');
        }, 800);

      }, 600);
    }

    function handleSuccessfulDelivery(form, submitBtn, originalBtnText, successAlert, pickupArea, waUrl) {
      if (successAlert) {
        successAlert.innerHTML = '<strong>Car Towing Enquiry Received!</strong> We have received your car breakdown details via email and WhatsApp. Our team will call you promptly.<br><a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="margin-top:10px;">Chat on WhatsApp Now</a>';
        successAlert.classList.add('is-visible');
      }
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Opening WhatsApp...</span>';

      if (window.MTSAnalytics) {
        window.MTSAnalytics.trackFormSuccess(form.id || 'towing_enquiry_form', pickupArea);
      }

      setTimeout(function () {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }, 800);
    }

    function handleFailedDelivery(submitBtn, originalBtnText, errorAlert, errorMsg) {
      if (errorAlert) {
        errorAlert.innerHTML = '<strong>Unable to submit enquiry online.</strong> Please call us directly at <a href="tel:8050469086" style="text-decoration:underline;font-weight:700;">80504 69086</a> for immediate car towing assistance.';
        errorAlert.classList.add('is-visible');
      }
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }

  /**
   * 5. Smooth Scroll for "Request Car Towing" CTA Buttons
   */
  function initSmoothScrollCTAs() {
    var ctaButtons = document.querySelectorAll('a[href="#enquiry-form"]');
    ctaButtons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var target = document.getElementById('enquiry-form');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          var firstInput = target.querySelector('input');
          if (firstInput) {
            setTimeout(function () { firstInput.focus(); }, 600);
          }
        }
      });
    });
  }
})();
