"""Datos semilla: política comercial, FAQ y ficha preventivo DDD (sin costes internos)."""

from __future__ import annotations

COMMERCIAL_POLICY_ES = """
Política comercial CECSA (uso agentes — sin costes internos ni márgenes).

Proceso habitual en viviendas: diagnóstico (fotos/preguntas/inspección si hace falta),
primer tratamiento (gel profesional, trampas, refugios), instrucciones al cliente,
segunda actuación según especie y criterio técnico, repaso en garantía si aplica,
cierre cuando trampas confirman control.

Precios: no inventar importes. Usar ficha maestra e histórico CRM. Presentar como
orientativos o «desde» / presupuesto personalizado. Si falta alcance (especie,
superficie, nivel, accesibilidad), pedir datos o visita técnica antes de cerrar.

Bares y restauración — filtro obligatorio:
- Sin infestación activa: servicio preventivo y certificado DDD según alcance contratado.
- Con cucaracha germánica activa: programa de eliminación profesional con seguimiento;
  NUNCA ofrecer el certificado preventivo como solución a una infestación existente.

Objeción de precio: ofrecer visita técnica para ajustar especie, focos y alcance.
La visita no implica rebaja automática ni garantía imposible.

Garantía: solo plaga/zona del presupuesto; cliente debe seguir preparación e higiene;
no cubre entradas nuevas desde vecinos, bajantes, mercancías, obras o zonas no tratadas.
Comunidades pueden requerir actuación coordinada. Infestaciones intensas o locales
alimentarios pueden necesitar más visitas o mantenimiento.

Validez orientativa del presupuesto: 15 días; revisar si la plaga evoluciona.
""".strip()

COMMERCIAL_POLICY_CA = """
Política comercial CECSA (ús agents — sense costos interns ni marges).

Procés habitual en habitatges: diagnòstic (fotos/preguntes/inspecció si cal),
primer tractament (gel professional, trampes, refugis), instruccions al client,
segona actuació segons espècie i criteri tècnic, repàs en garantia si escau,
tancament quan les trampes confirmen el control.

Preus: no inventar imports. Usar fitxa mestra i històric CRM. Presentar com
orientatius o «des de» / pressupost personalitzat. Si falta abast (espècie,
superfície, nivell, accessibilitat), demanar dades o visita tècnica abans de tancar.

Bars i restauració — filtre obligatori:
- Sense infestació activa: servei preventiu i certificat DDD segons abast contractat.
- Amb panerola germànica activa: programa d'eliminació professional amb seguiment;
  MAI oferir el certificat preventiu com a solució a una infestació existent.

Objecció de preu: oferir visita tècnica per ajustar espècie, focus i abast.
La visita no implica rebaixa automàtica ni garantia impossible.

Garantia: només plaga/zona del pressupost; el client ha de seguir preparació i higiene;
no cobreix entrades noves des de veïns, baixants, mercaderies, obres o zones no tractades.
Comunitats poden requerir actuació coordinada. Infestacions intensos o locals
alimentaris poden necessitar més visites o manteniment.

Validesa orientativa del pressupost: 15 dies; revisar si la plaga evoluciona.
""".strip()

AGENT_NOTES_ES = """
Conversación: primero deja que explique el caso con sus palabras; reconoce la
preocupación; máximo UNA pregunta por turno. No listes preguntas técnicas al inicio.
En bares, confirma preventivo/certificado DDD vs infestación activa antes de orientar precio.
Si el precio es el problema principal, ofrece visita técnica (no un tratamiento barato
que no resuelva). No publiques costes internos, salarios ni márgenes. No inventes euros.
Usa get_company_info y, para presupuestos, ficha + histórico + política comercial.
""".strip()

AGENT_NOTES_CA = """
Conversa: primer deixa que expliqui el cas amb les seves paraules; reconeix la
preocupació; màxim UNA pregunta per torn. No llancis llistes de preguntes tècniques a l'inici.
En bars, confirma preventiu/certificat DDD vs infestació activa abans d'orientar preu.
Si el preu és el problema principal, ofereix visita tècnica (no un tractament barat
que no resolgui). No publiquis costos interns, salaris ni marges. No inventis euros.
Usa get_company_info i, per a pressupostos, fitxa + històric + política comercial.
""".strip()

FAQ_SEED = [
    {
        "slug": "preu-pis",
        "category": "preus",
        "sort_order": 10,
        "question_ca": "Quant costa eliminar paneroles en un pis?",
        "question_es": "¿Cuánto cuesta eliminar cucarachas en un piso?",
        "question_en": "How much does it cost to eliminate cockroaches in an apartment?",
        "answer_ca": (
            "El preu depèn de l'espècie, la superfície, el nivell d'infestació i l'accessibilitat. "
            "No tanquem un import sense dades suficients: et donem una valoració orientativa "
            "pel xat o demanem una visita tècnica abans del pressupost definitiu."
        ),
        "answer_es": (
            "El precio depende de la especie, la superficie, el nivel de infestación y la accesibilidad. "
            "No cerramos un importe sin datos suficientes: te damos una valoración orientativa "
            "por el chat o pedimos una visita técnica antes del presupuesto definitivo."
        ),
        "answer_en": (
            "Price depends on species, size, infestation level and access. "
            "We give an indicative valuation via chat or a technical visit before a final quote."
        ),
    },
    {
        "slug": "dos-tractaments",
        "category": "tecnic",
        "sort_order": 20,
        "question_ca": "Per què se solen fer dos tractaments?",
        "question_es": "¿Por qué suelen hacerse dos tratamientos?",
        "question_en": "Why are two treatments usually needed?",
        "answer_ca": (
            "El cicle de les paneroles i els refugis amagats fan que una sola actuació sovint no n'hi hagi prou. "
            "Dues actuacions amb seguiment augmenten la probabilitat de control i permeten la garantia segons condicions."
        ),
        "answer_es": (
            "El ciclo de las cucarachas y los refugios ocultos hacen que una sola actuación a menudo no baste. "
            "Dos actuaciones con seguimiento aumentan la probabilidad de control y permiten la garantía según condiciones."
        ),
        "answer_en": (
            "Cockroach life cycles and hidden harbourage mean one visit is often not enough. "
            "Two treatments with follow-up raise the chance of control under guarantee conditions."
        ),
    },
    {
        "slug": "garantia",
        "category": "garantia",
        "sort_order": 30,
        "question_ca": "El tractament té garantia?",
        "question_es": "¿El tratamiento tiene garantía?",
        "question_en": "Does the treatment include a guarantee?",
        "answer_ca": (
            "Sí, garantia de solució segons condicions del pressupost: plaga i zona incloses, "
            "accés i instruccions del client. No cobreix entrades noves des de veïns, baixants "
            "o zones no tractades quan no es pot actuar a l'origen."
        ),
        "answer_es": (
            "Sí, garantía de solución según condiciones del presupuesto: plaga y zona incluidas, "
            "acceso e instrucciones del cliente. No cubre nuevas entradas desde vecinos, bajantes "
            "o zonas no tratadas cuando no se puede actuar en el origen."
        ),
        "answer_en": (
            "Yes, a solution guarantee under quote conditions: included pest/area, access and client instructions. "
            "It does not cover new entries from neighbours, drains or untreated areas."
        ),
    },
    {
        "slug": "sortir-casa",
        "category": "seguretat",
        "sort_order": 40,
        "question_ca": "He de sortir de casa durant l'aplicació?",
        "question_es": "¿Tengo que salir de casa durante la aplicación?",
        "question_en": "Do I need to leave home during the treatment?",
        "answer_ca": (
            "En la majoria de tractaments amb gel professional no cal desallotjar. "
            "El tècnic t'indicarà les precaucions concretes segons producte i zones tractades."
        ),
        "answer_es": (
            "En la mayoría de tratamientos con gel profesional no hace falta desalojar. "
            "El técnico te indicará las precauciones concretas según producto y zonas tratadas."
        ),
        "answer_en": (
            "With most professional gel treatments you do not need to leave. "
            "The technician will explain any specific precautions."
        ),
    },
    {
        "slug": "nens-mascotes",
        "category": "seguretat",
        "sort_order": 50,
        "question_ca": "El producte és compatible amb nens i mascotes?",
        "question_es": "¿El producto es compatible con niños y mascotas?",
        "question_en": "Is the product safe around children and pets?",
        "answer_ca": (
            "Treballem amb protocols de mínima invasió i gels professionals aplicats en punts estratègics. "
            "Cal seguir les instruccions del tècnic (no tocar cebos/trampes) per a una convivència segura."
        ),
        "answer_es": (
            "Trabajamos con protocolos de mínima invasión y geles profesionales en puntos estratégicos. "
            "Hay que seguir las instrucciones del técnico (no tocar cebos/trampas) para una convivencia segura."
        ),
        "answer_en": (
            "We use low-impact protocols and professional gels in strategic points. "
            "Follow the technician’s instructions (do not disturb baits/traps)."
        ),
    },
    {
        "slug": "preparacio",
        "category": "tecnic",
        "sort_order": 60,
        "question_ca": "Què he de preparar abans de la visita?",
        "question_es": "¿Qué debo preparar antes de la visita?",
        "question_en": "What should I prepare before the visit?",
        "answer_ca": (
            "Deixa accessibles les zones afectades, evita insecticides domèstics i redueix aliment, aigua i refugi. "
            "El tècnic et donarà instruccions específiques en acabar la primera actuació."
        ),
        "answer_es": (
            "Deja accesibles las zonas afectadas, evita insecticidas domésticos y reduce alimento, agua y refugio. "
            "El técnico te dará instrucciones específicas al terminar la primera actuación."
        ),
        "answer_en": (
            "Keep affected areas accessible, avoid DIY sprays and reduce food, water and harbourage. "
            "The technician will give specific instructions after the first visit."
        ),
    },
    {
        "slug": "temps-activitat",
        "category": "tecnic",
        "sort_order": 70,
        "question_ca": "Quant triga a desaparèixer l'activitat?",
        "question_es": "¿Cuánto tarda en desaparecer la actividad?",
        "question_en": "How long until activity disappears?",
        "answer_ca": (
            "Pots veure activitat els primers dies mentre el gel fa efecte. "
            "El control es confirma amb el seguiment i la segona actuació; cada cas té el seu ritme."
        ),
        "answer_es": (
            "Puedes ver actividad los primeros días mientras el gel hace efecto. "
            "El control se confirma con el seguimiento y la segunda actuación; cada caso tiene su ritmo."
        ),
        "answer_en": (
            "Some activity in the first days is normal while the gel works. "
            "Control is confirmed with follow-up and the second treatment."
        ),
    },
    {
        "slug": "veins-comunitat",
        "category": "garantia",
        "sort_order": 80,
        "question_ca": "Què passa si les paneroles venen d'un altre habitatge o de la comunitat?",
        "question_es": "¿Qué ocurre si las cucarachas vienen de otra vivienda o de la comunidad?",
        "question_en": "What if cockroaches come from a neighbour or the community?",
        "answer_ca": (
            "Cal identificar l'origen. Si el focus és extern o a zones comunes, pot caldre tractar "
            "de forma coordinada. La garantia no cobreix reentrades des de zones no incloses al pressupost."
        ),
        "answer_es": (
            "Hay que identificar el origen. Si el foco es externo o en zonas comunes, puede hacer falta "
            "tratar de forma coordinada. La garantía no cubre reentradas desde zonas no incluidas en el presupuesto."
        ),
        "answer_en": (
            "We need to identify the source. External or common-area foci may need coordinated treatment. "
            "The guarantee does not cover re-entry from areas outside the quote."
        ),
    },
    {
        "slug": "bars-locals",
        "category": "tecnic",
        "sort_order": 90,
        "question_ca": "També tracteu bars, locals i comunitats?",
        "question_es": "¿También tratáis bares, locales y comunidades?",
        "question_en": "Do you also treat bars, premises and communities?",
        "answer_ca": (
            "Sí: habitatges, bars i restauració, altres locals i comunitats de propietaris a Barcelona "
            "i l'Àrea Metropolitana, amb diagnòstic adaptat a cada ús."
        ),
        "answer_es": (
            "Sí: viviendas, bares y restauración, otros locales y comunidades de propietarios en Barcelona "
            "y el Área Metropolitana, con diagnóstico adaptado a cada uso."
        ),
        "answer_en": (
            "Yes: homes, bars and hospitality, other premises and homeowners’ communities "
            "in Barcelona and the metro area."
        ),
    },
    {
        "slug": "certificat-ddd",
        "category": "tecnic",
        "sort_order": 100,
        "question_ca": "Emeteu certificat sanitari DDD per a establiments?",
        "question_es": "¿Emitís certificado sanitario DDD para establecimientos?",
        "question_en": "Do you issue DDD sanitary certificates for businesses?",
        "answer_ca": (
            "Sí, per a establiments que necessiten prevenció i certificat DDD conforme a l'abast contractat. "
            "Això és diferent d'un programa d'eliminació si ja hi ha infestació activa."
        ),
        "answer_es": (
            "Sí, para establecimientos que necesitan prevención y certificado DDD conforme al alcance contratado. "
            "Eso es distinto de un programa de eliminación si ya hay infestación activa."
        ),
        "answer_en": (
            "Yes, for premises needing prevention and a DDD certificate under the contracted scope. "
            "That is different from an elimination programme if there is an active infestation."
        ),
    },
    {
        "slug": "preventiu-vs-activa",
        "category": "preus",
        "sort_order": 110,
        "question_ca": "Quina diferència hi ha entre el certificat preventiu i un tractament per a una infestació activa?",
        "question_es": "¿Qué diferencia hay entre el certificado preventivo y un tratamiento para una infestación activa?",
        "question_en": "What is the difference between a preventive certificate and treatment for an active infestation?",
        "answer_ca": (
            "El servei preventiu amb certificat DDD està pensat per a establiments sense problema actiu. "
            "Si ja hi ha panerola germànica, cal un programa d'eliminació amb actuacions i seguiment; "
            "el certificat preventiu no és la solució a una infestació existent."
        ),
        "answer_es": (
            "El servicio preventivo con certificado DDD está pensado para establecimientos sin problema activo. "
            "Si ya hay cucaracha germánica, hace falta un programa de eliminación con actuaciones y seguimiento; "
            "el certificado preventivo no es la solución a una infestación existente."
        ),
        "answer_en": (
            "Preventive DDD certification is for premises without an active problem. "
            "Active German cockroach needs an elimination programme; the preventive certificate is not a cure."
        ),
    },
    {
        "slug": "bar-germanica-preu",
        "category": "preus",
        "sort_order": 120,
        "question_ca": "Quant costa eliminar la panerola germànica d'un bar amb garantia de solució?",
        "question_es": "¿Cuánto cuesta eliminar la cucaracha germánica de un bar con garantía de solución?",
        "question_en": "How much does it cost to eliminate German cockroaches in a bar with a solution guarantee?",
        "answer_ca": (
            "És un programa professional d'eliminació (no el certificat preventiu). "
            "L'import es confirma amb diagnòstic: focus, superfície i condicions del local. "
            "Demana valoració pel xat o visita tècnica; no tanquem preu a cegues."
        ),
        "answer_es": (
            "Es un programa profesional de eliminación (no el certificado preventivo). "
            "El importe se confirma con diagnóstico: focos, superficie y condiciones del local. "
            "Pide valoración por el chat o visita técnica; no cerramos precio a ciegas."
        ),
        "answer_en": (
            "It is a professional elimination programme (not the preventive certificate). "
            "Price is confirmed after diagnosing foci, size and site conditions via chat or a technical visit."
        ),
    },
]

COMMERCIAL_KNOWLEDGE_CHUNKS = [
    {
        "title": "Proceso estándar viviendas CECSA",
        "category": "comercial",
        "content": COMMERCIAL_POLICY_ES.split("Bares y restauración")[0].strip(),
    },
    {
        "title": "Filtro bares preventivo vs infestacion",
        "category": "comercial",
        "content": (
            "Bares y restauración: distinguir servicio preventivo y certificado DDD "
            "(sin infestación activa) del programa de eliminación de cucaracha germánica "
            "(infestación activa, ficha CUC-GER-NEG). Nunca vender el preventivo como solución "
            "a plaga activa. Si el precio es el problema, ofrecer visita técnica para ajustar alcance."
        ),
    },
    {
        "title": "Servicio especial hostelería cucaracha alemana graves",
        "category": "comercial",
        "content": (
            "Servicio especial CECSA (ficha CUC-GER-HOST) para casos graves o persistentes de "
            "cucaracha alemana en bares, restaurantes y cocinas profesionales, especialmente cuando "
            "otras empresas ya han tratado y siguen apareciendo. Precio orientativo 1.100 € + IVA. "
            "No es «venir a poner gel»: localizar focos, estrategia específica y seguimiento hasta "
            "la solución dentro de las condiciones del servicio. Antes de vender, conocer el caso "
            "(tiempo del problema y tratamientos previos) para confirmar si CECSA es la empresa adecuada. "
            "Landing pública: /servei-panerola-alemana-hostaleria. "
            "Casos de negocio estándar sin persistencia grave → CUC-GER-NEG, no este servicio."
        ),
    },
    {
        "title": "Garantia y exclusiones CECSA",
        "category": "comercial",
        "content": (
            "Garantía condicionada al alcance presupuestado, acceso e instrucciones del cliente. "
            "No cubre nuevas entradas desde vecinos, bajantes, mercancías, obras o zonas no tratadas. "
            "Comunidades pueden requerir actuación coordinada. Presupuesto orientativo válido ~15 días."
        ),
    },
]
