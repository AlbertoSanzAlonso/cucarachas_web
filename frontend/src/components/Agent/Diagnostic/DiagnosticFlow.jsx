import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Building2, Users, AlertTriangle, MessageSquare, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const DiagnosticFlow = ({ step, path, handleAnswer, handleBack }) => {
  const { t } = useTranslation();
  
  const renderParticularFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'cocina' },
          { id: 'bano' },
          { id: 'dormitorio' },
          { id: 'salon' },
          { id: 'garaje' },
          { id: 'toda' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 3:
        return [
          { id: 'one' },
          { id: 'several' },
          { id: 'many' },
          { id: 'nests' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('quantity', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 4:
        return [
          { id: 'today' },
          { id: 'days' },
          { id: 'weeks' },
          { id: 'months' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('since', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 5:
        return [
          { id: 'yes_urgent' },
          { id: 'this_week' },
          { id: 'only_budget' },
          { id: 'info_first' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('urgency', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 6:
        return [
          { id: 'yes' },
          { id: 'no' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sensitive', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      default: return null;
    }
  };

  const renderEmpresaFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'restaurante' },
          { id: 'hotel' },
          { id: 'oficina' },
          { id: 'tienda' },
          { id: 'nave' },
          { id: 'comunidad' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('business_type', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 3:
        return [
          { id: 'urgent' },
          { id: 'soon' },
          { id: 'no' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sanitary_risk', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 4:
        return [
          { id: 'cocina' },
          { id: 'almacen' },
          { id: 'clientes' },
          { id: 'banos' },
          { id: 'exterior' },
          { id: 'varias' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where_empresa', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 5:
        return [
          { id: 'punctual' },
          { id: 'frequent' },
          { id: 'grave' },
          { id: 'closure' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('level', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
      case 6:
        return [
          { id: 'yes' },
          { id: 'no' },
          { id: 'unknown' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('certificate', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {t(`agent.options.${opt.id}`)}
          </button>
        ));
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
    }
    if (path === 'empresa') {
      if (step === 2) return t('agent.questions.business_type');
      if (step === 3) return t('agent.questions.sanitary_risk');
      if (step === 4) return t('agent.questions.where_e');
      if (step === 5) return t('agent.questions.level_e');
      if (step === 6) return t('agent.questions.certificate');
    }
    if (step === 7) return t('agent.questions.extra_info');
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
        <button key={opt.id} onClick={() => handleAnswer('who', opt.id)} className={`flex items-center p-4 md:p-5 rounded-2xl border transition-all group text-left w-full sm:min-w-[260px] ${opt.primary ? 'bg-accent-green text-black border-accent-green shadow-lg' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}>
          <opt.icon size={20} className={`mr-4 ${opt.primary ? 'text-black' : 'text-accent-green'}`} />
          <span className="font-bold">{t(`agent.options.${opt.id}`)}</span>
        </button>
      ));
    }
    
    if (step === 7) {
      return (
        <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 px-4 items-center">
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

    return (
      <div className="w-full max-w-xs">
        <Button variant="accent" onClick={() => handleAnswer('finish', 'finish')} className="w-full">
          {t('agent.finish_diagnostic')}
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 md:mb-14 w-full flex flex-col items-center">
        <div className="flex items-center justify-center space-x-4">
          {step > 1 && (
            <button onClick={handleBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/60 hover:text-white transition-all">
              <ChevronLeft size={24} />
            </button>
          )}
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight">
            {getQuestion()}
          </h2>
        </div>
      </div>
      <div className={`grid gap-2 md:gap-3 max-w-3xl mx-auto w-full ${step === 6 || step === 7 ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default DiagnosticFlow;
