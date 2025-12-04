import React from 'react';
import { AuthProvider } from './auth';
import { TopBar } from './components/TopBar';
import { UsersPanel } from './components/UsersPanel';
import { RolesPanel } from './components/RolesPanel';
import { DevicesPanel } from './components/DevicesPanel';
import { RealtimeEvents } from './components/RealtimeEvents';
import { ReaderStatus } from './components/ReaderStatus';
import './styles.css';

const App: React.FC = () => (
  <AuthProvider>
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Keylog Admin</p>
          <h1>Panel de control de accesos</h1>
          <p className="muted">
            Administra usuarios, roles, dispositivos y revisa eventos en vivo desde un solo lugar.
          </p>
        </div>
      </header>
      <TopBar />
      <section className="grid two-cols gap">
        <UsersPanel />
        <RolesPanel />
      </section>
      <section className="grid two-cols gap">
        <DevicesPanel />
        <ReaderStatus />
      </section>
      <RealtimeEvents />
    </div>
  </AuthProvider>
);

export default App;
