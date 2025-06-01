import Header from './components/Header';
import Footer from './components/Footer';
import MapView from './components/MapView';
import Landing2025 from './components/Landing2025';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <MapView />
        <Landing2025 />
      </main>
      <Footer />
    </div>
  );
}
