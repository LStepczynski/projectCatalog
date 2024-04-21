import { useEffect, useState } from "react";
import { Box } from "@primer/react";
import { debounce } from "lodash";

export const NavBar = () => {
  const [visibility, setVisibility] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

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
    <Box
      sx={{
        width: "100%",
        height: "90px",
        backgroundColor: "canvas.subtle",
        display: "flex",
        justifyContent: "space-between",
        px: 4,
        position: "fixed",
        top: 0,
        zIndex: 1000,
        transition: "transform 0.2s ease",
        transform: visibility ? "translateY(0)" : "translateY(-100%)",
      }}
    ></Box>
  );
};
