import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen.jsx';
import { SellerDashboard } from './components/SellerDashboard.jsx';
import { ConsumerView } from './components/ConsumerView.jsx';

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <LoginScreen onEnter={setSession} />;
  }

  if (session.role === 'consumer') {
    return (
      <ConsumerView
        homeId={session.homeId}
        homeName={session.homeName}
        onLogout={() => setSession(null)}
      />
    );
  }

  return <SellerDashboard onLogout={() => setSession(null)} />;
}
