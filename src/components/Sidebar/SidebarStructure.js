import React, { useContext } from 'react';
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  CameraAlt as CameraIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext/AuthContext';

export const useSidebarStructure = () => {
  const { usuario } = useContext(AuthContext);

  // 🔹 Obtenemos el roleId del usuario o del localStorage
  const roleId = usuario?.roleId || localStorage.getItem("roleId");

  // 🔹 Estructura completa del menú
  const structure = [
    { id: 100, label: 'Perfil', link: '/app/profile', icon: <ProfileIcon /> },
    {
      id: 1,
      label: 'Cursos',
      link: '/app/ecommerce',
      icon: <ShoppingCartIcon />,
      children: [
        { label: 'Cursos', link: '/app/ecommerce/gridproducts' },
        { label: 'Agregar Curso', link: '/app/ecommerce/courseadd' },
      ],
    },
    {
      id: 101,
      label: 'Sistemas',
      link: '/app/system',
      icon: <CategoryIcon />,
      children: [
        { label: 'Lista de sistemas', link: '/app/system/list' },
        { label: 'Agregar sistema', link: '/app/system/addsystem' }
      ]
    },
    {
      id: 102,
      label: 'Eventos',
      link: '/app/event',
      icon: <EventIcon />,
      children: [
        { label: 'Lista de eventos', link: '/app/events/list' },
        { label: 'Agregar evento', link: '/app/events/addevent' }
      ]
    },
    { id: 103, label: 'Escáner', link: '/app/scanner', icon: <CameraIcon /> },
    { id: 0, label: 'Dashboard', link: '/app/dashboard', icon: <HomeIcon /> },
    // {
    //   id: 1,
    //   label: 'Cursos',
    //   link: '/app/ecommerce',
    //   icon: <ShoppingCartIcon />,
    //   children: [
    //     { label: 'Cursos', link: '/app/ecommerce/gridproducts' },
    //     { label: 'Agregar Curso', link: '/app/ecommerce/courseadd' },
    //   ],
    // },
    {
      id: 2,
      label: 'Usuarios',
      link: '/app/user',
      icon: <PersonIcon />,
      children: [
        { label: 'Lista de Usuarios', link: '/app/users/list' },
        { label: 'Crear Usuario', link: '/app/users/useradd' },
      ],
    },
  ];

  // 🔹 Filtrado según rol
  if (parseInt(roleId) === 5) {
    // Solo mostrar Escáner
    return structure.filter(item => item.label === "Escáner");
  }

  if (parseInt(roleId) === 1) {
    // Mostrar todo excepto Escáner
    return structure.filter(item => item.label !== "Escáner");
  }

  // Otros roles: mostrar todo
  return structure;
};
