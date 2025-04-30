import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const PossibleValuesPage = () => {
  const [properties, setProperties] = useState([]);
  const [possibleValues, setPossibleValues] = useState({});
  const [selectedProperty, setSelectedProperty] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await api.getProperties();
        setProperties(data);
        if (data.length > 0) {
          setSelectedProperty(data[0].name);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

      useEffect(() => {
    const fetchValues = async () => {
      if (selectedProperty) {
        try {
          const data = await api.getPossibleValues(selectedProperty);
          const values = {};
          data.forEach(item => {
            if (!values[item.property_name]) {
              values[item.property_name] = [];
            }
            values[item.property_name].push(item.value);
          });
          setPossibleValues(values);
        } catch (error) {
          setError(error.message);
        }
      }
    };
    fetchValues();
  }, [selectedProperty]);

  const handleAddPossibleValue = async () => {
    if (newValue.trim() === '' || !selectedProperty) {
        setError("Выберите свойство и введите значение!");
        return;
    }
    try {
      await api.createPossibleValue(selectedProperty, { value: newValue });
      setPossibleValues(prevValues => ({
        ...prevValues,
        [selectedProperty]: [...(prevValues[selectedProperty] || []), newValue]
      }));
      setNewValue('');
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeletePossibleValue = async (value) => {
    try {
      await api.deletePossibleValue(selectedProperty, value);
      setPossibleValues(prevValues => ({
        ...prevValues,
        [selectedProperty]: prevValues[selectedProperty].filter(v => v !== value)
      }));
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
        <h2>Возможные значения</h2>
      </div>

        {error && <div style={{color: 'red'}}>{error}</div>}


      <div className="relative flex justify-center m-1 w-100">
          <select class="absolute left-1 top-1 w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block py-1 px-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedProperty} 
            onChange={(e) => setSelectedProperty(e.target.value)}>
            {properties.map((property) => (
              <option key={property.id} value={property.name}>
                {property.name}
              </option>
            ))}
          </select>
          <input 
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-36 pr-25 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            type="text" 
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Введите новое значение"/>
          <button className="absolute right-1 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" onClick={handleAddPossibleValue} >
            Добавить
          </button>
      </div>
      {selectedProperty && (
        <ul className="pt-3 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
          {possibleValues[selectedProperty]?.map((value, index) => (
            <li key={index} className="flex justify-between pl-3 font-semibold text-gray-900 dark:text-black">
              {value}
              <button className="right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
               onClick={() => handleDeletePossibleValue(value)}> - </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PossibleValuesPage;