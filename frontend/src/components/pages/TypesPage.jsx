import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const TypesPage = () => {
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const data = await api.getTypes();
        setTypes(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  const handleAddType = async () => {
    if (newType.trim() === '') {
        setError("Введите название типа!");
        return;
    }
    try {
      const addedType = await api.createType({ name: newType });
      setTypes([...types, addedType]);
      setNewType('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteType = async (typeId) => {
    try {
      await api.deleteType(typeId);
      setTypes(types.filter(type => type.id !== typeId));
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="block p-10 rounded-lg bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-black">
      <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
        <h2>Типы произведений</h2>
      </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className=" ">
        <div className="relative flex justify-center m-1 w-100">
          <input 
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-40 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            type="text" 
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Введите новый тип"/>
          <button 
            className="absolute right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" 
            onClick={handleAddType} >
            Добавить тип
          </button>
        </div>
        <ol className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
          {types.map((type) => (
            <li key={type.id} className="flex justify-between font-semibold text-gray-900 dark:text-black">
              {type.name}
              <button className="right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" onClick={() => handleDeleteType(type.id)}> - </button>
            </li>
          ))}
        </ol>
      </div>
    </div>    
  );
};

export default TypesPage;