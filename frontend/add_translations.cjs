const fs = require('fs');
const caPath = './src/locales/ca/translation.json';
const esPath = './src/locales/es/translation.json';

const ca = JSON.parse(fs.readFileSync(caPath, 'utf8'));
const es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

const newQuestionsCa = {
  "gestion_tipo": "Quin tipus de gestió estàs realitzant?",
  "where_admin": "On s'ha detectat la incidència?",
  "since_admin": "Des de quan tens coneixement del problema?",
  "volume_admin": "Quin volum d'incidències has rebut?",
  "escalate_admin": "Et preocupa que pugui escalar a nivell de gestió o imatge?",
  "prev_admin": "S'ha fet alguna intervenció prèvia?",
  "priority_admin": "Quin nivell de prioritat té ara mateix?",
  "advance_admin": "Com prefereixes avançar ara?",
  "where_comunidad": "On s'ha detectat el problema?",
  "since_comunidad": "Des de quan passa?",
  "role_comunidad": "Quina és la teva relació amb la comunitat?",
  "has_admin": "La comunitat té administrador de finques?",
  "which_admin": "Saps quin administrador gestiona la finca?",
  "help_community": "Si detectem un problema important, vols que t'ajudem a gestionar-ho amb la comunitat?",
  "contact_who": "Vols que contactem amb tu o amb l'administrador?",
  "what_if_not": "Què creus que passarà si no s'actua?"
};

const newQuestionsEs = {
  "gestion_tipo": "¿Qué tipo de gestión estás realizando?",
  "where_admin": "¿Dónde se ha detectado la incidencia?",
  "since_admin": "¿Desde cuándo tienes conocimiento del problema?",
  "volume_admin": "¿Qué volumen de incidencias has recibido?",
  "escalate_admin": "¿Te preocupa que esto pueda escalar a nivel de gestión o imagen?",
  "prev_admin": "¿Se ha realizado alguna intervención previa?",
  "priority_admin": "¿Qué nivel de prioridad tiene ahora mismo?",
  "advance_admin": "¿Cómo prefieres avanzar ahora?",
  "where_comunidad": "¿Dónde se ha detectado el problema?",
  "since_comunidad": "¿Desde cuándo ocurre?",
  "role_comunidad": "¿Cuál es tu relación con la comunidad?",
  "has_admin": "¿La comunidad tiene administrador de fincas?",
  "which_admin": "¿Sabes qué administrador gestiona la finca?",
  "help_community": "Si detectamos un problema importante, ¿quieres que te ayudemos a gestionarlo con la comunidad?",
  "contact_who": "¿Te gustaría que contactemos directamente contigo o con el administrador?",
  "what_if_not": "¿Qué crees que pasará si no se actúa?"
};

const newOptionsCa = {
  "admin_fincas": "Administració de finques",
  "edificio_publico": "Gestió d’edifici públic",
  "equipamiento": "Equipament municipal (escola, centre, etc.)",
  "varias_ubicaciones": "Gestió de diverses ubicacions",
  "punto_concreto": "Punt concret",
  "dificil_localizar": "Difícil de localitzar / estès",
  "reciente": "Recent",
  "algunas_semanas": "Algunes setmanes",
  "varios_mesos": "Diversos mesos",
  "recurrente": "Recurrent en el temps",
  "aviso_puntual": "Avís puntual",
  "algunos_avisos": "Alguns avisos",
  "bastantes_incidencias": "Bastantes incidències",
  "constante": "Incidència constant",
  "no_especialment": "No especialment",
  "algo": "Una mica",
  "bastante": "Bastant",
  "prioritario_evitar": "Sí, és prioritari evitar-ho",
  "actuacion_puntual": "Actuació puntual",
  "tratamientos_previos": "Tractaments previs",
  "problema_recurrente": "Problema recurrent",
  "baja": "Baixa",
  "media": "Mitjana",
  "alta": "Alta",
  "prioritaria_urgente": "Prioritària / urgent",
  "agendar_visita": "Que m'agendeu una visita tècnica gratuïta",
  "llamadme": "Prefereixo que em truqueu per telèfon",
  "propuesta_escrita": "Vull rebre una proposta per escrit",
  "solo_info": "Només vull informació de moment",
  "solo_vivienda": "Només en un habitatge",
  "varias_viviendas": "Diversos habitatges",
  "todo_edificio": "Tot l'edifici",
  "hace_poco": "Fa poc",
  "mucho_tiempo": "Molt temps",
  "presidente": "Sóc el/la president/a de la comunitat",
  "junta": "Formo part de la junta",
  "vecino": "Sóc veí/veïna",
  "administrador": "Sóc administrador/a de finques",
  "no_lo_se": "No ho sé",
  "si_ayuda": "Sí, m'agradaria que m'ajudeu",
  "yo_primero": "Prefereixo parlar-ho jo primer",
  "conmigo": "Amb mi directament",
  "con_admin": "Amb l'administrador",
  "ambos": "Ambdós",
  "no_creo_mas": "No crec que vagi a més",
  "puede_molestar": "Pot molestar més",
  "extendera": "S'estendrà a més veïns",
  "problema_serio": "Serà un problema seriós a tota la finca",
  "zonas_comunes": "Zones comunes"
};

const newOptionsEs = {
  "admin_fincas": "Administración de fincas",
  "edificio_publico": "Gestión de edificio público",
  "equipamiento": "Equipamiento municipal (escuela, centro, etc.)",
  "varias_ubicaciones": "Gestión de varias ubicaciones",
  "punto_concreto": "Punto concreto",
  "dificil_localizar": "Difícil de localizar / extendido",
  "reciente": "Reciente",
  "algunas_semanas": "Algunas semanas",
  "varios_mesos": "Varios meses",
  "recurrente": "Recurrente en el tiempo",
  "aviso_puntual": "Aviso puntual",
  "algunos_avisos": "Algunos avisos",
  "bastantes_incidencias": "Bastantes incidencias",
  "constante": "Incidencia constante",
  "no_especialment": "No especialmente",
  "algo": "Algo",
  "bastante": "Bastante",
  "prioritario_evitar": "Sí, es prioritario evitarlo",
  "actuacion_puntual": "Actuación puntual",
  "tratamientos_previos": "Tratamientos anteriores",
  "problema_recurrente": "Problema recurrente",
  "baja": "Baja",
  "media": "Media",
  "alta": "Alta",
  "prioritaria_urgente": "Prioritaria / urgente",
  "agendar_visita": "Que me agendéis una visita técnica gratuita",
  "llamadme": "Prefiero que me llaméis por teléfono",
  "propuesta_escrita": "Quiero recibir una propuesta por escrito",
  "solo_info": "Solo quiero información por ahora",
  "solo_vivienda": "Solo en una vivienda",
  "varias_viviendas": "Varias viviendas",
  "todo_edificio": "Todo el edificio",
  "hace_poco": "Hace poco",
  "mucho_tiempo": "Mucho tiempo",
  "presidente": "Soy presidente/a de la comunidad",
  "junta": "Formo parte de la junta",
  "vecino": "Soy vecino/a",
  "administrador": "Soy administrador/a de fincas",
  "no_lo_se": "No lo sé",
  "si_ayuda": "Sí, me gustaría que me ayudéis",
  "yo_primero": "Prefiero hablarlo yo primero",
  "conmigo": "Conmigo directamente",
  "con_admin": "Con el administrador",
  "ambos": "Ambos",
  "no_creo_mas": "No creo que vaya a más",
  "puede_molestar": "Puede molestar más",
  "extendera": "Se extenderá a más vecinos",
  "problema_serio": "Será un problema serio en toda la finca",
  "zonas_comunes": "Zonas comunes"
};

Object.assign(ca.agent.questions, newQuestionsCa);
Object.assign(es.agent.questions, newQuestionsEs);

Object.assign(ca.agent.options, newOptionsCa);
Object.assign(es.agent.options, newOptionsEs);

fs.writeFileSync(caPath, JSON.stringify(ca, null, 2));
fs.writeFileSync(esPath, JSON.stringify(es, null, 2));

console.log('Translations updated successfully.');
