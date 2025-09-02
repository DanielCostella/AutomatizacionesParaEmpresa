import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

const camposPorTipo: Record<string, { label: string; name: string; type: string; placeholder?: string }[]> = {
  whatsapp: [
    { label: 'Números de destino', name: 'numeros', type: 'textarea', placeholder: 'Un número por línea o separados por coma. Ej: +5492611111111, +5492612222222' },
    { label: 'Mensaje', name: 'mensaje', type: 'text', placeholder: 'Escribe el mensaje...' },
  ],
  email: [
    { label: 'Destinatario', name: 'destinatario', type: 'email', placeholder: 'correo@ejemplo.com' },
    { label: 'Asunto', name: 'asunto', type: 'text', placeholder: 'Asunto del email' },
    { label: 'Cuerpo', name: 'cuerpo', type: 'text', placeholder: 'Mensaje del email' },
  ],
  sheets: [
    { label: 'Hoja', name: 'hoja', type: 'text', placeholder: 'Nombre de la hoja' },
    { label: 'Valor', name: 'valor', type: 'text', placeholder: 'Nuevo valor' },
  ],
};

const nombresPorTipo: Record<string, string> = {
  whatsapp: 'Enviar WhatsApp',
  email: 'Enviar Email',
  sheets: 'Actualizar Google Sheets',
};

const EjecutarAutomatizacionDisponible: React.FC = () => {
  const { tipoId } = useParams();
  const [parametros, setParametros] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const navigate = useNavigate();

  const campos = camposPorTipo[tipoId || ''] || [];
  const nombreTipo = nombresPorTipo[tipoId || ''] || tipoId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResultado(null);
    try {
      let paramsToSend: any = { ...parametros };
      if (tipoId === 'whatsapp') {
        let numerosRaw = parametros['numeros'] || '';
        let numeros = numerosRaw.split(/[\,\n]+/).map((n: string) => n.trim()).filter(Boolean);
        numeros = numeros.map((numero: string) => {
          if (!numero.startsWith('whatsapp:')) {
            numero = 'whatsapp:' + numero.replace(/^\+?/, '');
          }
          return numero;
        });
        paramsToSend = {
          to: numeros.join(','),
          body: parametros['mensaje'] || ''
        };
      }
      const res = await apiFetch(`/automatizaciones/ejecutar-tipo`, {
        method: 'POST',
        body: JSON.stringify({ tipo: tipoId, parametros: paramsToSend })
      });
      const data = await res.json();
      setResultado(data);
    } catch {
      setError('Error al ejecutar la automatización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-10 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">{nombreTipo}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 mb-6">
        {campos.map(campo => (
          <div key={campo.name}>
            <label className="block mb-2 font-semibold text-gray-700">{campo.label}</label>
            {campo.type === 'textarea' ? (
              <textarea
                name={campo.name}
                value={parametros[campo.name] || ''}
                onChange={e => setParametros(p => ({ ...p, [campo.name]: e.target.value }))}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                placeholder={campo.placeholder}
                required
              />
            ) : (
              <input
                type={campo.type}
                name={campo.name}
                value={parametros[campo.name] || ''}
                onChange={e => setParametros(p => ({ ...p, [campo.name]: e.target.value }))}
                className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={campo.placeholder}
                required
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl shadow hover:from-blue-600 hover:to-green-600 transition text-lg font-semibold"
          disabled={loading}
        >
          {loading ? 'Ejecutando...' : 'Ejecutar'}
        </button>
      </form>
      {resultado && (
        <div className="mt-4">
          <div className="text-center text-green-600 font-bold mb-2">¡Automatización ejecutada!</div>
          {Array.isArray(resultado.resultados) && resultado.resultados.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
              <h4 className="font-semibold text-blue-700 mb-2">Detalles de la ejecución:</h4>
              <ul className="list-disc ml-6 text-gray-700 text-sm">
                {resultado.resultados.map((r: any, i: number) => (
                  <li key={i} className="mb-1">
                    <span className="font-medium">Acción:</span> {r.accion?.replace('_', ' ')} |
                    <span className="font-medium ml-1">Estado:</span> <span className={r.status === 'enviado' || r.status === 'actualizado' ? 'text-green-600' : r.status === 'error' ? 'text-red-600' : 'text-gray-600'}>{r.status}</span>
                    {r.parametros && (
                      <span> | <span className="font-medium">Parámetros:</span> {typeof r.parametros === 'string' ? r.parametros : JSON.stringify(r.parametros)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
      <button
        className="mt-4 text-blue-600 underline text-sm"
        onClick={() => navigate('/automatizaciones')}
      >
        Volver
      </button>
    </div>
  );
};

export default EjecutarAutomatizacionDisponible;

