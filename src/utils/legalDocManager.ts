// 隐私政策 / 使用条款生成器：数据目录 + 纯前端文档拼装逻辑
// 所有界面、选项与生成的合规文档默认使用纯中文表述，并通过 i18n 结构预留多语言扩展能力

export interface DataTypeOption {
  id: string;
  label: string;
}

export const DATA_TYPE_CATALOG: DataTypeOption[] = [
  { id: 'name', label: '用户姓名与昵称' },
  { id: 'email', label: '电子邮箱地址' },
  { id: 'phone', label: '手机电话号码' },
  { id: 'address', label: '联系地址或收货地址' },
  { id: 'photos', label: '相册图片与相机拍摄权限' },
  { id: 'contacts', label: '通讯录联系人信息' },
  { id: 'precise_location', label: '精确地理位置数据' },
  { id: 'approximate_location', label: '粗略地理位置数据' },
  { id: 'usage_data', label: '使用行为与诊断日志数据' },
  { id: 'device_id', label: '设备标识符与广告标识' },
  { id: 'cookies', label: '本地缓存与同源追踪技术' },
];

export interface ServiceOption {
  id: string;
  label: string;
  englishLabel?: string;
  policyUrl?: string;
}

export interface ServiceCategory {
  category: string;
  services: ServiceOption[];
}

export const SERVICE_CATALOG: ServiceCategory[] = [
  {
    category: '数据分析与统计',
    services: [
      { id: 'firebase_analytics', label: '谷歌移动统计分析', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'ga4', label: '谷歌分析第四代服务', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'mixpanel', label: '漏斗行为统计服务', policyUrl: 'https://mixpanel.com/legal/privacy-policy/' },
      { id: 'amplitude', label: '用户增长分析服务', policyUrl: 'https://amplitude.com/privacy' },
      { id: 'segment', label: '客户数据网关服务', policyUrl: 'https://segment.com/legal/privacy/' },
      { id: 'umeng', label: '友盟统计分析', policyUrl: 'https://www.umeng.com/policy' },
      { id: 'talkingdata', label: '腾云天下数据统计', policyUrl: 'https://www.talkingdata.com/policy.jsp' },
    ],
  },
  {
    category: '崩溃异常与性能监控',
    services: [
      { id: 'crashlytics', label: '谷歌崩溃分析服务', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'sentry', label: '实时错误追踪监控', policyUrl: 'https://sentry.io/privacy/' },
      { id: 'instabug', label: '移动应用反馈与监控', policyUrl: 'https://www.instabug.com/privacy' },
      { id: 'bugsnag', label: '应用稳定性监控服务', policyUrl: 'https://www.bugsnag.com/legal/privacy-policy/' },
      { id: 'bugly', label: '腾讯异常上报监控', policyUrl: 'https://bugly.qq.com/v2/agreement/privacy' },
    ],
  },
  {
    category: '广告变现与渠道归因',
    services: [
      { id: 'admob', label: '谷歌移动广告联盟', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'meta_audience', label: '社交受众广告网络', policyUrl: 'https://www.facebook.com/privacy/policy/' },
      { id: 'applovin', label: '移动广告聚合平台', policyUrl: 'https://www.applovin.com/privacy/' },
      { id: 'vungle', label: '激励视频广告网络', policyUrl: 'https://vungle.com/privacy/' },
      { id: 'startapp', label: '移动原生广告平台', policyUrl: 'https://www.startapp.com/privacy/' },
      { id: 'appsflyer', label: '移动营销归因分析', policyUrl: 'https://www.appsflyer.com/legal/privacy-policy/' },
      { id: 'adjust', label: '渠道转化归因监测', policyUrl: 'https://www.adjust.com/terms/privacy-policy/' },
      { id: 'pangle', label: '穿山甲广告联盟', policyUrl: 'https://www.pangleglobal.com/privacy' },
    ],
  },
  {
    category: '消息推送通知',
    services: [
      { id: 'fcm', label: '谷歌云消息推送', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'onesignal', label: '跨平台消息推送服务', policyUrl: 'https://onesignal.com/privacy_policy' },
      { id: 'jpush', label: '极光推送服务', policyUrl: 'https://www.jiguang.cn/license/privacy' },
      { id: 'getui', label: '个推消息推送服务', policyUrl: 'https://www.getui.com/privacy' },
    ],
  },
  {
    category: '云端后端与身份认证',
    services: [
      { id: 'firebase', label: '谷歌应用云开发平台', policyUrl: 'https://firebase.google.com/support/privacy' },
      { id: 'supabase', label: '开源后端数据库云服务', policyUrl: 'https://supabase.com/privacy' },
      { id: 'auth0', label: '统一身份认证服务', policyUrl: 'https://auth0.com/privacy' },
      { id: 'clerk', label: '用户会话与鉴权服务', policyUrl: 'https://clerk.com/privacy' },
      { id: 'aws_amplify', label: '亚马逊云应用托管服务', policyUrl: 'https://aws.amazon.com/privacy/' },
    ],
  },
  {
    category: '第三方快捷登录',
    services: [
      { id: 'google_signin', label: '谷歌账号授权登录', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'apple_signin', label: '苹果账号授权登录', policyUrl: 'https://www.apple.com/legal/privacy/' },
      { id: 'facebook_login', label: '社交账号授权登录', policyUrl: 'https://www.facebook.com/privacy/policy/' },
      { id: 'wechat_login', label: '微信账号授权登录', policyUrl: 'https://www.tencent.com/privacy-policy' },
    ],
  },
  {
    category: '支付结算与内购订阅',
    services: [
      { id: 'stripe', label: '在线银行卡支付服务', policyUrl: 'https://stripe.com/privacy' },
      { id: 'revenuecat', label: '应用内订阅管理服务', policyUrl: 'https://www.revenuecat.com/privacy' },
      { id: 'adapty', label: '内购付费墙分析服务', policyUrl: 'https://adapty.io/privacy' },
      { id: 'iap', label: '应用商店原生内购结算' },
      { id: 'paypal', label: '贝宝跨境支付服务', policyUrl: 'https://www.paypal.com/us/webapps/mpp/ua/privacy-full' },
      { id: 'alipay', label: '支付宝支付服务', policyUrl: 'https://www.alipay.com' },
      { id: 'wechat_pay', label: '微信支付服务', policyUrl: 'https://pay.weixin.qq.com' },
    ],
  },
  {
    category: '电子地图与位置服务',
    services: [
      { id: 'google_maps', label: '谷歌电子地图服务', policyUrl: 'https://policies.google.com/privacy' },
      { id: 'amap', label: '高德地图定位服务', policyUrl: 'https://www.amap.com/doc/privacy' },
      { id: 'baidu_map', label: '百度地图定位服务', policyUrl: 'https://map.baidu.com/zt/client/privacy/index.html' },
    ],
  },
  {
    category: '对象云存储与多媒体分发',
    services: [
      { id: 'aws_s3', label: '亚马逊云对象存储', policyUrl: 'https://aws.amazon.com/privacy/' },
      { id: 'cloudinary', label: '云端图像与音视频托管', policyUrl: 'https://cloudinary.com/privacy' },
    ],
  },
  {
    category: '跨端开发框架与渲染引擎',
    services: [
      { id: 'godot', label: '开源游戏渲染引擎', policyUrl: 'https://godotengine.org/privacy-policy' },
      { id: 'unity', label: '实时三维图形引擎', policyUrl: 'https://unity3d.com/legal/privacy-policy' },
      { id: 'expo', label: '跨平台移动应用框架', policyUrl: 'https://expo.io/privacy' },
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
  appType: 'free' | 'open_source' | 'freemium' | 'ad_supported' | 'commercial';
  isAIUsed: boolean;
  isLocationTracked: boolean;
  ownerType: 'individual' | 'company';
  developerName: string;
  businessAddress: string;
  euRepresentative: string;
  isDsa: boolean;
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
  appType: 'free' | 'open_source' | 'freemium' | 'ad_supported' | 'commercial';
  isAIUsed: boolean;
  ownerType: 'individual' | 'company';
  developerName: string;
  businessAddress: string;
  euRepresentative: string;
  isDsa: boolean;
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
  appType: 'free',
  isAIUsed: false,
  isLocationTracked: false,
  ownerType: 'individual',
  developerName: '',
  businessAddress: '',
  euRepresentative: '',
  isDsa: false,
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
  appType: 'free',
  isAIUsed: false,
  ownerType: 'individual',
  developerName: '',
  businessAddress: '',
  euRepresentative: '',
  isDsa: false,
};

/**
 * The Compliance Toolkit collects all fields for every generated document in a single
 * shared questionnaire. Because every field on `PrivacyDraft` and `TermsDraft` that shares
 * a name already shares the same type, the intersection type below is structurally a valid
 * `PrivacyDraft` AND a valid `TermsDraft` at once, so a single `MasterDraft` object can be
 * passed directly to any of the `build*Sections`/`build*Rows` functions below.
 */
export type MasterDraft = PrivacyDraft & TermsDraft;

export const DEFAULT_MASTER_DRAFT: MasterDraft = {
  ...DEFAULT_PRIVACY_DRAFT,
  ...DEFAULT_TERMS_DRAFT,
};

export const PLATFORM_LABELS: Record<PrivacyDraft['platform'], string> = {
  ios: '苹果移动端应用',
  android: '安卓移动端应用',
  both: '苹果与安卓双端应用',
  web: '网页端应用',
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

function companyOf(draft: { ownerType?: 'individual' | 'company'; appName: string; companyName: string; developerName?: string }): string {
  if (draft.ownerType === 'individual') {
    return draft.developerName?.trim() || draft.appName.trim() || '本开发者';
  }
  return draft.companyName.trim() || draft.appName.trim() || '本公司';
}

export function buildPrivacyPolicySections(draft: PrivacyDraft): DocSection[] {
  const appName = draft.appName.trim() || '本应用';
  const company = companyOf(draft);
  const sections: DocSection[] = [];

  const platformNoun = PLATFORM_LABELS[draft.platform || 'both'];
  const appTypeNoun =
    draft.appType === 'open_source' ? '一款开源软件应用' :
    draft.appType === 'freemium' ? '一款免费下载并含可选应用内购买的应用' :
    draft.appType === 'ad_supported' ? '一款由广告支持运营的应用' :
    draft.appType === 'commercial' ? '一款商业付费应用' :
    '一款免费应用';

  const costNoun =
    draft.appType === 'commercial'
      ? `由${company}提供，并按现状供您使用。`
      : `由${company}免费提供，并按现状供您使用。`;

  sections.push({
    heading: '引言与总则',
    paragraphs: [
      `本隐私政策旨在说明当您使用「${appName}」（属于${platformNoun}，以下统称“本服务”）时，${company}关于收集、使用、存储及披露您的个人信息的规则与程序，并向您告知您所享有的隐私权利及适用法律对您的保护。`,
      `我们将「${appName}」构建为${appTypeNoun}。本服务${costNoun}我们仅在提供与改进本服务所必需的范围内处理您的相关数据。一旦您访问或使用本服务，即表示您同意我们按照本隐私政策收集与使用相关信息。`,
    ],
  });

  const selectedDataLabels = DATA_TYPE_CATALOG.filter((d) => draft.dataTypes.includes(d.id) && d.id !== 'cookies').map((d) => d.label);
  const dataParas: string[] = [];
  if (selectedDataLabels.length > 0) {
    dataParas.push(
      `在您使用本服务的过程中，为了实现核心业务功能或与您取得联系，我们可能会请求您提供或自动收集特定类型的个人身份识别信息。此类信息包括但不限于：`
    );
    dataParas.push(selectedDataLabels.map((l) => `• ${l}`).join('\n'));
  } else {
    dataParas.push('除维持本服务基础运行所严格必需的技术参数外，我们不会主动收集您的个人身份识别信息。');
  }
  if (draft.customDataTypes.trim()) {
    dataParas.push(`此外，根据具体功能场景，我们还可能收集：${draft.customDataTypes.trim()}。`);
  }
  sections.push({ heading: '我们收集的信息', paragraphs: dataParas });

  sections.push({
    heading: '日志与诊断数据',
    paragraphs: [
      `当您使用本服务时，若应用发生运行故障或异常崩溃，我们会通过系统组件或第三方诊断工具在您的设备上收集日志数据。该日志数据可能包含您的设备网络协议地址、设备型号名称、操作系统版本、应用运行配置、使用本服务的日期与时间戳以及其他性能诊断统计信息。`,
    ],
  });

  sections.push({
    heading: '信息的使用方式',
    paragraphs: [
      `${company}会将所收集的信息用于以下合规目的：提供与维护本服务的正常运转；向您通知本服务的重大变更；提供客户支持与问题排查；监测服务运行状态并防止技术故障或欺诈行为；以及在征得您同意的前提下向您发送与服务相关的通知。`,
    ],
  });

  if (draft.dataTypes.includes('cookies')) {
    sections.push({
      heading: '本地缓存与同源追踪技术',
      paragraphs: [
        `我们使用本地缓存及类似的同源标识符技术来保持您的会话状态并存储必要的偏好设置。您可以在设备或浏览器设置中清除缓存或拒绝此类标识，但禁用后可能导致本服务的部分个性化功能无法正常使用。`,
      ],
    });
  }

  if (draft.isLocationTracked) {
    sections.push({
      heading: '地理位置信息处理',
      paragraphs: [
        `本服务可能会在获得您授权后收集并使用您设备的精确或粗略地理位置数据，以提供基于位置的服务功能并优化应用体验。`,
        `在设备上开启位置权限即表示您同意我们按上述目的处理位置数据；您可随时通过设备系统设置撤回或关闭位置访问权限。`,
      ],
    });
  }

  if (draft.isAIUsed) {
    sections.push({
      heading: '人工智能技术应用说明',
      paragraphs: [
        `本应用集成了人工智能算法与推理技术，用于提升使用体验并驱动相关智能功能。相关组件可能会在安全合规的前提下处理您输入的上下文数据以生成结果。`,
        `未经您的明确授权同意，我们不会将您的个人隐私数据用于训练外部公开模型。`,
      ],
    });
  }

  sections.push({
    heading: '禁止追踪信号响应',
    paragraphs: [
      `目前本服务暂不响应浏览器发出的“禁止追踪”标头信号。您可以通过终端设备或浏览器的隐私偏好设置自行管理追踪权限。`,
    ],
  });

  const selectedServices = draft.services.map(findService).filter((s): s is ServiceOption => !!s);
  if (selectedServices.length > 0 || draft.customServices.length > 0) {
    const paras: string[] = [
      `我们可能会委托具备合规资质的第三方服务商协助提供基础设施、统计分析或特定业务功能。这些第三方仅在代表我们履行上述职责所必需的范围内接触必要数据，并受保密与数据保护义务约束。`,
    ];
    for (const svc of selectedServices) {
      paras.push(
        svc.policyUrl
          ? `我们在本服务中集成了「${svc.label}」。关于该服务商如何处理数据的详细规则，请参阅其官方隐私政策：${svc.policyUrl}`
          : `我们在本服务中集成了「${svc.label}」。请参阅该服务商公布的隐私政策了解其数据处理详情。`
      );
    }
    for (const custom of draft.customServices) {
      if (!custom.name.trim()) continue;
      paras.push(
        custom.url.trim()
          ? `我们在本服务中集成了「${custom.name.trim()}」。欲了解其隐私保护措施，请访问：${custom.url.trim()}`
          : `我们在本服务中集成了「${custom.name.trim()}」。请参阅该服务商自身的隐私政策了解详情。`
      );
    }
    sections.push({ heading: '第三方服务与开发工具包', paragraphs: paras });
  }

  sections.push({
    heading: '跨境数据传输说明',
    paragraphs: [
      `您的信息（包括个人数据）可能会被传输至您所在省市、国家或司法管辖区以外的服务器进行处理和存储。若您位于${draft.governingLaw.trim() || '我们运营所在地'}以外的地区并选择向我们提供信息，即视为您知悉并同意按照本隐私政策采取的安全保障措施进行相关数据传输。`,
    ],
  });

  sections.push({
    heading: '数据保留期限',
    paragraphs: [
      draft.retention.trim()
        ? draft.retention.trim()
        : `我们仅在实现本隐私政策所述目的所必需的最短期限内保留您的个人数据，并在履行法定义务、解决争议及执行协议所需的范围内依法留存。超出保留期限后，我们将对数据进行删除或匿名化处理。`,
    ],
  });

  sections.push({
    heading: '账号与数据注销机制',
    paragraphs: draft.hasUserAccounts
      ? [
          draft.deletionInstructions.trim()
            ? draft.deletionInstructions.trim()
            : `若您在本服务中注册了用户账号，您可以随时通过应用内提供的注销入口或通过下方“联系我们”章节中的方式申请注销账号并删除关联的个人数据。我们将在核实身份后的合理期限内完成清理（法律法规要求强制留存的除外）。`,
        ]
      : [
          `本服务无需您注册持久化个人账号。若您希望查询、更正或删除我们可能持有的与您相关的任何信息，请随时通过下方“联系我们”章节中的方式与我们联系。`,
        ],
  });

  sections.push({
    heading: '未成年人隐私保护',
    paragraphs: draft.coppa
      ? [
          `本服务包含面向十三周岁以下未成年人的功能或内容，并严格遵守儿童在线隐私保护相关法规。我们在收集未成年人个人信息前会依法征得其父母或法定监护人的可验证同意，且仅收集实现功能所严格必需的信息。监护人可随时联系我们查阅、更正或要求删除未成年人的相关信息。`,
        ]
      : [
          `本服务不面向十三周岁以下的儿童，我们也不会故意收集十三周岁以下未成年人的个人身份识别信息。如果监护人发现未成年人在未获同意的情况下向我们提供了个人数据，请立即联系我们，我们将第一时间采取措施予以删除。`,
        ],
  });

  if (draft.gdpr) {
    sections.push({
      heading: '欧盟与英国用户的数据保护权利',
      paragraphs: [
        `如果您居住在欧洲经济区或英国，根据通用数据保护条例规定，您对自己的个人数据享有知情访问权、更正权、删除权（被遗忘权）、限制处理权、反对处理权以及数据可携带权。`,
        `我们基于您的明确同意、履行合同之必要以及合法运营权益处理您的数据。您可随时通过下方联系方式行使上述权利，亦有权向您常住地的数据保护监管机构提出申诉。`,
      ],
    });
  }

  if (draft.ccpa) {
    sections.push({
      heading: '美国加州居民隐私权利',
      paragraphs: [
        `如果您是美国加利福尼亚州居民，根据加州消费者隐私法案规定，您有权要求披露我们收集、使用或共享的个人信息类别，有权要求删除您的个人信息，并有权拒绝出售个人信息。我们绝不出售用户的个人隐私数据。如需行使上述权利，请通过下方联系方式与我们取得联系。`,
      ],
    });
  }

  sections.push({
    heading: '数据安全保障措施',
    paragraphs: [
      `我们高度重视您的数据安全，并采取符合行业标准的加密与访问控制措施加以保护。但请注意，没有任何互联网传输或电子存储方式能够保证百分之百绝对安全，我们将尽商业上合理之努力持续防范安全风险。`,
    ],
  });

  sections.push({
    heading: '外部网站与服务链接',
    paragraphs: [
      `本服务可能包含指向非我们运营的第三方网站或外部服务的链接。当您点击第三方链接时，将跳转至该第三方的站点。我们建议您仔细阅读所访问站点的隐私政策，我们对该等第三方站点的内容或隐私实践不承担责任。`,
    ],
  });

  sections.push({
    heading: '适用法律与管辖',
    paragraphs: [
      draft.governingLaw.trim()
        ? `本隐私政策的订立、执行、解释及争议解决均适用${draft.governingLaw.trim()}，并排除冲突法规则的适用。`
        : `本隐私政策的订立、执行、解释及争议解决均适用${company}设立地所施行的有效法律法规。`,
    ],
  });

  sections.push({
    heading: '隐私政策的变更通知',
    paragraphs: [
      `我们可能会适时修订本隐私政策。任何更新一经在本页面发布并更新顶部“生效日期”后即行生效。建议您定期查阅本页面以了解最新的隐私保护措施。`,
    ],
  });

  const contactParts = [`如果您对本隐私政策有任何疑问或权利请求，请通过电子邮箱联系我们：${draft.contactEmail.trim() || '未填写'}`];
  if (draft.websiteUrl.trim()) contactParts.push(`或访问我们的官方网站：${draft.websiteUrl.trim()}`);
  if (draft.ownerType === 'company' && draft.businessAddress.trim()) {
    contactParts.push(`或寄信至我们的注册办公地址：${draft.businessAddress.trim()}`);
  }
  sections.push({ heading: '联系我们', paragraphs: [contactParts.join('，') + '。'] });

  return sections;
}

export function buildTermsOfUseSections(draft: TermsDraft): DocSection[] {
  const appName = draft.appName.trim() || '本应用';
  const company = companyOf(draft);
  const sections: DocSection[] = [];

  sections.push({
    heading: '条款确认与接受',
    paragraphs: [
      `本使用条款构成您与${company}之间就访问和使用「${appName}」（以下统称“本服务”）所达成的具有法律约束力的协议。一旦您下载、安装、访问或使用本服务，即视为您已充分阅读、理解并同意接受本使用条款的全部内容。若您不同意本条款的任何部分，请立即停止使用本服务。`,
    ],
  });

  const minAge = draft.minimumAge.trim() || '13';
  sections.push({
    heading: '用户使用资格',
    paragraphs: [
      `您必须年满 ${minAge} 周岁（或达到您所在司法管辖区规定的法定成年年龄）方可使用本服务。若您代表公司或其他组织使用本服务，您声明并保证已获得充分授权使该组织受本条款约束。`,
    ],
  });

  sections.push({
    heading: '服务内容说明',
    paragraphs: [
      draft.serviceDescription.trim()
        ? draft.serviceDescription.trim()
        : `「${appName}」向用户提供应用内所展示的各项功能与数字服务。我们保留在任何时候升级、修改、暂停或终止本服务全部或部分功能的权利。`,
    ],
  });

  if (draft.requiresAccount) {
    sections.push({
      heading: '账号注册与保管责任',
      paragraphs: [
        `您在创建账号时应提供真实、准确、完整且最新的注册信息。您应对自己的账号凭证及密码安全负全部责任，并对该账号下发生的所有操作行为承担法律责任。如发现任何未经授权的使用行为，请立即通知我们。`,
      ],
    });
  }

  if (draft.hasUGC) {
    sections.push({
      heading: '用户生成内容规范',
      paragraphs: [
        `本服务允许您发布、上传、存储或分享文字、图片及其他内容。您对所发布的全部内容之合法性、真实性及适当性独立承担责任。通过发布内容，您授予我们一项全球范围内免费、非独占的许可，仅用于在提供本服务的过程中展示与传输该内容。我们有权随时移除违反法律法规或本条款的不当内容。`,
      ],
    });
  }

  if (draft.hasSubscriptions) {
    sections.push({
      heading: '内购与自动续期订阅',
      paragraphs: [
        `本服务的部分高级功能需通过一次性应用内购买或周期性订阅解锁，交易由您下载本应用所在的应用商店结算系统处理。除非您在当前计费周期结束前至少二十四小时在系统账户设置中取消订阅，否则订阅将按照平台规则自动续期。退费事宜遵循对应应用商店平台的官方政策。`,
      ],
    });
  }

  sections.push({
    heading: '禁止性行为规范',
    paragraphs: [
      `您同意在使用本服务时不得从事以下行为：违反任何适用法律法规；未经书面许可发送垃圾广告或促销信息；冒充本公司工作人员或其他用户；从事任何损害、干扰、超负荷加载或破坏本服务正常运行的攻击行为；或未经授权抓取、逆向探测本服务的数据与接口。`,
    ],
  });

  sections.push({
    heading: '知识产权归属',
    paragraphs: [
      `除用户依法享有著作权的上传内容外，本服务所包含的全部源代码、界面设计、图形、文字、商标及交互逻辑均归${company}及其许可方独占所有，受著作权法、商标法及其他知识产权法律法规保护。`,
    ],
  });

  if (draft.appType === 'open_source') {
    sections.push({
      heading: '软件开源许可授权',
      paragraphs: [
        `本应用依据所附带的开源软件许可证进行分发。您对本应用的使用、复制、修改与再分发行为均受该开源许可证条款的约束。`,
      ],
    });
  } else {
    sections.push({
      heading: '软件使用许可授权',
      paragraphs: [
        `在您严格遵守本条款的前提下，${company}授予您一项有限的、非排他的、不可转让且可撤销的个人使用许可，允许您在合法拥有的终端设备上安装并使用本应用。除法律明确允许外，您不得对本应用进行复制、反编译、逆向工程、反汇编或试图提取源代码。`,
      ],
    });
  }

  if (draft.isAIUsed) {
    sections.push({
      heading: '人工智能服务条款',
      paragraphs: [
        `本应用包含人工智能辅助生成与推荐功能。您理解并知悉人工智能输出内容具有概率性，我们会遵循相关合规要求提供服务，但请您在使用生成结果时结合实际情况审慎判断。`,
      ],
    });
  }

  sections.push({
    heading: '用户反馈建议授权',
    paragraphs: [
      `若您向我们提交关于本服务的任何改进建议、想法或反馈，即表示您同意我们可无偿且不受限制地使用、采纳并实施该等反馈意见，而无需向您支付额外报酬。`,
    ],
  });

  sections.push({
    heading: '第三方链接与服务免责',
    paragraphs: [
      `本服务可能包含指向第三方网站或服务的链接。我们不对任何第三方网站或服务的内容、隐私政策或运营行为进行控制或背书，亦不承担由此产生的任何直接或间接责任。`,
    ],
  });

  sections.push({
    heading: '设备安全与网络连接责任',
    paragraphs: [
      `本服务的部分功能依赖稳定的互联网连接。若因无线网络未连接或移动数据流量耗尽导致本服务无法正常运作，我们不承担相关责任。您在非无线网络环境下使用本服务所产生的移动数据流量费用或漫游资费，由您自行向移动通信运营商承担。`,
      `您不得对运行本应用的终端设备进行越狱或获取最高系统权限的操作，此类操作可能导致设备暴露于恶意软件风险之中并致使本应用无法正常工作。同时，${company}不对设备电池自然损耗或硬件老化承担责任。`,
    ],
  });

  sections.push({
    heading: '服务中止与协议终止',
    paragraphs: [
      `若您违反本使用条款的任何规定，我们有权在不预先通知的情况下立即暂停或终止您对本服务的访问权限。协议终止后，您使用本服务的权利即刻失效。`,
    ],
  });

  sections.push({
    heading: '免责声明',
    paragraphs: [
      `本服务系按“现状”与“现有”基础提供，不附带任何明示或暗示的担保，包括但不限于对适销性、特定用途适用性及不侵权的默示保证。我们不担保本服务在任何时间均不间断、完全无误或免于一切网络威胁。`,
    ],
  });

  sections.push({
    heading: '责任限制',
    paragraphs: [
      `在适用法律允许的最大范围内，${company}及其关联方、管理人员或员工均不对因您使用或无法使用本服务而产生的任何间接性、附带性、特殊性、惩罚性或后果性损害（包括但不限于利润损失、数据丢失或业务中断）承担赔偿责任。`,
    ],
  });

  sections.push({
    heading: '违约赔偿责任',
    paragraphs: [
      `若因您违反本使用条款或不当使用本服务而导致任何第三方提出索赔、诉讼或损失，您同意全额赔偿并使${company}及其工作人员免受损害。`,
    ],
  });

  sections.push({
    heading: '适用法律与争议解决',
    paragraphs: [
      draft.governingLaw.trim()
        ? `本条款的解释、效力及争议解决均适用${draft.governingLaw.trim()}。因本条款引起的任何争议应提交该管辖区有管辖权的人民法院或法院裁决。`
        : `本条款的解释、效力及争议解决均适用${company}设立地现行有效的法律法规。`,
    ],
  });

  if (draft.isDsa) {
    const euRepText = draft.euRepresentative.trim()
      ? `如服务提供方设立于欧盟境外，我们已依据数字服务法案指定欧盟法定授权代表：${draft.euRepresentative.trim()}。`
      : `我们设立了直接联系窗口以配合监管机构及服务接收方的沟通，联系邮箱为：${draft.contactEmail || '官方支持邮箱'}。`;

    sections.push({
      heading: '欧盟数字服务法案合规条款',
      paragraphs: [
        `若本应用涉及欧盟数字服务法案所界定的中介服务，则除本条款一般规定外，同时适用以下合规机制：`,
        `联络点与授权代表：${euRepText}`,
        `内容治理与申诉说明：当因违反法律法规或社区准则需要对用户提交的内容采取限制措施或封禁账号时，我们将向受影响用户提供清晰的决定理由说明及救济申诉渠道。`,
        `违规举报与处理机制：若您发现服务内存在违法或违规内容，可通过 ${draft.contactEmail || '官方支持邮箱'} 提交详细举报通知，我们将依法及时审核并反馈处理结果。`,
      ],
    });
  }

  sections.push({
    heading: '条款可分割性',
    paragraphs: [
      `若本条款的任何规定被有管辖权的法院或仲裁机构认定为无效或不可执行，该规定应在最小必要范围内予以调整或分割，且不影响其余条款的法律效力。`,
    ],
  });

  sections.push({
    heading: '完整协议',
    paragraphs: [
      `本使用条款连同我们的隐私政策共同构成您与${company}之间关于使用本服务的完整协议，并取代双方此前就同一事项达成的任何口头或书面约定。`,
    ],
  });

  sections.push({
    heading: '条款修订与通知',
    paragraphs: [
      `我们保留根据业务发展或法规变化适时修订本使用条款的权利。重大变更将在本页面公示并更新顶部生效日期，您在变更生效后继续使用本服务即视为接受修订后的条款。`,
    ],
  });

  const contactParts = [`如果您对本使用条款有任何疑问，请通过电子邮箱联系我们：${draft.contactEmail.trim() || '未填写'}`];
  if (draft.websiteUrl.trim()) contactParts.push(`或访问我们的官方网站：${draft.websiteUrl.trim()}`);
  sections.push({ heading: '联系我们', paragraphs: [contactParts.join('，') + '。'] });

  return sections;
}

const LEGAL_DISCLAIMER =
  '本文件由合规文档模板工具自动生成，仅供上架参考使用，不构成正式法律意见。在正式发布或提交应用商店审核前，请结合实际业务情况并咨询专业法务人员进行核验。';

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
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.7; color: #1a1a1a; max-width: 720px; margin: 0 auto; padding: 48px 24px; }
  h1 { font-size: 28px; margin-bottom: 4px; }
  .effective-date { color: #666; font-size: 14px; margin-bottom: 32px; }
  h2 { font-size: 18px; margin-top: 32px; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; }
  p { font-size: 15px; margin: 12px 0; white-space: pre-wrap; }
  .disclaimer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #999; }
</style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="effective-date">生效日期：${escapeHtml(effectiveDate)}</div>
  ${body}
  <div class="disclaimer">${escapeHtml(LEGAL_DISCLAIMER)}</div>
</body>
</html>`;
}

export function renderSectionsToPlainText(title: string, effectiveDate: string, sections: DocSection[]): string {
  const parts = [title, `生效日期：${effectiveDate}`, ''];
  for (const s of sections) {
    parts.push(s.heading);
    parts.push('-'.repeat(Math.max(4, s.heading.length * 2)));
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
  const parts = [`# ${title}`, '', `_生效日期：${effectiveDate}_`, ''];
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

export type HighRiskType = 'none' | 'ai_generated' | 'health_medical' | 'ugc_community';

export const HIGH_RISK_TYPE_LABELS: Record<HighRiskType, string> = {
  none: '无特殊高风险属性',
  ai_generated: '人工智能生成内容类',
  health_medical: '健康与医疗辅助类',
  ugc_community: '用户生成内容与社区类',
};

export function buildCustomEulaSections(draft: TermsDraft, highRiskType: HighRiskType): DocSection[] {
  const baseline = buildTermsOfUseSections(draft);
  if (highRiskType === 'none') return baseline;

  let clause: DocSection;
  if (highRiskType === 'ai_generated') {
    clause = {
      heading: '人工智能生成内容免责条款',
      paragraphs: [
        `本应用使用人工智能模型生成内容、建议或其他输出结果。我们不对任何由人工智能生成内容的准确性、完整性、可靠性或适用性作出保证，亦不对您依赖该等内容所作出的任何决定或行动承担法律责任。`,
        `您在将任何人工智能生成结果用于实际决策前，应自行独立核实其真实性与妥当性。`,
      ],
    };
  } else if (highRiskType === 'health_medical') {
    clause = {
      heading: '医疗与健康信息免责声明',
      paragraphs: [
        `本应用所提供的全部数据与建议仅供日常健康信息参考，绝不构成专业的医疗诊断、治疗方案或医嘱，亦不能替代执业医师或其他具备资质的医疗卫生专业人员的面诊咨询。`,
        `如您有任何身体不适或医疗健康疑问，请务必及时咨询专业医生，切勿因本应用提供的信息而延误就医或擅自更改诊疗计划。`,
      ],
    };
  } else {
    clause = {
      heading: '不良内容零容忍与社区治理政策',
      paragraphs: [
        `我们对任何辱骂、骚扰、仇恨言论、暴力或色情低俗等违规用户生成内容采取严格的“零容忍”政策。为贯彻该政策，我们在服务内提供以下强制保障机制：（1）对用户提交内容进行自动化与规则过滤筛查；（2）提供便捷的拉黑屏蔽功能，允许任何用户即时屏蔽特定用户的互动；（3）提供应用内一键举报通道，支持用户直接举报违规内容或不良行为；（4）建立快速响应审核机制，收到举报后将在二十四小时内完成核查，立即移除违规内容并对违规账号予以封禁处罚。`,
        `屡次违反社区内容规范的用户将被永久终止访问权限。`,
      ],
    };
  }

  const contactIndex = baseline.findIndex((s) => s.heading === '联系我们');
  if (contactIndex === -1) return [...baseline, clause];
  return [...baseline.slice(0, contactIndex), clause, ...baseline.slice(contactIndex)];
}

export type NutritionLabelCategory = 'tracking' | 'linked' | 'not_linked';

export const NUTRITION_LABEL_CATEGORY_LABELS: Record<NutritionLabelCategory, string> = {
  tracking: '用于追踪您的数据',
  linked: '与您身份关联的数据',
  not_linked: '未与您身份关联的数据',
};

const AD_ATTRIBUTION_SERVICE_IDS = new Set(
  SERVICE_CATALOG.find((g) => g.category === '广告变现与渠道归因')?.services.map((s) => s.id) ?? []
);

const DEFAULT_PURPOSES: Record<string, string[]> = {
  name: ['基础应用功能'],
  email: ['基础应用功能', '开发者通知与营销沟通'],
  phone: ['基础应用功能'],
  address: ['基础应用功能'],
  photos: ['基础应用功能'],
  contacts: ['基础应用功能'],
  precise_location: ['基础应用功能', '统计分析'],
  approximate_location: ['基础应用功能', '统计分析'],
  usage_data: ['统计分析', '基础应用功能'],
  device_id: ['第三方广告与归因', '统计分析'],
  cookies: ['统计分析', '第三方广告与归因'],
};

export interface NutritionLabelRow {
  dataTypeId: string;
  dataTypeLabel: string;
  category: NutritionLabelCategory;
  purposes: string[];
}

export function buildNutritionLabelRows(draft: PrivacyDraft): NutritionLabelRow[] {
  const hasAdService = draft.services.some((id) => AD_ATTRIBUTION_SERVICE_IDS.has(id));
  return DATA_TYPE_CATALOG.filter((d) => draft.dataTypes.includes(d.id)).map((d) => {
    const category: NutritionLabelCategory = hasAdService ? 'tracking' : draft.hasUserAccounts ? 'linked' : 'not_linked';
    return {
      dataTypeId: d.id,
      dataTypeLabel: d.label,
      category,
      purposes: DEFAULT_PURPOSES[d.id] ?? ['基础应用功能'],
    };
  });
}

export function renderNutritionLabelRowsToText(rows: NutritionLabelRow[]): string {
  const lines = ['数据类型 | 苹果隐私标签分类 | 建议勾选用途', '--- | --- | ---'];
  for (const r of rows) {
    lines.push(`${r.dataTypeLabel} | ${NUTRITION_LABEL_CATEGORY_LABELS[r.category]} | ${r.purposes.join('、')}`);
  }
  return lines.join('\n');
}

export function renderNutritionLabelRowsToMarkdown(rows: NutritionLabelRow[]): string {
  const parts = [
    '# 苹果应用商店隐私营养标签 — 填表对照表',
    '',
    '_请以苹果开发者后台最新问卷界面表述为准，在提交审核前逐项核对下表。_',
    '',
    '| 数据类型 | 苹果隐私标签分类 | 建议勾选用途 |',
    '| --- | --- | --- |',
  ];
  for (const r of rows) {
    parts.push(`| ${r.dataTypeLabel} | ${NUTRITION_LABEL_CATEGORY_LABELS[r.category]} | ${r.purposes.join('、')} |`);
  }
  return parts.join('\n');
}

export function buildAccountDeletionSections(draft: PrivacyDraft): DocSection[] {
  const appName = draft.appName.trim() || '本应用';
  const contactLine = `受理联系邮箱：${draft.contactEmail.trim() || '未填写'}`;

  if (draft.hasUserAccounts) {
    return [
      {
        heading: '账号与数据注销指南',
        paragraphs: [
          draft.deletionInstructions.trim()
            ? draft.deletionInstructions.trim()
            : `您可以随时通过「${appName}」应用内的账号设置入口或发送请求至下方联系邮箱，申请永久注销您的账号并清除全部关联个人数据。我们将在核实身份后的合理期限内完成数据删除（法律法规另有强制留存规定的除外）。`,
          contactLine,
        ],
      },
    ];
  }

  return [
    {
      heading: '账号与数据注销指南',
      paragraphs: [
        `「${appName}」无需注册持久化个人账号即可使用。若您希望删除我们在提供服务过程中可能留存的与您相关的任何记录，请通过下方联系邮箱与我们取得联系。`,
        contactLine,
      ],
    },
  ];
}

export interface PermissionCopyEntry {
  dataTypeId: string;
  iosKey?: string;
  androidPermission?: string;
  zh: string;
  en: string;
}

const PERMISSION_COPY_MATRIX: Record<string, PermissionCopyEntry> = {
  photos: {
    dataTypeId: 'photos',
    iosKey: '相册读取权限标识 (NSPhotoLibraryUsageDescription)',
    androidPermission: '读取媒体图片权限 (READ_MEDIA_IMAGES)',
    zh: '我们需要访问您的相册，以便您选择照片用于设置头像或编辑保存图片。',
    en: '我们需要访问您的相册，以便您选择照片用于设置头像或编辑保存图片。',
  },
  contacts: {
    dataTypeId: 'contacts',
    iosKey: '通讯录权限标识 (NSContactsUsageDescription)',
    androidPermission: '读取联系人权限 (READ_CONTACTS)',
    zh: '我们需要访问您的通讯录联系人，以便帮您快速查找或邀请好友。',
    en: '我们需要访问您的通讯录联系人，以便帮您快速查找或邀请好友。',
  },
  precise_location: {
    dataTypeId: 'precise_location',
    iosKey: '使用期间位置权限标识 (NSLocationWhenInUseUsageDescription)',
    androidPermission: '精确位置权限 (ACCESS_FINE_LOCATION)',
    zh: '我们需要获取您的精确地理位置，以便为您提供附近地点推荐与位置导航服务。',
    en: '我们需要获取您的精确地理位置，以便为您提供附近地点推荐与位置导航服务。',
  },
  approximate_location: {
    dataTypeId: 'approximate_location',
    androidPermission: '粗略位置权限 (ACCESS_COARSE_LOCATION)',
    zh: '我们需要获取您的大致位置信息，以便为您展示本地化的服务内容。',
    en: '我们需要获取您的大致位置信息，以便为您展示本地化的服务内容。',
  },
  device_id: {
    dataTypeId: 'device_id',
    iosKey: '跨应用追踪权限标识 (NSUserTrackingUsageDescription)',
    zh: '我们需要获取您的设备标识符，仅用于为您提供更契合兴趣的个性化广告体验与效果评估。',
    en: '我们需要获取您的设备标识符，仅用于为您提供更契合兴趣的个性化广告体验与效果评估。',
  },
};

const CAMERA_SUPPLEMENTAL_ENTRY: PermissionCopyEntry = {
  dataTypeId: 'camera',
  iosKey: '相机拍摄权限标识 (NSCameraUsageDescription)',
  androidPermission: '相机硬件权限 (CAMERA)',
  zh: '我们需要访问您的相机，以便您拍摄照片用于扫码识别或上传头像图片。',
  en: '我们需要访问您的相机，以便您拍摄照片用于扫码识别或上传头像图片。',
};

export function buildPermissionMatrix(draft: PrivacyDraft): PermissionCopyEntry[] {
  const entries: PermissionCopyEntry[] = [];
  for (const id of draft.dataTypes) {
    const entry = PERMISSION_COPY_MATRIX[id];
    if (entry) entries.push(entry);
    if (id === 'photos') entries.push(CAMERA_SUPPLEMENTAL_ENTRY);
  }
  return entries;
}

export function shouldShowAttPrompt(draft: PrivacyDraft): boolean {
  return draft.dataTypes.includes('device_id') && draft.services.some((id) => AD_ATTRIBUTION_SERVICE_IDS.has(id));
}

export const ATT_PROMPT_COPY = {
  zh: '我们需要获取您的设备标识符，仅用于为您提供更契合兴趣的个性化广告体验与效果评估。',
  en: '我们需要获取您的设备标识符，仅用于为您提供更契合兴趣的个性化广告体验与效果评估。',
};

export function renderInfoPlistSnippet(entries: PermissionCopyEntry[]): string {
  return entries
    .filter((e) => e.iosKey)
    .map((e) => `<key>${e.iosKey}</key>\n<string>${e.zh}</string>`)
    .join('\n');
}

export function renderAndroidPermissionSnippet(entries: PermissionCopyEntry[]): string {
  return entries
    .filter((e) => e.androidPermission)
    .map((e) => `<!-- ${e.zh} -->\n<uses-permission android:name="android.permission.${e.androidPermission}" />`)
    .join('\n');
}

export interface DataSafetyRow {
  dataType: string;
  collected: boolean;
  shared: boolean;
  purpose: string;
  optional: boolean;
}

const DATA_SAFETY_CSV_COLUMNS: Array<{ key: keyof DataSafetyRow; label: string }> = [
  { key: 'dataType', label: '数据类型' },
  { key: 'collected', label: '是否收集' },
  { key: 'shared', label: '是否共享给第三方' },
  { key: 'purpose', label: '处理用途' },
  { key: 'optional', label: '用户是否可选' },
];

export function buildDataSafetyRows(draft: PrivacyDraft): DataSafetyRow[] {
  const hasThirdParty = draft.services.length > 0 || draft.customServices.length > 0;
  return DATA_TYPE_CATALOG.filter((d) => draft.dataTypes.includes(d.id)).map((d) => ({
    dataType: d.label,
    collected: true,
    shared: hasThirdParty,
    purpose: (DEFAULT_PURPOSES[d.id] ?? ['基础应用功能']).join('；'),
    optional: false,
  }));
}

function escapeCsvValue(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toDataSafetyCsv(rows: DataSafetyRow[]): string {
  const header = DATA_SAFETY_CSV_COLUMNS.map((c) => c.label).join(',');
  const lines = rows.map((r) =>
    DATA_SAFETY_CSV_COLUMNS.map((c) => {
      const val = r[c.key];
      return escapeCsvValue(typeof val === 'boolean' ? (val ? '是' : '否') : String(val));
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

/** Shared by the Privacy/Terms wizards and the Compliance Toolkit to detect an untouched draft. */
export function isNonEmptyDraft(draft: Record<string, unknown>): boolean {
  return Object.values(draft).some((v) => (typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v));
}
