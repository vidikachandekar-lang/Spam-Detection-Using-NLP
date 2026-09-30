import { BenchmarkSample } from './types';

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'phish-01',
    title: 'PayPal Unauthorized Transaction Alert',
    category: 'Phishing',
    groundTruth: 'SPAM',
    subject: 'URGENT: Unauthorized access detected on your PayPal Account #98213',
    content: `Dear Customer,

We detected an unauthorized login attempt to your PayPal account from an unrecognized device in Moscow, Russia (IP: 185.220.101.5). 

Your account has been temporarily RESTRICTED to prevent unauthorized wire transfers. Immediate action is required within 24 hours to verify your identity and restore access.

Please click the secure link below to confirm your password and billing credentials:
http://paypal-verification-support.xyz/restore-login?auth=token99

If you fail to verify your account within 24 hours, your account will be permanently terminated and your remaining funds ($1,480.00) will be forfeited.

PayPal Security Team`,
    notes: 'Classic credential phishing: artificial urgency (24 hours), fear tactic (permanent termination), brand spoofing, suspicious .xyz TLD link.',
  },
  {
    id: 'phish-02',
    title: 'Microsoft 365 Password Expiry Warning',
    category: 'Phishing',
    groundTruth: 'SPAM',
    subject: 'Action Required: Your Microsoft Office 365 password expires today',
    content: `IT Helpdesk Notification:

Your Office 365 enterprise password will expire in 2 hours. To maintain uninterrupted access to your corporate email, OneDrive files, and SharePoint documents, you must keep your existing password.

CLICK HERE to validate your credentials:
https://bit.ly/m365-pass-keep-alive

Failure to respond immediately will result in your corporate account being locked out by network administration.

Global IT Support Department`,
    notes: 'Enterprise phishing: impersonating internal IT, shortener URL (bit.ly), false deadline ("expires in 2 hours").',
  },
  {
    id: 'phish-03',
    title: 'DocuSign Signature Request Lure',
    category: 'Phishing',
    groundTruth: 'SPAM',
    subject: 'DocuSign: Please review & sign Wire Transfer Authorization Form.pdf',
    content: `DocuSign Electronic Delivery:

Accountant Robert Sterling has sent you "CONFIDENTIAL WIRE SETTLEMENT AGREEMENT (Ref #8812)" for immediate electronic review and signature.

Amount: $24,500.00 USD
Action: Signature Required

View and sign document here:
http://192.168.10.45/docusign-portal/document.php?ref=wire24k

Do not forward this email as the link allows access to sensitive legal escrow documents.`,
    notes: 'Financial DocuSign spoof: raw IP address link, high financial figure, confidential lure.',
  },
  {
    id: 'scam-01',
    title: 'Crypto Doubling Guarantee Scam',
    category: 'Scam',
    groundTruth: 'SPAM',
    subject: 'Elon Musk BTC Giveaway: Double your Bitcoin in 30 minutes! 100% Guaranteed',
    content: `CONGRATULATIONS! You have been selected to participate in the official 2026 Crypto Liquidity Giveaway!

Send 0.05 BTC to 0.5 BTC to our official liquidity wallet address:
bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq

Within 15 minutes, our automated smart contract will return DOUBLE the deposit back to your wallet address! 

Hurry! Only 42 slots remaining for today! 100% Risk-Free guaranteed profit. Claim your free reward now!`,
    notes: 'Greed appeal, fake celebrity endorsement, urgency ("only 42 slots"), cryptocurrency address.',
  },
  {
    id: 'scam-02',
    title: 'Inheritance Beneficiary (419 Nigerian Scam)',
    category: 'Scam',
    groundTruth: 'SPAM',
    subject: 'CONFIDENTIAL: Urgent transfer of unclaimed estate ($18.5 Million USD)',
    content: `Dearest Beloved Friend,

I am Barrister Edward Mensah, senior legal counsel to the late petroleum magnate Dr. Al-Hassan who died along with his entire immediate family in a tragic motor accident.

He left behind a dormant bank deposit of $18,500,000.00 USD with the Commercial Bank. As his private attorney, I am reaching out to present you as his next-of-kin so the funds can be released to your foreign bank account before the government confiscates it.

I will offer you 40% of the total sum ($7.4 Million) as your compensation. Kindly reply urgently with your full name, private telephone number, and bank details. Total confidentiality is required.

Yours Faithfully,
Barrister Edward Mensah`,
    notes: 'High-value advance-fee fraud, urgent plea, legal authority persona, confidential sharing proposition.',
  },
  {
    id: 'mkt-01',
    title: 'Aggressive 90% Flash Discount Spam',
    category: 'Marketing',
    groundTruth: 'SPAM',
    subject: 'FLASH SALE: 90% OFF Ray-Ban & Designer Watches! FINAL 3 HOURS!',
    content: `DON'T MISS OUT! EXCLUSIVE VIP DISCOUNT JUST FOR YOU!

Get original polarized luxury sunglasses and swiss designer watches starting from just $19.99! Free worldwide shipping on all orders over $50!

Use voucher code: SAVE90NOW
CLICK HERE TO SHOP NOW: http://super-deals-outlet.click/shop

Offer expires at midnight! Claim your massive discount before stock runs out completely! Unsubscribe: click here.`,
    notes: 'Aggressive marketing spam: all-caps shouting, exclamation inflation, fake urgency, suspicious .click TLD.',
  },
  {
    id: 'mkt-02',
    title: 'Unsolicited B2B SEO Services',
    category: 'Marketing',
    groundTruth: 'SPAM',
    subject: 'Quick question regarding your website SEO ranking and traffic',
    content: `Hi Founder,

I came across your website and noticed several critical technical SEO errors that are preventing you from ranking #1 on Google. 

We can guarantee 5,000+ organic high-intent B2B leads per month for your company. Our turnkey offshore marketing team handles backlinks, keyword domination, and traffic generation with zero upfront cost.

Can we hop on a brief 10-minute phone call tomorrow morning at 10 AM EST?

Best regards,
David Miller, Growth Hacker`,
    notes: 'Cold unsolicited sales pitch: generic salutation ("Hi Founder"), unrealistic guarantees, unprompted consultation pitch.',
  },
  {
    id: 'ham-01',
    title: 'Flight Boarding Pass & Gate Change Notification',
    category: 'Legitimate Ham',
    groundTruth: 'HAM',
    subject: 'Delta Air Lines: Boarding Pass & Gate Change for Flight DL 1842 to SFO',
    content: `Delta Air Lines Confirmation #HK82LP

Passenger: Sarah Jenkins
Flight: DL 1842
Departure: Seattle-Tacoma (SEA) - 08:45 AM
Arrival: San Francisco (SFO) - 10:55 AM
Seat: 14C (Main Cabin)

UPDATE: Your departure gate has changed from Gate B4 to Gate A12. Boarding begins at 08:10 AM.

Your mobile boarding pass barcode is attached to this email. You can also view real-time flight status and track your checked baggage in the Fly Delta app.

Thank you for choosing Delta. Have a great flight!`,
    notes: 'Legitimate transactional communication: authentic travel logistics, flight details, polite and informative.',
  },
  {
    id: 'ham-02',
    title: 'GitHub Pull Request Review Request',
    category: 'Legitimate Ham',
    groundTruth: 'HAM',
    subject: '[GitHub] Pull Request #142: Fix Redis cache invalidation on user logout',
    content: `Hey team,

@alex-dev requested your review on Pull Request #142 in acme-corp/api-gateway:
"Fix Redis cache invalidation on user logout"

Summary of changes:
- Corrected TTL expiration key logic in AuthSessionMiddleware
- Added integration test coverage for concurrent logout events
- Verified passing unit tests across all CI matrix runners

Diff summary: 3 files changed, 48 insertions(+), 12 deletions(-)

You can review the diff and run local benchmarks here:
https://github.com/acme-corp/api-gateway/pull/142

Let me know if you have questions or notes before we merge into main. Thanks!`,
    notes: 'Authentic software engineering collaboration: GitHub repo structure, PR diff metadata, professional tone.',
  },
  {
    id: 'ham-03',
    title: 'Colleague Lunch & Architecture Sync',
    category: 'Legitimate Ham',
    groundTruth: 'HAM',
    subject: 'Quick sync tomorrow after standup? + Lunch at Mediterranean deli',
    content: `Hi Maya,

Hope you're having a good week! 

Do you have about 20 minutes tomorrow after our 10:00 AM sprint standup to review the new database schema drafts for the analytics pipeline? I attached the diagrams we discussed yesterday in Jira.

Also, Carlos and I are grabbing lunch at that new Mediterranean deli around 12:30 PM. Let me know if you'd like to join us!

Best,
Marcus`,
    notes: 'Personal work email: natural informal phrasing, realistic workplace context, casual lunch invitation.',
  },
  {
    id: 'ham-04',
    title: 'Two-Factor Authentication OTP Verification Code',
    category: 'Legitimate Ham',
    groundTruth: 'HAM',
    subject: 'Your Acme Security one-time passcode is 849201',
    content: `Your Acme Account verification code is:

849201

This code will expire in 10 minutes. If you did not initiate this sign-in request, please review your active sessions in your Security Settings immediately.

Do not share this code with anyone. Acme support representatives will never ask for your verification passcode.`,
    notes: 'Legitimate OTP message: contains security advice, short expiration time, but lacks phishing redirection links.',
  },
  {
    id: 'edge-01',
    title: 'Urgent Production Incident Alert (Edge Ham)',
    category: 'Adversarial Edge',
    groundTruth: 'HAM',
    subject: 'URGENT P1 INCIDENT: Kubernetes cluster node memory exhaustion alert',
    content: `CRITICAL ALERT: P1 Incident #9921

Cluster: prod-us-east-cluster-01
Triggered: High Memory Usage (>94%) across worker nodes
Impact: Latency degradation on public checkout microservice

Action Required: On-call DevOps engineer must join the war room bridge immediately:
https://meet.google.com/xyz-prod-incident

Grafana dashboard: https://internal.monitoring.corp/d/cluster-health
Log stream: kubectl logs -n production -l app=checkout-service

This is an automated PagerDuty dispatch alert.`,
    notes: 'Tricky Edge Ham: Heavy urgency keywords ("URGENT", "CRITICAL", "Action Required", "immediately") that could trick a naive keyword counter, but is authentic DevOps ham.',
  },
  {
    id: 'edge-02',
    title: 'Polite Phishing with Low-Urgency Salutations (Edge Spam)',
    category: 'Adversarial Edge',
    groundTruth: 'SPAM',
    subject: 'Updated quarterly corporate directory & employee benefits package review',
    content: `Good morning,

We hope you are enjoying a pleasant and productive week. In accordance with our annual human resources audit, all team members are kindly requested to verify their personal mailing address and emergency contact details for the new year.

Please take a few moments at your earliest convenience to sign into the updated employee directory portal:
http://portal-employee-verify.xyz/login

Thank you for your continuous dedication to our organization.

Warmest regards,
Human Resources & Talent Management`,
    notes: 'Tricky Edge Spam: Uses calm, courteous corporate language ("Good morning", "at your earliest convenience", "Warmest regards") without loud threats, but targets credential theft via spoofed .xyz portal.',
  },
];
