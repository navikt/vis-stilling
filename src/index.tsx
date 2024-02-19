import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@navikt/ds-css';
import './index.css';

const app = document.getElementById('root');
const root = createRoot(app!);

const setupMock = async () => {
    if (import.meta.env.DEV) {
        await import('./mock/mock-api');
    }
};

setupMock().then(() => root.render(<App />));
