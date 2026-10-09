import React, { useContext } from 'react';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  AccountCircle as ProfileIcon,
  Lock as SecretIcon,
  Inventory2 as ProductsIcon,
  Spa as SpaIcon,
  LiveTv as LiveTvIcon,
  TaskAlt as TaskIcon,
  Verified as CertificationIcon,
  MenuBook as FormationIcon,
  People as UsersIcon,
  ReceiptLong as OrdersIcon,
  PendingActions as PendingTasksIcon,
} from '@mui/icons-material';

import AuthContext from '../../context/AuthContext/AuthContext';

export const useSidebarStructure = () => {
  const { usuario } = useContext(AuthContext);

  const roleId = usuario?.roleId || localStorage.getItem('roleId');

  const structure = [
    {
      id: 0,
      label: 'Dashboard',
      link: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 100,
      label: 'Perfil',
      link: '/profile',
      icon: <ProfileIcon />,
    },
    {
      id: 1,
      label: 'Cursos',
      link: '/ecommerce/gridproducts',
      icon: <SchoolIcon />,
    },
    {
      id: 101,
      label: 'Secretos',
      link: '/system',
      icon: <SecretIcon />,
    },
    {
      id: 104,
      label: 'Productos',
      link: '/product/list',
      icon: <ProductsIcon />,
    },
    {
      id: 105,
      label: 'Salón de tus sueños',
      link: '/salon_of_your_dreams',
      icon: <SpaIcon />,
    },
    {
      id: 111,
      label: 'Ordenes',
      link: '/orders',
      icon: <OrdersIcon />,
    },
    {
      id: 106,
      label: 'Lives',
      link: '/lives/live_playlist',
      icon: <LiveTvIcon />,
    },
    {
      id: 2,
      label: 'Usuarios',
      link: '/users/list',
      icon: <UsersIcon />,
    },
    {
      id: 107,
      label: 'Tareas',
      link: '/task',
      icon: <TaskIcon />,
    },
    {
      id: 108,
      label: 'Certificaciones',
      link: '/certifications/list',
      icon: <CertificationIcon />,
    },
    {
      id: 110,
      label: 'Formaciones',
      link: '/formations',
      icon: <FormationIcon />,
      children: [
        {
          label: 'Lista de formaciones',
          link: '/formations/list',
        },
        {
          label: 'Entregables',
          link: '/formations/deliverable',
        },
      ],
    },
    {
      id: 109,
      label: 'Tareas Pendientes',
      link: '/pending-tasks',
      icon: <PendingTasksIcon />,
    },
  ];

  // Rol 5 - Escáner
  if (parseInt(roleId) === 5) {
    return structure.filter(item => item.label === 'Escáner');
  }

  // Rol 3 - Tareas
  if (parseInt(roleId) === 3) {
    return structure.filter(item => item.label === 'Tareas');
  }

  // Rol 6 - Administrador de Lives
  if (parseInt(roleId) === 6) {
    return structure
      .filter(item => item.label === 'Lives')
      .map(item => ({
        ...item,
        children: item.children?.filter(
          child => child.label === 'Lista de lives'
        ),
      }));
  }

  // Rol 1 - Mostrar todo
  if (parseInt(roleId) === 1) {
    return structure.filter(
      item => item.label !== 'Tareas'
    );
  }

  return structure;
};
