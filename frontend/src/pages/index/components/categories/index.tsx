import { Box, Text, Heading } from '@primer/react';

export const Categories = () => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        gap: '10%',
        alignItems: 'center',
        '@media screen and (min-width: 768px)': {
          width: '70%',
        },
        '@media screen and (min-width: 1012px)': {
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          '@media screen and (min-width: 1012px)': {
            width: '50%',
          },
        }}
      >
        {/* Title */}
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '800',
            color: '#ff9d00',
          }}
        >
          Variety of categories
        </Heading>

        {/* Description */}
        <Text
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '500',
          }}
        >
          Project Catalog offers a diverse selection of article categories
          spanning numerous fields, ensuring there's something for everyone.
          Whether you're interested in technology, tinkering, or arts, our
          extensive range of topics provides valuable insights and information.
        </Text>
        <br></br>
        <br></br>

        {/* List of Categories */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            pr: 4,
          }}
        >
          <ul
            style={{
              fontFamily: 'inter tight',
              fontWeight: '600',
              width: 'max-content',
              fontSize: '18px',
            }}
          >
            <li>Programming</li>
            <li>3D printing</li>
            <li>Chemistry</li>
          </ul>
          <ul
            style={{
              fontFamily: 'inter tight',
              fontWeight: '600',
              width: 'max-content',
              fontSize: '18px',
            }}
          >
            <li>Physics</li>
            <li>Woodworking</li>
            <li>Electronics</li>
          </ul>
        </Box>
      </Box>

      {/* Image */}
      <Box
        sx={{
          display: 'none',
          width: '40%',
          '@media screen and (min-width: 1012px)': {
            display: 'block',
          },
        }}
      >
        <img
          loading="lazy"
          src="images/home-category.webp"
          alt="WoodWorking"
          style={{
            width: '100%',
            aspectRatio: 1920 / 2397,
            borderRadius: '25px',
          }}
        />
      </Box>
    </Box>
  );
};
