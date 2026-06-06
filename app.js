import "./firebase-config.js";

const STORAGE_KEY = "planilha-gastos-multiviews-v1";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const SECTION_LABELS = {
  fixas_mensais: "Despesas fixas mensais",
  assinaturas_mensais: "Assinaturas mensais",
  variaveis_mensais: "Despesas variáveis mensais",
  empresa_mensal: "Empresa mensal",
  empresa_anual: "Empresa anual",
  investimentos: "Investimentos mensais",
  investimentos_anuais: "Investimentos anuais",
  anuais_fixas: "Despesas anuais fixas",
  assinaturas_anuais: "Assinaturas anuais"
};

const SECTION_DEFAULTS = {
  fixas_mensais: { group: "pessoais", recurrence: "mensal", allowAnnual: true, annualSection: "anuais_fixas", monthlySection: "fixas_mensais", isSubscription: false, category: "moradia" },
  assinaturas_mensais: { group: "pessoais", recurrence: "mensal", allowAnnual: true, annualSection: "assinaturas_anuais", monthlySection: "assinaturas_mensais", isSubscription: true, category: "assinaturas" },
  variaveis_mensais: { group: "pessoais", recurrence: "mensal", allowAnnual: false, monthlySection: "variaveis_mensais", isSubscription: false, category: "alimentacao" },
  empresa_mensal: { group: "empresa", recurrence: "mensal", allowAnnual: true, annualSection: "empresa_anual", monthlySection: "empresa_mensal", isSubscription: false, category: "empresa" },
  investimentos: { group: "investimentos", recurrence: "mensal", allowAnnual: true, annualSection: "investimentos_anuais", monthlySection: "investimentos", isSubscription: false, category: "investimentos" },
  investimentos_anuais: { group: "investimentos", recurrence: "anual", allowAnnual: true, annualSection: "investimentos_anuais", monthlySection: "investimentos", isSubscription: false, category: "investimentos" },
  anuais_fixas: { group: "pessoais", recurrence: "anual", allowAnnual: true, annualSection: "anuais_fixas", monthlySection: "fixas_mensais", isSubscription: false, category: "moradia" },
  assinaturas_anuais: { group: "pessoais", recurrence: "anual", allowAnnual: true, annualSection: "assinaturas_anuais", monthlySection: "assinaturas_mensais", isSubscription: true, category: "assinaturas" },
  empresa_anual: { group: "empresa", recurrence: "anual", allowAnnual: true, annualSection: "empresa_anual", monthlySection: "empresa_mensal", isSubscription: false, category: "empresa" }
};

const COLUMNS = [
  {
    title: "Gastos mensais fixos",
    subtitle: "Fixas e assinaturas mensais",
    sections: ["fixas_mensais", "assinaturas_mensais"]
  },
  {
    title: "Gastos mensais variáveis",
    subtitle: "Consumo mensal recorrente",
    sections: ["variaveis_mensais"]
  },
  {
    title: "Gastos anuais",
    subtitle: "Fixas, assinaturas e investimentos",
    sections: ["anuais_fixas", "assinaturas_anuais", "investimentos", "investimentos_anuais"]
  },
  {
    title: "Gastos da Empresa",
    subtitle: "Custos mensais e anuais do CNPJ",
    sections: ["empresa_mensal", "empresa_anual"]
  }
];

function getBaseSection(section) {
  if (section === "anuais_fixas") return "fixas_mensais";
  if (section === "assinaturas_anuais") return "assinaturas_mensais";
  if (section === "empresa_anual") return "empresa_mensal";
  if (section === "investimentos_anuais") return "investimentos";
  return section;
}

function resolveSection(baseSection, recurrence) {
  const defaults = SECTION_DEFAULTS[baseSection] || SECTION_DEFAULTS.fixas_mensais;
  if (recurrence === "anual" && defaults.allowAnnual) return defaults.annualSection || baseSection;
  return defaults.monthlySection || baseSection;
}

function getSectionDefaults(baseSection, recurrence = null) {
  const baseDefaults = SECTION_DEFAULTS[getBaseSection(baseSection)] || SECTION_DEFAULTS.fixas_mensais;
  const finalRecurrence = recurrence || baseDefaults.recurrence;
  const section = resolveSection(getBaseSection(baseSection), finalRecurrence);
  return { ...(SECTION_DEFAULTS[section] || baseDefaults), section };
}


const defaultItems = [];


const STAT_ICONS = {
  essential: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.8V21h14V9.8"/></svg>',
  mandatory: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 7.5V12c0 5 3.8 8.7 9 9 5.2-.3 9-4 9-9V7.5Z"/><path d="m9 12 2 2 4-5"/></svg>',
  ideal: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l3-3 3 2 4-6"/></svg>',
  complete: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3h8l4 4v13a1 1 0 0 1-1.6.8L16 19l-2.4 1.8L11.2 19 8.8 20.8 6.4 19 4 20.8A1 1 0 0 1 3 20V4a1 1 0 0 1 1-1z"/><path d="M8 8h8"/><path d="M8 12h8"/><path d="M8 16h5"/></svg>',
  cartao: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  debito: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-3"/><path d="M3 7h18"/><path d="M15 12h6"/></svg>',
  company: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M13 9v.01"/><path d="M13 12v.01"/><path d="M13 15v.01"/><path d="M17 15v.01"/></svg>',
  investments: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/></svg>',
  annual: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/></svg>',
  annualTotal: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>'
};

function getStatIcon(type) {
  return STAT_ICONS[type] || STAT_ICONS.complete;
}

function normalizeImportance(item = {}) {
  if (item.importance) return item.importance;
  return item.isEssential ? "essential" : "none";
}

function isEssentialItem(item) {
  return item.importance === "essential" || item.importance === "both" || (!item.importance && item.isEssential);
}

function isMandatoryItem(item) {
  return item.importance === "mandatory" || item.importance === "both";
}

function renderImportanceDots(item) {
  const dots = [];
  if (isEssentialItem(item)) dots.push('<span class="importance-dot essential" title="Essencial"></span>');
  if (isMandatoryItem(item)) dots.push('<span class="importance-dot mandatory" title="Obrigatório"></span>');
  return dots.length ? `<span class="importance-dots">${dots.join("")}</span>` : "";
}


const CATEGORY_LABELS = {
  moradia: "Moradia",
  alimentacao: "Alimentação e saúde",
  contas: "Contas e serviços",
  assinaturas: "Assinaturas e softwares",
  transporte: "Transporte",
  impostos: "Impostos e dívidas",
  pet: "Pet",
  lazer: "Lazer e educação",
  empresa: "Empresa",
  investimentos: "Investimentos",
  outros: "Outros"
};

const CATEGORY_ICONS = {
  moradia: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v11h14V10"/><path d="M9 21v-6h6v6"/></svg>',
  alimentacao: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7c1.5-2.2 4-3.2 6-3-0.2 2.4-1.5 4-3.4 5.1"/><path d="M12 7C10.9 5.1 9 4.1 6.8 4c0 2.2 1 4 2.9 5.1"/><path d="M8.4 10.2c-1.6 0-3.4 1.4-3.4 4 0 4.4 3.1 6.8 4.9 6.8 1.1 0 1.8-.6 3.1-.6 1.4 0 2.1.6 3.2.6 1.7 0 4.8-2.4 4.8-6.8 0-2.8-1.9-4-3.5-4-1.3 0-2.3.7-3.1.7-.9 0-1.9-.7-3-.7Z"/></svg>',
  contas: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/><path d="M8.5 6.5a5 5 0 0 1 7 0"/><path d="M10 9a3 3 0 0 1 4 0"/></svg>',
  assinaturas: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  transporte: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2l-2-6H5l-2 6h2"/><path d="M7 17h10"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  impostos: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/><path d="M7 15h.01"/><path d="M11 15h2"/></svg>',
  pet: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 6 0l3 5a3 3 0 0 1-3 4H9a3 3 0 0 1-3-4z"/><circle cx="4" cy="14" r="2"/></svg>',
  lazer: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="6"/></svg>',
  empresa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>',
  investimentos: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
  outros: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>'
};

function normalizeCategory(category, item = {}) {
  const raw = String(category || "").trim().toLowerCase();
  const name = String(item.name || "").toLowerCase();
  const section = item.section || "";

  const direct = {
    "moradia": "moradia",
    "casa": "moradia",
    "moradia / imposto": "moradia",
    "alimentacao": "alimentacao",
    "alimentação": "alimentacao",
    "alimentação e saúde": "alimentacao",
    "alimentação e suplementação": "alimentacao",
    "saude": "alimentacao",
    "saúde": "alimentacao",
    "fitness": "alimentacao",
    "suplementos": "alimentacao",
    "saúde e fitness": "alimentacao",
    "transporte": "transporte",
    "contas": "contas",
    "internet": "contas",
    "internet / telefone": "contas",
    "internet, telefone e utilidades digitais": "contas",
    "celular": "contas",
    "armazenamento": "contas",
    "streaming": "assinaturas",
    "música": "assinaturas",
    "musica": "assinaturas",
    "streaming e mídia": "assinaturas",
    "assinaturas": "assinaturas",
    "assinatura": "assinaturas",
    "ferramentas": "assinaturas",
    "ferramenta": "assinaturas",
    "ferramentas / software": "assinaturas",
    "ferramentas, software e assinaturas": "assinaturas",
    "produtividade": "assinaturas",
    "site / domínio": "assinaturas",
    "impostos": "impostos",
    "impostos / taxas": "impostos",
    "impostos e taxas": "impostos",
    "impostos e dívidas": "impostos",
    "tributos": "impostos",
    "dívida": "impostos",
    "divida": "impostos",
    "dívidas e empréstimos": "impostos",
    "pet": "pet",
    "dino": "pet",
    "lazer": "lazer",
    "educação": "lazer",
    "educacao": "lazer",
    "lazer e educação": "lazer",
    "empresa": "empresa",
    "contabilidade": "empresa",
    "remuneração": "empresa",
    "remuneracao": "empresa",
    "investimentos": "investimentos",
    "reserva": "investimentos",
    "patrimônio": "investimentos",
    "patrimonio": "investimentos"
  };

  if (CATEGORY_LABELS[raw]) return raw;
  if (direct[raw]) return direct[raw];

  if (section.startsWith("empresa")) return "empresa";
  if (section === "investimentos") return "investimentos";
  if (section.includes("assinaturas")) return "assinaturas";

  if (section === "variaveis_mensais") {
    if (name.includes("mercado") || name.includes("whey") || name.includes("creatina") || name.includes("polivit") || name.includes("humana") || name.includes("burnfit")) return "alimentacao";
    if (name.includes("ração") || name.includes("pet")) return "pet";
    if (name.includes("energia")) return "moradia";
  }

  if (name.includes("netflix") || name.includes("max") || name.includes("youtube") || name.includes("spotify") || name.includes("gamepass") || name.includes("amazon prime")) return "assinaturas";
  if (name.includes("google one") || name.includes("brisanet") || name.includes("vivo")) return "contas";
  if (name.includes("adobe") || name.includes("freepik") || name.includes("elementor") || name.includes("ticktick") || name.includes("domínio")) return "assinaturas";
  if (name.includes("iptu") || name.includes("mei") || name.includes("inss") || name.includes("empréstimo")) return "impostos";
  if (name.includes("financiamento") || name.includes("condomínio")) return "moradia";

  return "outros";
}

function getCategoryIcon(category) {
  const key = CATEGORY_ICONS[category] ? category : "outros";
  return CATEGORY_ICONS[key];
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.outros;
}

const startupState = loadState();
let state = cloneAppState(startupState);

const els = {
  loginScreen: document.querySelector("#loginScreen"),
  loginForm: document.querySelector("#loginForm"),
  loginUser: document.querySelector("#loginUser"),
  loginPassword: document.querySelector("#loginPassword"),
  loadingScreen: document.querySelector("#loadingScreen"),
  appMessageDialog: document.querySelector("#appMessageDialog"),
  appMessageIcon: document.querySelector("#appMessageIcon"),
  appMessageTitle: document.querySelector("#appMessageTitle"),
  appMessageText: document.querySelector("#appMessageText"),
  appMessageCancelBtn: document.querySelector("#appMessageCancelBtn"),
  appMessageConfirmBtn: document.querySelector("#appMessageConfirmBtn"),
  logoutBtn: document.querySelector("#logoutBtn"),
  currentYear: document.querySelector("#currentYear"),
  searchInput: document.querySelector("#searchInput"),
  viewSelect: document.querySelector("#viewSelect"),
  manageViewsBtn: document.querySelector("#manageViewsBtn"),
  viewsDialog: document.querySelector("#viewsDialog"),
  closeViewsDialogBtn: document.querySelector("#closeViewsDialogBtn"),
  viewsList: document.querySelector("#viewsList"),
  viewPreview: document.querySelector("#viewPreview"),
  createViewBtn: document.querySelector("#createViewBtn"),
  summaryCards: document.querySelector("#summaryCards"),
  tableTabBtn: document.querySelector("#tableTabBtn"),
  chartsTabBtn: document.querySelector("#chartsTabBtn"),
  tableView: document.querySelector("#tableView"),
  chartsView: document.querySelector("#chartsView"),
  columnsContainer: document.querySelector("#columnsContainer"),
  newItemBtn: document.querySelector("#newItemBtn"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  importJsonInput: document.querySelector("#importJsonInput"),
  resetBtn: document.querySelector("#resetBtn"),
  dialog: document.querySelector("#itemDialog"),
  form: document.querySelector("#itemForm"),
  modalPreview: document.querySelector("#modalPreview"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelBtn: document.querySelector("#cancelBtn"),
  deleteItemBtn: document.querySelector("#deleteItemBtn"),
  modalTitle: document.querySelector("#modalTitle"),
  itemId: document.querySelector("#itemId"),
  name: document.querySelector("#name"),
  importance: document.querySelector("#importance"),
  category: document.querySelector("#category"),
  section: document.querySelector("#section"),
  recurrence: document.querySelector("#recurrence"),
  payment: document.querySelector("#payment"),
  monthlyValue: document.querySelector("#monthlyValue"),
  annualValue: document.querySelector("#annualValue"),
  renewalMonth: document.querySelector("#renewalMonth"),
  monthlyField: document.querySelector("#monthlyField"),
  annualField: document.querySelector("#annualField"),
  renewalField: document.querySelector("#renewalField"),
  columnTemplate: document.querySelector("#columnTemplate"),
  sectionTemplate: document.querySelector("#sectionTemplate")
};

init();

function item(name, group, category, section, recurrence, value, payment, isSubscription, renewalMonth = null, notes = "", importance = null) {
  return {
    id: crypto.randomUUID(),
    name,
    group,
    category,
    section,
    recurrence,
    payment,
    renewalMonth,
    isSubscription,
    notes,
    importance: importance || "none",
    monthlyValue: recurrence === "mensal" ? value : round(value / 12),
    annualValue: recurrence === "anual" ? value : round(value * 12)
  };
}




async function setupLogin() {
  const currentUser = await getAuthConnector().getCurrentUser();

  if (currentUser) {
    await startLoadingSequence(currentUser);
  } else {
    document.body.classList.add("app-locked");
    setTimeout(() => els.loginUser?.focus(), 0);
  }

  els.loginForm?.addEventListener("submit", async event => {
    event.preventDefault();

    const user = els.loginUser.value.trim();
    const password = els.loginPassword.value.trim();

    if (!user || !password) return;

    setLoginLoading(true);

    try {
      const authenticatedUser = await getAuthConnector().login(user, password);
      sessionStorage.setItem("ei-harold-auth", "ok");
      await startLoadingSequence(authenticatedUser);
    } catch (error) {
      console.error(error);
      await showAppAlert({
        title: "Não foi possível entrar",
        message: "Verifique seu e-mail e senha e tente novamente.",
        tone: "danger"
      });
      setLoginLoading(false);
    }
  });

  [els.loginUser, els.loginPassword].forEach(input => {
    input?.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        els.loginForm?.requestSubmit();
      }
    });
  });
}

function getAuthConnector() {
  return window.EI_HAROLD_FIREBASE || {
    async getCurrentUser() {
      return sessionStorage.getItem("ei-harold-auth") === "ok" ? { uid: "local-dev-user" } : null;
    },
    async login(user) {
      return { uid: "local-dev-user", email: user };
    },
    async loadData() {
      return null;
    },
    async saveData() {
      return false;
    },
    async logout() {
      sessionStorage.removeItem("ei-harold-auth");
      return true;
    }
  };
}

function setLoginLoading(isLoading) {
  const button = document.querySelector(".login-button");
  if (!button) return;
  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
}

function getMessageIcon(tone) {
  const icons = {
    danger: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 7.5V12c0 5 3.8 8.7 9 9 5.2-.3 9-4 9-9V7.5Z"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
  };

  return icons[tone] || icons.info;
}

function showAppMessage({ title = "Aviso", message = "", tone = "info", confirmText = "Ok", cancelText = "Cancelar", showCancel = false } = {}) {
  return new Promise(resolve => {
    if (!els.appMessageDialog) {
      resolve(showCancel ? window.confirm(message || title) : (window.alert(message || title), true));
      return;
    }

    let settled = false;

    const settle = value => {
      if (settled) return;
      settled = true;
      cleanup();
      if (els.appMessageDialog.open) els.appMessageDialog.close();
      resolve(value);
    };

    const cleanup = () => {
      els.appMessageConfirmBtn?.removeEventListener("click", onConfirm);
      els.appMessageCancelBtn?.removeEventListener("click", onCancel);
      els.appMessageDialog?.removeEventListener("cancel", onCancel);
      els.appMessageDialog?.removeEventListener("close", onClose);
    };

    const onConfirm = event => {
      event.preventDefault();
      settle(true);
    };
    const onCancel = event => {
      event.preventDefault();
      settle(false);
    };
    const onClose = () => settle(false);

    els.appMessageTitle.textContent = title;
    els.appMessageText.textContent = message;
    els.appMessageIcon.innerHTML = getMessageIcon(tone);
    els.appMessageDialog.dataset.tone = tone;
    els.appMessageConfirmBtn.textContent = confirmText;
    els.appMessageCancelBtn.textContent = cancelText;
    els.appMessageCancelBtn.hidden = !showCancel;

    els.appMessageConfirmBtn?.addEventListener("click", onConfirm);
    els.appMessageCancelBtn?.addEventListener("click", onCancel);
    els.appMessageDialog?.addEventListener("cancel", onCancel);
    els.appMessageDialog?.addEventListener("close", onClose);
    els.appMessageDialog.showModal();
    setTimeout(() => els.appMessageConfirmBtn?.focus(), 0);
  });
}

function showAppAlert(options) {
  return showAppMessage({ confirmText: "Entendi", ...options, showCancel: false });
}

function showAppConfirm(options) {
  return showAppMessage({ confirmText: "Confirmar", cancelText: "Cancelar", tone: "warning", ...options, showCancel: true });
}

async function startLoadingSequence(user) {
  document.body.classList.add("app-locked");
  els.loginScreen?.classList.add("is-hidden");
  els.loadingScreen?.classList.remove("is-hidden");

  try {
    await loadAppData(user);
    unlockApp();
  } catch (error) {
    console.error(error);
    await showAppAlert({
      title: "Falha ao carregar",
      message: "Não foi possível carregar seus dados agora. Tente novamente em instantes.",
      tone: "danger"
    });
    els.loadingScreen?.classList.add("is-hidden");
    els.loginScreen?.classList.remove("is-hidden");
  } finally {
    setLoginLoading(false);
  }
}

async function loadAppData(user) {
  const currentUser = user || { uid: "local-dev-user" };
  const connector = getAuthConnector();

  if (!connector.FIREBASE_ENABLED) {
    state = {
      ...cloneAppState(startupState),
      currentUser
    };
    normalizeLegacyItems(false);
    persistLocalOnly();
    renderViewSelect();
    render();
    return;
  }

  const remoteData = await connector.loadData(currentUser.uid);

  if (hasPersistedViews(remoteData)) {
    state = {
      ...createStateFromPayload(remoteData),
      currentUser
    };
    persistLocalOnly();
    normalizeLegacyItems();
  } else {
    state = {
      ...createEmptyState(),
      currentUser
    };
    normalizeLegacyItems(false);
    persist();
  }

  renderViewSelect();
  render();
}

function unlockApp() {
  document.body.classList.remove("app-locked");
  els.loginScreen?.classList.add("is-hidden");
  els.loadingScreen?.classList.add("is-hidden");
}




function init() {
  MONTHS.forEach(month => els.renewalMonth.add(new Option(month, month)));
  if (els.currentYear) els.currentYear.textContent = new Date().getFullYear();

  els.viewSelect.addEventListener("change", event => {
    state.activeViewId = event.target.value;
    state.activeStatFilter = null;
    persist();
    render();
  });

  els.manageViewsBtn.addEventListener("click", openViewsDialog);
  els.closeViewsDialogBtn.addEventListener("click", closeViewsDialog);
  els.viewsDialog.addEventListener("click", event => {
    if (event.target === els.viewsDialog) closeViewsDialog();
  });
  els.createViewBtn.addEventListener("click", createNewView);
  els.logoutBtn?.addEventListener("click", logoutApp);

  els.tableTabBtn.addEventListener("click", () => setView("table"));
  els.chartsTabBtn.addEventListener("click", () => setView("charts"));

  els.searchInput.addEventListener("input", e => {
    state.search = e.target.value.trim().toLowerCase();
    render();
  });

  els.newItemBtn.addEventListener("click", () => openDialog());
  els.closeDialogBtn.addEventListener("click", closeDialog);
  els.dialog.addEventListener("click", event => {
    if (event.target === els.dialog) closeDialog();
  });
  els.cancelBtn.addEventListener("click", closeDialog);
  els.deleteItemBtn.addEventListener("click", deleteCurrentItem);
  els.section.addEventListener("change", syncSectionRules);
  els.recurrence.addEventListener("change", updateRecurrenceFields);
  [els.name, els.importance, els.category, els.section, els.recurrence, els.payment, els.monthlyValue, els.annualValue, els.renewalMonth].forEach(input => {
    input.addEventListener("input", updateModalPreview);
    input.addEventListener("change", updateModalPreview);
  });
  els.form.addEventListener("submit", saveForm);
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.importJsonInput.addEventListener("change", importJson);
  els.resetBtn.addEventListener("click", resetData);

  setupLogin();
}

function createView(name, items = defaultItems) {
  return {
    id: crypto.randomUUID(),
    name,
    items: items.map(item => ({ ...item, id: crypto.randomUUID() }))
  };
}

function createEmptyState() {
  const firstView = createView("Custo de Vida 2026.1", []);
  return {
    views: [firstView],
    activeViewId: firstView.id,
    search: "",
    activeStatFilter: null
  };
}

function createStateFromPayload(payload) {
  return {
    views: payload.views,
    activeViewId: payload.activeViewId || payload.views[0].id,
    search: "",
    activeStatFilter: null
  };
}

function cloneAppState(source) {
  return createStateFromPayload({
    views: JSON.parse(JSON.stringify(source.views)),
    activeViewId: source.activeViewId
  });
}

function hasPersistedViews(data) {
  return Array.isArray(data?.views) && data.views.length > 0;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const firstView = createView("Custo de Vida 2026.1", defaultItems);
    return {
      views: [firstView],
      activeViewId: firstView.id,
      search: "",
      activeStatFilter: null
    };
  }

  try {
    const data = JSON.parse(raw);

    if (Array.isArray(data)) {
      const migratedView = createView("Custo de Vida 2026.1", data);
      return {
        views: [migratedView],
        activeViewId: migratedView.id,
        search: "",
        activeStatFilter: null
      };
    }

    if (Array.isArray(data.views) && data.views.length) {
      return {
        views: data.views,
        activeViewId: data.activeViewId || data.views[0].id,
        search: "",
        activeStatFilter: null
      };
    }
  } catch {}

  const fallbackView = createView("Custo de Vida 2026.1", defaultItems);
  return {
    views: [fallbackView],
    activeViewId: fallbackView.id,
    search: "",
    activeStatFilter: null
  };
}

function getActiveView() {
  let view = state.views.find(view => view.id === state.activeViewId);
  if (!view) {
    view = state.views[0];
    state.activeViewId = view.id;
  }
  return view;
}

function getItems() {
  return getActiveView().items;
}

function setItems(items) {
  getActiveView().items = items;
  persist();
}

function getPersistPayload() {
  return {
    views: state.views,
    activeViewId: state.activeViewId
  };
}

function persistLocalOnly() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistPayload()));
}

function persist() {
  const payload = getPersistPayload();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  if (state.currentUser?.uid) {
    getAuthConnector().saveData(state.currentUser.uid, payload).catch(error => {
      console.warn("Não foi possível sincronizar com o Firebase ainda.", error);
    });
  }
}

function renderViewSelect() {
  els.viewSelect.innerHTML = state.views
    .map(view => `<option value="${view.id}">${escapeHtml(view.name)}</option>`)
    .join("");

  els.viewSelect.value = state.activeViewId;
  renderViewsList();
}

function renderViewsList() {
  if (!els.viewsList) return;

  const activeView = getActiveView();
  const items = activeView.items || [];
  const monthlyComplete = sum(items, "monthlyValue");
  const annualTotal = monthlyComplete * 12;
  const itemCount = items.length;

  if (els.viewPreview) {
    els.viewPreview.innerHTML = `
      <div class="view-preview-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>
        </svg>
      </div>
      <div class="view-preview-copy">
        <strong>${escapeHtml(activeView.name)}</strong>
        <small>${itemCount} itens • ${moneyBR(monthlyComplete)}/mês • ${moneyBR(annualTotal)}/ano</small>
      </div>
      <span class="view-preview-badge">Atual</span>
    `;
  }

  els.viewsList.innerHTML = state.views.map(view => `
    <article class="view-row ${view.id === state.activeViewId ? "active" : ""}">
      <button type="button" class="view-row-selector" title="Selecionar view" onclick="selectView('${view.id}')"></button>
      <input class="view-name-input" value="${escapeHtml(view.name)}" data-view-id="${view.id}" aria-label="Nome da view">
      <button type="button" class="icon-only" title="Salvar nome" onclick="saveViewName('${view.id}')"><span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span></button>
      <button type="button" class="icon-only" title="Duplicar view" onclick="duplicateViewById('${view.id}')"><span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></span></button>
      <button type="button" class="icon-only danger" title="Excluir view" onclick="removeView('${view.id}')"><span class="btn-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg></span></button>
    </article>
  `).join("");
}

function normalizeLegacyItems(shouldPersist = true) {
  state.views.forEach(view => {
    view.items = view.items.map(i => {
      const section = normalizeSection(i.section || inferSection(i));
      return {
        ...i,
        section,
        category: normalizeCategory(i.category, { ...i, section }),
        importance: normalizeImportance(i)
      };
    });
  });
  if (shouldPersist) persist();
}

function normalizeSection(section) {
  if (section === "empresa") return "empresa_mensal";
  if (section === "variaveis_anuais") return "variaveis_mensais";
  return SECTION_LABELS[section] ? section : "fixas_mensais";
}

function inferSection(i) {
  if (i.group === "empresa") return i.recurrence === "anual" ? "empresa_anual" : "empresa_mensal";
  if (i.group === "investimentos") return "investimentos";
  if (i.recurrence === "anual" && i.isSubscription) return "assinaturas_anuais";
  if (i.recurrence === "anual") return "anuais_fixas";
  if (i.recurrence === "mensal" && i.isSubscription) return "assinaturas_mensais";
  const variableNames = ["Energia", "Mercado", "Whey", "Creatina", "Polivitamínico", "Dino"];
  if (variableNames.some(name => String(i.name).includes(name))) return "variaveis_mensais";
  return "fixas_mensais";
}



function matchesStatFilter(item, filter) {
  if (!filter) return true;

  const rules = {
    essential: i => i.recurrence === "mensal" && isEssentialItem(i),
    mandatory: i => i.recurrence === "mensal" && isMandatoryItem(i),
    ideal: i => i.recurrence === "mensal",
    total: i => true,
    cartao: i => i.payment === "cartao",
    debito: i => i.payment === "debito",
    annual: i => i.recurrence === "anual",
    annualTotal: i => true
  };

  return (rules[filter] || (() => true))(item);
}

function toggleStatFilter(filter) {
  state.activeStatFilter = state.activeStatFilter === filter ? null : filter;
  render();
}

window.toggleStatFilter = toggleStatFilter;


function filteredItems() {
  return getItems().filter(i => {
    const searchMatch = !state.search || `${i.name} ${getCategoryLabel(i.category)} ${SECTION_LABELS[i.section]}`.toLowerCase().includes(state.search);
    const statMatch = matchesStatFilter(i, state.activeStatFilter);
    return searchMatch && statMatch;
  });
}

function render() {
  const items = filteredItems();
  renderSummary(getItems());
  renderColumns(items);
  renderCharts(items);
}

function renderSummary(items) {
  const monthlyEssential = sum(items.filter(i =>
    i.recurrence === "mensal" && isEssentialItem(i)
  ), "monthlyValue");

  const monthlyMandatory = sum(items.filter(i =>
    i.recurrence === "mensal" && isMandatoryItem(i)
  ), "monthlyValue");

  const monthlyIdeal = sum(items.filter(i => i.recurrence === "mensal"), "monthlyValue");

  const annualInstallment = sum(items.filter(i => i.recurrence === "anual"), "monthlyValue");

  const monthlyTotal = sum(items, "monthlyValue");

  const annualTotal = monthlyTotal * 12;

  const credit = sum(items.filter(i => i.payment === "cartao"), "monthlyValue");

  const debit = sum(items.filter(i => i.payment === "debito"), "monthlyValue");

  const stats = [
    ["Mensal essencial", monthlyEssential, "essential", "essential", "Soma dos itens marcados como Essencial e com recorrência mensal."],
    ["Mensal obrigatório", monthlyMandatory, "mandatory", "mandatory", "Soma dos itens marcados como Obrigatório e com recorrência mensal."],
    ["Mensal ideal", monthlyIdeal, "ideal", "ideal", "Soma de todos os itens mensais. Não inclui parcelas mensais de itens anuais."],
    ["Mensal total", monthlyTotal, "complete", "total", "Total mensal provisionado: todos os itens mensais + parcelas mensais dos itens anuais."],
    ["Crédito", credit, "cartao", "cartao", "Soma mensal provisionada dos itens pagos no crédito. Para itens anuais, considera a parcela mensal equivalente."],
    ["Débito", debit, "debito", "debito", "Soma mensal provisionada dos itens pagos no débito. Para itens anuais, considera a parcela mensal equivalente."],
    ["Parcela anual", annualInstallment, "annual", "annual", "Soma das parcelas mensais equivalentes dos gastos anuais. É quanto reservar por mês para pagar os anuais."],
    ["Anual total", annualTotal, "annualTotal", "annualTotal", "Estimativa anual do custo de vida completo: mensal total multiplicado por 12."]
  ];

  els.summaryCards.innerHTML = stats.map(([label, value, type, filter, tooltip]) => `
    <button class="stat ${type} ${state.activeStatFilter === filter ? "active-filter" : ""}" title="${escapeHtml(tooltip)}" type="button" onclick="toggleStatFilter('${filter}')">
      <span class="stat-icon">${getStatIcon(type)}</span>
      <div class="stat-content">
        <span>${label}</span>
        <strong>${moneyBR(value)}</strong>
      </div>
    </button>
  `).join("");
}

function renderColumns(items) {
  els.columnsContainer.innerHTML = "";

  const fixedPanel = {
    title: "Gastos mensais fixos",
    subtitle: "Fixas e assinaturas mensais",
    sections: ["fixas_mensais", "assinaturas_mensais"]
  };

  const variablePanel = {
    title: "Gastos mensais variáveis",
    subtitle: "Consumo mensal recorrente",
    sections: ["variaveis_mensais"]
  };

  const annualPanel = {
    title: "Gastos anuais",
    subtitle: "Fixas e assinaturas anuais",
    sections: ["anuais_fixas", "assinaturas_anuais"]
  };

  const investmentPanel = {
    title: "Investimentos",
    subtitle: "Reservas e patrimônio",
    sections: ["investimentos", "investimentos_anuais"]
  };

  const companyPanel = {
    title: "Gastos da Empresa",
    subtitle: "Custos mensais e anuais do CNPJ",
    sections: ["empresa_mensal", "empresa_anual"]
  };

  els.columnsContainer.appendChild(renderColumnPanel(fixedPanel, items));
  els.columnsContainer.appendChild(renderColumnPanel(variablePanel, items));

  const stackedColumn = document.createElement("div");
  stackedColumn.className = "column-stack";
  stackedColumn.appendChild(renderColumnPanel(annualPanel, items));
  stackedColumn.appendChild(renderColumnPanel(investmentPanel, items));
  els.columnsContainer.appendChild(stackedColumn);

  els.columnsContainer.appendChild(renderColumnPanel(companyPanel, items));
}

function renderColumnPanel(column, items) {
  const columnItems = items.filter(i => column.sections.includes(i.section));
  const node = els.columnTemplate.content.cloneNode(true);
  const panel = node.querySelector(".column");

  panel.dataset.panel = column.title;

  node.querySelector(".column-title").textContent = column.title;
  node.querySelector(".column-subtitle").textContent = column.subtitle;
  node.querySelector(".column-total").innerHTML = `
    ${moneyBR(sum(columnItems, "monthlyValue"))}<br>
    <small>${moneyBR(sum(columnItems, "annualValue"))}/ano</small>
  `;

  const sections = node.querySelector(".sections");
  column.sections.forEach(sectionKey => {
    sections.appendChild(renderSection(sectionKey, columnItems.filter(i => i.section === sectionKey)));
  });

  return node;
}


function renderSection(sectionKey, items) {
  const node = els.sectionTemplate.content.cloneNode(true);
  node.querySelector(".mini-section").dataset.section = sectionKey;
  node.querySelector(".section-title span").textContent = SECTION_LABELS[sectionKey];
  node.querySelector(".section-title strong").textContent = moneyBR(sum(items, "monthlyValue"));
  node.querySelector(".section-add").addEventListener("click", () => openDialog(null, sectionKey));

  const list = node.querySelector(".items");

  if (!items.length) {
    list.innerHTML = `<div class="empty">—</div>`;
    return node;
  }

  list.innerHTML = items
    .sort((a, b) => Number(b.monthlyValue || 0) - Number(a.monthlyValue || 0))
    .map(i => `
      <div class="item-row" title="${escapeHtml(i.notes || i.category || "")}" onclick="editItem('${i.id}')">
        <div class="item-name">
          <span class="category-icon" title="${escapeHtml(getCategoryLabel(i.category))}">${getCategoryIcon(i.category)}</span>
          <div class="item-copy">
            <strong class="item-title">${escapeHtml(i.name)}${renderImportanceDots(i)}</strong>
            <small class="item-meta"><span>${moneyBR(i.annualValue)}/ano</span>${i.recurrence === "anual" ? `<b class="sep">•</b><em>${i.renewalMonth.slice(0,3)}</em>` : ""}</small>
          </div>
        </div>
        <div class="value">${moneyBR(i.monthlyValue)}</div>
        <span class="badge ${i.payment}">${i.payment === "cartao" ? "C" : "D"}</span>

      </div>
    `).join("");

  return node;
}

function openDialog(existing = null, presetSection = null) {
  const existingSection = existing?.section || presetSection || "fixas_mensais";
  const baseSection = getBaseSection(existingSection);
  const recurrence = existing?.recurrence || (SECTION_DEFAULTS[existingSection] || SECTION_DEFAULTS[baseSection] || SECTION_DEFAULTS.fixas_mensais).recurrence;
  const defaults = getSectionDefaults(baseSection, recurrence);

  els.form.reset();
  els.itemId.value = existing?.id || "";
  els.modalTitle.textContent = existing ? "Editar gasto" : "Novo gasto";
  els.deleteItemBtn.style.display = existing ? "" : "none";

  els.section.value = baseSection;
  els.recurrence.value = recurrence;
  els.name.value = existing?.name || "";
  els.importance.value = existing ? normalizeImportance(existing) : "none";
  els.category.value = existing ? normalizeCategory(existing.category, existing) : (defaults.category || "outros");
  els.payment.value = existing?.payment || "debito";
  els.monthlyValue.value = existing?.recurrence === "mensal" ? existing.monthlyValue : "";
  els.annualValue.value = existing?.recurrence === "anual" ? existing.annualValue : "";
  els.renewalMonth.value = existing?.renewalMonth || "Janeiro";

  updateRecurrenceFields();
  updateModalPreview();

  els.name.focus();
  els.dialog.showModal();
}

function closeDialog() {
  els.dialog.close();
}

function syncSectionRules() {
  const baseSection = els.section.value;
  const baseDefaults = SECTION_DEFAULTS[baseSection] || SECTION_DEFAULTS.fixas_mensais;

  if (!baseDefaults.allowAnnual) {
    els.recurrence.value = "mensal";
  }

  if (!els.itemId.value || !els.category.value || els.category.value === "outros") {
    els.category.value = baseDefaults.category || "outros";
  }

  updateRecurrenceFields();
}

function updateRecurrenceFields() {
  const baseSection = els.section.value;
  const baseDefaults = SECTION_DEFAULTS[baseSection] || SECTION_DEFAULTS.fixas_mensais;
  const allowAnnual = Boolean(baseDefaults.allowAnnual);

  if (!allowAnnual) {
    els.recurrence.value = "mensal";
  }

  els.recurrence.disabled = !allowAnnual;
  els.recurrence.closest("label").classList.toggle("disabled-field", !allowAnnual);

  const annual = els.recurrence.value === "anual";

  els.monthlyField.style.display = annual ? "none" : "";
  els.annualField.style.display = annual ? "" : "none";

  els.renewalField.style.display = "";
  els.renewalField.classList.toggle("disabled-field", !annual);
  els.renewalMonth.disabled = !annual;

  els.monthlyValue.required = !annual;
  els.annualValue.required = annual;

  updateModalPreview();
}


function getCurrentModalValues() {
  const baseSection = els.section.value;
  const defaults = getSectionDefaults(baseSection, els.recurrence.value);
  const recurrence = defaults.recurrence;
  const monthly = recurrence === "mensal" ? Number(els.monthlyValue.value || 0) : round(Number(els.annualValue.value || 0) / 12);
  const annual = recurrence === "anual" ? Number(els.annualValue.value || 0) : round(Number(els.monthlyValue.value || 0) * 12);

  return {
    name: els.name.value.trim() || "Nome do item",
    importance: els.importance.value,
    category: normalizeCategory(els.category.value),
    recurrence,
    payment: els.payment.value,
    monthlyValue: monthly,
    annualValue: annual,
    renewalMonth: recurrence === "anual" ? els.renewalMonth.value : null
  };
}

function updateModalPreview() {
  if (!els.modalPreview) return;

  const item = getCurrentModalValues();
  const paymentLabel = item.payment === "cartao" ? "C" : "D";
  const renewal = item.recurrence === "anual" ? `<b class="sep">•</b><em>${item.renewalMonth.slice(0,3)}</em>` : "";

  els.modalPreview.innerHTML = `
    <span class="category-icon preview-icon" title="${escapeHtml(getCategoryLabel(item.category))}">${getCategoryIcon(item.category)}</span>
    <div class="item-copy">
      <strong class="item-title">${escapeHtml(item.name)}${renderImportanceDots(item)}</strong>
      <small class="item-meta"><span>${moneyBR(item.annualValue)}/ano</span>${renewal}</small>
    </div>
    <div class="value">${moneyBR(item.monthlyValue)}</div>
    <span class="badge ${item.payment}">${paymentLabel}</span>
  `;
}


function saveForm(e) {
  e.preventDefault();

  const baseSection = els.section.value;
  const defaults = getSectionDefaults(baseSection, els.recurrence.value);
  const recurrence = defaults.recurrence;
  const section = defaults.section;
  const monthly = recurrence === "mensal" ? Number(els.monthlyValue.value || 0) : round(Number(els.annualValue.value || 0) / 12);
  const annual = recurrence === "anual" ? Number(els.annualValue.value || 0) : round(Number(els.monthlyValue.value || 0) * 12);

  const data = {
    id: els.itemId.value || crypto.randomUUID(),
    name: els.name.value.trim(),
    importance: els.importance.value,
    group: defaults.group,
    category: normalizeCategory(els.category.value),
    section,
    recurrence,
    payment: els.payment.value,
    monthlyValue: monthly,
    annualValue: annual,
    renewalMonth: recurrence === "anual" ? els.renewalMonth.value : null,
    isSubscription: defaults.isSubscription,
    notes: ""
  };

  if (!data.name) return;

  const items = getItems();
  const index = items.findIndex(i => i.id === data.id);
  if (index >= 0) items[index] = data;
  else items.push(data);

  persist();
  closeDialog();
  render();
}

async function deleteCurrentItem() {
  const id = els.itemId.value;
  const existing = getItems().find(i => i.id === id);
  if (!existing) return;

  const confirmed = await showAppConfirm({
    title: "Remover item?",
    message: `O item "${existing.name}" será removido da view atual.`,
    confirmText: "Remover",
    tone: "danger"
  });
  if (!confirmed) return;

  setItems(getItems().filter(i => i.id !== id));
  persist();
  closeDialog();
  render();
}

window.editItem = id => {
  const existing = getItems().find(i => i.id === id);
  if (existing) openDialog(existing);
};

window.deleteItem = async id => {
  const existing = getItems().find(i => i.id === id);
  if (!existing) return;
  const confirmed = await showAppConfirm({
    title: "Remover item?",
    message: `O item "${existing.name}" será removido da view atual.`,
    confirmText: "Remover",
    tone: "danger"
  });
  if (!confirmed) return;
  setItems(getItems().filter(i => i.id !== id));
  persist();
  render();
};

async function resetData() {
  const confirmed = await showAppConfirm({
    title: "Resetar view?",
    message: "A view atual voltará para os dados iniciais. Esta ação não altera as outras views.",
    confirmText: "Resetar",
    tone: "warning"
  });
  if (!confirmed) return;
  getActiveView().items = defaultItems.map(i => ({ ...i, id: crypto.randomUUID() }));
  persist();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify({
    views: state.views,
    activeViewId: state.activeViewId
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "custo-de-vida-views.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importJson(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);

      if (Array.isArray(data.views) && data.views.length) {
        state.views = data.views;
        state.activeViewId = data.activeViewId || data.views[0].id;
      } else if (Array.isArray(data)) {
        getActiveView().items = data;
      } else {
        throw new Error();
      }

      normalizeLegacyItems();
      renderViewSelect();
      render();
      closeViewsDialog();
    } catch {
      showAppAlert({
        title: "Arquivo inválido",
        message: "Não foi possível importar esse arquivo. Verifique se ele é um JSON exportado pelo app.",
        tone: "danger"
      });
    }
    e.target.value = "";
  };
  reader.readAsText(file);
}



function openViewsDialog() {
  renderViewsList();
  els.viewsDialog.showModal();
}

function closeViewsDialog() {
  els.viewsDialog.close();
}

function getNextViewName() {
  let index = 1;
  const names = new Set(state.views.map(view => view.name));
  while (names.has(`View nova ${index}`)) index += 1;
  return `View nova ${index}`;
}

function createNewView() {
  const view = createView(getNextViewName(), []);
  state.views.push(view);
  state.activeViewId = view.id;
  persist();
  renderViewSelect();
  render();
}

function duplicateCurrentView() {
  const current = getActiveView();
  const view = createView(`${current.name} cópia`, current.items);
  state.views.push(view);
  state.activeViewId = view.id;
  persist();
  renderViewSelect();
  render();
}



window.selectView = function selectView(id) {
  state.activeViewId = id;
  persist();
  renderViewSelect();
  render();
};

window.saveViewName = function saveViewName(id) {
  const view = state.views.find(view => view.id === id);
  if (!view) return;

  const input = els.viewsList.querySelector(`input[data-view-id="${id}"]`);
  const newName = input?.value.trim();
  if (!newName) return;

  view.name = newName;
  persist();
  renderViewSelect();
  renderViewsList();
};

window.duplicateViewById = function duplicateViewById(id) {
  const source = state.views.find(view => view.id === id);
  if (!source) return;

  const view = createView(`${source.name} cópia`, source.items);
  state.views.push(view);
  state.activeViewId = view.id;
  persist();
  renderViewSelect();
  render();
};

window.removeView = function removeView(id) {
  if (state.views.length <= 1) {
    showAppAlert({
      title: "Uma view é necessária",
      message: "Você precisa manter pelo menos uma view para o app funcionar.",
      tone: "info"
    });
    return;
  }

  const view = state.views.find(view => view.id === id);
  if (!view) return;

  showAppConfirm({
    title: "Excluir view?",
    message: `A view "${view.name}" será removida com todos os itens dela.`,
    confirmText: "Excluir",
    tone: "danger"
  }).then(confirmed => {
    if (!confirmed) return;

    state.views = state.views.filter(view => view.id !== id);
    if (state.activeViewId === id) {
      state.activeViewId = state.views[0].id;
    }

    persist();
    renderViewSelect();
    render();
  });
};



async function logoutApp() {
  try {
    await getAuthConnector().logout();
  } catch (error) {
    console.warn("Falha ao sair pelo conector. Limpando sessão local.", error);
    sessionStorage.removeItem("ei-harold-auth");
  }

  document.body.classList.add("app-locked");
  els.loginScreen?.classList.remove("is-hidden");
  els.loadingScreen?.classList.add("is-hidden");
  els.loginPassword.value = "";
  setTimeout(() => els.loginUser?.focus(), 0);
}


function setView(view) {
  const isCharts = view === "charts";
  els.tableTabBtn.classList.toggle("active", !isCharts);
  els.chartsTabBtn.classList.toggle("active", isCharts);
  els.tableView.classList.toggle("active", !isCharts);
  els.chartsView.classList.toggle("active", isCharts);

  if (isCharts) {
    setTimeout(() => renderCharts(filteredItems()), 0);
  }
}

function renderCharts(items) {
  if (!els.chartsView || !els.chartsView.classList.contains("active")) return;

  const monthlyEssential = sum(items.filter(i =>
    i.recurrence === "mensal" && isEssentialItem(i)
  ), "monthlyValue");
  const monthlyMandatory = sum(items.filter(i =>
    i.recurrence === "mensal" && isMandatoryItem(i)
  ), "monthlyValue");
  const monthlyIdeal = sum(items.filter(i => i.recurrence === "mensal"), "monthlyValue");
  const monthlyTotal = sum(items, "monthlyValue");
  const company = sum(items.filter(i => i.group === "empresa"), "monthlyValue");
  const investments = sum(items.filter(i => i.group === "investimentos"), "monthlyValue");
  const credit = sum(items.filter(i => i.payment === "cartao"), "monthlyValue");
  const debit = sum(items.filter(i => i.payment === "debito"), "monthlyValue");

  const groupData = [
    ["Pessoais", sum(items.filter(i => i.group === "pessoais"), "monthlyValue")],
    ["Empresa", company],
    ["Invest.", investments]
  ];

  const paymentData = [
    ["Crédito", credit],
    ["Débito", debit]
  ];

  const sectionData = COLUMNS.flatMap(column => column.sections)
    .map(section => [shortSectionLabel(section), sum(items.filter(i => i.section === section), "monthlyValue")])
    .filter(([, value]) => value > 0);

  const renewalData = MONTHS.map(month => [
    month.slice(0, 3),
    sum(items.filter(i => i.recurrence === "anual" && i.renewalMonth === month), "annualValue")
  ]);

  const topCostsData = [...items]
    .sort((a, b) => Number(b.monthlyValue || 0) - Number(a.monthlyValue || 0))
    .slice(0, 6)
    .map(i => [i.name.length > 12 ? `${i.name.slice(0, 11)}…` : i.name, i.monthlyValue]);

  drawBarChart(document.querySelector("#groupChart"), groupData, { horizontal: true, money: true });
  drawBarChart(document.querySelector("#essentialCompleteChart"), [
    ["Essencial", monthlyEssential],
    ["Obrig.", monthlyMandatory],
    ["Ideal", monthlyIdeal],
    ["Total", monthlyTotal]
  ], { horizontal: true, money: true });
  drawDonutChart(document.querySelector("#paymentChart"), paymentData);
  drawBarChart(document.querySelector("#sectionChart"), sectionData, { horizontal: false, money: true });
  drawLineChart(document.querySelector("#renewalChart"), renewalData);
  drawBarChart(document.querySelector("#topCostsChart"), topCostsData, { horizontal: true, money: true });
}

function shortSectionLabel(section) {
  return {
    fixas_mensais: "Fixas",
    assinaturas_mensais: "Ass. M.",
    variaveis_mensais: "Var. M.",
    empresa_mensal: "Emp. M.",
    empresa_anual: "Emp. A.",
    investimentos: "Inv. M.",
    investimentos_anuais: "Inv. A.",
    anuais_fixas: "Anuais",
    assinaturas_anuais: "Ass. A."
  }[section] || section;
}

function setupCanvas(canvas) {
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function chartColors() {
  return [
    "#c95919",
    "#f09a5b",
    "#f9c8ae",
    "#7cc6f2",
    "#f3d7a6",
    "#b86f3c",
    "#e8b894",
    "#d9c4ad"
  ];
}

function drawBarChart(canvas, data, options = {}) {
  const setup = setupCanvas(canvas);
  if (!setup) return;

  const { ctx, width, height } = setup;
  const colors = chartColors();
  ctx.clearRect(0, 0, width, height);

  const values = data.map(([, value]) => value);
  const max = Math.max(...values, 1);
  const pad = 24;
  const labelArea = options.horizontal ? 72 : 26;
  const chartW = width - pad * 2 - (options.horizontal ? labelArea : 0);
  const chartH = height - pad * 2 - (options.horizontal ? 0 : labelArea);

  ctx.font = "9px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";

  if (options.horizontal) {
    const rowH = chartH / Math.max(data.length, 1);
    data.forEach(([label, value], index) => {
      const y = pad + index * rowH + rowH * 0.22;
      const barH = Math.max(8, rowH * 0.30);
      const barW = (value / max) * chartW;

      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "left";
      ctx.fillText(label, pad, y + barH / 2);

      ctx.fillStyle = colors[index % colors.length];
      roundRect(ctx, pad + labelArea, y, barW, barH, 6);
      ctx.fill();

      ctx.fillStyle = "#1f2937";
      ctx.textAlign = "right";
      ctx.fillText(moneyBR(value), width - pad, y + barH / 2);
    });
  } else {
    const gap = 8;
    const barW = Math.max(8, ((chartW - gap * (data.length - 1)) / Math.max(data.length, 1)) * 0.72);

    data.forEach(([label, value], index) => {
      const x = pad + index * (barW + gap);
      const barH = (value / max) * chartH;
      const y = pad + chartH - barH;

      ctx.fillStyle = colors[index % colors.length];
      roundRect(ctx, x, y, Math.max(4, barW), barH, 5);
      ctx.fill();

      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(x + barW / 2, height - pad + 10);
      ctx.rotate(-0.35);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    });
  }
}

function drawDonutChart(canvas, data) {
  const setup = setupCanvas(canvas);
  if (!setup) return;

  const { ctx, width, height } = setup;
  const colors = chartColors();
  ctx.clearRect(0, 0, width, height);

  const total = data.reduce((sum, [, value]) => sum + value, 0) || 1;
  const cx = width / 2;
  const cy = height / 2 - 8;
  const radius = Math.min(width, height) * 0.27;
  let start = -Math.PI / 2;

  data.forEach(([label, value], index) => {
    const angle = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#fffdf8";
  ctx.fill();

  ctx.fillStyle = "#1f2937";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(moneyBR(total), cx, cy);

  ctx.font = "10px Inter, system-ui, sans-serif";
  data.forEach(([label, value], index) => {
    const y = height - 34 + index * 16;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(18, y - 5, 10, 10);
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.fillText(`${label}: ${moneyBR(value)}`, 34, y);
  });
}

function drawLineChart(canvas, data) {
  const setup = setupCanvas(canvas);
  if (!setup) return;

  const { ctx, width, height } = setup;
  ctx.clearRect(0, 0, width, height);

  const padX = 26;
  const padY = 22;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2 - 10;
  const max = Math.max(...data.map(([, value]) => value), 1);

  ctx.strokeStyle = "#ddd4c6";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, padY + chartH);
  ctx.lineTo(width - padX, padY + chartH);
  ctx.stroke();

  ctx.beginPath();
  data.forEach(([label, value], index) => {
    const x = padX + (index / (data.length - 1)) * chartW;
    const y = padY + chartH - (value / max) * chartH;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#c95919";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#c95919";
  data.forEach(([label, value], index) => {
    const x = padX + (index / (data.length - 1)) * chartW;
    const y = padY + chartH - (value / max) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b7280";
    ctx.font = "10px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, x, height - 12);
    ctx.fillStyle = "#c95919";
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

window.addEventListener("resize", () => renderCharts(filteredItems()));


function sum(items, key) {
  return items.reduce((t, i) => t + Number(i[key] || 0), 0);
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function moneyBR(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
