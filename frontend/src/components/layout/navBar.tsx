import { useEffect, useState } from 'react';
import { Box, Button } from '@primer/react';
import { debounce } from 'lodash';
import { ThreeBarsIcon } from '@primer/octicons-react';
import { SideBar } from './sideBar';
import { getUser } from '@helper/helper';
import { ProfileDropdown } from '../common/user/profileDropdown';

export const NavBar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [navbarVis, setNavbarVis] = useState(true);
  const [sidevarVis, setSidebarVis] = useState(
    localStorage.getItem('sidebarVis') || 'false'
  );

  const user = getUser();

  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;
    setNavbarVis(currentScrollPos <= prevScrollPos || currentScrollPos <= 200);
    setPrevScrollPos(currentScrollPos);
    if (currentScrollPos > prevScrollPos && currentScrollPos > 200)
      changeSidebarVis('false');
  }, 30);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const changeSidebarVis = (value: any = undefined) => {
    const newValue =
      value === undefined ? (sidevarVis === 'true' ? 'false' : 'true') : value;
    localStorage.setItem('sidebarVis', newValue);
    setSidebarVis(newValue);
  };

  return (
    <>
      <Box
        sx={{
          transform: navbarVis ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s',
          backgroundColor: 'canvas.default',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'ansi.black',
          alignItems: 'center',
          position: 'fixed',
          display: 'flex',
          height: '80px',
          width: '100%',
          zIndex: 1000,
          py: '15px',
          px: 4,
        }}
      >
        <Box>
          <Box
            sx={{
              transition: '.3s background-color',
              borderRadius: '8px',
              px: 2,
              py: 1,
              ':hover': {
                backgroundColor: 'sidenav.selectedBg',
              },
            }}
            onClick={() => changeSidebarVis()}
          >
            <ThreeBarsIcon size={32} />
          </Box>
        </Box>
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
          {user ? (
            <ProfileDropdown state={navbarVis} />
          ) : (
            <Button
              onClick={() => {
                window.location.href = '/sign-up';
              }}
            >
              Sign Up
            </Button>
          )}
        </Box>
      </Box>
      <SideBar state={sidevarVis === 'true'} />
    </>
  );
};
