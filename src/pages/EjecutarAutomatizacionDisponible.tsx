import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

// Campos por tipo de automatización (igual que en crear)
const camposPorTipo: Record<string, { label: string; name: string; type: string; placeholder?: string }[]> = {
  'enviar_whatsapp': [
    { label: 'Mensaje', name: 'mensaje', type: 'text', placeholder: 'Escribe el mensaje...' },
  ],
  'actualizar_sheets': [
    { label: 'Hoja', name: 'hoja', type: 'text', placeholder: 'Nombre de la hoja' },
    { label: 'Valor', name: 'valor', type: 'text', placeholder: 'Nuevo valor' },
  ],
  // Agrega más tipos y campos aquí si tu backend lo soporta
};

const nombresPorTipo: Record<string, string> = {
  'enviar_whatsapp': 'Enviar WhatsApp',
  'actualizar_sheets': 'Actualizar Google Sheets',
  // ...
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
      // Llama al backend para ejecutar la automatización de este tipo con los parámetros
      const res = await apiFetch(`/automatizaciones/ejecutar-tipo`, {
        method: 'POST',
        body: JSON.stringify({ tipo: tipoId, parametros })
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
            <input
              type={campo.type}
              name={campo.name}
              value={parametros[campo.name] || ''}
              onChange={e => setParametros(p => ({ ...p, [campo.name]: e.target.value }))}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder={campo.placeholder}
              required
            />
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
        <div className="mt-4 text-center text-green-600 font-bold">¡Automatización ejecutada!</div>
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
