import { useState } from 'react';
import { Landing } from './components/Landing.jsx';
import { LoginScreen } from './components/LoginScreen.jsx';
import { SellerDashboard } from './components/SellerDashboard.jsx';
import { ConsumerView } from './components/ConsumerView.jsx';

export default function App() {
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(null);

  let screen;
  if (!started) {
    screen = <Landing onStart={() => setStarted(true)} />;
  } else if (!session) {
    screen = <LoginScreen onEnter={setSession} />;
  } else if (session.role === 'consumer') {
    screen = (
      <ConsumerView homeId={session.homeId} homeName={session.homeName} onLogout={() => setSession(null)} />
    );
  } else {
    screen = <SellerDashboard onLogout={() => setSession(null)} />;
  }

  return (
    <>
      {screen}
      <footer className="app-credit">Powered by Nuh Regaib Ünsal</footer>
    </>
  );
}
