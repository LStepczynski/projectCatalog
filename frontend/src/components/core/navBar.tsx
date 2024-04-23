import { useEffect, useState } from "react";
import { Box, Button } from "@primer/react";
import { debounce } from "lodash";
import { ListUnorderedIcon } from "@primer/octicons-react";
import { SideBar } from "./sideBar";

export const NavBar = () => {
  const [visibility, setVisibility] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showSideBar, setShowSideBar] = useState(false);

  const handleScroll = debounce(() => {
    const currentScrollPos = window.pageYOffset;

    if (currentScrollPos > prevScrollPos && currentScrollPos > 200) {
      setVisibility(false);
    } else {
      setVisibility(true);
    }

    setPrevScrollPos(currentScrollPos);
  }, 30);

  const handleResize = debounce(() => {
    setScreenWidth(window.innerWidth);
  }, 300);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleScroll, handleResize]);

  return (
    <>
      <Box
        sx={{
          transform: visibility ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.2s ease",
          backgroundColor: "canvas.default",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "ansi.black",
          alignItems: "center",
          position: "fixed",
          display: "flex",
          height: "65px",
          width: "100%",
          zIndex: 1000,
          top: 0,
          px: 4,
        }}
      >
        <Box>
          <Box
            sx={{
              transition: ".3s background-color",
              borderRadius: "8px",
              px: 2,
              py: 1,
              ":hover": {
                backgroundColor: "sidenav.selectedBg",
              },
            }}
            onClick={() => {
              setShowSideBar(!showSideBar);
            }}
          >
            <ListUnorderedIcon size={32} />
          </Box>
        </Box>
        <Box>
          <Button>Sign In</Button>
        </Box>
      </Box>
      <SideBar state={showSideBar} />
    </>
  );
};
