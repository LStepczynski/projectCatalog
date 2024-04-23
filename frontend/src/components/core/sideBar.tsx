import { useEffect, useState } from "react";
import { Box, ActionList, Text } from "@primer/react";
import {
  CodeIcon,
  PackageIcon,
  PlugIcon,
  ScreenFullIcon,
  PersonIcon,
  HomeIcon,
  BeakerIcon,
  TelescopeIcon,
  UnlockIcon,
  BookIcon,
} from "@primer/octicons-react";
import { debounce } from "lodash";

interface Props {
  state: boolean;
}
const iconSize: number = 22;
const items = [
  {
    title: "Navigation",
    items: [
      {
        name: "Home",
        icon: <HomeIcon size={iconSize} />,
        action: "/",
      },
      {
        name: "Categories",
        icon: <TelescopeIcon size={iconSize} />,
        action: "/categories",
      },
      {
        name: "Account",
        icon: <PersonIcon size={iconSize} />,
        action: "/account",
      },
    ],
  },
  {
    title: "Categories",
    items: [
      {
        name: "Programming",
        icon: <CodeIcon size={iconSize} />,
        action: "/categories/programming",
      },
      {
        name: "3D Modeling",
        icon: <PackageIcon size={iconSize} />,
        action: "/categories/3d-modeling",
      },
      {
        name: "Electronics",
        icon: <PlugIcon size={iconSize} />,
        action: "/categories/electronics",
      },
      {
        name: "Woodworking",
        icon: <ScreenFullIcon size={iconSize} />,
        action: "/categories/woodworking",
      },
      {
        name: "Chemistry",
        icon: <BeakerIcon size={iconSize} />,
        action: "/categories/chemistry",
      },
      {
        name: "Cybersecurity",
        icon: <UnlockIcon size={iconSize} />,
        action: "/categories/cybersecurity",
      },
      {
        name: "Physics",
        icon: <BookIcon size={iconSize} />,
        action: "/categories/physics",
      },
    ],
  },
];

export const SideBar = (props: Props) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { state } = props;

  const handleResize = debounce(() => {
    setScreenWidth(window.innerWidth);
  }, 300);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <Box
      sx={{
        transform: state ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s ease",
        backgroundColor: "canvas.default",
        borderRight: "2px solid",
        borderColor: "sidenav.selectedBg",
        flexDirection: "column",
        position: "fixed",
        display: "flex",
        width: "250px",
        height: "100%",
        zIndex: 1000,
        top: "65px",
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
                fontFamily: "Exo 2",
                fontSize: "20px",
                fontWeight: "bold",
                paddingLeft: 2,
              }}
            >
              {category.title}
            </Text>
            <Box
              sx={{
                width: "100%",
                marginTop: 2,
                height: "1px",
                backgroundColor: "ansi.white",
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
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {item.icon}
                    <Text
                      sx={{
                        fontFamily: "Exo 2",
                        fontSize: "16px",
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
