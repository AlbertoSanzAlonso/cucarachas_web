# Circuito comercial iGEO (potencial → cliente → sede → contrato → OT)

Procediment operatiu CECSA per a l'assistent d'oficina. Dades vives (clients, OT) es consulten amb eines d'espill/CRM, no amb aquest document.

## Ordre del circuit

1. **Identificar** contacte a l'espill iGEO / CRM local (telèfon, email, nom, adreça).
2. Si no existeix → **CLIENTE_POTENCIAL** (alta lead).
3. Pressupost acceptat → convertir a **CLIENTE** + **SEDE**.
4. **CONTRATO** (línia de negoci, zones, dates) — cal confirmació humana.
5. **ORDEN_DE_TRABAJO** (planning: tècnic, franja, tractament) — confirmació si canvia planning d'altri.
6. Després: documents/certificats, factura/cobrament (rol facturació + confirmació).

## Regles

- L'IA **no** publica JSON lliure a iGEO: només tools del backend amb contracte.
- No inventar codis de delegació, gestor, tècnic, tractament ni línia de negoci.
- Si falta un camp obligatori (*!), preguntar a l'operari; no inventar.
- Deduplicar per telèfon normalitzat, email i codi iGEO abans de CREATE.
- `remoteOperationId` estable per reintents segurs (no duplicar si ja hi ha ACK OK).

## Aplicació prevista vs repàs / garantia

- **Aplicació prevista**: visita del contracte (planificada, amb cost segons contracte).
- **Repàs / incidència / garantia**: sense cost addicional si cau en garantia; modelar com OT de tipus repàs + notes si iGEO no té entitat «incidència».
- En dubte contracte vs garantia → **handoff humà**, no decidir sol.

## Confirmació humana obligatòria

- Alta definitiva de client/contracte, factura, DELETE, canvi de tècnic aliè, preu fora de tarifa.
