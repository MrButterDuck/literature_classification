const API_BASE_URL = 'http://localhost:8000';

async function fetchData(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, options);

  if (!response.ok) {
    let errorData;
    try {
        errorData = await response.json();
    } catch (parseError) {
        errorData = { detail: response.statusText };
    }

    const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;

    throw error;
  }

  return response.json();
}


export const getTypes = () => fetchData('/types');
export const createType = (typeData) => fetchData('/types', 'POST', typeData);
export const deleteType = (typeId) => fetchData(`/types/${typeId}`, 'DELETE');

export const getProperties = () => fetchData('/properties');
export const createProperty = (propertyData) => fetchData(`/properties`, 'POST', propertyData);
export const deleteProperty = (propertyId) => fetchData(`/properties/${propertyId}`, 'DELETE');

export const getPossibleValues = (propertyName) => fetchData(`/possible-values/${propertyName}`);
export const createPossibleValue = (propertyName, valueData) => fetchData(`/possible-values/${propertyName}`, 'POST', valueData);
export const deletePossibleValue = (propertyName, valueName) => fetchData(`/possible-values/${propertyName}/${valueName}`, 'DELETE');


export const getTypeProperties = (typeId) => fetchData(`/type-properties/${typeId}`);
export const createTypeProperty = (typeId, propertyName) => fetchData(`/type-properties/${typeId}`, 'POST', { property_name: propertyName });
export const deleteTypeProperty = (typeId, propertyName) => fetchData(`/type-properties/${typeId}/${propertyName}`, 'DELETE');


export const getPropertyValues = (typeId, propertyId) => fetchData(`/property-values/${typeId}/${propertyId}`);
export const createPropertyValue = (typeId, propertyId, valueData) => fetchData(`/property-values/${typeId}/${propertyId}`, 'POST', valueData);
export const deletePropertyValue = (typeId, propertyId, value) => {
    const encodedValue = encodeURIComponent(value);
    return fetchData(`/property-values/${typeId}/${propertyId}/${encodedValue}`, 'DELETE');
}

export const checkCompleteness = () => fetchData('/completeness-check');

export const classifyItem = (itemData) => fetchData('/classify', 'POST', itemData);
export const classifyItemAI = (itemData) => fetchData('/classify-ai', 'POST', itemData);
export const train_model = (itemData) => fetchData('/train-ai', 'POST', itemData)
export const check_model = (itemData) => fetchData('/check-model', 'POST', itemData)
