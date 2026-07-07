// 隐私政策 / 使用条款生成器：数据目录 + 纯前端文档拼装逻辑
// 所有生成的法律文本均为英文（App Store Connect / Play Console 与终端用户的通用预期语言）

export interface DataTypeOption {
  id: string;
  label: string;
}

export const DATA_TYPE_CATALOG: DataTypeOption[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email address' },
  { id: 'phone', label: 'Phone number' },
  { id: 'address', label: 'Address' },
  { id: 'photos', label: 'Photos and camera access' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'precise_location', label: 'Precise location data' },
  { id: 'approximate_location', label: 'Approximate location data' },
  { id: 'usage_data', label: 'Usage and log data' },
  { id: 'device_id', label: 'Device identifiers / Advertising ID' },
  { id: 'cookies', label: 'Cookies and tracking technologies' },
];

export interface ServiceOption {
  id: string;
  label: string;
  policyUrl?: string;
}

export interface ServiceCategory {
  category: string;
  services: ServiceOption[];
}

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    category: 'Analytics',
    services: [
      { id: 'firebase_analytics', label: 'Google Analytics for Firebase', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'ga4', label: 'Google Analytics (GA4)', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'mixpanel', label: 'Mixpanel', policyUrl: 'https://mixpanel.com/legal/privacy-policy/' },
      { id: 'amplitude', label: 'Amplitude', policyUrl: 'https://amplitude.com/privacy' },
      { id: 'segment', label: 'Segment', policyUrl: 'https://segment.com/legal/privacy/' },
      { id: 'umeng', label: '友盟+ (U-MENG)', policyUrl: 'https://www.umeng.com/policy' },
      { id: 'talkingdata', label: 'TalkingData', policyUrl: 'https://www.talkingdata.com/policy.jsp' },
    ],
  },
  {
    category: 'Crash / 性能监控',
    services: [
      { id: 'crashlytics', label: 'Firebase Crashlytics', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'sentry', label: 'Sentry', policyUrl: 'https://sentry.io/privacy/' },
      { id: 'bugsnag', label: 'Bugsnag', policyUrl: 'https://www.bugsnag.com/legal/privacy-policy/' },
      { id: 'bugly', label: '腾讯 Bugly', policyUrl: 'https://bugly.qq.com/v2/agreement/privacy' },
    ],
  },
  {
    category: '广告 / 归因',
    services: [
      { id: 'admob', label: 'AdMob', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'meta_audience', label: 'Meta Audience Network', policyUrl: 'https://www.facebook.com/privacy/policy/' },
      { id: 'appsflyer', label: 'AppsFlyer', policyUrl: 'https://www.appsflyer.com/legal/privacy-policy/' },
      { id: 'adjust', label: 'Adjust', policyUrl: 'https://www.adjust.com/terms/privacy-policy/' },
      { id: 'pangle', label: '穿山甲 (Pangle)', policyUrl: 'https://www.pangleglobal.com/privacy' },
    ],
  },
  {
    category: '推送通知',
    services: [
      { id: 'fcm', label: 'Firebase Cloud Messaging', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'onesignal', label: 'OneSignal', policyUrl: 'https://onesignal.com/privacy_policy' },
      { id: 'jpush', label: '极光推送 (JPush)', policyUrl: 'https://www.jiguang.cn/license/privacy' },
      { id: 'getui', label: '个推 (Getui)', policyUrl: 'https://www.getui.com/privacy' },
    ],
  },
  {
    category: '后端 / 认证',
    services: [
      { id: 'firebase', label: 'Firebase', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'supabase', label: 'Supabase', policyUrl: 'https://supabase.com/privacy' },
      { id: 'auth0', label: 'Auth0', policyUrl: 'https://auth0.com/privacy' },
      { id: 'aws_amplify', label: 'AWS Amplify', policyUrl: 'https://aws.amazon.com/privacy/' },
    ],
  },
  {
    category: '登录方式',
    services: [
      { id: 'google_signin', label: 'Google 登录', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'apple_signin', label: 'Apple 登录', policyUrl: 'https://www.apple.com/legal/privacy/' },
      { id: 'facebook_login', label: 'Facebook 登录', policyUrl: 'https://www.facebook.com/privacy/policy/' },
      { id: 'wechat_login', label: '微信登录', policyUrl: 'https://www.tencent.com/privacy-policy' },
    ],
  },
  {
    category: '支付 / 订阅',
    services: [
      { id: 'stripe', label: 'Stripe', policyUrl: 'https://stripe.com/privacy' },
      { id: 'revenuecat', label: 'RevenueCat', policyUrl: 'https://www.revenuecat.com/privacy' },
      { id: 'iap', label: 'App 内购买 (StoreKit / Google Play Billing)' },
      { id: 'paypal', label: 'PayPal', policyUrl: 'https://www.paypal.com/us/webapps/mpp/ua/privacy-full' },
      { id: 'alipay', label: '支付宝 (Alipay)', policyUrl: 'https://www.alipay.com' },
      { id: 'wechat_pay', label: '微信支付 (WeChat Pay)', policyUrl: 'https://pay.weixin.qq.com' },
    ],
  },
  {
    category: '地图 / 定位',
    services: [
      { id: 'google_maps', label: 'Google Maps', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'amap', label: '高德地图 (AMap)', policyUrl: 'https://www.amap.com/doc/privacy' },
      { id: 'baidu_map', label: '百度地图 (Baidu Map)', policyUrl: 'https://map.baidu.com/zt/client/privacy/index.html' },
    ],
  },
  {
    category: '云存储',
    services: [
      { id: 'aws_s3', label: 'AWS S3', policyUrl: 'https://aws.amazon.com/privacy/' },
      { id: 'cloudinary', label: 'Cloudinary', policyUrl: 'https://cloudinary.com/privacy' },
    ],
  },
];

export interface CustomService {
  name: string;
  url: string;
}

export interface PrivacyDraft {
  appName: string;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  effectiveDate: string;
  platform: 'ios' | 'android' | 'both' | 'web';
  dataTypes: string[];
  customDataTypes: string;
  services: string[];
  customServices: CustomService[];
  gdpr: boolean;
  ccpa: boolean;
  coppa: boolean;
  retention: string;
  hasUserAccounts: boolean;
  deletionInstructions: string;
  governingLaw: string;
}

export interface TermsDraft {
  appName: string;
  companyName: string;
  websiteUrl: string;
  contactEmail: string;
  effectiveDate: string;
  serviceDescription: string;
  requiresAccount: boolean;
  hasUGC: boolean;
  hasSubscriptions: boolean;
  governingLaw: string;
  minimumAge: string;
}

export const DEFAULT_PRIVACY_DRAFT: PrivacyDraft = {
  appName: '',
  companyName: '',
  websiteUrl: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  platform: 'both',
  dataTypes: [],
  customDataTypes: '',
  services: [],
  customServices: [],
  gdpr: false,
  ccpa: false,
  coppa: false,
  retention: '',
  hasUserAccounts: false,
  deletionInstructions: '',
  governingLaw: '',
};

export const DEFAULT_TERMS_DRAFT: TermsDraft = {
  appName: '',
  companyName: '',
  websiteUrl: '',
  contactEmail: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  serviceDescription: '',
  requiresAccount: false,
  hasUGC: false,
  hasSubscriptions: false,
  governingLaw: '',
  minimumAge: '13',
};

export const PLATFORM_LABELS: Record<PrivacyDraft['platform'], string> = {
  ios: 'iOS app',
  android: 'Android app',
  both: 'iOS and Android app',
  web: 'website',
};

export interface DocSection {
  heading: string;
  paragraphs: string[];
}

function findService(id: string): ServiceOption | undefined {
  for (const group of SERVICE_CATALOG) {
    const found = group.services.find((s) => s.id === id);
    if (found) return found;
  }
  return undefined;
}

function companyOf(draft: { appName: string; companyName: string }): string {
  return draft.companyName.trim() || draft.appName.trim() || 'the App';
}

export function buildPrivacyPolicySections(draft: PrivacyDraft): DocSection[] {
  const appName = draft.appName.trim() || 'the App';
  const company = companyOf(draft);
  const sections: DocSection[] = [];

  const platformNoun = PLATFORM_LABELS[draft.platform || 'both'];
  sections.push({
    heading: 'Introduction',
    paragraphs: [
      `This Privacy Policy describes ${company}'s policies and procedures on the collection, use, and disclosure of your information when you use ${appName} (the "${platformNoun}", referred to as the "Service"), and tells you about your privacy rights and how the law protects you.`,
      `We use your personal data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.`,
    ],
  });

  const selectedDataLabels = DATA_TYPE_CATALOG.filter((d) => draft.dataTypes.includes(d.id) && d.id !== 'cookies').map((d) => d.label);
  const dataParas: string[] = [];
  if (selectedDataLabels.length > 0) {
    dataParas.push(
      `While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. Personally identifiable information may include, but is not limited to:`
    );
    dataParas.push(selectedDataLabels.map((l) => `• ${l}`).join('\n'));
  } else {
    dataParas.push('We do not knowingly collect personally identifiable information beyond what is strictly necessary to operate the Service.');
  }
  if (draft.customDataTypes.trim()) {
    dataParas.push(`In addition, we may collect: ${draft.customDataTypes.trim()}.`);
  }
  sections.push({ heading: 'Information We Collect', paragraphs: dataParas });

  sections.push({
    heading: 'Log Data',
    paragraphs: [
      `Whenever you use our Service, in the event of an error, we collect data and information (through third-party products) on your device called Log Data. This Log Data may include information such as your device's Internet Protocol ("IP") address, device name, operating system version, the configuration of the app when using our Service, the time and date of your use of the Service, and other statistics.`,
    ],
  });

  sections.push({
    heading: 'How We Use Your Information',
    paragraphs: [
      `${company} may use the information we collect for various purposes, including to: provide and maintain the Service; notify you about changes to the Service; provide customer support; monitor usage of the Service; detect, prevent, and address technical issues; and provide you with news and general information about other services we offer.`,
    ],
  });

  if (draft.dataTypes.includes('cookies')) {
    sections.push({
      heading: 'Cookies and Tracking Technologies',
      paragraphs: [
        `We use cookies and similar tracking technologies to track activity on our Service and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your device to refuse all cookies or to indicate when a cookie is being sent, however if you do not accept cookies, you may not be able to use some portions of our Service.`,
      ],
    });
  }

  sections.push({
    heading: 'Do Not Track Signals',
    paragraphs: [
      `We do not support Do Not Track ("DNT"). Do Not Track is a preference you can set in your web browser to inform websites that you do not want to be tracked. You can enable or disable Do Not Track by visiting the preferences or settings page of your browser.`,
    ],
  });

  const selectedServices = draft.services.map(findService).filter((s): s is ServiceOption => !!s);
  if (selectedServices.length > 0 || draft.customServices.length > 0) {
    const paras: string[] = [
      `We may employ third-party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.`,
    ];
    for (const svc of selectedServices) {
      paras.push(
        svc.policyUrl
          ? `We use ${svc.label} as part of our Service. For more information on the privacy practices of ${svc.label}, please visit their Privacy Policy: ${svc.policyUrl}`
          : `We use ${svc.label} as part of our Service. Please refer to the provider's own privacy policy for details on how they handle your data.`
      );
    }
    for (const custom of draft.customServices) {
      if (!custom.name.trim()) continue;
      paras.push(
        custom.url.trim()
          ? `We use ${custom.name.trim()} as part of our Service. For more information on their privacy practices, please visit: ${custom.url.trim()}`
          : `We use ${custom.name.trim()} as part of our Service. Please refer to the provider's own privacy policy for details on how they handle your data.`
      );
    }
    sections.push({ heading: 'Third-Party Services', paragraphs: paras });
  }

  sections.push({
    heading: 'International Data Transfers',
    paragraphs: [
      `Your information, including personal data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those of your jurisdiction. If you are located outside ${draft.governingLaw.trim() || 'the country in which we operate'} and choose to provide information to us, we transfer your data there and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.`,
    ],
  });

  sections.push({
    heading: 'Data Retention',
    paragraphs: [
      draft.retention.trim()
        ? draft.retention.trim()
        : `We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.`,
    ],
  });

  sections.push({
    heading: 'Account and Data Deletion',
    paragraphs: draft.hasUserAccounts
      ? [
          draft.deletionInstructions.trim()
            ? draft.deletionInstructions.trim()
            : `If you have created an account with us, you may request deletion of your account and associated personal data at any time by contacting us using the details in the "Contact Us" section below. We will respond to your request within a reasonable timeframe and delete your data unless we are required to retain it to comply with a legal obligation.`,
        ]
      : [
          `Our Service does not require you to create an account, and we do not retain a persistent user profile beyond the data described in this Privacy Policy. If you would like us to delete any data we hold about you, please contact us using the details in the "Contact Us" section below.`,
        ],
  });

  sections.push({
    heading: "Children's Privacy",
    paragraphs: draft.coppa
      ? [
          `Our Service is directed at, or knowingly collects personal information from, children under the age of 13, in compliance with the Children's Online Privacy Protection Act (COPPA). We obtain verifiable parental consent before collecting personal information from children, limit the collection of children's personal information to what is reasonably necessary, and do not condition a child's participation on the disclosure of more information than is reasonably necessary. Parents or guardians may review, request deletion of, or refuse further collection of their child's information by contacting us using the details below.`,
        ]
      : [
          `Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us. If we become aware that we have collected personal data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.`,
        ],
  });

  if (draft.gdpr) {
    sections.push({
      heading: 'Your GDPR Data Protection Rights (EEA / UK Users)',
      paragraphs: [
        `If you are a resident of the European Economic Area (EEA) or the United Kingdom, you have certain data protection rights under the General Data Protection Regulation (GDPR), including the right to access, correct, erase, restrict, or object to our processing of your personal data, and the right to data portability.`,
        `We process your personal data on the legal bases of your consent, the performance of a contract with you, and our legitimate interests in operating and improving the Service. You may exercise your rights at any time by contacting us using the details in the "Contact Us" section below. You also have the right to lodge a complaint with a supervisory authority in your country of residence.`,
      ],
    });
  }

  if (draft.ccpa) {
    sections.push({
      heading: 'Your California Privacy Rights (CCPA)',
      paragraphs: [
        `If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with the right to know what personal information is collected, used, shared, or sold, the right to delete personal information, and the right to opt out of the sale of your personal information. We do not sell your personal information. To exercise any of these rights, please contact us using the details in the "Contact Us" section below.`,
      ],
    });
  }

  sections.push({
    heading: 'Security of Your Data',
    paragraphs: [
      `The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.`,
    ],
  });

  sections.push({
    heading: 'Links to Other Websites',
    paragraphs: [
      `Our Service may contain links to other websites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.`,
    ],
  });

  sections.push({
    heading: 'Governing Law',
    paragraphs: [
      draft.governingLaw.trim()
        ? `This Privacy Policy and any dispute arising from it shall be governed by and construed in accordance with the laws of ${draft.governingLaw.trim()}, without regard to its conflict of law provisions.`
        : `This Privacy Policy and any dispute arising from it shall be governed by and construed in accordance with the laws applicable in the jurisdiction in which ${company} is established, without regard to its conflict of law provisions.`,
    ],
  });

  sections.push({
    heading: 'Changes to This Privacy Policy',
    paragraphs: [
      `We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes.`,
    ],
  });

  const contactParts = [`If you have any questions about this Privacy Policy, you can contact us by email: ${draft.contactEmail.trim() || 'N/A'}`];
  if (draft.websiteUrl.trim()) contactParts.push(`or by visiting our website: ${draft.websiteUrl.trim()}`);
  sections.push({ heading: 'Contact Us', paragraphs: [contactParts.join(', ') + '.'] });

  return sections;
}

export function buildTermsOfUseSections(draft: TermsDraft): DocSection[] {
  const appName = draft.appName.trim() || 'the App';
  const company = companyOf(draft);
  const sections: DocSection[] = [];

  sections.push({
    heading: 'Agreement to Terms',
    paragraphs: [
      `These Terms of Use constitute a legally binding agreement made between you and ${company} concerning your access to and use of ${appName} (the "Service"). By accessing or using the Service, you agree that you have read, understood, and agree to be bound by all of these Terms of Use. If you do not agree with all of these terms, you are expressly prohibited from using the Service and must discontinue use immediately.`,
    ],
  });

  const minAge = draft.minimumAge.trim() || '13';
  sections.push({
    heading: 'Eligibility',
    paragraphs: [
      `You must be at least ${minAge} years old, or the age of legal majority in your jurisdiction if that is greater, to use the Service. By using the Service, you represent and warrant that you meet this requirement. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.`,
    ],
  });

  sections.push({
    heading: 'Description of Service',
    paragraphs: [
      draft.serviceDescription.trim()
        ? draft.serviceDescription.trim()
        : `${appName} provides its users with a range of features and functionality described within the Service itself. We reserve the right to change, suspend, or discontinue any part of the Service at any time without notice or liability.`,
    ],
  });

  if (draft.requiresAccount) {
    sections.push({
      heading: 'User Accounts',
      paragraphs: [
        `When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.`,
      ],
    });
  }

  if (draft.hasUGC) {
    sections.push({
      heading: 'User-Generated Content',
      paragraphs: [
        `Our Service may allow you to post, link, store, share, and otherwise make available certain information, text, graphics, or other material ("Content"). You are responsible for the Content that you post, including its legality, reliability, and appropriateness. By posting Content, you grant us a non-exclusive, royalty-free license to use, reproduce, and display such Content in connection with providing the Service. We reserve the right to remove any Content that violates these Terms or is otherwise objectionable.`,
      ],
    });
  }

  if (draft.hasSubscriptions) {
    sections.push({
      heading: 'Subscriptions and Payments',
      paragraphs: [
        `Some parts of the Service are billed on a subscription basis or offered as one-time in-app purchases, processed through the applicable platform's billing system (e.g., Apple App Store or Google Play Billing). Subscriptions automatically renew unless canceled before the end of the current billing period, in accordance with the policies of the platform through which you purchased. Refunds are subject to the policies of the applicable platform.`,
      ],
    });
  }

  sections.push({
    heading: 'Prohibited Uses',
    paragraphs: [
      `You agree not to use the Service: in any way that violates any applicable law or regulation; to transmit any advertising or promotional material without our prior written consent; to impersonate or attempt to impersonate the company, an employee, another user, or any other person; to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service; or to attempt to gain unauthorized access to, interfere with, damage, or disrupt any part of the Service.`,
    ],
  });

  sections.push({
    heading: 'Intellectual Property',
    paragraphs: [
      `The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of ${company} and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks may not be used in connection with any product or service without our prior written consent.`,
    ],
  });

  sections.push({
    heading: 'Feedback',
    paragraphs: [
      `If you send us feedback, suggestions, or ideas about the Service, you agree that we may use them without any restriction or compensation to you, and you hereby irrevocably assign to us all right, title, and interest in such feedback.`,
    ],
  });

  sections.push({
    heading: 'Third-Party Links and Services',
    paragraphs: [
      `Our Service may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We strongly advise you to read the terms and privacy policy of any third-party website or service that you visit.`,
    ],
  });

  sections.push({
    heading: 'Termination',
    paragraphs: [
      `We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms of Use. Upon termination, your right to use the Service will cease immediately.`,
    ],
  });

  sections.push({
    heading: 'Disclaimer of Warranties',
    paragraphs: [
      `The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or course of performance. We do not warrant that the Service will function uninterrupted, secure, or available at any particular time or location, or that any errors or defects will be corrected.`,
    ],
  });

  sections.push({
    heading: 'Limitation of Liability',
    paragraphs: [
      `To the maximum extent permitted by applicable law, in no event shall ${company}, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of, or inability to access or use, the Service.`,
    ],
  });

  sections.push({
    heading: 'Indemnification',
    paragraphs: [
      `You agree to defend, indemnify, and hold harmless ${company} and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your access to or use of the Service or your violation of these Terms.`,
    ],
  });

  sections.push({
    heading: 'Governing Law',
    paragraphs: [
      draft.governingLaw.trim()
        ? `These Terms shall be governed and construed in accordance with the laws of ${draft.governingLaw.trim()}, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of that jurisdiction.`
        : `These Terms shall be governed and construed in accordance with the laws applicable in the jurisdiction in which ${company} is established, without regard to its conflict of law provisions.`,
    ],
  });

  sections.push({
    heading: 'Severability',
    paragraphs: [
      `If any provision of these Terms is held to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.`,
    ],
  });

  sections.push({
    heading: 'Entire Agreement',
    paragraphs: [
      `These Terms, together with our Privacy Policy, constitute the entire agreement between you and ${company} regarding the Service and supersede any prior agreements, whether oral or written, relating to the subject matter herein.`,
    ],
  });

  sections.push({
    heading: 'Changes to These Terms',
    paragraphs: [
      `We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect by posting the updated Terms on this page and updating the "Effective Date" above.`,
    ],
  });

  const contactParts = [`If you have any questions about these Terms of Use, you can contact us by email: ${draft.contactEmail.trim() || 'N/A'}`];
  if (draft.websiteUrl.trim()) contactParts.push(`or by visiting our website: ${draft.websiteUrl.trim()}`);
  sections.push({ heading: 'Contact Us', paragraphs: [contactParts.join(', ') + '.'] });

  return sections;
}

const LEGAL_DISCLAIMER =
  'This document was generated by a template tool and is provided for informational purposes only. It does not constitute legal advice. Please review it (and verify any third-party links) with a qualified professional before publishing.';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderSectionsToHtml(title: string, effectiveDate: string, sections: DocSection[]): string {
  const body = sections
    .map(
      (s) => `
    <section>
      <h2>${escapeHtml(s.heading)}</h2>
      ${s.paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`).join('\n')}
    </section>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 48px 24px; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .effective-date { color: #666; font-size: 14px; margin-bottom: 32px; }
  h2 { font-size: 18px; margin-top: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  p { font-size: 15px; margin: 12px 0; white-space: pre-wrap; }
  .disclaimer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="effective-date">Effective date: ${escapeHtml(effectiveDate)}</div>
  ${body}
  <div class="disclaimer">${escapeHtml(LEGAL_DISCLAIMER)}</div>
</body>
</html>`;
}

export function renderSectionsToPlainText(title: string, effectiveDate: string, sections: DocSection[]): string {
  const parts = [title, `Effective date: ${effectiveDate}`, ''];
  for (const s of sections) {
    parts.push(s.heading.toUpperCase());
    parts.push('-'.repeat(s.heading.length));
    for (const p of s.paragraphs) {
      parts.push(p);
      parts.push('');
    }
  }
  parts.push('---');
  parts.push(LEGAL_DISCLAIMER);
  return parts.join('\n');
}

export function renderSectionsToMarkdown(title: string, effectiveDate: string, sections: DocSection[]): string {
  const parts = [`# ${title}`, '', `_Effective date: ${effectiveDate}_`, ''];
  for (const s of sections) {
    parts.push(`## ${s.heading}`);
    parts.push('');
    for (const p of s.paragraphs) {
      parts.push(p);
      parts.push('');
    }
  }
  parts.push('---');
  parts.push(`_${LEGAL_DISCLAIMER}_`);
  return parts.join('\n');
}
