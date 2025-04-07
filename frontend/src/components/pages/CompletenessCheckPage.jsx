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
    <div>
      <h2>Проверка полноты знаний</h2>

      <button onClick={checkCompleteness} disabled={loading}>
        {loading ? 'Проверка...' : 'Проверить полноту'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <div>
        <h3>Неполные типы:</h3>
        {incompleteTypes.length > 0 ? (
          <ul>
            {incompleteTypes.map((item, index) => (
              <li key={index}>
                {item.type === "Нет типов" ? (
                  "Типы предметов не определены."
                ) : (
                  <>
                    Тип: <strong>{item.type}</strong>, причина: {item.reason}
                    {item.properties && item.properties.length > 0 && (
                      <ul>
                        {item.properties.map((prop, propIndex) => (
                          <li key={propIndex}>{prop}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>Нет неполных типов.</p>
        )}
      </div>

      <div>
        <h3>Свойства без возможных значений:</h3>
        {propertiesWithoutValues.length > 0 ? (
          <ul>
            {propertiesWithoutValues.map((property, index) => (
              <li key={index}>
                {property === "Нет свойств"
                  ? "Свойства не определены."
                  : `Свойство "${property}" не имеет возможных значений.`}
              </li>
            ))}
          </ul>
        ) : (
          <p>У всех свойств есть возможные значения.</p>
        )}
      </div>
    </div>
  );
};

export default CompletenessCheckPage;