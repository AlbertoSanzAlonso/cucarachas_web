import { Phone, MessageSquare } from 'lucide-react';

const FloatingCTA = () => {
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4">
      <a 
        href="tel:900123456" 
        className="bg-primary-blue text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
        title="Llama ahora"
      >
        <Phone size={24} />
      </a>
      <a 
        href="#contacto" 
        className="bg-secondary-gray text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300"
        title="Pide Presupuesto"
      >
        <MessageSquare size={24} />
      </a>
    </div>
  );
};

export default FloatingCTA;
