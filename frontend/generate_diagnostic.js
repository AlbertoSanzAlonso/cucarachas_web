const fs = require('fs');

const fileContent = `import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Building2, Users, AlertTriangle, MessageSquare, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const DiagnosticFlow = memo(({ step, path, handleAnswer, handleBack }) => {
  const { t } = useTranslation();
  
  const renderOptions = (key, opts) => opts.map(opt => (
    <button key={opt} onClick={() => handleAnswer(key, opt)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px] diagnostic-btn">
      {t(\`agent.options.\${opt}\`)}
    </button>
  ));

  const renderParticularFlow = () => {
    switch (step) {
      case 2: return renderOptions('where', ['cocina', 'bano', 'dormitorio', 'salon', 'garaje', 'toda']);
      case 3: return renderOptions('quantity', ['one', 'several', 'many', 'nests']);
      case 4: return renderOptions('since', ['today', 'days', 'weeks', 'months']);
      case 5: return renderOptions('urgency', ['yes_urgent', 'this_week', 'only_budget', 'info_first']);
      case 6: return renderOptions('sensitive', ['yes', 'no']);
      default: return null;
    }
  };

  const renderEmpresaFlow = () => {
    switch (step) {
      case 2: return renderOptions('business_type', ['restaurante', 'hotel', 'oficina', 'tienda', 'nave', 'comunidad']);
      case 3: return renderOptions('sanitary_risk', ['urgent', 'soon', 'no']);
      case 4: return renderOptions('where_empresa', ['cocina', 'almacen', 'clientes', 'banos', 'exterior', 'varias']);
      case 5: return renderOptions('level', ['punctual', 'frequent', 'grave', 'closure']);
      case 6: return renderOptions('certificate', ['yes', 'no', 'unknown']);
      default: return null;
    }
  };

  const renderAdminFlow = () => {
    switch (step) {
      case 2: return renderOptions('gestion_tipo', ['admin_fincas', 'edificio_publico', 'equipamiento', 'varias_ubicaciones']);
      case 3: return renderOptions('where_admin', ['punto_concreto', 'varias', 'zonas_comunes', 'dificil_localizar']);
      case 4: return renderOptions('since_admin', ['reciente', 'algunas_semanas', 'varios_mesos', 'recurrente']);
      case 5: return renderOptions('volume_admin', ['aviso_puntual', 'algunos_avisos', 'bastantes_incidencias', 'constante']);
      case 6: return renderOptions('escalate_admin', ['no_especialment', 'algo', 'bastante', 'prioritario_evitar']);
      case 7: return renderOptions('prev_admin', ['no', 'actuacion_puntual', 'tratamientos_previos', 'problema_recurrente']);
      case 8: return renderOptions('priority_admin', ['baja', 'media', 'alta', 'prioritaria_urgente']);
      case 9: return renderOptions('advance_admin', ['agendar_visita', 'llamadme', 'propuesta_escrita', 'solo_info']);
      default: return null;
    }
  };

  const renderComunidadFlow = () => {
    switch (step) {
      case 2: return renderOptions('where_comunidad', ['solo_vivienda', 'varias_viviendas', 'zonas_comunes', 'todo_edificio']);
      case 3: return renderOptions('since_comunidad', ['hace_poco', 'algunas_semanas', 'varios_mesos', 'mucho_tiempo']);
      case 4: return renderOptions('role_comunidad', ['presidente', 'junta', 'vecino', 'administrador']);
      case 5: return renderOptions('has_admin', ['yes', 'no', 'no_lo_se']);
      case 6: return (
        <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4 px-4 items-center col-span-full">
          <input 
            type="text"
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-base placeholder:text-white/30 focus:outline-none focus:border-accent-green/50 shadow-lg"
            placeholder="Ej: Fincas Martínez..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handleAnswer('which_admin', e.target.value);
              }
            }}
            onChange={(e) => handleAnswer('which_admin', e.target.value, true)}
          />
          <Button variant="accent" onClick={() => handleAnswer('which_admin', 'finish', false)} className="w-full max-w-md py-4 text-sm font-black uppercase tracking-widest">
            Continuar
          </Button>
        </div>
      );
      case 7: return renderOptions('help_community', ['si_ayuda', 'yo_primero', 'solo_info']);
      case 8: return renderOptions('contact_who', ['conmigo', 'con_admin', 'ambos']);
      case 9: return renderOptions('what_if_not', ['no_creo_mas', 'puede_molestar', 'extendera', 'problema_serio']);
      default: return null;
    }
  };

  const getQuestion = () => {
    if (step === 1) return t('agent.questions.who');
    if (path === 'particular') {
      if (step === 2) return t('agent.questions.where_p');
      if (step === 3) return t('agent.questions.qty_p');
      if (step === 4) return t('agent.questions.since_p');
      if (step === 5) return t('agent.questions.urgency_p');
      if (step === 6) return t('agent.questions.sensitive_p');
      if (step === 7) return t('agent.questions.extra_info');
    }
    if (path === 'empresa') {
      if (step === 2) return t('agent.questions.business_type');
      if (step === 3) return t('agent.questions.sanitary_risk');
      if (step === 4) return t('agent.questions.where_e');
      if (step === 5) return t('agent.questions.level_e');
      if (step === 6) return t('agent.questions.certificate');
      if (step === 7) return t('agent.questions.extra_info');
    }
    if (path === 'admin') {
      if (step === 2) return t('agent.questions.gestion_tipo');
      if (step === 3) return t('agent.questions.where_admin');
      if (step === 4) return t('agent.questions.since_admin');
      if (step === 5) return t('agent.questions.volume_admin');
      if (step === 6) return t('agent.questions.escalate_admin');
      if (step === 7) return t('agent.questions.prev_admin');
      if (step === 8) return t('agent.questions.priority_admin');
      if (step === 9) return t('agent.questions.advance_admin');
      if (step === 10) return t('agent.questions.extra_info');
    }
    if (path === 'comunidad') {
      if (step === 2) return t('agent.questions.where_comunidad');
      if (step === 3) return t('agent.questions.since_comunidad');
      if (step === 4) return t('agent.questions.role_comunidad');
      if (step === 5) return t('agent.questions.has_admin');
      if (step === 6) return t('agent.questions.which_admin');
      if (step === 7) return t('agent.questions.help_community');
      if (step === 8) return t('agent.questions.contact_who');
      if (step === 9) return t('agent.questions.what_if_not');
      if (step === 10) return t('agent.questions.extra_info');
    }
    return t('agent.questions.default');
  };

  const renderCurrentStep = () => {
    if (step === 1) {
      return [
        { id: 'particular', icon: Home },
        { id: 'empresa', icon: Building2 },
        { id: 'comunidad', icon: Users },
        { id: 'admin', icon: Building2 },
        { id: 'unknown', icon: AlertTriangle },
        { id: 'chat_direct', icon: MessageSquare, primary: true }
      ].map(opt => (
        <button key={opt.id} onClick={() => handleAnswer('who', opt.id)} className={\`flex items-center p-4 md:p-5 rounded-2xl border transition-all group text-left w-full sm:min-w-[260px] \${opt.primary ? 'bg-accent-green text-black border-accent-green shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'} diagnostic-btn\`}>
          <opt.icon size={20} className={\`mr-4 \${opt.primary ? 'text-black' : 'text-accent-green'}\`} />
          <span className="font-bold">{t(\`agent.options.\${opt.id}\`)}</span>
        </button>
      ));
    }
    
    let isLastStep = false;
    if ((path === 'particular' || path === 'empresa') && step === 7) isLastStep = true;
    if ((path === 'admin' || path === 'comunidad') && step === 10) isLastStep = true;

    if (isLastStep) {
      return (
        <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 px-4 items-center col-span-full">
          <textarea 
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-white text-lg placeholder:text-white/30 focus:outline-none focus:border-accent-green/50 min-h-[220px] mb-2 shadow-2xl"
            placeholder={t('agent.questions.extra_info_placeholder')}
            onChange={(e) => handleAnswer('extra_info', e.target.value, true)}
          />
          <Button variant="accent" onClick={() => handleAnswer('finish', 'finish')} className="w-full max-w-md py-5 text-base font-black uppercase tracking-widest shadow-xl">
            {t('agent.give_diagnostic')}
          </Button>
        </div>
      );
    }

    if (path === 'particular') return renderParticularFlow();
    if (path === 'empresa') return renderEmpresaFlow();
    if (path === 'admin') return renderAdminFlow();
    if (path === 'comunidad') return renderComunidadFlow();

    return (
      <div className="w-full max-w-xs col-span-full">
        <Button variant="accent" onClick={() => handleAnswer('finish', 'finish')} className="w-full">
          {t('agent.finish_diagnostic')}
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="diagnostic-title-container mb-4 md:mb-14 w-full flex flex-col items-center">
        <div className="flex items-center justify-center space-x-4">
          {step > 1 && (
            <button onClick={handleBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
              <ChevronLeft size={24} />
            </button>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight text-center">
            {getQuestion()}
          </h2>
        </div>
      </div>
      <div className={\`flex flex-col space-y-2 sm:space-y-0 sm:grid sm:gap-3 px-4 md:px-8 max-w-3xl mx-auto w-full \${step === 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'}\`}>
        {renderCurrentStep()}
      </div>
    </>
  );
});

export default DiagnosticFlow;
`;

fs.writeFileSync('./src/components/Agent/Diagnostic/DiagnosticFlow.jsx', fileContent);
console.log('DiagnosticFlow.jsx rewritten successfully');
