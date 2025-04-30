import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const TypePropertiesPage = () => {
    const [types, setTypes] = useState([]);
    const [properties, setProperties] = useState([]);
    const [typeProperties, setTypeProperties] = useState({});
    const [selectedType, setSelectedType] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const typesData = await api.getTypes();
                const propertiesData = await api.getProperties();
                setTypes(typesData);
                setProperties(propertiesData);

                if (typesData.length > 0) {
                    setSelectedType(typesData[0].id);
                }

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchTypeProperties = async () => {
            if (selectedType) {
                try {
                    const data = await api.getTypeProperties(selectedType);
                    setTypeProperties(prevTypeProperties => ({
                        ...prevTypeProperties,
                        [selectedType]: data
                    }));
                } catch (error) {
                    setError(error.message);
                }
            }
        };
        fetchTypeProperties();
    }, [selectedType]);

   const handleAddTypeProperty = async (property) => {
    try {
        await api.createTypeProperty(selectedType, property);
        setTypeProperties(prev => ({
            ...prev,
             [selectedType]: [...(prev[selectedType] || []), property]
        }));
        setError(null);
    } catch (error) {
        setError(error.message);
    }
    };

    const handleDeleteTypeProperty = async (property) => {
        try {
            await api.deleteTypeProperty(selectedType, property);
            setTypeProperties(prev => ({
                ...prev,
                [selectedType]: prev[selectedType] ? prev[selectedType].filter(p => p !== property) : []
            }));
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleCheckboxChange = (property) => {
        if (typeProperties[selectedType] && typeProperties[selectedType].includes(property)) {
          handleDeleteTypeProperty(property);
        }
         else {
            handleAddTypeProperty(property);
        }

    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div className="block rounded-lg p-10 bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-black ">
            <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                <h2>Свойства для типов</h2>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div className="flex justify-center m-1 w-100">
                <select class="absolute w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                    {types.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>    
            {selectedType && (
                <div className="mt-10">
                    <h3>Свойства для {types.find(type => type.id === parseInt(selectedType))?.name}:</h3>
                     {properties.map(property => {
                        const propertyName = property.name;
                        return (
                            <div key={propertyName} class="flex">
                            <label class="flex items-center cursor-pointer relative" htmlFor={`${selectedType}-${propertyName}`}>
                              <input
                                class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                type="checkbox"
                                id={`${selectedType}-${propertyName}`}
                                checked={typeProperties[selectedType] ? typeProperties[selectedType].includes(propertyName) : false}
                                onChange={() => handleCheckboxChange(propertyName)}
                               />
                              <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                                  stroke="currentColor" stroke-width="1">
                                  <path fill-rule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clip-rule="evenodd"></path>
                                </svg>
                              </span>
                            </label>
                            <label class="cursor-pointer ml-2 text-slate-600 " htmlFor={`${selectedType}-${propertyName}`}>
                            {propertyName}
                            </label>
                          </div>
                        );
                    })}
                </div>
            )}
        
        </div>
    );
};

export default TypePropertiesPage;