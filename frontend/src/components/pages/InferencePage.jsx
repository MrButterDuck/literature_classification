import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Link } from 'react-router-dom';

const InferencePage = () => {
    const [properties, setProperties] = useState([]);
    const [possibleValues, setPossibleValues] = useState({});
    const [selectedValues, setSelectedValues] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [resultAI, setResultAI] = useState(null);
    const [classificationError, setClassificationError] = useState(null);
    const [classificationErrorAI, setClassificationErrorAI] = useState(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                console.log("Fetching properties...");
                const response = await api.getProperties();
                console.log("Properties response:", response);
                setProperties(response);
                const initialValues = {};
                response.forEach((property) => {
                    initialValues[property.name.toLowerCase()] = "";
                });
                setSelectedValues(initialValues);
            } catch (error) {
                console.error("Error fetching properties:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        const fetchAllPossibleValues = async () => {
            const allValues = {};
            try {
                console.log("Fetching possible values for properties:", properties);
                for (const property of properties) {
                    const data = await api.getPossibleValues(property.name);
                    console.log(`Possible values for ${property.name}:`, data);
                    allValues[property.name.toLowerCase()] = data.map(item => item.value);
                }
                setPossibleValues(allValues);
            } catch (error) {
                console.error("Error fetching possible values:", error);
                setError(error.message);
            }
        };
        if (properties.length > 0) {
            fetchAllPossibleValues();
        }
    }, [properties]);

    const handleValueChange = (propertyName, value) => {
        setSelectedValues(prevValues => ({
            ...prevValues,
            [propertyName.toLowerCase()]: value === "" ? "" : value,
        }));
    };

    const handleResetValue = (propertyName) => {
        setSelectedValues((prevValues) => ({
            ...prevValues,
            [propertyName.toLowerCase()]: "",
        }));
    };

    const handleClassify = async () => {
        setClassificationError(null);
        setResult(null);
        try {
            const result = await api.classifyItem({ properties: selectedValues });
            setResult(result);
        } catch (error) {
            setClassificationError(error.message);
        }
    };

    const handleClassifyAI = async () => {
        setClassificationErrorAI(null);
        setResultAI(null);
        console.log("Sending selectedValues:", selectedValues);
        try {
            const result = await api.classifyItemAI({ properties: selectedValues });
            setResultAI(result);
        } catch (error) {
            setClassificationErrorAI(error.message);
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    return (
        <div className="flex gap-4 rounded-lg p-10 bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-black ">
            <div className="flex-1">
                <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                    <h1>Ввод исходных данных</h1>
                </div>
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <h2>Выберите значения свойств:</h2>
                {properties.map((property) => (
                    <div key={property.id} style={{ marginBottom: '20px' }}>
                        <h3>{property.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <select
                                class="flex-1  w-32 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                value={selectedValues[property.name.toLowerCase()] || ""}
                                onChange={(e) => handleValueChange(property.name, e.target.value)}
                                style={{ marginRight: '10px', padding: '5px' }}
                            >
                                <option value="">Не выбрано</option>
                                {possibleValues[property.name.toLowerCase()] ? (
                                    possibleValues[property.name.toLowerCase()].map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))
                                ) : (
                                    <option disabled>Нет значений</option>
                                )}
                            </select>
                            <button
                                className="right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                                onClick={() => handleResetValue(property.name)}
                                disabled={!selectedValues[property.name.toLowerCase()]}
                            >
                                Сбросить
                            </button>
                        </div>
                    </div>
                ))}
                <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                    <h2>Введенные данные:</h2>
                </div>
                <ul className="pt-6 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                    {Object.entries(selectedValues).map(([propertyName, value]) => (
                        <li key={propertyName} className="pl-3 pr-3 flex justify-between font-semibold text-gray-900 dark:text-black">
                            <strong>{propertyName}:</strong> {value || "Значение не выбрано"}
                        </li>
                    ))}
                </ul>
                <div className='flex gap-10 justify-center'>
                    <button 
                        className=" rounded w-40 bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        onClick={handleClassify} style={{ marginRight: '10px' }}>
                        Определить тип (Решатель)
                    </button>
                    <button 
                        className="rounded w-40 bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        onClick={handleClassifyAI}>
                        Определить тип
                        (Нейронная сеть)
                    </button>
                </div>
            </div>
            {(result || classificationError || resultAI || classificationErrorAI ) && (
            <div className="flex-1">
                {result && (
                    <div>
                        <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                            <h2>Результат классификации (Решатель):</h2>
                        </div>
                        <p><strong>Тип предмета:</strong> {result.type}</p>
                        <h3>Объяснение:</h3>
                        <ul className="pb-6 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                            {result.explanation.map((exp, index) => (
                                <li key={index} className="pl-3 pr-3 flex justify-between font-semibold text-sm text-gray-900 dark:text-black">{exp}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {classificationError && (
                    <div style={{ color: 'red' }}>
                        Ошибка классификации (Решатель): {classificationError}
                    </div>
                )}
                {resultAI && (
                    <div>
                        <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
                            <h2>Результат классификации (Нейронная сеть):</h2>
                        </div>
                        <p><strong>Тип предмета:</strong> {resultAI.type}</p>
                        <h3>Объяснение:</h3>
                        <ul className="pb-6 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                            {resultAI.explanation.map((exp, index) => (
                                <li key={index} className="pl-3 pr-3 flex justify-between font-semibold text-gray-900 dark:text-black">{exp}</li>
                            ))}
                        </ul>
                        <h3>Вероятности:</h3>
                        <ul>
                            {Object.entries(resultAI.probabilities).map(([type, prob]) => (
                                <li key={type}>
                                    <strong>{type}:</strong> {(prob * 100).toFixed(2)}%
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {classificationErrorAI && (
                    <div style={{ color: 'red' }}>
                        Ошибка классификации (Нейронная сеть): {classificationErrorAI}
                    </div>
                )}
        </div>
        )}
        </div>
    );
};

export default InferencePage;