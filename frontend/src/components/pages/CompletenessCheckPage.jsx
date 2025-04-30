import React, { useState } from 'react';
import * as api from '../../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const CompletenessCheckPage = () => {
  const [incompleteTypes, setIncompleteTypes] = useState([]);
  const [propertiesWithoutValues, setPropertiesWithoutValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const checkCompleteness = async () => {
    setLoading(true);
    setError(null);
    setIncompleteTypes([]);
    setPropertiesWithoutValues([]);
    setIsComplete(false);

    try {
      const data = await api.checkCompleteness();
      setIncompleteTypes(data.incomplete_types || []);
      setPropertiesWithoutValues(data.properties_without_values || []);
      if (data.incomplete_types.length === 0 && data.properties_without_values.length === 0) {
        toast.success("Все поля заполнены!");
        setIsComplete(true);
      } else {
        toast.error("Не все поля заполнены!");
        setIsComplete(false);
      }
    } catch (error) {
      setError(error.message);
      toast.error("Ошибка при проверке полноты знаний!");
      setIsComplete(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="block rounded-lg p-10 bg-white text-surface shadow-secondary-1 dark:bg-surface-dark dark:text-black ">
      <div className="border-b-2 border-neutral-100 px-6 py-3 dark:border-black/10 text-center">
        <h2>Проверка полноты знаний</h2>
      </div>
      <div className="flex justify-center m-1 w-100">
        <button className="rounded w-full bg-slate-800 py-1 px-2.5 border border-transparent text-center text text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
          onClick={checkCompleteness} disabled={loading}>
          {loading ? 'Проверка...' : 'Проверить полноту'}
        </button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <h3 className="px-2 py-3 dark:border-black/10">Неполные типы:</h3>
        {incompleteTypes.length > 0 ? (
          <ul className="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
            {incompleteTypes.map((item, index) => (
              <li key={index} className="font-semibold text-gray-900 px-2 dark:text-black border-b-3 border-neutral-100 dark:border-black/10">
                {item.type === "Нет типов" ? (
                  "Типы предметов не определены."
                ) : (
                  <>
                    Тип: <strong>{item.type}</strong>, причина: {item.reason}
                    {item.properties && item.properties.length > 0 && (
                      <ul className="max-w-md ps-5 mt-2 space-y-1 text-gray-100 list-disc list-inside dark:text-gray-100 dark:border-black/10">
                        {item.properties.map((prop, propIndex) => (
                          <li key={propIndex} className="font-semibold text-gray-900 dark:text-black">{prop}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-2">Нет неполных типов.</p>
        )}
      </div>

      <div>
        <h3 className="p-2">Свойства без возможных значений:</h3>
        {propertiesWithoutValues.length > 0 ? (
          <ul className="max-w-md space-y-1 text-gray-500 list-none list-inside dark:text-gray-400">
            {propertiesWithoutValues.map((property, index) => (
              <li key={index} className="font-semibold text-gray-900 px-2 dark:text-black border-b-3 border-neutral-100 dark:border-black/10">
                {property === "Нет свойств"
                  ? "Свойства не определены."
                  : `Свойство "${property}" не имеет возможных значений.`}
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-2">У всех свойств есть возможные значения.</p>
        )}
      </div>
    </div>
  );
};

export default CompletenessCheckPage;