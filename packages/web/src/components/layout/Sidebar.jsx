import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Report Waste' },
  { to: '/my-reports', label: 'My Reports' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r p-4 space-y-2">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className={({ isActive }) =>
            `block px-3 py-2 rounded ${isActive ? 'bg-primary text-white' : 'hover:bg-bg'}`
          }
        >
          {l.label}
        </NavLink>
      ))}
    </aside>
  );
}
