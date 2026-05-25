import React from 'react';
import casaCiudad from '../../assets/casa_ciudad.jpg';

export default function Contacto() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-16 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#243e7b] tracking-tight mb-4">
          Contacto
        </h1>
        <div className="w-24 h-1.5 bg-[#9ce694] mx-auto rounded-full"></div>
        <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto leading-relaxed">
          Contáctenos en caso de cualquier duda o consulta. Estamos para servirle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Lado izquierdo: Tarjetas de Información */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Tarjeta de Teléfono */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
            <div className="p-3.5 bg-[#9ce694]/10 rounded-2xl text-emerald-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Teléfonos de Atención</h3>
              <p className="text-gray-500 text-sm mb-2">Llámenos para consultas directas y matrículas:</p>
              <div className="flex flex-col gap-1">
                <a href="tel:84535107" className="text-[#243e7b] hover:text-[#9ce694] font-extrabold text-lg transition-colors flex items-center gap-1.5">
                  8453-5107
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium">Celular</span>
                </a>
                <a href="tel:25502340" className="text-[#243e7b] hover:text-[#9ce694] font-extrabold text-lg transition-colors flex items-center gap-1.5">
                  2550-2340
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-medium">Oficina</span>
                </a>
              </div>
            </div>
          </div>

          {/* Tarjeta de Correo Electrónico */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
            <div className="p-3.5 bg-[#9ce694]/10 rounded-2xl text-emerald-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Correo Electrónico</h3>
              <p className="text-gray-500 text-sm mb-2">Envíenos un mensaje y responderemos a la brevedad:</p>
              <a 
                href="mailto:cursoscasadelaciudad@itcr.ac.cr" 
                className="text-[#243e7b] hover:text-[#9ce694] font-extrabold text-base md:text-lg transition-colors break-words block"
              >
                cursoscasadelaciudad@itcr.ac.cr
              </a>
            </div>
          </div>

          {/* Tarjeta de Ubicación e Información de Casa de la Ciudad */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
            <div className="p-3.5 bg-[#9ce694]/10 rounded-2xl text-emerald-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Ubicación y Sede</h3>
              <p className="text-gray-500 text-sm mb-1 font-medium">Casa de la Ciudad</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Cartago, Costa Rica. Programa de Extensión Cultural de la Escuela de Cultura y Deporte, Tecnológico de Costa Rica.
              </p>
            </div>
          </div>

        </div>

        {/* Lado derecho: Imagen de la Sede */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-100/50 group h-full min-h-[300px] lg:min-h-[450px]">
            <img 
              src={casaCiudad} 
              alt="Sede Casa de la Ciudad" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
              <span className="text-xs font-bold uppercase tracking-widest text-[#9ce694] drop-shadow-sm mb-1 block">Sede</span>
              <h3 className="text-2xl font-bold drop-shadow-md">Casa de la Ciudad, Cartago</h3>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
