import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import ClientLoader from './ClientLoader';
import defaultData from './data/gsl.json';
import { validateClientData } from './validator';

const STORAGE_KEY = 'dashboard_client_data';

export default function App() {
  const [data, setData] = useState(defaultData);

  // Restaurar último cliente cargado desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const validation = validateClientData(parsed);
        if (validation.valid) {
          setData(parsed);
        } else {
          console.warn('Cliente en localStorage inválido, usando default:', validation.errors);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (err) {
      console.warn('Error al leer localStorage:', err);
    }
  }, []);

  return (
    <>
      <Dashboard data={data} />
      {/* Botón "Cargar Cliente" desactivado temporalmente — descomentar para recuperarlo:
      <ClientLoader currentData={data} onDataLoad={setData} defaultData={defaultData} /> */}
    </>
  );
}
