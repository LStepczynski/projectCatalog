import { Box } from '@primer/react';

import { AboutComponent } from '@pages/index/components/about/aboutComponent';

export const About = ({ screenWidth }: any) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5%',
        alignItems: 'center',
        '@media screen and (min-width: 768px)': {
          flexDirection: 'row',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '140px',
          '@media screen and (min-width: 768px)': {
            width: '50%',
          },
        }}
      >
        <AboutComponent
          category="Discover"
          title="Explore new ideas to stay inspired"
        >
          Course Catalog offers users a wide variety of project ideas designed
          to spark creativity, provide inspiration, and help cure boredom.
          Whether you're looking to explore a new hobby or sharpen existing
          skills, the platform is a great resource for discovering hands-on
          activities that promote learning and personal growth.
        </AboutComponent>

        <AboutComponent
          category="Create"
          title="Produce content and inspire others"
        >
          Our platform empowers users to create and share their own tutorials
          and articles on a wide range of topics. Whether it's hands-on, or on
          paper, users can contribute valuable content that helps others learn
          new skills and tackle exciting projects. By sharing your knowledge,
          you inspire and support a growing community of creators and learners.
        </AboutComponent>

        <AboutComponent
          category="Learn"
          title="Study the experiences of other people"
        >
          Course Catalog empowers individuals to learn from the shared knowledge
          and expertise of others by providing a platform where users can browse
          tutorials, articles, and project ideas across a wide variety of
          topics. The diverse content contributed by community members enables
          you to explore new skills and deepen your understanding, all while
          benefiting from the real-world experiences of fellow creators.
        </AboutComponent>
      </Box>

      <img
        loading="lazy"
        src="images/home-side.webp"
        alt="home side"
        style={{
          width: screenWidth > 767 ? '50%' : '70%',
          aspectRatio: 1920 / 2879,
          marginTop: screenWidth > 767 ? '' : '40px',
          borderRadius: '25px',
        }}
      />
    </Box>
  );
};
