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
    // If you have a custom backend or webhook endpoint (e.g., Firebase Function, Zapier, Webhook, REST API),
    // set the URL string below. If left empty (''), the form uses direct WhatsApp handoff.
    apiEndpoint: '',
    businessPhone: '9845384726',
    whatsappNumber: '919845384726'
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initStickyHeader();
    initFAQAccordion();
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
   * 4. Quick Car Towing Enquiry Form Validation & Honest Submission
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

        // Check if an actual backend API endpoint has been configured
        if (FORM_CONFIG.apiEndpoint && FORM_CONFIG.apiEndpoint.trim() !== '') {
          // Genuine API submission to configured backend
          fetch(FORM_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
          })
            .then(function (res) {
              if (!res.ok) throw new Error('Network response was not ok');
              return res.json();
            })
            .then(function () {
              handleSuccessfulDelivery(form, submitBtn, originalBtnText, successAlert, formData.pickupLocation);
            })
            .catch(function (err) {
              handleFailedDelivery(submitBtn, originalBtnText, errorAlert, err.message);
            });
        } else {
          // HONEST INTEGRATION PLACEHOLDER:
          // No fake backend success! Instead of showing a fake "submitted to database" message,
          // we honestly prepare a direct WhatsApp handoff with all filled details, so the driver
          // is reliably and directly connected with Manjunatha Towing Service immediately.
          setTimeout(function () {
            var waMessage = 'Hello Manjunatha Towing Service, I need car towing assistance.\n\n' +
              '*Name:* ' + formData.customerName + '\n' +
              '*Phone:* ' + formData.customerPhone + '\n' +
              '*Pickup Location:* ' + formData.pickupLocation + '\n' +
              (formData.destination ? '*Destination:* ' + formData.destination + '\n' : '') +
              (formData.carModel ? '*Car Model:* ' + formData.carModel + '\n' : '') +
              (formData.problemDesc ? '*Issue:* ' + formData.problemDesc : '');

            var waUrl = 'https://wa.me/' + FORM_CONFIG.whatsappNumber + '?text=' + encodeURIComponent(waMessage);

            if (successAlert) {
              successAlert.innerHTML = '<strong>Enquiry Details Prepared:</strong> To arrange towing assistance directly with Manjunatha Towing Service, please send your prepared details on WhatsApp or call <a href="tel:9845384726" style="text-decoration:underline;font-weight:700;">98453 84726</a> to confirm availability and pricing.<br><a href="' + waUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" style="margin-top:10px;">Send Details on WhatsApp</a>';
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
      });
    });

    function handleSuccessfulDelivery(form, submitBtn, originalBtnText, successAlert, pickupArea) {
      if (successAlert) {
        successAlert.innerHTML = '<strong>Car Towing Enquiry Received!</strong> We have received your car breakdown details. Our team at Manjunatha Towing Service will call you promptly to confirm availability and towing arrangements.';
        successAlert.classList.add('is-visible');
      }
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Request Submitted &check;';

      if (window.MTSAnalytics) {
        window.MTSAnalytics.trackFormSuccess(form.id || 'towing_enquiry_form', pickupArea);
      }
    }

    function handleFailedDelivery(submitBtn, originalBtnText, errorAlert, errorMsg) {
      if (errorAlert) {
        errorAlert.innerHTML = '<strong>Unable to submit enquiry online.</strong> Please call us directly at <a href="tel:9845384726" style="text-decoration:underline;font-weight:700;">98453 84726</a> for immediate car towing assistance.';
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
