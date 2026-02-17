import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {
  return (
    <div className="app-root">
      <Navbar />
      <Outlet />
    </div>
  );
}
