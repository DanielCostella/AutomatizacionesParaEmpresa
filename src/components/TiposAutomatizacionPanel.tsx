import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { PlusCircleIcon } from '@heroicons/react/24/solid';

interface TipoAutomatizacion {
  id: string;
  nombre: string;
  descripcion?: string;
}

const TiposAutomatizacionPanel: React.FC = () => {
  const [tipos, setTipos] = useState<TipoAutomatizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiFetch('/automatizaciones/tipos')
      .then(res => {
        if (!res.ok) throw new Error('No autorizado');
        return res.json();
      })
      .then(data => setTipos(data))
      .catch(() => setError('Error al cargar tipos de automatización'))
      .finally(() => setLoading(false));
  }, []);

  const handleEjecutar = (tipoId: string) => {
    // Redirige al flujo de ejecución guiada para ese tipo
    navigate(`/automatizaciones/ejecutar/${tipoId}`);
  };

  if (loading) return <div className="text-center mt-8">Cargando tipos...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Automatizaciones Disponibles</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {tipos.map(tipo => (
          <div key={tipo.id} className="bg-white border border-blue-100 rounded-2xl shadow-md p-7 flex flex-col gap-3 items-center hover:shadow-xl transition">
            <div className="w-12 h-12 mb-2 flex items-center justify-center bg-blue-50 rounded-full">
              <PlusCircleIcon className="w-8 h-8 text-blue-500" />
            </div>
            <span className="text-lg font-semibold text-blue-800 text-center">{tipo.nombre}</span>
            {tipo.descripcion && <span className="text-gray-500 text-sm text-center">{tipo.descripcion}</span>}
            <button
              onClick={() => handleEjecutar(tipo.id)}
              className="mt-3 px-6 py-2 rounded-lg font-semibold shadow bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 transition"
            >
              Ejecutar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TiposAutomatizacionPanel;
