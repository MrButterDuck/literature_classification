import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';

const PropertiesPage = () => {
    const [properties, setProperties] = useState([]);
    const [newProperty, setNewProperty] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
         const fetchProperties = async () => {
            try {
                const data = await api.getProperties();
                setProperties(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const handleAddProperty = async () => {
        if (newProperty.trim() === '') {
            setError("Введите название свойства!");
            return;
        }
        try {
            const addedProperty = await api.createProperty({ name: newProperty });
            setProperties([...properties, addedProperty]);
            setNewProperty('');
            setError(null);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteProperty = async (propertyId) => {
        try {
            await api.deleteProperty(propertyId);
            setProperties(properties.filter(property => property.id !== propertyId));
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
                <h2>Свойства</h2>
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div className="relative flex justify-center m-1 w-100">
                <input 
                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md pl-3 pr-40 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                    type="text" 
                    value={newProperty}
                    onChange={(e) => setNewProperty(e.target.value)}
                    placeholder='Введите новое свойство'/>
                <button className="absolute right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" 
                    onClick={handleAddProperty} >
                    Добавить тип
                </button>
            </div>
            <ul className="pt-6 max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                {properties.map((property) => (
                    <li key={property.id} className="pl-3 pr-3 flex justify-between font-semibold text-gray-900 dark:text-black">
                        {property.name}
                        <button className="right-2 top-1 rounded bg-slate-800 py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                         onClick={() => handleDeleteProperty(property.id)}> - </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PropertiesPage;