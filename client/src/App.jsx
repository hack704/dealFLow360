import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuotationProvider } from './context/QuotationContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuotationProvider>
          <AppRoutes />
        </QuotationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
