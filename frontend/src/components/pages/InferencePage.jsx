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
            [propertyName.toLowerCase()]: value === "" ? "" : value, // Сбрасываем на пустую строку, если выбрано "Не выбрано"
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
        <div>
            <h1>Ввод исходных данных</h1>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <h2>Выберите значения свойств:</h2>
            {properties.map((property) => (
                <div key={property.id} style={{ marginBottom: '20px' }}>
                    <h3>{property.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <select
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
                            onClick={() => handleResetValue(property.name)}
                            disabled={!selectedValues[property.name.toLowerCase()]}
                        >
                            Сбросить
                        </button>
                    </div>
                </div>
            ))}
            <h2>Введенные данные:</h2>
            <ul>
                {Object.entries(selectedValues).map(([propertyName, value]) => (
                    <li key={propertyName}>
                        <strong>{propertyName}:</strong> {value || "Значение не выбрано"}
                    </li>
                ))}
            </ul>
            <div style={{ marginTop: '20px' }}>
                <Link to="/">
                    <button style={{ marginRight: '10px' }}>Посмотреть базу знаний</button>
                </Link>
                <button onClick={handleClassify} style={{ marginRight: '10px' }}>
                    Определить тип (Решатель)
                </button>
                <button onClick={handleClassifyAI}>
                    Определить тип (ИИ)
                </button>
            </div>
            {result && (
                <div>
                    <h2>Результат классификации (Решатель):</h2>
                    <p><strong>Тип предмета:</strong> {result.type}</p>
                    <h3>Объяснение:</h3>
                    <ul>
                        {result.explanation.map((exp, index) => (
                            <li key={index}>{exp}</li>
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
                    <h2>Результат классификации (ИИ):</h2>
                    <p><strong>Тип предмета:</strong> {resultAI.type}</p>
                    <h3>Объяснение:</h3>
                    <ul>
                        {resultAI.explanation.map((exp, index) => (
                            <li key={index}>{exp}</li>
                        ))}
                    </ul>
                    <h3>Вероятности:</h3>
                    <ul>
                        {Object.entries(resultAI.probabilities).map(([type, prob]) => (
                            <li key={type}>{type}: {prob.toFixed(4)}</li>
                        ))}
                    </ul>
                </div>
            )}
            {classificationErrorAI && (
                <div style={{ color: 'red' }}>
                    Ошибка классификации (ИИ): {classificationErrorAI}
                </div>
            )}
        </div>
    );
};

export default InferencePage;