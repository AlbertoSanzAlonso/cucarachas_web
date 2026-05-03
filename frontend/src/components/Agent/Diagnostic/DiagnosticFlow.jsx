import React from 'react';
import { Home, Building2, Users, AlertTriangle, MessageSquare, ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

const DiagnosticFlow = ({ step, path, handleAnswer, handleBack }) => {
  
  const renderParticularFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'cocina', label: 'Cuina' },
          { id: 'bano', label: 'Bany' },
          { id: 'dormitorio', label: 'Dormitori' },
          { id: 'salon', label: 'Saló' },
          { id: 'garaje', label: 'Garatge / Traster' },
          { id: 'toda', label: 'Tota la casa' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 3:
        return [
          { id: 'one', label: 'Només una o dues' },
          { id: 'several', label: 'Diverses al dia' },
          { id: 'many', label: 'Moltes cada nit' },
          { id: 'nests', label: 'He trobat nius / cries' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('quantity', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 4:
        return [
          { id: 'today', label: 'Avui mateix' },
          { id: 'days', label: 'Fa uns dies' },
          { id: 'weeks', label: 'Fa setmanes' },
          { id: 'months', label: 'Fa mesos' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('since', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 5:
        return [
          { id: 'yes', label: 'Sí, necessito ajuda avui' },
          { id: 'week', label: 'Aquesta setmana' },
          { id: 'budget', label: 'Només vull pressupost' },
          { id: 'info', label: 'Vull informació primer' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('urgency', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 6:
        return [
          { id: 'yes', label: 'Sí' },
          { id: 'no', label: 'No' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sensitive', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      default: return null;
    }
  };

  const renderEmpresaFlow = () => {
    switch (step) {
      case 2:
        return [
          { id: 'restaurante', label: 'Restaurant / Bar' },
          { id: 'hotel', label: 'Hotel' },
          { id: 'oficina', label: 'Oficina' },
          { id: 'tienda', label: 'Botiga' },
          { id: 'nave', label: 'Nau Industrial' },
          { id: 'comunidad', label: 'Comunitat / Finca' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('business_type', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 3:
        return [
          { id: 'urgent', label: 'Sí, urgent' },
          { id: 'soon', label: 'Pròximament' },
          { id: 'no', label: 'No' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('sanitary_risk', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 4:
        return [
          { id: 'cocina', label: 'Cuina' },
          { id: 'almacen', label: 'Magatzem' },
          { id: 'clientes', label: 'Zona clients' },
          { id: 'baños', label: 'Banys' },
          { id: 'exterior', label: 'Exterior' },
          { id: 'varias', label: 'Diverses zones' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('where_empresa', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 5:
        return [
          { id: 'puntual', label: 'Avistaments puntuals' },
          { id: 'frequent', label: 'Freqüent' },
          { id: 'grave', label: 'Greu' },
          { id: 'closure', label: 'Tancament imminent' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('level', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      case 6:
        return [
          { id: 'yes', label: 'Sí' },
          { id: 'no', label: 'No' },
          { id: 'unknown', label: 'No ho sé' }
        ].map(opt => (
          <button key={opt.id} onClick={() => handleAnswer('certificate', opt.id)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white font-bold text-sm text-center min-w-[200px]">
            {opt.label}
          </button>
        ));
      default: return null;
    }
  };

  const getQuestion = () => {
    if (step === 1) return 'Qui necessita el servei?';
    if (path === 'particular') {
      if (step === 2) return 'On has vist paneroles?';
      if (step === 3) return 'Quantes n\'has vist?';
      if (step === 4) return 'Des de quan passa?';
      if (step === 5) return 'És urgent?';
      if (step === 6) return 'Hi ha nens o mascotes?';
    }
    if (path === 'empresa') {
      if (step === 2) return 'Quin tipus de negoci ets?';
      if (step === 3) return 'Hi ha inspecció sanitària?';
      if (step === 4) return 'On apareix el problema?';
      if (step === 5) return 'Nivell del problema';
      if (step === 6) return 'Necessites certificat?';
    }
    return 'Explica\'ns més';
  };

  const renderCurrentStep = () => {
    if (step === 1) {
      return [
        { id: 'particular', label: 'Particular / Habitatge', icon: Home },
        { id: 'empresa', label: 'Empresa / Negoci', icon: Building2 },
        { id: 'comunidad', label: 'Comunitat de veïns', icon: Users },
        { id: 'admin', label: 'Administració / Local públic', icon: Building2 },
        { id: 'unknown', label: 'No ho sé', icon: AlertTriangle },
        { id: 'chat_direct', label: 'Tinc preguntes / Consultar Agent', icon: MessageSquare, primary: true }
      ].map(opt => (
        <button key={opt.id} onClick={() => handleAnswer('who', opt.id)} className={`flex items-center p-5 rounded-2xl border transition-all group text-left min-w-[260px] ${opt.primary ? 'bg-accent-green text-black border-accent-green' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}>
          <opt.icon size={20} className={`mr-4 ${opt.primary ? 'text-black' : 'text-accent-green'}`} />
          <span className="font-bold">{opt.label}</span>
        </button>
      ));
    }
    
    if (path === 'particular') return renderParticularFlow();
    if (path === 'empresa') return renderEmpresaFlow();
    
    return (
      <div className="w-full max-w-xs">
        <Button variant="accent" onClick={() => handleAnswer('finish', 'finish')} className="w-full">
          Finalitzar Diagnòstic
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="mb-3">
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
      <div className={`grid gap-3 max-w-3xl mx-auto w-full ${step === 6 ? 'grid-cols-1 max-w-xs' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default DiagnosticFlow;
