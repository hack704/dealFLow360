import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuotationProvider } from './context/QuotationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AutoModeProvider } from './context/AutoModeContext';
import AutoPilotController from './components/common/AutoPilotController';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <QuotationProvider>
            <AutoModeProvider>
              <AppRoutes />
              <AutoPilotController />
            </AutoModeProvider>
          </QuotationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
