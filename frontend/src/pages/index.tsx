import { Box, Text, Heading } from '@primer/react';
import { PersonIcon, BookIcon } from '@primer/octicons-react';

const gradientAnimationStyles = {
  background: 'linear-gradient(90deg, #ff7b00, #ff007b, #00c1ff)',
  backgroundSize: '300%',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  animation: 'gradient-animation 5s infinite linear alternate',
};

const keyframeStyles = {
  '@keyframes gradient-animation': {
    '0%': {
      backgroundPosition: '0%',
    },
    '100%': {
      backgroundPosition: '100%',
    },
  },
};

const commonStyles = {
  position: 'relative',
  cursor: 'pointer',
  fontFamily: 'inter tight',
  fontWeight: '500',
  fontSize: '22px',
  width: '255px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  px: 3,
  py: 3,
  borderRadius: '4px',
  border: '1px solid transparent',
};

const gradientStyles = (colors: [string, string]) => ({
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})`,
    zIndex: -1,
    borderRadius: '10px',
  },
});

export const Index = () => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '250px',
        mb: '150px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'relative',
          width: '100%',
          mt: '120px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: '20%',
            width: '50%',
          }}
        >
          <Heading
            sx={{
              fontFamily: 'inter tight',
              fontWeight: '700',
            }}
          >
            Project Catalog
          </Heading>
          <Box sx={keyframeStyles}>
            <Heading
              sx={{
                fontSize: '52px',
                fontFamily: 'inter tight',
                fontWeight: '800',
                mt: 3,
                mb: 5,
              }}
            >
              New <span style={gradientAnimationStyles}>ideas</span> within{' '}
              <br /> the palm of your hand
            </Heading>
          </Box>
          <Text
            sx={{
              fontSize: '22px',
              fontFamily: 'inter tight',
              fontWeight: '800',
            }}
          >
            Welcome to Course Catalog, where you can explore and share articles
            about hands-on projects. Dive into tutorials, or create your own and
            inspire others to build and tinker.
          </Text>
        </Box>
        <img
          src="images/home-hero.webp"
          alt="home-hero"
          style={{
            borderRadius: '25px',
            zIndex: -1,
            width: '70%',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '5%',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%',
            gap: '140px',
          }}
        >
          <Box>
            <Text
              sx={{
                fontSize: '20px',
                color: '#f5004e',
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Discover
            </Text>
            <Heading
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Explore new ideas to stay inspired
            </Heading>
            <Text
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '500',
              }}
            >
              Course Catalog offers users a wide variety of project ideas
              designed to spark creativity, provide inspiration, and help cure
              boredom. Whether you're looking to explore a new hobby or sharpen
              existing skills, the platform is a great resource for discovering
              hands-on activities that promote learning and personal growth.
            </Text>
          </Box>

          <Box>
            <Text
              sx={{
                fontSize: '20px',
                color: '#f5004e',
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Create
            </Text>
            <Heading
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Produce content and inspire others
            </Heading>
            <Text
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '500',
              }}
            >
              Our platform empowers users to create and share their own
              tutorials and articles on a wide range of topics. Whether it's
              hands-on, or on paper, users can contribute valuable content that
              helps others learn new skills and tackle exciting projects. By
              sharing your knowledge, you inspire and support a growing
              community of creators and learners.
            </Text>
          </Box>

          <Box>
            <Text
              sx={{
                fontSize: '20px',
                color: '#f5004e',
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Learn
            </Text>
            <Heading
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '800',
              }}
            >
              Study the experiences of other people
            </Heading>
            <Text
              sx={{
                fontFamily: 'inter tight',
                fontWeight: '500',
              }}
            >
              Course Catalog empowers individuals to learn from the shared
              knowledge and expertise of others by providing a platform where
              users can browse tutorials, articles, and project ideas across a
              wide variety of topics. The diverse content contributed by
              community members enables you to explore new skills and deepen
              your understanding, all while benefiting from the real-world
              experiences of fellow creators.
            </Text>
          </Box>
        </Box>

        <img
          src="images/home-side.webp"
          alt="home side"
          style={{
            width: '50%',
            borderRadius: '25px',
          }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: '5%',
        }}
      >
        <Box sx={{ width: '60%' }}>
          <Heading
            sx={{
              fontFamily: 'inter tight',
              fontWeight: '800',
              fontSize: '42px',
              background: 'linear-gradient(90deg, #ff5121, #ff7b00)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Create an account and start today
          </Heading>
          <Text
            sx={{
              fontFamily: 'inter tight',
              fontWeight: '500',
            }}
          >
            Join Course Catalog today and unlock the full potential of your
            creativity! By creating an account, you can not only access
            inspiring projects and tutorials, but also share your own expertise
            with others. Start today and be part of a thriving community where
            every idea has the power to inspire and educate. Don't wait—create
            your account now and dive into a world of possibilities!
          </Text>
        </Box>
        <Box
          sx={{
            width: '35%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          <Box
            onClick={() => (window.location.href = 'sign-up')}
            sx={{
              ...commonStyles,
              ...gradientStyles(['#ff5121', '#ff7b00']),
            }}
          >
            Create an account
            <PersonIcon size={32} />
          </Box>
          <Box
            onClick={() => (window.location.href = 'categories')}
            sx={{
              ...commonStyles,
              ...gradientStyles(['#ff1f48', '#ff1f2e']),
            }}
          >
            Start browsing
            <BookIcon size={32} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
