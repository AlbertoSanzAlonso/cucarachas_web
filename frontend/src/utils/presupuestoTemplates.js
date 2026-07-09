/**
 * Plantillas de presupuesto CECSA (modelos 11675P y 11630P).
 * Mantener sincronizado con backend/api/presupuesto_templates.py
 */
export const PRESUPUESTO_TEMPLATES = [
  {
    id: '11675P',
    label: 'Particular — Desinsectació paneroles',
    pest_type: 'german_cockroach',
    severity: 'medium',
    tipo_propiedad: 'Residencial',
    garantia_meses: 12,
    validez_dias: 30,
    notas: [
      'CUOTA SEMESTRAL 151,25 € IVA INCLUIDO.',
      'Tipus de treball: Contracte de manteniment',
      'Zones a tractar: La totalitat de les instal·lacions',
    ].join('\n'),
    lineas: [
      {
        concepto: 'DESINSECTACIÓ CUCARACHES (SENSE TERMINI DE SEGURETAT)',
        descripcion:
          'TRACTAMENT DE DESINSECTACIÓ: Aplicació de gels biocides d\'ús exclusiu professional, sense termini de seguretat, mitjançant la col·locació estratègica de esquer en zones clau per garantir el control eficaç de la plaga.\n\n' +
          'El contracte inclou el nombre d\'intervencions pactades, amb garantia TOTAL durant la vigència del mateix. La durada del contracte és d\'1 any a partir del primer tractament.',
        precio: '125.00',
        cantidad: 2,
      },
    ],
  },
  {
    id: '11630P',
    label: 'Hostaleria — Servei integral DDD',
    pest_type: 'german_cockroach',
    severity: 'medium',
    tipo_propiedad: 'Comercial',
    garantia_meses: 12,
    validez_dias: 30,
    notas: [
      'Facturació semestral segons condicions del contracte.',
      'Tipus de treball: Contracte de manteniment',
      'Zones a tractar: Obrador, Zona de venda, Magatzem de matèries primeres, Lavabos i zona de dutxa',
      'Inclou Certificat Sanitari Oficial.',
    ].join('\n'),
    lineas: [
      {
        concepto: 'SERVEI INTEGRAL',
        descripcion:
          'SERVEI PROFESSIONAL INTEGRAL DE DESINSECTACIÓ, DESRATITZACIÓ I DESINFECCIÓ PER A ESTABLIMENTS D\'HOSTALERIA.\n\n' +
          'Desinfeccions Cecsa està especialitzada en solucions integrals DDD per a locals d\'hostaleria, complint la normativa sanitària vigent. S\'entrega Certificat Sanitari Oficial.\n\n' +
          'Abast: dues intervencions anuals (cada sis mesos) amb garantia de 12 mesos.',
        precio: '225.00',
        cantidad: 2,
      },
    ],
  },
];

export const getPresupuestoTemplate = (id) =>
  PRESUPUESTO_TEMPLATES.find((tpl) => tpl.id === id) ?? null;

export const calcTotalConIva = (base) => {
  const num = Number(base);
  if (Number.isNaN(num)) return 0;
  return num * 1.21;
};
