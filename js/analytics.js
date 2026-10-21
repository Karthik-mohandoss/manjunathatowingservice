/**
 * ==========================================================================
 * Manjunatha Towing Service — Analytics & Conversion Tracking Module
 * Google Ads, GA4 & GTM Event Measurement
 * ==========================================================================
 * 
 * SETUP INSTRUCTIONS FOR PRODUCTION:
 * To enable live tracking, update the configuration below with your genuine IDs:
 * 1. GTM Container ID: Replace '' with 'GTM-XXXXXXX'
 * 2. GA4 Measurement ID: Replace '' with 'G-XXXXXXXXXX'
 * 3. Google Ads ID: Replace '' with 'AW-XXXXXXXXX'
 * 4. Google Ads Conversion Label for Calls/Leads: Replace '' with 'AbCdEfGhIjKlMnOpQr'
 *
 * NOTE: No fake or invented IDs are hardcoded. If keys remain empty, tracking
 * executes in safe local mode (logged to console if debug is enabled), ensuring
 * zero broken external scripts or console errors.
 */

(function () {
  'use strict';

  // Configurable tracking parameters (Configured from Google Ads account)
  window.TRACKING_CONFIG = {
    gtmId: '',                        // e.g., 'GTM-XXXXXXX'
    ga4MeasurementId: '',             // e.g., 'G-XXXXXXXXXX'
    googleAdsId: 'AW-18518049268',    // Live Google Ads Account ID
    googleAdsCallConversionLabel: 'iHYtCNGv1aQdEPSDjP5E', // Live Contact conversion label for call button clicks
    googleAdsLeadConversionLabel: 'iHYtCNGv1aQdEPSDjP5E', // Contact conversion label
    googleAdsWhatsAppConversionLabel: 'iHYtCNGv1aQdEPSDjP5E', // Contact conversion label for WhatsApp clicks
    debug: false                      // Set to true to inspect tracking events in console
  };

  // Conversion deduplication cache for session
  var trackedEventsCache = {};

  /**
   * Helper: Initialize Google Tag Manager or gtag if IDs are provided
   */
  function initTags() {
    // 1. Google Tag Manager initialization
    if (window.TRACKING_CONFIG.gtmId && window.TRACKING_CONFIG.gtmId.trim() !== '') {
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer',window.TRACKING_CONFIG.gtmId);
    }

    // 2. Google Analytics 4 / Google Ads gtag.js initialization
    var mainGoogleId = window.TRACKING_CONFIG.ga4MeasurementId || window.TRACKING_CONFIG.googleAdsId;
    if (mainGoogleId && mainGoogleId.trim() !== '') {
      var existingTagScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      if (!existingTagScript && !window.gtag) {
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(mainGoogleId);
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function(){ window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
      } else {
        window.dataLayer = window.dataLayer || [];
        if (!window.gtag) {
          window.gtag = function(){ window.dataLayer.push(arguments); };
        }
      }

      if (window.TRACKING_CONFIG.ga4MeasurementId) {
        window.gtag('config', window.TRACKING_CONFIG.ga4MeasurementId, {
          send_page_view: true
        });
      }
      if (window.TRACKING_CONFIG.googleAdsId && !existingTagScript) {
        window.gtag('config', window.TRACKING_CONFIG.googleAdsId);
      }
    }
  }

  /**
   * Central Dispatcher for Tracking Events
   * Pushes to dataLayer, invokes gtag(), and notifies console if in debug mode.
   * Strictly NO personally identifiable information (PII) is included.
   */
  function trackEvent(eventName, params) {
    params = params || {};
    
    // Add standard context
    var fullPayload = {
      event: eventName,
      event_name: eventName,
      page_url: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
      timestamp: new Date().toISOString()
    };

    // Merge non-PII params
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        fullPayload[key] = params[key];
      }
    }

    // 1. Push to dataLayer (GTM standard)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(fullPayload);

    // 2. Direct gtag invocation if configured
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, fullPayload);

      // Handle direct Google Ads conversion mapping for Phone Calls
      if (eventName === 'phone_call_click' && window.TRACKING_CONFIG.googleAdsId) {
        var callLabel = window.TRACKING_CONFIG.googleAdsCallConversionLabel || window.TRACKING_CONFIG.googleAdsLeadConversionLabel;
        if (callLabel) {
          window.gtag('event', 'conversion', {
            'send_to': window.TRACKING_CONFIG.googleAdsId + '/' + callLabel,
            'transport_type': 'beacon'
          });
        }
      }

      // Handle direct Google Ads conversion mapping for WhatsApp Clicks
      if (eventName === 'whatsapp_click' && window.TRACKING_CONFIG.googleAdsId) {
        var waLabel = window.TRACKING_CONFIG.googleAdsWhatsAppConversionLabel || window.TRACKING_CONFIG.googleAdsLeadConversionLabel;
        if (waLabel) {
          window.gtag('event', 'conversion', {
            'send_to': window.TRACKING_CONFIG.googleAdsId + '/' + waLabel,
            'transport_type': 'beacon'
          });
        }
      }

      // ONLY verified API delivery triggers lead conversion mapping
      if (eventName === 'enquiry_form_success' && window.TRACKING_CONFIG.googleAdsId && window.TRACKING_CONFIG.googleAdsLeadConversionLabel) {
        window.gtag('event', 'conversion', {
          'send_to': window.TRACKING_CONFIG.googleAdsId + '/' + window.TRACKING_CONFIG.googleAdsLeadConversionLabel,
          'transport_type': 'beacon'
        });
      }
    }

    if (window.TRACKING_CONFIG.debug) {
      console.log('[MTS Analytics Event]', eventName, fullPayload);
    }
  }

  /**
   * Track Phone Call Click
   * Notes: This records the link click intent; it does NOT falsely guarantee the call connected.
   */
  function trackPhoneCallClick(ctaPlacement, customLocation) {
    trackEvent('phone_call_click', {
      cta_placement: ctaPlacement || 'unspecified',
      service_location: customLocation || 'general',
      target_phone: '9845384726'
    });
  }

  /**
   * Track WhatsApp Click
   * Notes: Records button tap intent; does NOT guarantee conversation occurred.
   */
  function trackWhatsAppClick(ctaPlacement, customLocation) {
    trackEvent('whatsapp_click', {
      cta_placement: ctaPlacement || 'unspecified',
      service_location: customLocation || 'general',
      target_channel: 'whatsapp'
    });
  }

  /**
   * Track Form Interactions
   */
  var formStarted = false;

  function trackFormStart(formId) {
    if (!formStarted) {
      formStarted = true;
      trackEvent('enquiry_form_start', {
        form_id: formId || 'towing_enquiry_form'
      });
    }
  }

  function trackFormSubmitAttempt(formId) {
    trackEvent('enquiry_form_submit', {
      form_id: formId || 'towing_enquiry_form'
    });
  }

  /**
   * Track Verified Form Delivery
   * Fired ONLY when backend server or webhook returns verified HTTP 200 delivery receipt.
   * Deduplicated per form ID to prevent multiple conversion counts.
   */
  function trackFormSuccess(formId, pickupArea) {
    var dedupeKey = 'form_success_' + (formId || 'main');
    if (trackedEventsCache[dedupeKey]) {
      return;
    }
    trackedEventsCache[dedupeKey] = true;

    trackEvent('enquiry_form_success', {
      form_id: formId || 'towing_enquiry_form',
      pickup_area: pickupArea || 'unspecified',
      delivery_status: 'verified_api_delivery'
    });
  }

  /**
   * Track WhatsApp Handoff from Form
   * Fired when user proceeds with prefilled WhatsApp details in fallback/unconfigured API mode.
   * NOTE: This is an outbound handoff event, NOT proof that a conversation, booking, or answered call occurred.
   * Deduplicated per form ID.
   */
  function trackFormWhatsAppHandoff(formId, pickupArea) {
    var dedupeKey = 'form_wa_handoff_' + (formId || 'main');
    if (trackedEventsCache[dedupeKey]) {
      return;
    }
    trackedEventsCache[dedupeKey] = true;

    trackEvent('enquiry_form_whatsapp_handoff', {
      form_id: formId || 'towing_enquiry_form',
      pickup_area: pickupArea || 'unspecified',
      handoff_channel: 'whatsapp',
      lead_status: 'unverified_handoff'
    });
  }

  // Bind delegated click listeners across all pages
  document.addEventListener('DOMContentLoaded', function () {
    initTags();

    // Delegate phone links
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href^="tel:"]');
      if (anchor) {
        var placement = anchor.getAttribute('data-cta-placement') || 'body_link';
        var loc = anchor.getAttribute('data-location') || 'general';
        trackPhoneCallClick(placement, loc);
      }
    });

    // Delegate WhatsApp links
    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');
      if (anchor) {
        var placement = anchor.getAttribute('data-cta-placement') || 'whatsapp_button';
        var loc = anchor.getAttribute('data-location') || 'general';
        trackWhatsAppClick(placement, loc);
      }
    });
  });

  /**
   * Directly track Google Ads Conversion (Contact)
   */
  function trackGoogleAdsConversion() {
    if (typeof window.gtag === 'function' && window.TRACKING_CONFIG.googleAdsId && window.TRACKING_CONFIG.googleAdsLeadConversionLabel) {
      window.gtag('event', 'conversion', {
        'send_to': window.TRACKING_CONFIG.googleAdsId + '/' + window.TRACKING_CONFIG.googleAdsLeadConversionLabel
      });
    }
  }

  // Expose analytics methods globally for form scripts
  window.MTSAnalytics = {
    trackEvent: trackEvent,
    trackPhoneCallClick: trackPhoneCallClick,
    trackWhatsAppClick: trackWhatsAppClick,
    trackFormStart: trackFormStart,
    trackFormSubmitAttempt: trackFormSubmitAttempt,
    trackFormSuccess: trackFormSuccess,
    trackFormWhatsAppHandoff: trackFormWhatsAppHandoff,
    trackGoogleAdsConversion: trackGoogleAdsConversion
  };
})();
