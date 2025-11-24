import React, { useContext } from 'react';
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  CameraAlt as CameraIcon,
  AccountCircle as ProfileIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext/AuthContext';

export const useSidebarStructure = () => {
  const { usuario } = useContext(AuthContext);

  // 🔹 Obtenemos el roleId del usuario o del localStorage
  const roleId = usuario?.roleId || localStorage.getItem("roleId");

  // 🔹 Estructura completa del menú
  const structure = [
    { id: 100, label: 'Perfil', link: '/profile', icon: <ProfileIcon /> },
    {
      id: 1,
      label: 'Cursos',
      link: '/ecommerce',
      icon: <ShoppingCartIcon />,
      children: [
        { label: 'Cursos', link: '/ecommerce/gridproducts' },
        { label: 'Agregar Curso', link: '/ecommerce/courseadd' },
      ],
    },
    {
      id: 101,
      label: 'Sistemas',
      link: '/system',
      icon: <CategoryIcon />,
      children: [
        { label: 'Lista de sistemas', link: '/system/list' },
        { label: 'Agregar sistema', link: '/system/addsystem' }
      ]
    },
    {
      id: 102,
      label: 'Eventos',
      link: '/event',
      icon: <EventIcon />,
      children: [
        { label: 'Lista de eventos', link: '/events/list' },
        { label: 'Agregar evento', link: '/events/addevent' }
      ]
    },
    { id: 103, label: 'Escáner', link: '/scanner', icon: <CameraIcon /> },
    { id: 0, label: 'Dashboard', link: '/dashboard', icon: <HomeIcon /> },
    {
      id: 104,
      label: 'Productos',
      link: '/product',
      icon: <StoreIcon />,
      children: [
        { label: 'Lista de prodcutos', link: '/product/list' },
        { label: 'Agregar producto', link: '/product/addproduct' }
      ]
    },
    // {
    //   id: 1,
    //   label: 'Cursos',
    //   link: '/ecommerce',
    //   icon: <ShoppingCartIcon />,
    //   children: [
    //     { label: 'Cursos', link: '/ecommerce/gridproducts' },
    //     { label: 'Agregar Curso', link: '/ecommerce/courseadd' },
    //   ],
    // },
    {
      id: 2,
      label: 'Usuarios',
      link: '/user',
      icon: <PersonIcon />,
      children: [
        { label: 'Lista de Usuarios', link: '/users/list' },
        { label: 'Crear Usuario', link: '/users/useradd' },
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
