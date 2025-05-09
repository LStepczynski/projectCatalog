import { getUser } from '@utils/getUser';

import { categories } from '@config/categories';

import { Box, ActionList, Text } from '@primer/react';
import {
  PersonIcon,
  HomeIcon,
  TelescopeIcon,
  PencilIcon,
  ChecklistIcon,
} from '@primer/octicons-react';

interface Props {
  state: boolean;
}
const iconSize: number = 22;
const items = [
  {
    title: 'Navigation',
    items: [
      {
        name: 'Home',
        icon: <HomeIcon size={iconSize} />,
        action: '/',
      },
      {
        name: 'Categories',
        icon: <TelescopeIcon size={iconSize} />,
        action: '/categories/1',
      },
      {
        name: 'Account',
        icon: <PersonIcon size={iconSize} />,
        action: '/account',
      },
    ],
  },
  {
    title: 'Popular',
    items: categories.slice(0, 5),
  },
];

const user = getUser();
if (user && user.roles.includes('publisher')) {
  items[0].items.push({
    name: 'My Articles',
    value: '',
    icon: <PencilIcon size={iconSize} />,
    action: '/myArticles/1',
  });
}
if (user && user.roles.includes('admin')) {
  items[0].items.push({
    name: 'Admin View',
    value: '',
    icon: <ChecklistIcon size={iconSize} />,
    action: '/adminView/1',
  });
}

export const SideBar = (props: Props) => {
  const { state } = props;

  return (
    <Box
      sx={{
        transform: state ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.2s ease',
        backgroundColor: 'canvas.default',
        borderRight: '2px solid',
        borderColor: 'sidenav.selectedBg',
        flexDirection: 'column',
        position: 'fixed',
        display: 'flex',
        width: '250px',
        overflowY: 'auto',
        height: '100%',
        zIndex: 999,
        pt: '80px',
      }}
    >
      {items.map((category: any, categoryIndex: number) => {
        return (
          <Box
            key={categoryIndex}
            sx={{
              paddingX: 3,
              paddingTop: 4,
            }}
          >
            <Text
              sx={{
                fontFamily: 'Exo 2',
                fontSize: '20px',
                fontWeight: 'bold',
                paddingLeft: 2,
              }}
            >
              {category.title}
            </Text>
            <Box
              sx={{
                width: '100%',
                marginTop: 2,
                height: '1px',
                backgroundColor: 'ansi.white',
              }}
            ></Box>
            <ActionList>
              {category.items.map((item: any, itemIndex: number) => {
                return (
                  <ActionList.Item
                    key={itemIndex}
                    onSelect={() => {
                      window.location = item.action;
                    }}
                    sx={{
                      my: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {item.icon}
                    <Text
                      sx={{
                        fontFamily: 'Exo 2',
                        fontSize: '16px',
                        paddingLeft: 3,
                      }}
                    >
                      {item.name}
                    </Text>
                  </ActionList.Item>
                );
              })}
            </ActionList>
          </Box>
        );
      })}
    </Box>
  );
};
