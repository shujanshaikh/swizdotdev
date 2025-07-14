'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('~/frontend/App'), { ssr: false });

export default function Home() {
  return <App />;
}