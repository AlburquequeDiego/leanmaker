import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
