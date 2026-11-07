<?php
/**
 * ==============================================================================
 * Manjunatha Towing Service — Form Enquiry Email Dispatcher
 * Sends new car breakdown / towing enquiries to business emails:
 * 1. manjunathatowingservice.in@gmail.com
 * 2. akrithmarketer@gmail.com
 * ==============================================================================
 */

// Set response header
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are accepted.'
    ]);
    exit;
}

// Read and decode JSON payload
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Fallback to $_POST if not JSON
if (!is_array($data)) {
    $data = $_POST;
}

// Honeypot spam check: if filled, quietly reject
if (!empty($data['website_url']) || !empty($data['honeypot'])) {
    echo json_encode([
        'success' => true,
        'message' => 'Enquiry received successfully.'
    ]);
    exit;
}

// Extract and sanitize input fields
$customerName   = isset($data['customerName']) ? trim(strip_tags((string)$data['customerName'])) : '';
$customerPhone  = isset($data['customerPhone']) ? preg_replace('/[^0-9]/', '', (string)$data['customerPhone']) : '';
$pickupLocation = isset($data['pickupLocation']) ? trim(strip_tags((string)$data['pickupLocation'])) : '';
$destination    = isset($data['destination']) ? trim(strip_tags((string)$data['destination'])) : 'Not specified';
$carModel       = isset($data['carModel']) ? trim(strip_tags((string)$data['carModel'])) : 'Not specified';
$problemDesc    = isset($data['problemDesc']) ? trim(strip_tags((string)$data['problemDesc'])) : 'Not specified';
$pageUrl        = isset($data['pageUrl']) ? filter_var($data['pageUrl'], FILTER_SANITIZE_URL) : 'https://manjunathatowingservice.in/';

// Fallback checks for snake_case names if sent via standard form
if (empty($customerName) && isset($data['customer_name'])) {
    $customerName = trim(strip_tags((string)$data['customer_name']));
}
if (empty($customerPhone) && isset($data['customer_phone'])) {
    $customerPhone = preg_replace('/[^0-9]/', '', (string)$data['customer_phone']);
}
if (empty($pickupLocation) && isset($data['pickup_location'])) {
    $pickupLocation = trim(strip_tags((string)$data['pickup_location']));
}
if ($destination === 'Not specified' && isset($data['destination'])) {
    $destination = trim(strip_tags((string)$data['destination']));
}
if ($carModel === 'Not specified' && isset($data['car_model'])) {
    $carModel = trim(strip_tags((string)$data['car_model']));
}
if ($problemDesc === 'Not specified' && isset($data['problem_desc'])) {
    $problemDesc = trim(strip_tags((string)$data['problem_desc']));
}

// Basic validation: name, phone, pickup location are mandatory
if (empty($customerName) || empty($customerPhone) || empty($pickupLocation)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: Name, Phone (10-digit), and Pickup Location are required.'
    ]);
    exit;
}

// Validate phone number length (standard 10-digit Indian mobile)
if (strlen($customerPhone) < 10) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please provide a valid 10-digit mobile number.'
    ]);
    exit;
}

// Date & time in Indian Standard Time (IST)
date_default_timezone_set('Asia/Kolkata');
$timestamp = date('d-M-Y h:i:s A') . ' IST';

// Recipients: manjunathatowingservice.in@gmail.com and akrithmarketer@gmail.com
$recipients = [
    'manjunathatowingservice.in@gmail.com',
    'akrithmarketer@gmail.com'
];
$toHeader = implode(', ', $recipients);

// Subject line
$subject = "🚗 Urgent Car Towing Enquiry: {$customerName} ({$pickupLocation})";

// Safe HTML characters for output
$safeName        = htmlspecialchars($customerName, ENT_QUOTES, 'UTF-8');
$safePhone       = htmlspecialchars($customerPhone, ENT_QUOTES, 'UTF-8');
$safePickup      = htmlspecialchars($pickupLocation, ENT_QUOTES, 'UTF-8');
$safeDestination = htmlspecialchars($destination, ENT_QUOTES, 'UTF-8');
$safeCarModel    = htmlspecialchars($carModel, ENT_QUOTES, 'UTF-8');
$safeProblem     = nl2br(htmlspecialchars($problemDesc, ENT_QUOTES, 'UTF-8'));
$safePageUrl     = htmlspecialchars($pageUrl, ENT_QUOTES, 'UTF-8');

// Build responsive HTML email template
$htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Car Towing Enquiry</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F3F4F6; color: #1F2937;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); border: 1px solid #E5E7EB;">
    <!-- Header -->
    <tr>
      <td style="background-color: #0B132B; padding: 24px 28px; text-align: left; border-bottom: 4px solid #FFB800;">
        <h1 style="margin: 0; color: #FFFFFF; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">
          🚗 Manjunatha Towing Service
        </h1>
        <p style="margin: 6px 0 0; color: #FFB800; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
          New Car Breakdown Enquiry Received
        </p>
      </td>
    </tr>

    <!-- Quick Action Callout -->
    <tr>
      <td style="padding: 24px 28px 12px;">
        <table role="presentation" width="100%" style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 14px 18px;">
          <tr>
            <td>
              <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
                ⚡ Urgent Lead: Customer requested car towing assistance!
              </p>
              <div style="margin-top: 12px;">
                <a href="tel:{$safePhone}" style="display: inline-block; background-color: #D97706; color: #FFFFFF; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: 700; margin-right: 10px;">
                  📞 Call {$safePhone}
                </a>
                <a href="https://wa.me/91{$safePhone}" target="_blank" style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: 700;">
                  💬 WhatsApp Customer
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Details Table -->
    <tr>
      <td style="padding: 12px 28px 24px;">
        <h2 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 700; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">
          Breakdown & Towing Details
        </h2>
        <table role="presentation" width="100%" style="border-collapse: collapse; font-size: 14px;">
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; width: 38%; font-weight: 600;">Customer Name</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 700;">{$safeName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Phone Number</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 700;">
              <a href="tel:{$safePhone}" style="color: #2563EB; text-decoration: underline;">{$safePhone}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Pickup Location</td>
            <td style="padding: 10px 0; color: #111827; font-weight: 700;">{$safePickup}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Drop Destination</td>
            <td style="padding: 10px 0; color: #111827;">{$safeDestination}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Car Model</td>
            <td style="padding: 10px 0; color: #111827;">{$safeCarModel}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Problem Description</td>
            <td style="padding: 10px 0; color: #111827; line-height: 1.5;">{$safeProblem}</td>
          </tr>
          <tr style="border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Received At</td>
            <td style="padding: 10px 0; color: #374151;">{$timestamp}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Enquiry Page</td>
            <td style="padding: 10px 0; color: #374151; word-break: break-all; font-size: 12px;">{$safePageUrl}</td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F9FAFB; padding: 18px 28px; text-align: center; border-top: 1px solid #E5E7EB; color: #6B7280; font-size: 12px; line-height: 1.5;">
        This automated enquiry was submitted via the website form at <a href="https://manjunathatowingservice.in/" style="color: #4B5563; text-decoration: underline;">manjunathatowingservice.in</a>.<br>
        Recipients: manjunathatowingservice.in@gmail.com &amp; akrithmarketer@gmail.com
      </td>
    </tr>
  </table>
</body>
</html>
HTML;

// Headers
$headers = [
    'From: Manjunatha Towing Service <noreply@manjunathatowingservice.in>',
    'Reply-To: noreply@manjunathatowingservice.in',
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
];

// Send email
$mailSent = @mail($toHeader, $subject, $htmlBody, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Car towing enquiry sent successfully to business emails.',
        'timestamp' => $timestamp
    ]);
} else {
    // If mail function fails, log and return 500
    error_log("[MTS Mail Error] Failed to send enquiry email for customer {$customerPhone}");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to send email notification at this moment.'
    ]);
}
