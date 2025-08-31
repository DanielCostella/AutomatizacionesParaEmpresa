import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface Automatizacion {
  id: number;
  nombre: string;
  acciones?: { accion: string; parametros?: string }[];
}

const Automatizaciones: React.FC = () => {
  const [automatizaciones, setAutomatizaciones] = useState<Automatizacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ejecutando, setEjecutando] = useState<number | null>(null);
  // Resultados por automatización: { [id]: { ok, resultados } }
  const [resultados, setResultados] = useState<Record<number, any>>({});
  const [unauthorized, setUnauthorized] = useState(false);

  const cargarAutomatizaciones = () => {
    setLoading(true);
    apiFetch('/automatizaciones')
      .then(async res => {
        if (res.status === 401) {
          localStorage.removeItem('token');
          setUnauthorized(true);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setAutomatizaciones(data);
        } else {
          setError('Respuesta inesperada del servidor');
        }
      })
      .catch(() => setError('Error al cargar automatizaciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarAutomatizaciones();
  }, []);
  // const handleCrear = ... // Eliminado: ya no se usa

  const ejecutar = async (id: number) => {
    setEjecutando(id);
    setError('');
    try {
      const res = await apiFetch(`/automatizaciones/${id}/ejecutar`, { method: 'POST' });
      const data = await res.json();
      setResultados(prev => ({ ...prev, [id]: data }));
    } catch {
      setError('Error al ejecutar la automatización');
    } finally {
      setEjecutando(null);
    }
  };

  if (unauthorized) {
    // Forzar recarga para mostrar pantalla de login
    window.location.reload();
    return null;
  }
  if (loading) return <div className="text-center mt-8">Cargando...</div>;
  if (error) return <div className="text-center text-red-500 mt-8">{error}</div>;

  return (
    <div>
      {automatizaciones.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No tienes automatizaciones aún.</div>
      ) : (
        <div className="grid gap-8">
          {automatizaciones.map(auto => (
            <div key={auto.id} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-7 flex flex-col gap-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-800 tracking-tight">{auto.nombre}</span>
                <button
                  onClick={() => ejecutar(auto.id)}
                  className={`px-6 py-2 rounded-lg font-semibold shadow transition text-white ${ejecutando === auto.id ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'}`}
                  disabled={ejecutando === auto.id}
                >
                  {ejecutando === auto.id ? 'Ejecutando...' : 'Ejecutar'}
                </button>
              </div>
              {/* Acciones asociadas */}
              {auto.acciones && auto.acciones.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {auto.acciones.map((accion, idx) => (
                    <span key={idx} className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {accion.accion.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
              {/* Resultado de ejecución */}
              {resultados[auto.id] && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {resultados[auto.id].ok ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-red-500" />
                    )}
                    <span className={`font-semibold ${resultados[auto.id].ok ? 'text-green-700' : 'text-red-700'}`}>{resultados[auto.id].ok ? '¡Ejecución exitosa!' : 'Error en la ejecución'}</span>
                  </div>
                  {/* Mostrar detalles de resultados */}
                  {Array.isArray(resultados[auto.id].resultados) && resultados[auto.id].resultados.length > 0 && (
                    <ul className="list-disc ml-6 text-sm text-gray-700">
                      {resultados[auto.id].resultados.map((r: any, i: number) => (
                        <li key={i} className="mb-1">
                          <span className="font-medium">Acción:</span> {r.accion.replace('_', ' ')} | <span className="font-medium">Estado:</span> <span className={r.status === 'ok' ? 'text-green-600' : 'text-red-600'}>{r.status}</span>
                          {r.parametros && (
                            <span> | <span className="font-medium">Parámetros:</span> {r.parametros}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Automatizaciones;

