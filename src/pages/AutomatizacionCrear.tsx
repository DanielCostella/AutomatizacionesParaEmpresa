import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { crearAutomatizacion, apiFetch } from '../api';

interface TipoAutomatizacion {
  id: string;
  nombre: string;
}

// Campos por tipo de automatización (puedes expandir según el backend)
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



const AutomatizacionCrear = () => {
  const [tipos, setTipos] = useState<TipoAutomatizacion[]>([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('');
  const [parametros, setParametros] = useState<Record<string, string>>({});
  const [paso, setPaso] = useState(1); // 1: nombre, 2: tipo, 3: params, 4: confirmación
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Si viene ?tipo= en la URL, preselecciona el tipo y salta al paso 1 o 2
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tipoParam = params.get('tipo');
    if (tipoParam) {
      setTipo(tipoParam);
      setPaso(1); // Si quieres saltar directo a paso 3, pon setPaso(3)
    }
  }, [location.search]);

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

  // Paso 1: nombre
  const handleNombre = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      setError('Ingresa un nombre para la automatización');
      return;
    }
    setError('');
    setPaso(2);
  };

  // Paso 2: tipo
  const handleTipo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipo) {
      setError('Selecciona un tipo de automatización');
      return;
    }
    setError('');
    setPaso(3);
  };

  // Paso 3: parámetros
  const handleParams = (e: React.FormEvent) => {
    e.preventDefault();
    const campos = camposPorTipo[tipo] || [];
    for (const campo of campos) {
      if (!parametros[campo.name]) {
        setError(`Completa el campo: ${campo.label}`);
        return;
      }
    }
    setError('');
    setPaso(4);
  };

  // Paso 4: confirmar y guardar
  const handleConfirmar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await crearAutomatizacion(nombre, tipo, parametros);
      setExito(true);
      setTimeout(() => navigate('/automatizaciones'), 1200);
    } catch {
      setError('Error al crear automatización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-10 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-700">Crear Automatización</h2>
      {/* Paso 1: Nombre */}
      {paso === 1 && (
        <form onSubmit={handleNombre} className="flex flex-col gap-8 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Nombre de la automatización</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej: Enviar WhatsApp a clientes"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl shadow hover:from-blue-600 hover:to-green-600 transition text-lg font-semibold"
          >
            Siguiente
          </button>
        </form>
      )}
      {/* Paso 2: Tipo */}
      {paso === 2 && (
        <form onSubmit={handleTipo} className="flex flex-col gap-8 mb-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Tipo de automatización</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading || tipos.length === 0}
              required
            >
              <option value="">Selecciona un tipo...</option>
              {tipos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
              onClick={() => setPaso(1)}
            >
              Atrás
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl shadow hover:from-blue-600 hover:to-green-600 transition text-lg font-semibold"
              disabled={loading || tipos.length === 0}
            >
              Siguiente
            </button>
          </div>
        </form>
      )}
      {/* Paso 3: Parámetros */}
      {paso === 3 && (
        <form onSubmit={handleParams} className="flex flex-col gap-8 mb-6">
          {(camposPorTipo[tipo] || []).map(campo => (
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
          <div className="flex gap-4">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
              onClick={() => setPaso(2)}
            >
              Atrás
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl shadow hover:from-blue-600 hover:to-green-600 transition text-lg font-semibold"
            >
              Siguiente
            </button>
          </div>
        </form>
      )}
      {/* Paso 4: Confirmación */}
      {paso === 4 && (
        <form onSubmit={handleConfirmar} className="flex flex-col gap-8 mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2 text-blue-700">Confirma los datos</h3>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="mb-2"><span className="font-semibold">Nombre:</span> {nombre}</div>
              <div className="mb-2"><span className="font-semibold">Tipo:</span> {tipos.find(t => t.id === tipo)?.nombre}</div>
              {(camposPorTipo[tipo] || []).map(campo => (
                <div key={campo.name}><span className="font-semibold">{campo.label}:</span> {parametros[campo.name]}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold shadow hover:bg-gray-300 transition"
              onClick={() => setPaso(3)}
            >
              Atrás
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-xl shadow hover:from-blue-600 hover:to-green-600 transition text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Confirmar y crear'}
            </button>
          </div>
        </form>
      )}
      {/* Mensaje de éxito */}
      {exito && (
        <div className="text-center text-green-600 font-bold text-lg mt-4">¡Automatización creada con éxito!</div>
      )}
      {loading && paso === 2 && <div className="text-center text-gray-500">Cargando tipos de automatización...</div>}
      {!loading && tipos.length === 0 && !error && (
        <div className="text-center text-gray-500">No hay tipos disponibles.</div>
      )}
      {error && <div className="text-red-500 text-center mt-2">{error}</div>}
    </div>
  );
};

export default AutomatizacionCrear;
