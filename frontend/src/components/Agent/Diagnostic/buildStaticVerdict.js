const QTY_KEYS = {
  one: 'qty_one',
  several: 'qty_several',
  many: 'qty_many',
  nests: 'qty_nests',
  punctual: 'qty_punctual',
  frequent: 'qty_frequent',
  grave: 'qty_grave',
  closure: 'qty_closure',
};

const EMPTY_EXTRA = new Set(['', '-', 'cap', 'ninguna', 'no especificat', 'no especificado']);

export function hasExtraInfo(extra) {
  if (extra == null) return false;
  return !EMPTY_EXTRA.has(String(extra).trim().toLowerCase());
}

function opt(t, value) {
  if (!value) return '—';
  const qtyKey = QTY_KEYS[value];
  if (qtyKey) return t(`agent.verdict.${qtyKey}`);
  return t(`agent.options.${value}`, { defaultValue: value });
}

function tierParticular({ urgency, quantity }) {
  if (urgency === 'yes_urgent' || ['many', 'nests'].includes(quantity)) return 'urgent';
  if (urgency === 'this_week' || quantity === 'several') return 'moderate';
  return 'info';
}

function tierEmpresa({ sanitary_risk, level }) {
  if (sanitary_risk === 'urgent' || ['grave', 'closure'].includes(level)) return 'urgent';
  if (sanitary_risk === 'soon' || level === 'frequent') return 'moderate';
  return 'info';
}

function tierAdmin({ priority_admin, volume_admin, escalate_admin }) {
  if (
    ['alta', 'prioritaria_urgente'].includes(priority_admin) ||
    volume_admin === 'constante' ||
    escalate_admin === 'prioritario_evitar'
  ) {
    return 'urgent';
  }
  if (priority_admin === 'media' || volume_admin === 'bastantes_incidencias') return 'moderate';
  return 'info';
}

function tierComunidad({ what_if_not, where_comunidad }) {
  if (
    ['extendera', 'problema_serio'].includes(what_if_not) ||
    ['varias_viviendas', 'todo_edificio'].includes(where_comunidad)
  ) {
    return 'urgent';
  }
  if (what_if_not === 'puede_molestar' || where_comunidad === 'zonas_comunes') return 'moderate';
  return 'info';
}

function getTier(path, answers) {
  switch (path) {
    case 'particular':
      return tierParticular(answers);
    case 'empresa':
      return tierEmpresa(answers);
    case 'admin':
      return tierAdmin(answers);
    case 'comunidad':
      return tierComunidad(answers);
    default:
      return 'info';
  }
}

function snippet(t, key, answers, field) {
  if (answers[field] === 'yes') return t(`agent.verdict.static_snippets.${key}`);
  return '';
}

function buildParams(path, answers, t) {
  switch (path) {
    case 'particular':
      return {
        where: opt(t, answers.where),
        qty: opt(t, answers.quantity),
        since: opt(t, answers.since),
        sensitive_note: snippet(t, 'sensitive_yes', answers, 'sensitive'),
      };
    case 'empresa':
      return {
        business: opt(t, answers.business_type),
        where: opt(t, answers.where_empresa),
        level: opt(t, answers.level),
        cert_note: snippet(t, 'cert_yes', answers, 'certificate'),
      };
    case 'admin':
      return {
        gestion: opt(t, answers.gestion_tipo),
        where: opt(t, answers.where_admin),
        advance: opt(t, answers.advance_admin),
      };
    case 'comunidad':
      return {
        where: opt(t, answers.where_comunidad),
        role: opt(t, answers.role_comunidad),
        concern: opt(t, answers.what_if_not),
      };
    default:
      return {};
  }
}

export function buildStaticVerdict(path, answers, t) {
  const safePath = ['particular', 'empresa', 'admin', 'comunidad'].includes(path) ? path : 'particular';
  const tier = getTier(safePath, answers);
  const params = buildParams(safePath, answers, t);
  const intro = t(`agent.verdict.static_intro.${safePath}`);
  const body = t(`agent.verdict.static.${safePath}.${tier}`, params);
  const offer = t('agent.verdict.static_offer');
  return `${intro}\n\n${body}\n\n${offer}`;
}
