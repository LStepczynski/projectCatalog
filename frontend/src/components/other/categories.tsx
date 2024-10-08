import {
  CodeIcon,
  PackageIcon,
  PlugIcon,
  ScreenFullIcon,
  BeakerIcon,
  UnlockIcon,
  BookIcon,
} from '@primer/octicons-react';

const iconSize = 22;

export const categories = [
  {
    name: 'Programming',
    value: 'programming',
    icon: <CodeIcon size={iconSize} />,
    action: '/categories/programming/1',
  },
  {
    name: '3D Modeling',
    value: '3d-modeling',
    icon: <PackageIcon size={iconSize} />,
    action: '/categories/3d-modeling/1',
  },
  {
    name: 'Electronics',
    value: 'electronics',
    icon: <PlugIcon size={iconSize} />,
    action: '/categories/electronics/1',
  },
  {
    name: 'Woodworking',
    value: 'woodworking',
    icon: <ScreenFullIcon size={iconSize} />,
    action: '/categories/woodworking/1',
  },
  {
    name: 'Woodworking',
    value: 'woodworking2',
    icon: <ScreenFullIcon size={iconSize} />,
    action: '/categories/woodworking/1',
  },
  {
    name: 'Chemistry',
    value: 'chemistry',
    icon: <BeakerIcon size={iconSize} />,
    action: '/categories/chemistry/1',
  },
  {
    name: 'Cybersecurity',
    value: 'cybersecurity',
    icon: <UnlockIcon size={iconSize} />,
    action: '/categories/cybersecurity/1',
  },
  {
    name: 'Physics',
    value: 'physics',
    icon: <BookIcon size={iconSize} />,
    action: '/categories/physics/1',
  },
];
