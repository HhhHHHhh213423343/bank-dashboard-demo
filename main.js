import React, {
  useEffect,
  useMemo,
  useState,
} from "https://esm.sh/react@18.3.1?target=es2022";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client?target=es2022";
import htm from "https://esm.sh/htm@3.1.1?target=es2022";
import {
  ArrowLeft,
  Landmark,
  PiggyBank,
  HandCoins,
  Bot,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  GitCompare,
  Layers3,
  Search,
  LayoutDashboard,
  Bell,
  Sliders,
  X,
  Plus,
} from "https://esm.sh/lucide-react@0.474.0?deps=react@18.3.1&target=es2022";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  FunnelChart,
  Funnel,
  LabelList,
  ReferenceLine,
} from "https://esm.sh/recharts@2.12.7?deps=react@18.3.1,react-dom@18.3.1&target=es2022";

// htm + React：把 class -> className（避免 JSX 编译依赖）
const reactCreateElement = (type, props, ...children) => {
  if (props && Object.prototype.hasOwnProperty.call(props, "class")) {
    // eslint-disable-next-line no-unused-vars
    const { class: klass, ...rest } = props;
    props = { ...rest, className: klass };
  }
  return React.createElement(type, props, ...children);
};

const html = htm.bind(reactCreateElement);

// -----------------------------
// Minimal Hash Router（避免 react-router-dom 与 React 版本冲突）
// -----------------------------
function normalizePath(p) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function getHashPath() {
  const raw = window.location.hash || "#/";
  const path = raw.replace(/^#/, "") || "/";
  return normalizePath(path);
}

function setHashPath(path) {
  window.location.hash = `#${normalizePath(path)}`;
}

function useHashRoute() {
  const [path, setPath] = useState(getHashPath);
  useEffect(() => {
    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    // 首次进入：如果没有 hash，补一个
    if (!window.location.hash) setHashPath("/");
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

function matchRoute(pathname) {
  const segs = pathname.split("/").filter(Boolean);
  // / -> []
  if (segs.length === 0) return { name: "home", params: {} };
  if (segs[0] === "deposit" && segs.length === 1)
    return { name: "deposit", params: {} };
  if (segs[0] === "deposit" && segs.length === 2)
    return { name: "branchDeposit", params: { branchId: segs[1] } };
  if (segs[0] === "loan" && segs.length === 1) return { name: "loan", params: {} };
  if (segs[0] === "loan" && segs[1] === "capital-asset" && segs.length === 3 && segs[2] !== "branch")
    return { name: "capitalAssetDetail", params: { indicatorId: segs[2] } };
  if (segs[0] === "loan" && segs[1] === "capital-asset" && segs[2] !== "branch" && segs[3] === "branch" && segs.length === 5)
    return { name: "capitalAssetBranch", params: { indicatorId: segs[2], branchId: segs[4] } };
  if (segs[0] === "linkage") return { name: "linkage", params: {} };
  if (segs[0] === "compare") return { name: "compare", params: {} };
  if (segs[0] === "dashboard-builder") return { name: "dashboardBuilder", params: {} };
  if (segs[0] === "alert-config") return { name: "alertConfig", params: {} };
  return { name: "notFound", params: {} };
}

// -----------------------------
// Mock Data
// -----------------------------
const BANK_DEPOSIT = {
  balance: 1286.4, // 亿元
  balanceDeltaPct: 0.9, // vs 上周
  dailyAvg: 1248.2, // 亿元
  dailyAvgDeltaPct: -0.3,
  increment: 11.7, // 亿元
  incrementDeltaPct: 1.4,
};

const BRANCHES = [
  {
    id: "shanghai",
    name: "上海分行",
    balance: 186.2,
    deltaPct: -1.8,
    structure: [
      { name: "活期", value: 38 },
      { name: "定期", value: 62 },
    ],
    warning:
      "受某大型集团资金调拨影响，本周对公存款下降 5.2%，建议关注重点客户资金链与回流节奏。",
  },
  {
    id: "beijing",
    name: "北京分行",
    balance: 211.5,
    deltaPct: 0.6,
    structure: [
      { name: "活期", value: 44 },
      { name: "定期", value: 56 },
    ],
    warning:
      "政府平台企业财政资金阶段性归集，带动本周对公活期提升 2.1%，建议把握结算黏性与代发拓展。",
  },
  {
    id: "shenzhen",
    name: "深圳分行",
    balance: 164.8,
    deltaPct: 1.2,
    structure: [
      { name: "活期", value: 52 },
      { name: "定期", value: 48 },
    ],
    warning:
      "受头部互联网企业季末回款影响，本周零售存款增量明显（+3.4%），建议提升高频场景留存与AUM转化。",
  },
  {
    id: "chengdu",
    name: "成都分行",
    balance: 121.9,
    deltaPct: -0.7,
    structure: [
      { name: "活期", value: 35 },
      { name: "定期", value: 65 },
    ],
    warning:
      "地方基建项目资金支付加速导致对公存款短期回落（-2.0%），建议联动授信提款节奏与资金回笼安排。",
  },
];

const LOAN_KPI = {
  balanceWanYi: 1.85, // 万亿
  balanceDeltaPct: 12, // %
  nplRate: 0.92, // %
  nplDeltaPct: -0.03, // %
  monthNewLendingYi: 450, // 亿
};

const LOAN_AI_BRIEF =
  "AI 助手检测到本月『绿色贷款』投放进度较快，主要受华东地区新能源项目集中入库带动，建议关注后续资本占用情况。";

const LOAN_INDUSTRY_DIST = [
  { name: "制造业", value: 32 },
  { name: "房地产", value: 18 },
  { name: "普惠", value: 28 },
  { name: "绿色", value: 22 },
];

// 资财指标：一级指标 + 下钻结构（支持详情页、分行对比、分行穿透）
const CAPITAL_ASSET_INDICATORS = [
  {
    id: "rmb-general",
    name: "人民币一般贷款",
    target: 12000,
    actual: 11580,
    unit: "亿元",
    children: [
      { id: "corp", name: "公司贷款 (含经营贷、商票直贴)", value: 6820, target: 7000, unit: "亿元", indent: 1 },
      { id: "retail", name: "零售条线 (含信用卡)", value: 3560, target: 3680, unit: "亿元", indent: 1 },
      { id: "village", name: "村行回迁", value: 1200, target: 1180, unit: "亿元", indent: 1 },
    ],
    branchRanking: [
      { branchId: "shenzhen", branchName: "深圳分行", actual: 1820, target: 1850, achievePct: 98.4 },
      { branchId: "shanghai", branchName: "上海分行", actual: 2100, target: 2050, achievePct: 102.4 },
      { branchId: "beijing", branchName: "北京分行", actual: 1680, target: 1720, achievePct: 97.7 },
      { branchId: "hangzhou", branchName: "杭州分行", actual: 980, target: 1000, achievePct: 98.0 },
      { branchId: "guangzhou", branchName: "广州分行", actual: 1200, target: 1180, achievePct: 101.7 },
    ],
  },
  {
    id: "bill-finance",
    name: "票据融资（不含商票直贴）",
    target: 850,
    actual: 820,
    unit: "亿元",
    children: [
      { id: "bill-inner", name: "票据融资（行内口径）", value: 820, target: 850, unit: "亿元", indent: 1 },
    ],
    branchRanking: [
      { branchId: "shanghai", branchName: "上海分行", actual: 180, target: 175, achievePct: 102.9 },
      { branchId: "shenzhen", branchName: "深圳分行", actual: 120, target: 125, achievePct: 96.0 },
      { branchId: "beijing", branchName: "北京分行", actual: 150, target: 155, achievePct: 96.8 },
      { branchId: "hangzhou", branchName: "杭州分行", actual: 95, target: 98, achievePct: 96.9 },
      { branchId: "guangzhou", branchName: "广州分行", actual: 110, target: 108, achievePct: 101.9 },
    ],
  },
  {
    id: "interbank",
    name: "同业借款",
    target: 420,
    actual: 398,
    unit: "亿元",
    children: [
      { id: "interbank-inner", name: "同业借款（全行）", value: 398, target: 420, unit: "亿元", indent: 1 },
    ],
    branchRanking: [
      { branchId: "beijing", branchName: "北京分行", actual: 85, target: 88, achievePct: 96.6 },
      { branchId: "shanghai", branchName: "上海分行", actual: 72, target: 75, achievePct: 96.0 },
      { branchId: "shenzhen", branchName: "深圳分行", actual: 58, target: 60, achievePct: 96.7 },
      { branchId: "guangzhou", branchName: "广州分行", actual: 45, target: 46, achievePct: 97.8 },
      { branchId: "hangzhou", branchName: "杭州分行", actual: 38, target: 40, achievePct: 95.0 },
    ],
  },
  {
    id: "foreign-currency",
    name: "外币贷款",
    target: 680,
    actual: 652,
    unit: "亿元",
    children: [
      { id: "fx-domestic", name: "外币贷款-境内外币 (离岸+在岸)", value: 420, target: 440, unit: "亿元", indent: 1 },
      { id: "fx-overseas", name: "外币贷款-海外分行", value: 232, target: 240, unit: "亿元", indent: 1 },
    ],
    branchRanking: [
      { branchId: "shanghai", branchName: "上海分行", actual: 185, target: 190, achievePct: 97.4 },
      { branchId: "shenzhen", branchName: "深圳分行", actual: 128, target: 125, achievePct: 102.4 },
      { branchId: "beijing", branchName: "北京分行", actual: 95, target: 98, achievePct: 96.9 },
      { branchId: "guangzhou", branchName: "广州分行", actual: 88, target: 85, achievePct: 103.5 },
      { branchId: "hangzhou", branchName: "杭州分行", actual: 52, target: 55, achievePct: 94.5 },
    ],
  },
];

// 分行穿透：某分行在某资财指标下的最末端细分（示例）
const CAPITAL_ASSET_BRANCH_LEAVES = {
  "rmb-general": {
    shenzhen: [
      { name: "公司一般贷款 (不含经营贷)", value: 420, unit: "亿元" },
      { name: "普惠个人经营贷", value: 280, unit: "亿元" },
      { name: "个人按揭贷款", value: 520, unit: "亿元" },
      { name: "消费贷款（其中: 浦闪贷）", value: 180, unit: "亿元" },
      { name: "保理", value: 95, unit: "亿元" },
      { name: "逾期", value: 12, unit: "亿元" },
    ],
    shanghai: [
      { name: "公司一般贷款 (不含经营贷)", value: 580, unit: "亿元" },
      { name: "普惠个人经营贷", value: 320, unit: "亿元" },
      { name: "个人按揭贷款", value: 680, unit: "亿元" },
      { name: "保理", value: 125, unit: "亿元" },
      { name: "逾期", value: 18, unit: "亿元" },
    ],
    beijing: [
      { name: "公司一般贷款 (不含经营贷)", value: 450, unit: "亿元" },
      { name: "个人按揭贷款", value: 520, unit: "亿元" },
      { name: "保理", value: 88, unit: "亿元" },
      { name: "逾期", value: 10, unit: "亿元" },
    ],
    hangzhou: [
      { name: "公司一般贷款 (不含经营贷)", value: 280, unit: "亿元" },
      { name: "普惠个人经营贷", value: 180, unit: "亿元" },
      { name: "个人按揭贷款", value: 320, unit: "亿元" },
      { name: "保理", value: 42, unit: "亿元" },
    ],
    guangzhou: [
      { name: "公司一般贷款 (不含经营贷)", value: 380, unit: "亿元" },
      { name: "个人按揭贷款", value: 420, unit: "亿元" },
      { name: "保理", value: 65, unit: "亿元" },
      { name: "逾期", value: 8, unit: "亿元" },
    ],
  },
  "bill-finance": {
    shenzhen: [{ name: "票据融资（行内）", value: 120, unit: "亿元" }],
    shanghai: [{ name: "票据融资（行内）", value: 180, unit: "亿元" }],
    beijing: [{ name: "票据融资（行内）", value: 150, unit: "亿元" }],
    hangzhou: [{ name: "票据融资（行内）", value: 95, unit: "亿元" }],
    guangzhou: [{ name: "票据融资（行内）", value: 110, unit: "亿元" }],
  },
  "interbank": {
    shenzhen: [{ name: "同业借款", value: 58, unit: "亿元" }],
    shanghai: [{ name: "同业借款", value: 72, unit: "亿元" }],
    beijing: [{ name: "同业借款", value: 85, unit: "亿元" }],
    hangzhou: [{ name: "同业借款", value: 38, unit: "亿元" }],
    guangzhou: [{ name: "同业借款", value: 45, unit: "亿元" }],
  },
  "foreign-currency": {
    shenzhen: [
      { name: "境内外币 (离岸+在岸)", value: 88, unit: "亿元" },
      { name: "海外分行", value: 40, unit: "亿元" },
    ],
    shanghai: [
      { name: "境内外币 (离岸+在岸)", value: 120, unit: "亿元" },
      { name: "海外分行", value: 65, unit: "亿元" },
    ],
    beijing: [
      { name: "境内外币 (离岸+在岸)", value: 95, unit: "亿元" },
    ],
    hangzhou: [{ name: "境内外币 (离岸+在岸)", value: 52, unit: "亿元" }],
    guangzhou: [
      { name: "境内外币 (离岸+在岸)", value: 58, unit: "亿元" },
      { name: "海外分行", value: 30, unit: "亿元" },
    ],
  },
};

const LINKAGE_KPI = {
  ldr: 78, // 存贷比 %
  reflux: 32, // 回流率 %
};

const COMPARE_RANKING = [
  // 前 5
  {
    id: "shenzhen",
    name: "深圳分行",
    achieve: 106,
    trend: [92, 95, 98, 101, 103, 105, 106],
  },
  {
    id: "beijing",
    name: "北京分行",
    achieve: 102,
    trend: [90, 93, 96, 98, 100, 101, 102],
  },
  {
    id: "shanghai",
    name: "上海分行",
    achieve: 99,
    trend: [88, 89, 91, 94, 96, 98, 99],
  },
  {
    id: "hangzhou",
    name: "杭州分行",
    achieve: 96,
    trend: [82, 84, 86, 88, 92, 94, 96],
  },
  {
    id: "nanjing",
    name: "南京分行",
    achieve: 92,
    trend: [78, 80, 81, 84, 87, 90, 92],
  },
  // 后 3
  {
    id: "xian",
    name: "西安分行",
    achieve: 71,
    trend: [80, 79, 78, 76, 74, 72, 71],
  },
  {
    id: "chongqing",
    name: "重庆分行",
    achieve: 66,
    trend: [76, 74, 72, 70, 69, 67, 66],
  },
  {
    id: "kunming",
    name: "昆明分行",
    achieve: 61,
    trend: [70, 69, 68, 66, 64, 62, 61],
  },
];

const ATTR_PRODUCT = [
  "活期存款",
  "定期存款",
  "通知存款",
  "协议存款",
  "协定存款",
  "保证金存款",
  "大额存单",
  "其他存款",
  "国库固定存款",
  "应解汇款及临时存款",
];

const ATTR_CUSTOMER_TYPE = [
  "个人存款",
  "单位存款",
  "金融机构存款",
  "其他存款",
];

const ATTR_ORG = ["零售条线", "对公条线", "同业条线"];

// 稳定的字符串哈希 -> 32 位无符号数
function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// 可复现的随机数（0~1）
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundTo(v, digits) {
  const p = Math.pow(10, digits);
  return Math.round(v * p) / p;
}

// 分行画像：影响“总体方向”和“波动幅度”（用于生成更像业务的差异）
const BRANCH_PROFILE = {
  shenzhen: { bias: 1.0, vol: 1.05 },
  beijing: { bias: 0.8, vol: 0.95 },
  shanghai: { bias: -0.7, vol: 1.1 },
  hangzhou: { bias: 0.6, vol: 0.9 },
  nanjing: { bias: 0.2, vol: 0.85 },
  xian: { bias: -0.8, vol: 1.0 },
  chongqing: { bias: -0.6, vol: 0.95 },
  kunming: { bias: -0.9, vol: 1.05 },
};

function getDimCategories(dimKey) {
  if (dimKey === "product") return ATTR_PRODUCT;
  if (dimKey === "customerType") return ATTR_CUSTOMER_TYPE;
  return ATTR_ORG;
}

function metricConfig(metricKey) {
  // scale：单项贡献的典型量级；digits：展示精度；unit：单位
  if (metricKey === "depAvg") return { scale: 2.2, digits: 1, unit: "亿" };
  if (metricKey === "loanScale") return { scale: 4.5, digits: 1, unit: "亿" };
  if (metricKey === "payRate") return { scale: 0.03, digits: 2, unit: "%" };
  if (metricKey === "npl") return { scale: 0.02, digits: 2, unit: "%" };
  return { scale: 1.0, digits: 1, unit: "" };
}

function generateAttribution(branchId, metricKey, dimKey) {
  const cats = getDimCategories(dimKey);
  const { scale, digits } = metricConfig(metricKey);
  const profile = BRANCH_PROFILE[branchId] || { bias: 0, vol: 1 };
  const rand = mulberry32(hash32(`${branchId}|${metricKey}|${dimKey}`));

  // 目标方向：结合分行画像 + 指标特性
  const metricDir =
    metricKey === "payRate" || metricKey === "npl"
      ? 0.6 // 成本/不良更容易“上行”被关注
      : 0.4;
  const target =
    (profile.bias * (rand() * 0.8 + 0.6) + (rand() * 2 - 1) * 0.3) *
    (scale * metricDir);

  // 生成初始值（保证正负都有，且不同维度分布不同）
  const raw = cats.map((name, idx) => {
    const base = (rand() * 2 - 1) * scale * profile.vol;
    // 让前几项更可能成为主要贡献
    const weight = idx < 3 ? 1.25 : idx < 6 ? 1.0 : 0.8;
    return { name, value: base * weight };
  });

  // 让整体和接近 target（把差额分摊到前两项）
  const sum = raw.reduce((s, x) => s + x.value, 0);
  const delta = target - sum;
  if (raw[0]) raw[0].value += delta * 0.62;
  if (raw[1]) raw[1].value += delta * 0.38;

  // 修正：避免全为同号
  const hasPos = raw.some((x) => x.value > 0);
  const hasNeg = raw.some((x) => x.value < 0);
  if (!hasPos && raw[0]) raw[0].value = Math.abs(raw[0].value) + scale * 0.25;
  if (!hasNeg && raw[raw.length - 1])
    raw[raw.length - 1].value = -Math.abs(raw[raw.length - 1].value) - scale * 0.18;

  return raw.map((x) => ({ name: x.name, value: roundTo(x.value, digits) }));
}

// -----------------------------
// UI Utils
// -----------------------------
function fmtYi(value) {
  // 亿元，保留 1 位小数
  return `${value.toFixed(1)}`;
}

function fmtPct(pct) {
  const n = Number(pct);
  const absN = Math.abs(n);
  const digits = absN >= 10 ? 0 : absN >= 1 ? 1 : 2; // +12%、+0.9%、-0.03%
  const abs = absN.toFixed(digits);
  return `${n >= 0 ? "+" : "-"}${abs}%`;
}

function isUp(pct) {
  return Number(pct) >= 0;
}

function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

// -----------------------------
// 智能预警：本地存储 key 与模拟值
// -----------------------------
const ALERT_STORAGE_KEY = "bank_cockpit_alert_config";
const ALERT_TRIGGERED_KEY = "bank_cockpit_alert_triggered";
const DEFAULT_ALERT_CONFIG = {
  depositOutflow: { enabled: true, thresholdPct: 5 },
  loanNpl: { enabled: true, thresholdPct: 0.3 },
};
const SIMULATED_VALUES = { depositOutflowPct: 6, loanNplPct: 0.4 };

function getAlertConfig() {
  try {
    const raw = localStorage.getItem(ALERT_STORAGE_KEY);
    if (raw) return { ...DEFAULT_ALERT_CONFIG, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_ALERT_CONFIG };
}

function setAlertConfig(config) {
  try {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}
}

function getAlertTriggered() {
  try {
    return localStorage.getItem(ALERT_TRIGGERED_KEY) === "1";
  } catch (_) {}
  return false;
}

function setAlertTriggered(value) {
  try {
    localStorage.setItem(ALERT_TRIGGERED_KEY, value ? "1" : "0");
  } catch (_) {}
}

// 看板生成器：指标库与关联推荐
const DASHBOARD_INDICATORS = [
  { id: "dep_balance", name: "存款余额", unit: "亿元", keywords: "存款 余额" },
  { id: "dep_avg", name: "存款日均", unit: "亿元", keywords: "存款 日均" },
  { id: "dep_pay_rate", name: "存款付息率", unit: "%", keywords: "存款 付息率 成本" },
  { id: "dep_increment", name: "存款增量", unit: "亿元", keywords: "存款 增量" },
  { id: "loan_balance", name: "贷款余额", unit: "亿元", keywords: "贷款 余额" },
  { id: "loan_scale", name: "贷款规模", unit: "亿元", keywords: "贷款 规模" },
  { id: "loan_npl", name: "不良率", unit: "%", keywords: "贷款 不良" },
  { id: "ldr", name: "存贷比", unit: "%", keywords: "存贷比" },
  { id: "reflux", name: "贷款回流率", unit: "%", keywords: "回流" },
];

function getRelatedIndicators(selectedIds) {
  const related = {
    dep_balance: ["dep_pay_rate", "dep_increment"],
    dep_avg: ["dep_pay_rate", "dep_balance"],
    dep_pay_rate: ["dep_balance", "dep_avg"],
    dep_increment: ["dep_balance", "dep_avg"],
    loan_balance: ["loan_npl", "loan_scale"],
    loan_scale: ["loan_npl", "loan_balance"],
    loan_npl: ["loan_balance", "loan_scale"],
    ldr: ["reflux", "dep_balance"],
    reflux: ["ldr", "dep_balance"],
  };
  const out = new Set();
  selectedIds.forEach((id) => (related[id] || []).forEach((r) => out.add(r)));
  return [...out].filter((id) => !selectedIds.includes(id));
}

// -----------------------------
// Components
// -----------------------------
function AppShell({ title, right, children, canBack, onBack }) {

  return html`
    <div
      class="min-h-screen bg-ink"
      style=${{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div class="sticky top-0 z-20 bg-ink/80 backdrop-blur border-b border-line">
        <div class="mx-auto max-w-[520px] px-4 py-3 flex items-center gap-3">
          <button
            class=${cls(
              "w-9 h-9 grid place-items-center rounded-xl border border-line bg-card2/60",
              canBack ? "active:scale-[.98]" : "opacity-0 pointer-events-none"
            )}
            onClick=${onBack}
            aria-label="返回"
          >
            <${ArrowLeft} size=${18} />
          </button>

          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-semibold tracking-wide truncate">
              ${title}
            </div>
            <div class="text-[12px] text-white/60 truncate">
              银行级经营驾驶舱 · H5 Demo
            </div>
          </div>

          <div class="shrink-0">${right}</div>
        </div>
      </div>

      <main class="mx-auto max-w-[520px] px-4 pb-6 pt-4">${children}</main>
    </div>
  `;
}

function Card({ className = "", children, onClick, role, "aria-label": aria }) {
  const clickable = typeof onClick === "function";
  return html`
    <div
      class=${cls(
        "rounded-2xl border border-line bg-gradient-to-b from-card to-card2 shadow-soft",
        clickable ? "cursor-pointer active:scale-[.99] transition" : "",
        className
      )}
      onClick=${onClick}
      role=${role}
      aria-label=${aria}
    >
      ${children}
    </div>
  `;
}

function GlassCard({ className = "", children }) {
  return html`
    <div
      class=${cls(
        "rounded-2xl border border-line bg-white/5 backdrop-blur shadow-soft",
        className
      )}
    >
      ${children}
    </div>
  `;
}

function Switch({ checked, onChange, "aria-label": aria }) {
  return html`
    <button
      role="switch"
      aria-checked=${checked}
      aria-label=${aria}
      class=${cls(
        "relative inline-flex h-7 w-12 shrink-0 rounded-full border transition-colors",
        checked ? "border-accent bg-accent/80" : "border-line bg-white/10"
      )}
      onClick=${() => onChange?.(!checked)}
    >
      <span
        class=${cls(
          "pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow transition-transform translate-y-0.5",
          checked ? "translate-x-6" : "translate-x-0.5"
        )}
      />
    </button>
  `;
}

function Slider({ value, min, max, step, onChange, "aria-label": aria }) {
  return html`
    <div class="flex items-center gap-3">
      <input
        type="range"
        class="flex-1 h-2 rounded-full appearance-none bg-white/10 accent-accent"
        style=${{ min, max, step: step ?? 1 }}
        value=${value}
        onInput=${(e) => onChange?.(Number(e.target.value))}
        aria-label=${aria}
      />
      <span class="w-14 text-right text-[13px] font-medium tabular-nums text-white/90">
        ${typeof value === "number" ? value : min}%
      </span>
    </div>
  `;
}

function SectionTitle({ icon, title, hint }) {
  return html`
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-xl bg-white/5 grid place-items-center border border-line">
          ${icon}
        </div>
        <div class="font-semibold">${title}</div>
      </div>
      ${hint
        ? html`<div class="text-[12px] text-white/60">${hint}</div>`
        : null}
    </div>
  `;
}

function DeltaPill({ pct }) {
  const up = isUp(pct);
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return html`
    <div
      class=${cls(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[12px] border",
        up
          ? "text-bad border-bad/30 bg-bad/10"
          : "text-good border-good/30 bg-good/10"
      )}
    >
      <${Icon} size=${14} />
      <span class="font-medium">${fmtPct(pct)}</span>
    </div>
  `;
}

function KPIStat({ label, value, unit, pct }) {
  return html`
    <div class="flex-1 min-w-0">
      <div class="text-[12px] text-white/60">${label}</div>
      <div class="mt-1 flex items-baseline gap-2">
        <div class="text-[26px] leading-none font-semibold tracking-tight">
          ${value}
        </div>
        <div class="text-[12px] text-white/60">${unit}</div>
      </div>
      <div class="mt-2"><${DeltaPill} pct=${pct} /></div>
    </div>
  `;
}

function KPIStatCompact({ label, value, unit, pct, note }) {
  return html`
    <div class="rounded-2xl border border-line bg-white/5 p-3">
      <div class="text-[12px] text-white/60">${label}</div>
      <div class="mt-1 flex items-baseline gap-2">
        <div class="text-[24px] leading-none font-semibold tracking-tight">
          ${value}
        </div>
        <div class="text-[12px] text-white/60">${unit}</div>
      </div>
      ${typeof pct === "number"
        ? html`<div class="mt-2"><${DeltaPill} pct=${pct} /></div>`
        : note
          ? html`<div class="mt-2 text-[12px] text-white/55">${note}</div>`
          : null}
    </div>
  `;
}

function ListRow({ title, meta, right, onClick }) {
  return html`
    <button
      class="w-full text-left px-4 py-3 flex items-center gap-3 border-t border-line active:bg-white/5"
      onClick=${onClick}
    >
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">${title}</div>
        <div class="text-[12px] text-white/60 truncate">${meta}</div>
      </div>
      <div class="flex items-center gap-2">
        ${right}
        <${ChevronRight} size=${18} class="text-white/50" />
      </div>
    </button>
  `;
}

function Sparkline({ values, stroke = "#60a5fa" }) {
  const data = values.map((v, idx) => ({ idx, v }));
  return html`
    <div class="w-[88px] h-[30px]">
      <${ResponsiveContainer} width="100%" height="100%">
        <${LineChart} data=${data}>
          <${Line}
            type="monotone"
            dataKey="v"
            stroke=${stroke}
            strokeWidth=${2}
            dot=${false}
            isAnimationActive=${false}
          />
        </${LineChart}>
      </${ResponsiveContainer}>
    </div>
  `;
}

function PieCard({ data }) {
  const colors = ["#60a5fa", "#f59e0b"]; // 活期/定期
  const total = data.reduce((s, d) => s + d.value, 0);

  return html`
    <div class="px-4 pb-4">
      <div class="mt-3 h-[220px]">
        <${ResponsiveContainer} width="100%" height="100%">
          <${PieChart}>
            <${Pie}
              data=${data}
              dataKey="value"
              nameKey="name"
              innerRadius=${58}
              outerRadius=${80}
              paddingAngle=${2}
              stroke="rgba(255,255,255,.12)"
            >
              ${data.map(
                (entry, i) =>
                  html`<${Cell}
                    key=${entry.name}
                    fill=${colors[i % colors.length]}
                  />`
              )}
            </${Pie}>
            <${Tooltip}
              contentStyle=${{
                background: "rgba(6,22,47,.92)",
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 12,
                color: "white",
              }}
              itemStyle=${{ color: "white" }}
              formatter=${(v) => [`${v}%`, "占比"]}
            />
          </${PieChart}>
        </${ResponsiveContainer}>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-2">
        ${data.map(
          (d, i) => html`
            <div class="rounded-xl border border-line bg-white/5 px-3 py-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span
                    class="inline-block w-2.5 h-2.5 rounded-full"
                    style=${{ background: colors[i % colors.length] }}
                  ></span>
                  <span class="text-[12px] text-white/70">${d.name}</span>
                </div>
                <span class="text-[12px] text-white/70"
                  >${d.value}%</span
                >
              </div>
              <div class="mt-1 text-[12px] text-white/50">
                口径：占比（合计 ${total}%）
              </div>
            </div>
          `
        )}
      </div>
    </div>
  `;
}

function WarningCard({ text }) {
  return html`
    <div class="px-4 pb-4">
      <div class="mt-3 rounded-2xl border border-warn/30 bg-warn/10 p-4">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 text-warn">
            <${AlertTriangle} size=${18} />
          </div>
          <div class="min-w-0">
            <div class="font-semibold">异常预警</div>
            <div class="mt-1 text-[13px] leading-relaxed text-white/85">
              ${text}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------
// Pages
// -----------------------------
function Home({ navigate }) {
  const alertTriggered = getAlertTriggered();
  const entries = [
    {
      title: "存款总览",
      desc: "余额 / 日均 / 增量 · 支持按机构下钻",
      icon: html`<${PiggyBank} size=${18} class="text-accent" />`,
      to: "/deposit",
    },
    {
      title: "贷款总览",
      desc: "余额 / 投放 / 利差（示例占位）",
      icon: html`<${HandCoins} size=${18} class="text-accent" />`,
      to: "/loan",
    },
    {
      title: "存贷联动",
      desc: "客户 / 产品 / 资金链路（示例占位）",
      icon: html`<${Layers3} size=${18} class="text-accent" />`,
      to: "/linkage",
    },
    {
      title: "分行对比",
      desc: "排名 / 环比 / 结构（示例占位）",
      icon: html`<${GitCompare} size=${18} class="text-accent" />`,
      to: "/compare",
    },
    {
      title: "自定义看板生成器",
      desc: "指标搜索 · 关联推荐 · 画布预览",
      icon: html`<${LayoutDashboard} size=${18} class="text-accent" />`,
      to: "/dashboard-builder",
    },
    {
      title: "智能预警配置",
      desc: "自定义阈值 · 触发提醒",
      icon: html`<${Bell} size=${18} class="text-accent" />`,
      to: "/alert-config",
    },
  ];

  return html`
    <${AppShell}
      title="行长经营分析驾驶舱"
      canBack=${false}
      onBack=${() => navigate("/")}
      right=${html`<div
        class="w-9 h-9 rounded-xl border border-line bg-card2/60 grid place-items-center"
        aria-label="机构"
      >
        <${Landmark} size=${18} class="text-white/80" />
      </div>`}
    >
      <div class="mb-4">
        <div class="text-white/70 text-[13px]">
          重点入口（卡片式）· 手机端适配
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3">
        ${entries.map(
          (e) => html`
            <${Card}
              onClick=${() => navigate(e.to)}
              role="button"
              aria-label=${e.title}
            >
              <div class="p-4 flex items-center gap-3">
                <div
                  class="w-11 h-11 rounded-2xl bg-white/5 border border-line grid place-items-center"
                >
                  ${e.icon}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-semibold">${e.title}</div>
                  <div class="text-[12px] text-white/60 mt-0.5 truncate">
                    ${e.desc}
                  </div>
                </div>
                <div class="text-white/50">
                  <${ChevronRight} size=${18} />
                </div>
              </div>
            </${Card}>
          `
        )}
      </div>

      <div class="mt-4 text-[12px] text-white/50 leading-relaxed">
        提示：本 Demo 重点实现“存款总览 → 按机构下钻 → 分行详情（结构饼图 + 异常预警）”。
      </div>

      <div
        class="fixed right-4 z-30"
        style=${{ bottom: "calc(env(safe-area-inset-bottom) + 18px)" }}
      >
        <button
          class=${cls(
            "w-14 h-14 rounded-full border-2 grid place-items-center shadow-soft backdrop-blur transition-colors",
            alertTriggered
              ? "border-bad bg-bad/90 text-white animate-pulse"
              : "border-line bg-white/5 text-accent"
          )}
          aria-label="AI 助手"
          onClick=${() => navigate("/alert-config")}
        >
          <${Bot} size=${22} />
        </button>
        <div class="text-[11px] text-white/70 mt-1 text-center">
          ${alertTriggered ? "有预警" : "AI 助手"}
        </div>
      </div>
    </${AppShell}>
  `;
}

function DepositOverview({ navigate }) {
  const bank = BANK_DEPOSIT;

  return html`
    <${AppShell} title="存款总览" canBack=${true} onBack=${() => history.back()}>
      <${Card}>
        <div class="p-4">
          <${SectionTitle}
            icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
            title="全行存款 KPI"
            hint="单位：亿元"
          />

          <div class="grid grid-cols-3 gap-3 mt-3">
            <${KPIStat}
              label="余额"
              value=${fmtYi(bank.balance)}
              unit="亿元"
              pct=${bank.balanceDeltaPct}
            />
            <${KPIStat}
              label="日均"
              value=${fmtYi(bank.dailyAvg)}
              unit="亿元"
              pct=${bank.dailyAvgDeltaPct}
            />
            <${KPIStat}
              label="增量"
              value=${fmtYi(bank.increment)}
              unit="亿元"
              pct=${bank.incrementDeltaPct}
            />
          </div>
        </div>
      </${Card}>

      <div class="mt-4">
        <${Card}>
          <div class="p-4 pb-2">
            <${SectionTitle}
              icon=${html`<${Landmark} size=${18} class="text-accent" />`}
              title="按机构下钻"
              hint="点击分行查看详情"
            />
          </div>

          <div class="pb-2">
            ${BRANCHES.map((b) => {
              const up = isUp(b.deltaPct);
              const Icon = up ? ArrowUpRight : ArrowDownRight;
              return html`
                <${ListRow}
                  title=${b.name}
                  meta=${`存款余额 ${fmtYi(b.balance)} 亿元`}
                  right=${html`<div class="flex items-center gap-2">
                    <div
                      class=${cls(
                        "inline-flex items-center gap-1 text-[12px] font-medium",
                        up ? "text-bad" : "text-good"
                      )}
                    >
                      <${Icon} size=${14} />
                      <span>${fmtPct(b.deltaPct)}</span>
                    </div>
                  </div>`}
                  onClick=${() => navigate(`/deposit/${b.id}`)}
                />
              `;
            })}
          </div>
        </${Card}>
      </div>
    </${AppShell}>
  `;
}

const FIVE_DIM_TABS = [
  { key: "history", label: "历史比" },
  { key: "peer", label: "同业比" },
  { key: "self", label: "自身比" },
  { key: "target", label: "目标比" },
  { key: "system", label: "系统内比" },
];

function branchDimChartData(branchId, dimKey) {
  const seed = (branchId + dimKey).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const r = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  if (dimKey === "history") {
    return months.map((name, i) => ({
      name,
      今年: 160 + r(i) * 40,
      去年: 140 + r(i + 10) * 30,
    }));
  }
  if (dimKey === "peer") {
    return months.map((name, i) => ({
      name,
      本行: 18 + r(i) * 4,
      同业平均: 16 + r(i + 5) * 3,
    }));
  }
  if (dimKey === "self") {
    return months.map((name, i) => ({
      name,
      环比: (r(i) * 2 - 1) * 5,
    }));
  }
  if (dimKey === "target") {
    return months.map((name, i) => ({
      name,
      目标: 20,
      实际: 18 + r(i) * 5,
    }));
  }
  if (dimKey === "system") {
    return months.map((name, i) => ({
      name,
      排名: Math.max(1, Math.min(12, Math.round(6 + (r(i) * 2 - 1) * 4))),
    }));
  }
  return [];
}

function BranchDepositDetail({ branchId, navigate }) {
  const branch = useMemo(
    () => BRANCHES.find((b) => b.id === branchId),
    [branchId]
  );
  const [dimTab, setDimTab] = useState("history");
  const chartData = useMemo(
    () => branchDimChartData(branch?.id || "", dimTab),
    [branch?.id, dimTab]
  );

  if (!branch) {
    return html`
      <${AppShell} title="分行详情" canBack=${true} onBack=${() => history.back()}>
        <${Card}>
          <div class="p-4 text-white/70 text-[13px]">未找到该分行。</div>
        </${Card}>
      </${AppShell}>
    `;
  }

  const tooltipStyle = {
    background: "rgba(6,22,47,.92)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    color: "white",
  };

  return html`
    <${AppShell} title=${branch.name} canBack=${true} onBack=${() => history.back()}>
      <${Card}>
        <div class="p-4">
          <${SectionTitle}
            icon=${html`<${PiggyBank} size=${18} class="text-accent" />`}
            title="存款核心指标（示例）"
            hint="单位：亿元"
          />
          <div class="grid grid-cols-2 gap-3 mt-3">
            <div class="rounded-2xl border border-line bg-white/5 p-3">
              <div class="text-[12px] text-white/60">存款余额</div>
              <div class="mt-1 flex items-baseline gap-2">
                <div class="text-[26px] leading-none font-semibold">
                  ${fmtYi(branch.balance)}
                </div>
                <div class="text-[12px] text-white/60">亿元</div>
              </div>
              <div class="mt-2"><${DeltaPill} pct=${branch.deltaPct} /></div>
            </div>
            <div class="rounded-2xl border border-line bg-white/5 p-3">
              <div class="text-[12px] text-white/60">本周贡献（示例）</div>
              <div class="mt-1 text-[26px] leading-none font-semibold">
                ${fmtYi(Math.max(0.1, branch.balance * 0.06))}
              </div>
              <div class="mt-2 text-[12px] text-white/55">
                口径：对全行增量的模拟贡献
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-line">
          <div class="p-4 pb-2">
            <${SectionTitle}
              icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
              title="五大维度下钻"
              hint="切换 Tab 查看对比"
            />
            <div class="flex gap-2 overflow-x-auto pb-1">
              ${FIVE_DIM_TABS.map(
                (t) => html`
                  <button
                    class=${cls(
                      "shrink-0 px-3 py-2 rounded-xl border text-[13px] active:scale-[.99]",
                      dimTab === t.key
                        ? "border-accent/50 bg-accent/15 text-white"
                        : "border-line bg-white/5 text-white/75"
                    )}
                    onClick=${() => setDimTab(t.key)}
                  >
                    ${t.label}
                  </button>
                `
              )}
            </div>
          </div>
          <div class="px-4 pb-4">
            <div class="h-[240px]">
              <${ResponsiveContainer} width="100%" height="100%">
                ${dimTab === "history" || dimTab === "peer" || dimTab === "target"
                  ? html`
                      <${LineChart} data=${chartData} margin=${{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <${CartesianGrid} stroke="rgba(255,255,255,.08)" />
                        <${XAxis} dataKey="name" tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} />
                        <${YAxis} tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} width=${32} />
                        <${Tooltip} contentStyle=${tooltipStyle} />
                        ${dimTab === "history"
                          ? html`
                              <${Line} type="monotone" dataKey="今年" stroke="#60a5fa" strokeWidth=${2} dot=${false} />
                              <${Line} type="monotone" dataKey="去年" stroke="rgba(255,255,255,.5)" strokeWidth=${1.5} dot=${false} strokeDasharray="4 4" />
                            `
                          : dimTab === "peer"
                            ? html`
                                <${Line} type="monotone" dataKey="本行" stroke="#60a5fa" strokeWidth=${2} dot=${false} />
                                <${Line} type="monotone" dataKey="同业平均" stroke="#f59e0b" strokeWidth=${1.5} dot=${false} />
                              `
                            : html`
                                <${Line} type="monotone" dataKey="目标" stroke="rgba(255,255,255,.4)" strokeWidth=${1.5} dot=${false} strokeDasharray="4 4" />
                                <${Line} type="monotone" dataKey="实际" stroke="#10b981" strokeWidth=${2} dot=${false} />
                              `}
                      </${LineChart}>
                    `
                  : dimTab === "self"
                    ? html`
                        <${BarChart} data=${chartData} margin=${{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <${CartesianGrid} stroke="rgba(255,255,255,.08)" horizontal=${false} />
                          <${XAxis} dataKey="name" tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} />
                          <${YAxis} tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} width=${32} />
                          <${Tooltip} contentStyle=${tooltipStyle} formatter=${(v) => [`${Number(v) >= 0 ? "+" : ""}${v}%`, "环比"]} />
                          <${ReferenceLine} y=${0} stroke="rgba(255,255,255,.2)" />
                          <${Bar} dataKey="环比" fill="#60a5fa" radius=${[4, 4, 0, 0]} isAnimationActive=${false} />
                        </${BarChart}>
                      `
                    : html`
                        <${LineChart} data=${chartData} margin=${{ top: 8, right: 8, left: 8, bottom: 8 }}>
                          <${CartesianGrid} stroke="rgba(255,255,255,.08)" />
                          <${XAxis} dataKey="name" tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} />
                          <${YAxis} tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 11 }} axisLine=${false} tickLine=${false} width=${28} domain=${[12, 1]} />
                          <${Tooltip} contentStyle=${tooltipStyle} formatter=${(v) => [`第 ${v} 名`, "排名"]} />
                          <${Line} type="monotone" dataKey="排名" stroke="#60a5fa" strokeWidth=${2} dot=${{ r: 3 }} />
                        </${LineChart}>
                      `}
              </${ResponsiveContainer}>
            </div>
          </div>
        </div>

        <div class="border-t border-line">
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
              title="产品结构"
              hint="活期 / 定期"
            />
          </div>
          <${PieCard} data=${branch.structure} />
        </div>

        <div class="border-t border-line">
          <${WarningCard} text=${branch.warning} />
        </div>
      </${Card}>
    </${AppShell}>
  `;
}

// 资财指标卡片：目标 vs 实际 横向重叠柱状图，支持点击下钻
function CapitalAssetCard({ indicators, onSelect, unit }) {
  const maxVal = Math.max(...indicators.flatMap((i) => [i.target, i.actual]), 1);
  const chartData = indicators.map((i) => ({
    name: i.name,
    id: i.id,
    target: i.target,
    actual: i.actual,
  }));

  return html`
    <div class="mt-4">
      <${Card}>
        <div class="p-4 pb-0">
          <${SectionTitle}
            icon=${html`<div class="w-6 h-0.5 rounded-full bg-accent" />`}
            title="资财指标"
            hint=${"单位：" + (unit || "亿元")}
          />
        </div>
        <div class="px-4 pb-4">
          <div class="space-y-4 mt-3">
            ${chartData.map(
              (d) => html`
                <button
                  class="w-full text-left rounded-xl border border-line bg-white/5 p-3 active:bg-white/8 transition-colors"
                  onClick=${() => onSelect(d.id)}
                  aria-label=${"查看 " + d.name}
                >
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[13px] font-medium text-white/90 truncate flex-1">${d.name}</span>
                    <span class="text-[15px] font-semibold tabular-nums text-white shrink-0"
                      >${d.actual.toLocaleString()} ${unit || "亿"}</span
                    >
                  </div>
                  <div class="h-7 w-full">
                    <${ResponsiveContainer} width="100%" height="100%">
                      <${BarChart}
                        data=${[d]}
                        layout="vertical"
                        margin=${{ top: 0, right: 0, left: 0, bottom: 0 }}
                        barGap=${-24}
                      >
                        <${XAxis}
                          type="number"
                          hide=${true}
                          domain=${[0, maxVal]}
                        />
                        <${YAxis} type="category" dataKey="name" hide=${true} />
                        <${Bar}
                          dataKey="target"
                          fill="rgba(255,255,255,.18)"
                          barSize=${24}
                          radius=${[4, 4, 4, 4]}
                          isAnimationActive=${false}
                        />
                        <${Bar}
                          dataKey="actual"
                          fill="#60a5fa"
                          barSize=${20}
                          radius=${[4, 4, 4, 4]}
                          isAnimationActive=${false}
                        />
                      </${BarChart}>
                    </${ResponsiveContainer}>
                  </div>
                </button>
              `
            )}
          </div>
        </div>
      </${Card}>
    </div>
  `;
}

function LoanOverview({ navigate }) {
  const kpi = LOAN_KPI;
  const chartData = LOAN_INDUSTRY_DIST.map((d) => ({
    name: d.name,
    value: d.value,
  }));

  return html`
    <${AppShell} title="贷款总览" canBack=${true} onBack=${() => history.back()}>
      <div class="sticky top-[66px] z-10">
        <${GlassCard} className="px-4 py-3">
          <div class="flex items-start gap-3">
            <div
              class="w-9 h-9 rounded-xl bg-white/5 border border-line grid place-items-center text-accent"
            >
              <${Bot} size=${18} />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <div class="font-semibold">AI 经营速达</div>
                <span
                  class="text-[11px] px-2 py-0.5 rounded-full border border-line bg-white/5 text-white/70"
                  >实时</span
                >
              </div>
              <div class="mt-1 text-[13px] text-white/80 leading-relaxed">
                ${LOAN_AI_BRIEF}
              </div>
            </div>
          </div>
        </${GlassCard}>
      </div>

      <div class="mt-3">
        <${Card}>
          <div class="p-4">
            <${SectionTitle}
              icon=${html`<${HandCoins} size=${18} class="text-accent" />`}
              title="核心指标"
              hint="口径：全行"
            />

            <div class="grid grid-cols-2 gap-3 mt-3">
              <${KPIStatCompact}
                label="贷款余额"
                value=${kpi.balanceWanYi.toFixed(2)}
                unit="万亿"
                pct=${kpi.balanceDeltaPct}
              />
              <${KPIStatCompact}
                label="不良率"
                value=${kpi.nplRate.toFixed(2)}
                unit="%"
                pct=${kpi.nplDeltaPct}
              />
              <div class="col-span-2">
                <${KPIStatCompact}
                  label="本月新投放"
                  value=${String(kpi.monthNewLendingYi)}
                  unit="亿"
                  note="截至今日 · 口径：投放金额"
                />
              </div>
            </div>
          </div>
        </${Card}>
      </div>

      <${CapitalAssetCard}
        indicators=${CAPITAL_ASSET_INDICATORS}
        unit="亿元"
        onSelect=${(id) => navigate("/loan/capital-asset/" + id)}
      />

      <div class="mt-4">
        <${Card}>
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
              title="贷款按行业分布"
              hint="单位：占比（%）"
            />
          </div>
          <div class="px-4 pb-4">
            <div class="h-[260px] mt-2">
              <${ResponsiveContainer} width="100%" height="100%">
                <${BarChart} data=${chartData} layout="vertical" margin=${{
                  top: 8,
                  right: 8,
                  left: 8,
                  bottom: 8,
                }}>
                  <${CartesianGrid} stroke="rgba(255,255,255,.08)" horizontal=${false} />
                  <${XAxis}
                    type="number"
                    tick=${{ fill: "rgba(255,255,255,.65)", fontSize: 12 }}
                    axisLine=${false}
                    tickLine=${false}
                    domain=${[0, 40]}
                  />
                  <${YAxis}
                    type="category"
                    dataKey="name"
                    tick=${{ fill: "rgba(255,255,255,.80)", fontSize: 12 }}
                    axisLine=${false}
                    tickLine=${false}
                    width=${56}
                  />
                  <${Tooltip}
                    contentStyle=${{
                      background: "rgba(6,22,47,.92)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 12,
                      color: "white",
                    }}
                    itemStyle=${{ color: "white" }}
                    formatter=${(v) => [`${v}%`, "占比"]}
                  />
                  <${Bar}
                    dataKey="value"
                    fill="#60a5fa"
                    radius=${[10, 10, 10, 10]}
                    isAnimationActive=${false}
                  />
                </${BarChart}>
              </${ResponsiveContainer}>
            </div>
          </div>
        </${Card}>
      </div>
    </${AppShell}>
  `;
}

// 资财指标详情页（二级）：细分指标（实际 vs 目标）+ 分行对比
function CapitalAssetDetail({ indicatorId, navigate }) {
  const indicator = CAPITAL_ASSET_INDICATORS.find((i) => i.id === indicatorId);
  if (!indicator) {
    return html`<${AppShell} title="资财指标" canBack=${true} onBack=${() => history.back()}>
      <div class="p-4 text-white/70">未找到该指标</div>
    </${AppShell}>`;
  }

  const childrenWithTarget = indicator.children.map((c) => {
    const actual = typeof c.value === "number" ? c.value : 0;
    const target = typeof c.target === "number" ? c.target : actual;
    const achievePct = target > 0 ? Math.round((actual / target) * 1000) / 10 : 100;
    return { ...c, actual, target, achievePct };
  });
  const maxChildVal = Math.max(...childrenWithTarget.flatMap((c) => [c.target, c.actual]), 1);

  return html`
    <${AppShell}
      title=${indicator.name}
      canBack=${true}
      onBack=${() => navigate("/loan")}
    >
      <div class="p-4">
        <${Card}>
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<div class="w-6 h-0.5 rounded-full bg-accent" />`}
              title="细分指标"
              hint=${"单位：" + indicator.unit}
            />
          </div>
          <ul class="divide-y divide-line">
            ${childrenWithTarget.map(
              (c) => html`
                <li
                  class="px-4 py-3"
                  style=${c.indent ? { paddingLeft: `${12 + (c.indent || 0) * 16}px` } : {}}
                >
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class="text-[13px] text-white/90 flex-1 min-w-0 truncate">${c.name}</span>
                    ${c.target != null
                      ? html`
                          <span class="text-[12px] text-white/70 shrink-0">
                            实际 ${c.actual.toLocaleString()} / 目标 ${c.target.toLocaleString()} ${c.unit || indicator.unit}
                            · 达成
                            <span class=${c.achievePct >= 100 ? "text-good font-medium" : "text-warn font-medium"}>
                              ${c.achievePct}%
                            </span>
                          </span>
                        `
                      : html`
                          <span class="text-[13px] font-semibold tabular-nums text-white/90 shrink-0">
                            ${typeof c.value === "number" ? c.value.toLocaleString() : c.value} ${c.unit || indicator.unit}
                          </span>
                        `}
                  </div>
                  ${c.target != null
                    ? html`
                        <div class="h-6 w-full">
                          <${ResponsiveContainer} width="100%" height="100%">
                            <${BarChart}
                              data=${[{ name: c.name, target: c.target, actual: c.actual }]}
                              layout="vertical"
                              margin=${{ top: 0, right: 0, left: 0, bottom: 0 }}
                              barGap=${-20}
                            >
                              <${XAxis} type="number" hide=${true} domain=${[0, maxChildVal]} />
                              <${YAxis} type="category" dataKey="name" hide=${true} />
                              <${Bar}
                                dataKey="target"
                                fill="rgba(255,255,255,.18)"
                                barSize=${20}
                                radius=${[4, 4, 4, 4]}
                                isAnimationActive=${false}
                              />
                              <${Bar}
                                dataKey="actual"
                                fill="#60a5fa"
                                barSize=${16}
                                radius=${[4, 4, 4, 4]}
                                isAnimationActive=${false}
                              />
                            </${BarChart}>
                          </${ResponsiveContainer}>
                        </div>
                      `
                    : null}
                </li>
              `
            )}
          </ul>
        </${Card}>
      </div>

      <div class="mt-3 px-4">
        <${Card}>
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<${GitCompare} size=${18} class="text-accent" />`}
              title="分行对比"
              hint="达成进度"
            />
          </div>
          <ul class="divide-y divide-line">
            ${indicator.branchRanking.map(
              (b) => html`
                <li>
                  <${ListRow}
                    title=${b.branchName}
                    meta=${"实际 " + b.actual + " / 目标 " + b.target + " " + indicator.unit + " · 达成 " + b.achievePct.toFixed(1) + "%"}
                    right=${html`
                      <span class=${b.achievePct >= 100 ? "text-good" : "text-warn"}>
                        ${b.achievePct >= 100 ? "达标" : "未达标"}
                      </span>
                    `}
                    onClick=${() => navigate("/loan/capital-asset/" + indicatorId + "/branch/" + b.branchId)}
                  />
                </li>
              `
            )}
          </ul>
        </${Card}>
      </div>
    </${AppShell}>
  `;
}

// 资财指标 · 分行穿透（三级）：该分行下最末端细分
function CapitalAssetBranch({ indicatorId, branchId, navigate }) {
  const indicator = CAPITAL_ASSET_INDICATORS.find((i) => i.id === indicatorId);
  const leavesByBranch = CAPITAL_ASSET_BRANCH_LEAVES[indicatorId];
  const leaves = (leavesByBranch && leavesByBranch[branchId]) || [];
  const branchName =
    indicator?.branchRanking?.find((b) => b.branchId === branchId)?.branchName || branchId;

  if (!indicator) {
    return html`<${AppShell} title="分行穿透" canBack=${true} onBack=${() => history.back()}>
      <div class="p-4 text-white/70">未找到该指标</div>
    </${AppShell}>`;
  }

  return html`
    <${AppShell}
      title=${branchName + " · " + indicator.name}
      canBack=${true}
      onBack=${() => navigate("/loan/capital-asset/" + indicatorId)}
    >
      <div class="p-4">
        <${Card}>
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
              title="末端细分指标"
              hint=${"单位：亿元"}
            />
          </div>
          ${leaves.length
            ? html`
                <ul class="divide-y divide-line">
                  ${leaves.map(
                    (l) => html`
                      <li class="px-4 py-3 flex items-center justify-between">
                        <span class="text-[13px] text-white/90">${l.name}</span>
                        <span class="text-[13px] font-semibold tabular-nums text-white/90"
                          >${typeof l.value === "number" ? l.value.toLocaleString() : l.value} ${l.unit || "亿元"}</span
                        >
                      </li>
                    `
                  )}
                </ul>
              `
            : html`
                <div class="px-4 py-6 text-center text-[13px] text-white/60">
                  该分行暂无更细维度数据
                </div>
              `}
        </${Card}>
      </div>
    </${AppShell}>
  `;
}

function Linkage() {
  const funnelData = [
    { name: "贷款发放", value: 100, fill: "rgba(96,165,250,.9)" },
    { name: "资金回流", value: 58, fill: "rgba(245,158,11,.85)" },
    { name: "存款留存", value: LINKAGE_KPI.reflux, fill: "rgba(16,185,129,.85)" },
  ];

  return html`
    <${AppShell} title="存贷联动" canBack=${true} onBack=${() => history.back()}>
      <${Card}>
        <div class="p-4">
          <${SectionTitle}
            icon=${html`<${GitCompare} size=${18} class="text-accent" />`}
            title="联动概览"
            hint="口径：全行"
          />
          <div class="grid grid-cols-2 gap-3 mt-3">
            <${KPIStatCompact}
              label="存贷比"
              value=${String(LINKAGE_KPI.ldr)}
              unit="%"
              note="建议区间：70%~85%"
            />
            <${KPIStatCompact}
              label="贷款回流率"
              value=${String(LINKAGE_KPI.reflux)}
              unit="%"
              note="口径：回流至本行存款"
            />
          </div>
        </div>

        <div class="border-t border-line">
          <div class="p-4">
            <${GlassCard} className="p-4">
              <div class="flex items-center gap-2">
                <div class="text-accent"><${Sparkles} size=${18} /></div>
                <div class="font-semibold">AI 深度归因</div>
              </div>

              <div class="mt-3 space-y-2 text-[13px] text-white/80 leading-relaxed">
                <div>
                  <span class="text-white/60">异常波动：</span>
                  近期存款流失 <span class="text-warn font-semibold">120亿</span>。
                </div>
                <div>
                  <span class="text-white/60">因子分析：</span>
                  AI 识别出主要因子为「季末理财搬家（贡献度 60%）」及「大型企业派薪（贡献度 25%）」。
                </div>
                <div>
                  <span class="text-white/60">建议动作：</span>
                  建议加强对公结算产品的线上营销，留存活期资金。
                </div>
              </div>
            </${GlassCard}>
          </div>
        </div>

        <div class="border-t border-line">
          <div class="p-4 pb-0">
            <${SectionTitle}
              icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
              title="资金链路（示意）"
              hint="漏斗图"
            />
          </div>
          <div class="px-4 pb-4">
            <div class="h-[240px] mt-2">
              <${ResponsiveContainer} width="100%" height="100%">
                <${FunnelChart}>
                  <${Tooltip}
                    contentStyle=${{
                      background: "rgba(6,22,47,.92)",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 12,
                      color: "white",
                    }}
                    itemStyle=${{ color: "white" }}
                    formatter=${(v) => [`${v}%`, "比例"]}
                  />
                  <${Funnel}
                    data=${funnelData}
                    dataKey="value"
                    isAnimationActive=${false}
                  >
                    <${LabelList}
                      position="right"
                      dataKey="name"
                      fill="rgba(255,255,255,.85)"
                      fontSize=${12}
                    />
                  </${Funnel}>
                </${FunnelChart}>
              </${ResponsiveContainer}>
            </div>
            <div class="text-[12px] text-white/55">
              注：为 Demo 示意图，体现“发放 → 回流 → 留存”链路。
            </div>
          </div>
        </div>
      </${Card}>
    </${AppShell}>
  `;
}

function AttributionPanel({ branch, onClose }) {
  const METRICS = [
    { key: "depAvg", label: "存款日均", unit: "亿" },
    { key: "payRate", label: "付息率", unit: "%" },
    { key: "loanScale", label: "贷款规模", unit: "亿" },
    { key: "npl", label: "不良率", unit: "%" },
  ];

  const DIMS = [
    { key: "org", label: "板块维度" },
    { key: "customerType", label: "客户类型维度" },
    { key: "product", label: "产品维度" },
  ];

  const [visible, setVisible] = useState(false);
  const [metricKey, setMetricKey] = useState("depAvg");
  const [dimKey, setDimKey] = useState("product");

  useEffect(() => {
    // 触发从右向左滑入
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, [branch?.id]);

  const metric = METRICS.find((m) => m.key === metricKey) || METRICS[0];
  const dim = DIMS.find((d) => d.key === dimKey) || DIMS[0];
  const metricMeta = metricConfig(metricKey);

  const rawItems = useMemo(
    () => generateAttribution(branch.id, metricKey, dimKey),
    [branch.id, metricKey, dimKey]
  );

  const items = useMemo(() => {
    // 按贡献绝对值排序
    return [...rawItems].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [rawItems]);

  const sum = useMemo(
    () => items.reduce((s, it) => s + Number(it.value || 0), 0),
    [items]
  );

  const conclusion = useMemo(() => {
    const top = items.slice(0, 2).map((x) => `『${x.name}』`).join("及");
    if (!top) return "分析结论：暂无足够数据生成结论。";

    if (metricKey === "payRate") {
      return `分析结论：该分行存款成本${sum >= 0 ? "上升" : "下降"}，主要受${top}影响。`;
    }
    if (metricKey === "npl") {
      return `分析结论：该分行不良率${sum >= 0 ? "抬升" : "回落"}，主要受${top}影响。`;
    }
    if (metricKey === "loanScale") {
      return `分析结论：该分行贷款规模${sum >= 0 ? "增长" : "回落"}，主要受${top}影响。`;
    }
    return `分析结论：该分行${metric.label}${sum >= 0 ? "上升" : "下降"}，主要受${top}影响。`;
  }, [items, metricKey, metric.label, sum]);

  const close = () => {
    setVisible(false);
    window.setTimeout(() => onClose?.(), 260);
  };

  const getBarFill = (v) =>
    Number(v) >= 0 ? "url(#gradPos)" : "url(#gradNeg)";

  const fmtContribution = (v) => {
    const n = Number(v);
    const sign = n >= 0 ? "+" : "";
    const digits = metricMeta.digits ?? 1;
    return `${sign}${n.toFixed(digits)}${metricMeta.unit}`;
  };

  const domain = useMemo(() => {
    if (items.length === 0) return [-1, 1];
    const min = Math.min(...items.map((d) => Number(d.value)));
    const max = Math.max(...items.map((d) => Number(d.value)));
    // 给一点边距
    const pad = Math.max(Math.abs(min), Math.abs(max)) * 0.25 || 0.5;
    return [min - pad, max + pad];
  }, [items]);

  return html`
    <div class="fixed inset-0 z-50">
      <button
        class="absolute inset-0 bg-black/45"
        onClick=${close}
        aria-label="关闭"
      ></button>

      <div
        class=${cls(
          "absolute inset-y-0 right-0 w-full max-w-[520px] border-l border-line bg-ink/90 backdrop-blur shadow-soft transition-transform duration-300 ease-out",
          visible ? "translate-x-0" : "translate-x-full"
        )}
        style=${{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div class="h-full flex flex-col">
          <div class="sticky top-0 z-10 bg-ink/70 backdrop-blur border-b border-line">
            <div class="px-4 py-3 flex items-center gap-3">
              <button
                class="w-9 h-9 grid place-items-center rounded-xl border border-line bg-white/5 active:scale-[.98]"
                onClick=${close}
                aria-label="返回"
              >
                <${ArrowLeft} size=${18} />
              </button>
              <div class="min-w-0">
                <div class="text-[13px] text-white/60">当前分析</div>
                <div class="font-semibold truncate">${branch.name}</div>
              </div>
              <div class="ml-auto text-accent flex items-center gap-2">
                <${Sparkles} size=${18} />
                <span class="text-[12px] text-white/70">智能归因</span>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-auto px-4 pb-6 pt-4">
            <${GlassCard} className="p-3">
              <div class="text-[12px] text-white/60">核心指标切换</div>
              <div class="mt-2 flex gap-2 overflow-x-auto pb-1">
                ${METRICS.map((m) => {
                  const active = m.key === metricKey;
                  return html`
                    <button
                      class=${cls(
                        "shrink-0 px-3 py-2 rounded-xl border text-[13px] active:scale-[.99]",
                        active
                          ? "border-accent/50 bg-accent/15 text-white"
                          : "border-line bg-white/5 text-white/75"
                      )}
                      onClick=${() => setMetricKey(m.key)}
                    >
                      ${m.label}
                    </button>
                  `;
                })}
              </div>
            </${GlassCard}>

            <div class="mt-3">
              <${Card}>
                <div class="p-4 pb-2">
                  <${SectionTitle}
                    icon=${html`<${BarChart3} size=${18} class="text-accent" />`}
                    title="下钻维度看板"
                    hint=${`${dim.label} · 贡献度排名`}
                  />

                  <div class="mt-2 flex gap-2">
                    ${DIMS.map((d) => {
                      const active = d.key === dimKey;
                      return html`
                        <button
                          class=${cls(
                            "flex-1 px-3 py-2 rounded-xl border text-[13px] active:scale-[.99]",
                            active
                              ? "border-accent/50 bg-accent/15 text-white"
                              : "border-line bg-white/5 text-white/75"
                          )}
                          onClick=${() => setDimKey(d.key)}
                        >
                          ${d.label}
                        </button>
                      `;
                    })}
                  </div>
                </div>

                <div class="px-4 pb-4">
                  <div class="text-[12px] text-white/55">
                    说明：条形图使用渐变色区分贡献正负（+ 红 / - 绿）
                  </div>
                  <div class="mt-2 max-h-[320px] overflow-y-auto pr-1">
                    <div style=${{ height: Math.max(280, items.length * 34) }}>
                      <${ResponsiveContainer} width="100%" height="100%">
                        <${BarChart}
                          data=${items}
                          layout="vertical"
                          margin=${{ top: 8, right: 12, left: 8, bottom: 8 }}
                        >
                        <defs>
                          <linearGradient id="gradPos" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgba(239,68,68,.25)" />
                            <stop offset="100%" stopColor="rgba(239,68,68,.95)" />
                          </linearGradient>
                          <linearGradient id="gradNeg" x1="1" y1="0" x2="0" y2="0">
                            <stop offset="0%" stopColor="rgba(16,185,129,.25)" />
                            <stop offset="100%" stopColor="rgba(16,185,129,.95)" />
                          </linearGradient>
                        </defs>

                        <${CartesianGrid}
                          stroke="rgba(255,255,255,.08)"
                          horizontal=${false}
                        />
                        <${XAxis}
                          type="number"
                          domain=${domain}
                          tick=${{
                            fill: "rgba(255,255,255,.60)",
                            fontSize: 12,
                          }}
                          axisLine=${false}
                          tickLine=${false}
                        />
                        <${YAxis}
                          type="category"
                          dataKey="name"
                          width=${74}
                          tick=${{
                            fill: "rgba(255,255,255,.80)",
                            fontSize: 12,
                          }}
                          axisLine=${false}
                          tickLine=${false}
                        />
                        <${ReferenceLine} x=${0} stroke="rgba(255,255,255,.18)" />
                        <${Tooltip}
                          contentStyle=${{
                            background: "rgba(6,22,47,.92)",
                            border: "1px solid rgba(255,255,255,.12)",
                            borderRadius: 12,
                            color: "white",
                          }}
                          itemStyle=${{ color: "white" }}
                          formatter=${(v) => [fmtContribution(v), "贡献值"]}
                          labelFormatter=${(name) => `${dim.label}：${name}`}
                        />
                        <${Bar} dataKey="value" isAnimationActive=${false} radius=${[10, 10, 10, 10]}>
                          ${items.map(
                            (it) =>
                              html`<${Cell} key=${it.name} fill=${getBarFill(it.value)} />`
                          )}
                        </${Bar}>
                        </${BarChart}>
                      </${ResponsiveContainer}>
                    </div>
                  </div>
                </div>
              </${Card}>
            </div>
          </div>

          <div class="sticky bottom-0 z-10 bg-ink/60 backdrop-blur border-t border-line">
            <div class="px-4 py-3">
              <${GlassCard} className="p-4">
                <div class="flex items-center gap-2">
                  <div class="text-accent"><${Sparkles} size=${18} /></div>
                  <div class="font-semibold">AI 归因结论</div>
                </div>
                <div class="mt-2 text-[13px] text-white/85 leading-relaxed">
                  ${conclusion}
                </div>
                <div class="mt-2 text-[12px] text-white/55">
                  当前：${metric.label} · ${dim.label}
                </div>
              </${GlassCard}>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function Compare() {
  const [assistantBubble, setAssistantBubble] = useState(null);
  const [detailBranch, setDetailBranch] = useState(null);

  const getAchieveStyle = (pct) => {
    if (pct >= 100) return { cls: "text-accent", stroke: "#60a5fa" };
    if (pct >= 90) return { cls: "text-white/85", stroke: "rgba(255,255,255,.75)" };
    if (pct >= 75) return { cls: "text-warn", stroke: "#f59e0b" };
    return { cls: "text-bad", stroke: "#ef4444" };
  };

  return html`
    <${AppShell} title="分行对比" canBack=${true} onBack=${() => history.back()}>
      <${Card}>
        <div class="p-4 pb-2">
          <${SectionTitle}
            icon=${html`<${Landmark} size=${18} class="text-accent" />`}
            title="存款进度排名"
            hint="前 5 / 后 3"
          />
        </div>

        <div class="pb-2">
          ${COMPARE_RANKING.map((b, idx) => {
            const s = getAchieveStyle(b.achieve);
            return html`
              <button
                class="w-full text-left px-4 py-3 flex items-center gap-3 border-t border-line active:bg-white/5"
                onClick=${() => setDetailBranch(b)}
              >
                <div class="w-7 text-[12px] text-white/50 tabular-nums">
                  ${idx + 1}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="font-medium truncate">${b.name}</div>
                  <div class="text-[12px] text-white/60">
                    达成度：
                    <span class=${cls("font-semibold tabular-nums", s.cls)}
                      >${b.achieve}%</span
                    >
                  </div>
                </div>

                <${Sparkline} values=${b.trend} stroke=${s.stroke} />

                <div class="text-white/50">
                  <${ChevronRight} size=${18} />
                </div>
              </button>
            `;
          })}
        </div>
      </${Card}>

      <div
        class="fixed right-4"
        style=${{
          bottom: "calc(env(safe-area-inset-bottom) + 18px)",
        }}
      >
        <div class="flex flex-col items-center gap-1">
          <button
            class="w-14 h-14 rounded-full border border-line bg-white/5 backdrop-blur shadow-soft grid place-items-center active:scale-[.98]"
            aria-label="智能行长助理"
            onClick=${() =>
              setAssistantBubble({
                name: "智能行长助理",
                text: "我可以为你快速定位分行异常、拆解归因，并给出可执行的经营动作建议。",
              })}
          >
            <${Bot} size=${22} class="text-accent" />
          </button>
          <div class="text-[11px] text-white/70">智能行长助理</div>
        </div>
      </div>

      ${assistantBubble
        ? html`
            <button
              class="fixed inset-0 bg-black/40"
              onClick=${() => setAssistantBubble(null)}
              aria-label="关闭"
            ></button>
            <div
              class="fixed left-1/2 -translate-x-1/2 w-[min(520px,calc(100vw-32px))]"
              style=${{
                bottom: "calc(env(safe-area-inset-bottom) + 92px)",
              }}
            >
              <${GlassCard} className="p-4">
                <div class="flex items-center gap-2">
                  <div class="text-accent"><${Sparkles} size=${18} /></div>
                  <div class="font-semibold truncate">AI 洞察 · ${assistantBubble.name}</div>
                </div>
                <div class="mt-2 text-[13px] text-white/80 leading-relaxed">
                  ${assistantBubble.text}
                </div>
              </${GlassCard}>
            </div>
          `
        : null}

      ${detailBranch
        ? html`<${AttributionPanel}
            branch=${detailBranch}
            onClose=${() => setDetailBranch(null)}
          />`
        : null}
    </${AppShell}>
  `;
}

function DashboardBuilder() {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [focusSearch, setFocusSearch] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return DASHBOARD_INDICATORS.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.keywords.split(" ").some((k) => k.includes(q) || q.includes(k))
    );
  }, [query]);

  const relatedIds = useMemo(
    () => getRelatedIndicators(selectedIds),
    [selectedIds]
  );
  const relatedItems = relatedIds.map((id) =>
    DASHBOARD_INDICATORS.find((i) => i.id === id)
  ).filter(Boolean);

  const addIndicator = (id) => {
    if (!selectedIds.includes(id)) setSelectedIds([...selectedIds, id]);
    setQuery("");
    setFocusSearch(false);
  };

  const removeIndicator = (id) => {
    setSelectedIds(selectedIds.filter((x) => x !== id));
  };

  const selectedItems = selectedIds
    .map((id) => DASHBOARD_INDICATORS.find((i) => i.id === id))
    .filter(Boolean);

  return html`
    <${AppShell} title="自定义看板生成器" canBack=${true} onBack=${() => history.back()}>
      <div class="relative">
        <div class="flex items-center gap-2 rounded-2xl border border-line bg-white/5 px-4 py-3">
          <${Search} size=${20} class="text-white/50" />
          <input
            type="text"
            class="flex-1 min-w-0 bg-transparent text-white placeholder-white/50 outline-none text-[15px]"
            placeholder="搜索指标，如：存款、付息率"
            value=${query}
            onInput=${(e) => setQuery(e.target.value)}
            onFocus=${() => setFocusSearch(true)}
          />
        </div>
        ${query.trim() && suggestions.length > 0
          ? html`
              <div class="absolute left-0 right-0 top-full mt-1 rounded-2xl border border-line bg-card shadow-soft overflow-hidden z-10">
                ${suggestions.slice(0, 6).map(
                  (i) => html`
                    <button
                      class="w-full text-left px-4 py-3 flex items-center justify-between border-b border-line last:border-0 active:bg-white/5"
                      onClick=${() => addIndicator(i.id)}
                    >
                      <span class="font-medium">${i.name}</span>
                      <span class="text-[12px] text-white/55">${i.unit}</span>
                    </button>
                  `
                )}
              </div>
            `
          : null}
      </div>

      ${relatedItems.length > 0
        ? html`
            <div class="mt-4">
              <${GlassCard} className="p-4">
                <div class="text-[12px] text-white/60 mb-2">
                  你可能还需要分析的关联指标
                </div>
                <div class="flex flex-wrap gap-2">
                  ${relatedItems.map(
                    (i) => html`
                      <button
                        class="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/5 px-3 py-2 text-[13px] active:scale-[.98]"
                        onClick=${() => addIndicator(i.id)}
                      >
                        <${Plus} size=${14} class="text-accent" />
                        ${i.name}
                      </button>
                    `
                  )}
                </div>
              </${GlassCard}>
            </div>
          `
        : null}

      <div class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold">画布预览</div>
          <div class="text-[12px] text-white/55">点击指标可移除</div>
        </div>
        ${selectedItems.length === 0
          ? html`
              <${GlassCard} className="p-8 text-center">
                <div class="text-white/50 text-[13px]">
                  在上方搜索并添加指标，此处将自动生成组件
                </div>
              </${GlassCard}>
            `
          : html`
              <div class="grid grid-cols-1 gap-3">
                ${selectedItems.map(
                  (i) => html`
                    <${Card}
                      key=${i.id}
                      onClick=${() => removeIndicator(i.id)}
                      role="button"
                      className="cursor-pointer"
                    >
                      <div class="p-4 flex items-center justify-between">
                        <div>
                          <div class="font-medium">${i.name}</div>
                          <div class="text-[12px] text-white/60 mt-1">
                            ${i.unit} · 小组件
                          </div>
                          <div class="mt-2 text-[22px] font-semibold text-accent tabular-nums">
                            ${i.id.includes("dep")
                              ? "1,286.4"
                              : i.id.includes("loan")
                                ? "18,520"
                                : i.id === "ldr"
                                  ? "78"
                                  : i.id === "reflux"
                                    ? "32"
                                    : "—"}
                          </div>
                        </div>
                        <div class="text-white/50">
                          <${X} size={18} />
                        </div>
                      </div>
                    </${Card}>
                  `
                )}
              </div>
            `}
      </div>
    </${AppShell}>
  `;
}

function AlertConfig() {
  const [config, setConfigState] = useState(getAlertConfig);

  useEffect(() => {
    const c = getAlertConfig();
    const triggered =
      (c.depositOutflow?.enabled && SIMULATED_VALUES.depositOutflowPct >= (c.depositOutflow?.thresholdPct ?? 5)) ||
      (c.loanNpl?.enabled && SIMULATED_VALUES.loanNplPct >= (c.loanNpl?.thresholdPct ?? 0.3));
    setAlertTriggered(triggered);
  }, []);

  const setConfig = (key, patch) => {
    const next = { ...config, [key]: { ...config[key], ...patch } };
    setConfigState(next);
    setAlertConfig(next);
    const triggered =
      (next.depositOutflow.enabled &&
        SIMULATED_VALUES.depositOutflowPct >= next.depositOutflow.thresholdPct) ||
      (next.loanNpl.enabled &&
        SIMULATED_VALUES.loanNplPct >= next.loanNpl.thresholdPct);
    setAlertTriggered(triggered);
  };

  return html`
    <${AppShell} title="智能预警配置" canBack=${true} onBack=${() => history.back()}>
      <div class="space-y-4">
        <${GlassCard} className="p-4">
          <div class="text-[12px] text-white/55 mb-3">
            当模拟数据超过阈值时，首页 AI 助手球将变红并闪烁提醒
          </div>
          <div class="rounded-xl border border-line bg-white/5 p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">存款大额流失预警</div>
                <div class="text-[12px] text-white/60">
                  单日流失超过阈值时触发（当前模拟值：${SIMULATED_VALUES.depositOutflowPct}%）
                </div>
              </div>
              <${Switch}
                checked=${config.depositOutflow.enabled}
                onChange=${(v) => setConfig("depositOutflow", { enabled: v })}
                aria-label="开启存款大额流失预警"
              />
            </div>
            <div>
              <div class="text-[12px] text-white/60 mb-2">阈值（%）</div>
              <${Slider}
                value=${config.depositOutflow.thresholdPct}
                min=${1}
                max=${20}
                step=${0.5}
                onChange=${(v) => setConfig("depositOutflow", { thresholdPct: v })}
                aria-label="存款流失阈值"
              />
            </div>
          </div>
        </${GlassCard}>

        <${GlassCard} className="p-4">
          <div class="rounded-xl border border-line bg-white/5 p-4 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium">贷款不良突增预警</div>
                <div class="text-[12px] text-white/60">
                  不良率增幅超过阈值时触发（当前模拟值：${SIMULATED_VALUES.loanNplPct}%）
                </div>
              </div>
              <${Switch}
                checked=${config.loanNpl.enabled}
                onChange=${(v) => setConfig("loanNpl", { enabled: v })}
                aria-label="开启贷款不良突增预警"
              />
            </div>
            <div>
              <div class="text-[12px] text-white/60 mb-2">阈值（%）</div>
              <${Slider}
                value=${config.loanNpl.thresholdPct}
                min=${0.1}
                max=${2}
                step=${0.05}
                onChange=${(v) => setConfig("loanNpl", { thresholdPct: v })}
                aria-label="不良率阈值"
              />
            </div>
          </div>
        </${GlassCard}>

        <div class="text-[12px] text-white/50">
          保存后自动与模拟值比对；若超过阈值，返回首页可见 AI 助手球变红闪烁。
        </div>
      </div>
    </${AppShell}>
  `;
}

function Placeholder({ title }) {
  return html`
    <${AppShell} title=${title} canBack=${true} onBack=${() => history.back()}>
      <${Card}>
        <div class="p-4">
          <${SectionTitle}
            icon=${html`<${Layers3} size=${18} class="text-accent" />`}
            title="页面占位"
            hint="Demo"
          />
          <div class="text-[13px] text-white/70 leading-relaxed">
            该模块在本次 Demo 中作为占位入口（可扩展为贷款/联动/对比分析）。
          </div>
        </div>
      </${Card}>
    </${AppShell}>
  `;
}

function App() {
  const path = useHashRoute();
  const route = useMemo(() => matchRoute(path), [path]);

  const navigate = (to) => setHashPath(to);

  if (route.name === "home") return html`<${Home} navigate=${navigate} />`;
  if (route.name === "deposit")
    return html`<${DepositOverview} navigate=${navigate} />`;
  if (route.name === "branchDeposit")
    return html`<${BranchDepositDetail}
      branchId=${route.params.branchId}
      navigate=${navigate}
    />`;
  if (route.name === "loan") return html`<${LoanOverview} navigate=${navigate} />`;
  if (route.name === "capitalAssetDetail")
    return html`<${CapitalAssetDetail}
      indicatorId=${route.params.indicatorId}
      navigate=${navigate}
    />`;
  if (route.name === "capitalAssetBranch")
    return html`<${CapitalAssetBranch}
      indicatorId=${route.params.indicatorId}
      branchId=${route.params.branchId}
      navigate=${navigate}
    />`;
  if (route.name === "linkage") return html`<${Linkage} />`;
  if (route.name === "compare") return html`<${Compare} />`;
  if (route.name === "dashboardBuilder") return html`<${DashboardBuilder} />`;
  if (route.name === "alertConfig") return html`<${AlertConfig} />`;
  return html`<${Placeholder} title="未找到页面" />`;
}

createRoot(document.getElementById("root")).render(html`<${App} />`);
