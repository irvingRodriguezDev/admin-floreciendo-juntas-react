import React, { useContext } from 'react';
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  PrivacyTipSharp as SecretIcon,
  Event as EventIcon,
  CameraAlt as CameraIcon,
  AccountCircle as ProfileIcon,
  Store as StoreIcon,
  Spa,
  LiveTv,
  Task as TaskIcon,
  DocumentScanner,
  RateReview,
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext/AuthContext';

export const useSidebarStructure = () => {
  const { usuario } = useContext(AuthContext);

  // 🔹 Obtenemos el roleId del usuario o del localStorage
  const roleId = usuario?.roleId || localStorage.getItem("roleId");

  // 🔹 Estructura completa del menú
  const structure = [
    { id: 0, label: 'Dashboard', link: '/dashboard', icon: <HomeIcon /> },
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
      label: 'Secretos',
      link: '/system',
      icon: <CategoryIcon />,
      children: [
        { label: 'Lista de secretos', link: '/system/list' },
        { label: 'Agregar secreto', link: '/system/addsystem' }
      ]
    },
    // {
    //   id: 107,
    //   label: 'Secretos',
    //   link: '/secrets',
    //   icon: <SecretIcon />,
    //   children: [
    //     { label: 'Lista de secretos', link: '/secrets/list' },
    //     { label: 'Agregar screto', link: '/secrets/addsecret' }
    //   ]
    // },
    // {
    //   id: 102,
    //   label: 'Eventos',
    //   link: '/event',
    //   icon: <EventIcon />,
    //   children: [
    //     { label: 'Lista de eventos', link: '/events/list' },
    //     { label: 'Agregar evento', link: '/events/addevent' }
    //   ]
    // },
    { id: 103, label: 'Escáner', link: '/scanner', icon: <CameraIcon /> },
    // { id: 0, label: 'Dashboard', link: '/dashboard', icon: <HomeIcon /> },
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
    {
      id: 105,
      label: 'Salón de tus sueños',
      link: '/salon_of_your_dreams',
      icon: <Spa />,
      children: [
        { label: 'Ordenes', link: '/salon_of_your_dreams/orders' },
        { label: 'Sorteo', link: '/salon_of_your_dreams/lottery' },

        // { label: 'Agregar producto', link: '/product/addproduct' }
      ]
    },
    {
      id: 106,
      label: 'Lives',
      link: '/lives',
      icon: <LiveTv />,
      children: [
        { label: 'Lista de lives', link: '/lives/live_playlist' },
        { label: 'Crea un live', link: '/lives/addlive' },

        // { label: 'Agregar producto', link: '/product/addproduct' }
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
    { id: 107, label: 'Tareas', link: '/task', icon: <TaskIcon /> },
    {
      id: 108,
      label: 'Certificaciones',
      link: '/certifications',
      icon: < DocumentScanner />,
      children: [
        { label: 'Lista de certificaciones', link: '/certifications/list' },
        { label: 'Crea una certificación', link: '/certifications/addcertificate' },
        // { label: 'Agregar modulo', link: '/certifications/:certificationId/modules' },

        // { label: 'Agregar producto', link: '/product/addproduct' }
      ]
    },
    {
      id: 110,
      label: 'Formaciones',
      link: '/formations',
      icon: < RateReview />,
      children: [
        { label: 'Lista de formaciones', link: '/formations/list' },
        { label: 'Crea una formación', link: '/formations/addformation' },
        { label: 'Entregables', link: '/formations/deliverable' },
        // { label: 'Agregar modulo', link: '/certifications/:certificationId/modules' },

        // { label: 'Agregar producto', link: '/product/addproduct' }
      ]
    },
    { id: 109, label: 'Tareas Pendientes', link: '/pending-tasks', icon: <TaskIcon /> },
  ];

  // 🔹 Filtrado según rol
  if (parseInt(roleId) === 5) {
    // Solo mostrar Escáner
    return structure.filter(item => item.label === "Escáner");
  }

  // 🔹 Filtrado según rol
  if (parseInt(roleId) === 3) {
    // Solo mostrar Tareas
    return structure.filter(item => item.label === "Tareas");
  }

  // 🔹 Rol 6 - Administrador de Lives
  if (parseInt(roleId) === 6) {
    return structure
      .filter(item => item.label === "Lives")
      .map(item => ({
        ...item,
        children: item.children.filter(
          child => child.label === "Lista de lives"
        ),
      }));
  }

  if (parseInt(roleId) === 1) {
    // Mostrar todo excepto Escáner y Tareas
    return structure.filter(
      item => 
      // item.label !== "Escáner" && 
      item.label !== "Tareas"
    );
  }


  // Otros roles: mostrar todo
  return structure;
};
