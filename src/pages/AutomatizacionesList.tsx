import React from 'react';

import Automatizaciones from '../components/Automatizaciones';
import TiposAutomatizacionPanel from '../components/TiposAutomatizacionPanel';

const AutomatizacionesList = () => (
  <div className="min-h-[80vh] flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 py-12">
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700 tracking-tight drop-shadow">Automatizaciones</h1>
      <TiposAutomatizacionPanel />
      <div className="my-10 border-t border-gray-200" />
      <Automatizaciones />
    </div>
  </div>
);

export default AutomatizacionesList;
