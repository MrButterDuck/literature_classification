import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CompletenessProvider } from './components/pages/CompletenessContext';
import './main.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="flex flex-col h-screen">
      <header className="h-16 bg-gray-700 text-white px-4">
        <div className='flex justify-center pt-5'>
          <div className='flex-1 '>КЛАССИФИКАЦИЯ ЛИТЕРАТУРНЫХ ПРОИЗВЕДЕНИЙ</div>
          <div className='flex-1 text-right'>Студент группы Б9121-09.03.04 Костюченко Антон</div>
        </div>
      </header>
      <CompletenessProvider className="flex-1 bg-gray-100 p-4">
          <App />
      </CompletenessProvider>
    </div>
  </React.StrictMode>
);