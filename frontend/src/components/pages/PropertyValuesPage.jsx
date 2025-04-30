import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const PropertyValuesPage = () => {
    const [types, setTypes] = useState([]);
    const [properties, setProperties] = useState([]);
    const [possibleValues, setPossibleValues] = useState({});
    const [propertyValues, setPropertyValues] = useState({});
    const [selectedType, setSelectedType] = useState('');
    const [selectedProperty, setSelectedProperty] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeProperties, setTypeProperties] = useState({});


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

    useEffect(() => {
        const fetchPossibleValues = async () => {
            if (selectedProperty) {
                try {
                    const propertyName = properties.find(p => p.id === parseInt(selectedProperty))?.name;
                    if (!propertyName) {
                        setPossibleValues({});
                        return;
                    }
                    const data = await api.getPossibleValues(propertyName);
                    const values = {};
                    values[propertyName] = data.map(item => item.value);
                    setPossibleValues(values);

                } catch (error) {
                    setError(error.message);
                }
            } else {
                setPossibleValues({});
            }
        };
        fetchPossibleValues();
    }, [selectedProperty, properties]);

  //  useEffect
  useEffect(() => {
    const fetchPropertyValues = async () => {
      console.log("Fetching property values for type:", selectedType, "property:", selectedProperty);
      if (selectedType && selectedProperty) {
        try {
          const propertyName = properties.find((p) => p.id === parseInt(selectedProperty))?.name;
          if (!propertyName) {
            setPropertyValues({});
            return;
          }
          const data = await api.getPropertyValues(selectedType, selectedProperty);
          console.log("Fetched property values:", data);
          const values = {};
            if (data && data.length > 0 && data[0].values) {
                values[selectedType] = {};
                values[selectedType][propertyName] = data[0].values;
            } else {
                values[selectedType] = {};
                values[selectedType][propertyName] = [];
            }

          setPropertyValues(values);
        } catch (error) {
          setError(error.message);
        }
      } else {
        setPropertyValues({});
      }
    };
    fetchPropertyValues();
  }, [selectedType, selectedProperty, properties]);


    useEffect(() => {
        const fetchTypePropertiesForSelectedType = async () => {
            if (selectedType) {
                try {
                    const typePropertiesData = await api.getTypeProperties(selectedType);
                      if (typePropertiesData.length > 0) {
                        const firstPropertyName = typePropertiesData[0];
                        const property = properties.find(p => p.name === firstPropertyName);
                        if (property) {
                            setSelectedProperty(property.id);
                        } else {
                            setSelectedProperty('');
                        }
                    } else {
                        setSelectedProperty('');
                    }
                } catch (error) {
                    setError(error.message);
                }
            }
        }
        fetchTypePropertiesForSelectedType();
    }, [selectedType, properties]);


    const handleAddValue = async (value) => {
        if (!selectedType || !selectedProperty || !value) {
            setError("Выберите тип, свойство и значение!");
            return;
        }
        const propertyName = properties.find((prop) => prop.id === parseInt(selectedProperty))?.name;
                if (propertyValues[selectedType] && propertyValues[selectedType][propertyName] && propertyValues[selectedType][propertyName].includes(value)) {
            setError("Такое значение уже добавлено!");
            return;
        }

        try {
            const newValue = [value];
            await api.createPropertyValue(selectedType, selectedProperty, { values: newValue });

            setPropertyValues(prev => {
                const updatedTypeValues = { ...(prev[selectedType] || {}) };
                const updatedPropertyValues = [...(updatedTypeValues[propertyName] || []), ...newValue];
                updatedTypeValues[propertyName] = updatedPropertyValues;

                return {
                    ...prev,
                    [selectedType]: updatedTypeValues
                };
            });
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

const handleDeleteValue = async (value) => {
    if (!selectedType || !selectedProperty) {
        setError("Выберите тип и свойство!");
        return;
    }

    try {
        await api.deletePropertyValue(selectedType, selectedProperty, value);

        const propertyName = properties.find((prop) => prop.id === parseInt(selectedProperty))?.name;
        if (!propertyName) {
            return;
        }

        const data = await api.getPropertyValues(selectedType, selectedProperty);
        const values = {};
        if (data && data.length > 0 && data[0].values) {
            values[selectedType] = {};
            values[selectedType][propertyName] = data[0].values;
        } else {
            values[selectedType] = {};
            values[selectedType][propertyName] = [];
        }
        setPropertyValues(values);
        setError(null);
    } catch (error) {
        setError(error.message);
    }
};

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="block rounded-lg p-10 bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-black">
            <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                <h2>Значения свойств для типов</h2>
                </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <div className="flex m-1 gap-2 justify-center w-100">
            <select
                class="flex-1  w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
            >
                <option value="">Выберите тип</option>
                {types.map((type) => (
                    <option key={type.id} value={type.id}>
                        {type.name}
                    </option>
                ))}
            </select>

            <select
                class="flex-1  w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
            >
                <option value="">Выберите свойство</option>
                {properties
                    .filter(property =>
                        selectedType ? (typeProperties[selectedType] || []).includes(property.name) : false
                    )
                    .map((property) => (
                        <option key={property.id} value={property.id}>
                            {property.name}
                        </option>
                    ))}
            </select>
            </div>        
            {selectedType && selectedProperty && (
                <div>
                    <h3>
                        Значения для{" "}
                        {properties.find((prop) => prop.id === parseInt(selectedProperty))?.name} типа{" "}
                        {types.find((type) => type.id === parseInt(selectedType))?.name}
                    </h3>
                    <ul className="pt-3 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                        {propertyValues[selectedType] && propertyValues[selectedType][properties.find(prop => prop.id === parseInt(selectedProperty))?.name]
                            ? (propertyValues[selectedType][properties.find(prop => prop.id === parseInt(selectedProperty))?.name]
                                .map((value, index) => (
                                    <li key={index} className="flex justify-between pl-3 font-semibold text-gray-900 dark:text-black" >
                                        {value}
                                        <button className="right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                        onClick={() => handleDeleteValue(value)}> - </button>
                                    </li>
                                ))
                            )
                            : (<li>Нет значений</li>)
                        }
                    </ul>

                    <select 
                        class="flex-1  w-auto bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(e) => handleAddValue(e.target.value)}>
                        <option value="">Выберите значение</option>
                        {possibleValues[properties.find(prop => prop.id === parseInt(selectedProperty))?.name]
                            ?.map((value) => (
                                <option key={value} value={value}>
                                   {value}
                                </option>
                            ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default PropertyValuesPage;