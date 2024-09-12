import { Box, Text, Heading } from '@primer/react';
import { PersonIcon, BookIcon } from '@primer/octicons-react';

import React from 'react';

import anime from 'animejs';
import { RainbowText } from '../components/animation/rainbowText';

import { useScreenWidth } from '../components/other/useScreenWidth';

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
  const screenWidth = useScreenWidth();

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '170px',
        mb: '70px',
        px: '5vw',
        '@media screen and (min-width: 768px)': {
          gap: '250px',
          px: '2vw',
          mb: '120px',
        },
      }}
    >
      <Head screenWidth={screenWidth} keyframeStyles={keyframeStyles} />

      <About screenWidth={screenWidth} />

      <StartNow commonStyles={commonStyles} gradientStyles={gradientStyles} />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-10px',
          left: 0,
          width: '100vw',
          zIndex: -2,
        }}
      >
        <AnimatedWave />
      </Box>
    </Box>
  );
};

function Head({ screenWidth, keyframeStyles }: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        width: '100%',
        mt: '80px',
        '@media screen and (min-width: 768px)': {
          mt: '120px',
          flexDirection: 'row',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '25px',
          width: '80%',
          justifyContent: 'center',
          flexDirection: 'column',
          display: 'flex',
          height: '100%',
          top: 0,
          '@media screen and (min-width: 768px)': {
            position: 'absolute',
            left: 0,
            width: '50%',
          },
        }}
      >
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '700',
            fontSize: '18px',
            '@media screen and (min-width: 768px)': {
              fontSize: '',
            },
          }}
        >
          Project Catalog
        </Heading>
        <Box sx={keyframeStyles}>
          <Heading
            sx={{
              fontFamily: 'inter tight',
              fontWeight: '800',
              fontSize: '30px',
              mt: 2,
              mb: 3,
              '@media screen and (min-width: 768px)': {
                fontSize: '36px',
                mt: 3,
                mb: 5,
              },
              '@media screen and (min-width: 1012px)': {
                fontSize: '50px',
              },
            }}
          >
            New{' '}
            <RainbowText gradientSettings="90deg, #ff7b00, #ff007b, #00c1ff">
              ideas
            </RainbowText>{' '}
            within <br /> the palm of your hand
          </Heading>
        </Box>
        <Text
          sx={{
            fontSize: '16px',
            fontFamily: 'inter tight',
            fontWeight: '800',
            '@media screen and (min-width: 768px)': {
              fontSize: '20px',
            },
            '@media screen and (min-width: 1012px)': {
              fontSize: '22px',
            },
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
          opacity: screenWidth > 767 ? 1 : 0.6,
          width: screenWidth > 767 ? '70%' : '100%',
        }}
      />
    </Box>
  );
}

function About({ screenWidth }: any) {
  function AboutComponent({ category, title, children }: any) {
    return (
      <Box>
        <Text
          sx={{
            fontSize: '20px',
            color: '#f5004e',
            fontFamily: 'inter tight',
            fontWeight: '800',
          }}
        >
          {category}
        </Text>
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '800',
            fontSize: '24px',
            '@media screen and (min-width: 768px)': {
              fontSize: '',
            },
          }}
        >
          {title}
        </Heading>
        <Text
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '500',
            fontSize: '14px',
            '@media screen and (min-width: 768px)': {
              fontSize: '',
            },
          }}
        >
          {children}
        </Text>
      </Box>
    );
  }

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
        src="images/home-side.webp"
        alt="home side"
        style={{
          width: screenWidth > 767 ? '50%' : '70%',
          marginTop: screenWidth > 767 ? '' : '40px',
          borderRadius: '25px',
        }}
      />
    </Box>
  );
}

function StartNow({ commonStyles, gradientStyles }: any) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '5%',
        '@media screen and (min-width: 768px)': {
          flexDirection: 'row',
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          '@media screen and (min-width: 768px)': {
            width: '60%',
          },
        }}
      >
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '800',
            fontSize: '34px',
            background: 'linear-gradient(90deg, #ff5121, #ff7b00)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            '@media screen and (min-width: 768px)': {
              fontSize: '42px',
            },
          }}
        >
          Create an account and start today
        </Heading>
        <Text
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '500',
            fontSize: '14px',
            '@media screen and (min-width: 768px)': {
              fontSize: 'inherit',
            },
          }}
        >
          Join Course Catalog today and unlock the full potential of your
          creativity! By creating an account, you can not only access inspiring
          projects and tutorials, but also share your own expertise with others.
          Start today and be part of a thriving community where every idea has
          the power to inspire and educate. Don't wait—create your account now
          and dive into a world of possibilities!
        </Text>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 8,
          gap: 5,
          '@media screen and (min-width: 768px)': {
            width: '35%',
            mt: 0,
          },
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
  );
}

const AnimatedWave = () => {
  const targetRef = React.useRef<SVGSVGElement | null>(null);
  const [opacity, setOpacity] = React.useState(0.3);

  const svgs = [
    [
      'M0 387L21.5 391.3C43 395.7 86 404.3 128.8 413.5C171.7 422.7 214.3 432.3 257.2 432.8C300 433.3 343 424.7 385.8 420C428.7 415.3 471.3 414.7 514.2 418.5C557 422.3 600 430.7 642.8 432.2C685.7 433.7 728.3 428.3 771.2 416.7C814 405 857 387 878.5 378L900 369L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 458L21.5 459.2C43 460.3 86 462.7 128.8 451C171.7 439.3 214.3 413.7 257.2 410.3C300 407 343 426 385.8 427C428.7 428 471.3 411 514.2 409.8C557 408.7 600 423.3 642.8 424.2C685.7 425 728.3 412 771.2 413.3C814 414.7 857 430.3 878.5 438.2L900 446L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 461L21.5 462C43 463 86 465 128.8 464.8C171.7 464.7 214.3 462.3 257.2 459.3C300 456.3 343 452.7 385.8 457.7C428.7 462.7 471.3 476.3 514.2 478.8C557 481.3 600 472.7 642.8 461.2C685.7 449.7 728.3 435.3 771.2 435.7C814 436 857 451 878.5 458.5L900 466L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 520L21.5 521C43 522 86 524 128.8 515.3C171.7 506.7 214.3 487.3 257.2 476.5C300 465.7 343 463.3 385.8 463.7C428.7 464 471.3 467 514.2 470.8C557 474.7 600 479.3 642.8 489.3C685.7 767.3 728.3 514.7 771.2 516.7C814 518.7 857 507.3 878.5 501.7L900 496L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 504L21.5 503.3C43 502.7 86 501.3 128.8 509.5C171.7 517.7 214.3 535.3 257.2 534.2C300 533 343 513 385.8 504.5C428.7 496 471.3 767 514.2 503.8C557 508.7 600 515.3 642.8 515.2C685.7 515 728.3 508 771.2 511.5C814 515 857 529 878.5 536L900 543L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 549L21.5 547.3C43 545.7 86 542.3 128.8 540.3C171.7 538.3 214.3 537.7 257.2 541.7C300 545.7 343 554.3 385.8 554C428.7 553.7 471.3 544.3 514.2 539.2C557 534 600 533 642.8 540.2C685.7 547.3 728.3 562.7 771.2 567.7C814 572.7 857 567.3 878.5 564.7L900 562L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
    ],
    [
      'M0 444L21.5 441.7C43 439.3 86 434.7 128.8 425.2C171.7 415.7 214.3 401.3 257.2 391.5C300 381.7 343 376.3 385.8 370C428.7 363.7 471.3 356.3 514.2 360.3C557 364.3 600 379.7 642.8 393.3C685.7 407 728.3 419 771.2 415.7C814 412.3 857 393.7 878.5 384.3L900 375L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 413L21.5 416C43 419 86 425 128.8 421.2C171.7 417.3 214.3 403.7 257.2 400.7C300 397.7 343 405.3 385.8 408.8C428.7 412.3 471.3 411.7 514.2 409.3C557 407 600 403 642.8 401.7C685.7 400.3 728.3 401.7 771.2 398.8C814 396 857 389 878.5 385.5L900 382L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 493L21.5 487C43 481 86 469 128.8 463.3C171.7 457.7 214.3 458.3 257.2 460.5C300 462.7 343 466.3 385.8 463.7C428.7 461 471.3 452 514.2 444.2C557 436.3 600 429.7 642.8 426.8C685.7 424 728.3 425 771.2 423.8C814 422.7 857 419.3 878.5 417.7L900 416L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 524L21.5 513C43 502 86 480 128.8 468.5C171.7 457 214.3 456 257.2 464.2C300 472.3 343 489.7 385.8 491.2C428.7 492.7 471.3 478.3 514.2 480.2C557 482 600 500 642.8 505.3C685.7 510.7 728.3 503.3 771.2 502.8C814 502.3 857 508.7 878.5 511.8L900 515L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 540L21.5 536C43 532 86 524 128.8 519.7C171.7 515.3 214.3 514.7 257.2 516.8C300 519 343 524 385.8 522.5C428.7 521 471.3 513 514.2 513.3C557 513.7 600 522.3 642.8 525C685.7 527.7 728.3 524.3 771.2 527.2C814 530 857 539 878.5 543.5L900 548L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 542L21.5 547C43 552 86 562 128.8 563.2C171.7 564.3 214.3 556.7 257.2 554.2C300 551.7 343 554.3 385.8 553C428.7 551.7 471.3 546.3 514.2 544.5C557 542.7 600 544.3 642.8 549.8C685.7 555.3 728.3 564.7 771.2 565.8C814 567 857 560 878.5 556.5L900 553L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
    ],
    [
      'M0 381L21.5 374C43 367 86 353 128.8 362.2C171.7 371.3 214.3 403.7 257.2 412.8C300 422 343 408 385.8 403.5C428.7 399 471.3 404 514.2 396.2C557 388.3 600 367.7 642.8 372.5C685.7 377.3 728.3 407.7 771.2 408.7C814 409.7 857 381.3 878.5 367.2L900 353L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 455L21.5 452.7C43 450.3 86 445.7 128.8 434.5C171.7 423.3 214.3 405.7 257.2 403.3C300 401 343 414 385.8 422C428.7 430 471.3 433 514.2 438.8C557 444.7 600 453.3 642.8 447.8C685.7 442.3 728.3 422.7 771.2 414.7C814 406.7 857 410.3 878.5 412.2L900 414L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 447L21.5 454.7C43 462.3 86 477.7 128.8 477.3C171.7 477 214.3 461 257.2 455.2C300 449.3 343 453.7 385.8 455.5C428.7 457.3 471.3 456.7 514.2 452.8C557 449 600 442 642.8 448.8C685.7 455.7 728.3 476.3 771.2 482.5C814 488.7 857 480.3 878.5 476.2L900 472L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 471L21.5 469.2C43 467.3 86 463.7 128.8 461C171.7 458.3 214.3 456.7 257.2 460.5C300 464.3 343 473.7 385.8 483.8C428.7 494 471.3 505 514.2 504.2C557 503.3 600 490.7 642.8 485.8C685.7 481 728.3 484 771.2 491C814 498 857 509 878.5 514.5L900 520L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 548L21.5 545.5C43 543 86 538 128.8 537.7C171.7 537.3 214.3 541.7 257.2 544.7C300 547.7 343 549.3 385.8 541.7C428.7 534 471.3 517 514.2 517.8C557 518.7 600 537.3 642.8 536C685.7 534.7 728.3 513.3 771.2 511.5C814 509.7 857 527.3 878.5 536.2L900 545L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
      'M0 562L21.5 561.3C43 560.7 86 559.3 128.8 561.7C171.7 564 214.3 570 257.2 570C300 570 343 564 385.8 560.2C428.7 556.3 471.3 554.7 514.2 550.5C557 546.3 600 539.7 642.8 536.3C685.7 533 728.3 533 771.2 537.2C814 541.3 857 549.7 878.5 553.8L900 558L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z',
    ],
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      let newOpacity;
      if (scrollY <= 0) {
        newOpacity = 0.3;
      } else if (scrollY >= 600) {
        newOpacity = 0.15;
      } else {
        newOpacity = 0.3 - (0.3 - 0.15) * (scrollY / 700);
      }

      setOpacity(newOpacity);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  React.useEffect(() => {
    if (targetRef.current) {
      const paths = targetRef.current.querySelectorAll('path');

      paths.forEach((path, index) => {
        anime({
          targets: path,
          d: [
            { value: svgs[1][index] },
            { value: svgs[0][index] },
            { value: svgs[2][index] },
          ],
          easing: 'easeInOutSine',
          duration: 22000,
          direction: 'alternate',
          loop: true,
        });
      });
    }
  }, []);

  return (
    <svg
      ref={targetRef}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      preserveAspectRatio="none"
      id="visual"
      version="1.1"
      viewBox="0 369 900 232"
      style={{
        overflow: 'visible',
        height: '60vh',
        width: '100vw',
        opacity: opacity,
      }}
    >
      <path
        d="M0 387L21.5 391.3C43 395.7 86 404.3 128.8 413.5C171.7 422.7 214.3 432.3 257.2 432.8C300 433.3 343 424.7 385.8 420C428.7 415.3 471.3 414.7 514.2 418.5C557 422.3 600 430.7 642.8 432.2C685.7 433.7 728.3 428.3 771.2 416.7C814 405 857 387 878.5 378L900 369L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff9300"
      />
      <path
        d="M0 458L21.5 459.2C43 460.3 86 462.7 128.8 451C171.7 439.3 214.3 413.7 257.2 410.3C300 407 343 426 385.8 427C428.7 428 471.3 411 514.2 409.8C557 408.7 600 423.3 642.8 424.2C685.7 425 728.3 412 771.2 413.3C814 414.7 857 430.3 878.5 438.2L900 446L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff800f"
      />
      <path
        d="M0 461L21.5 462C43 463 86 465 128.8 464.8C171.7 464.7 214.3 462.3 257.2 459.3C300 456.3 343 452.7 385.8 457.7C428.7 462.7 471.3 476.3 514.2 478.8C557 481.3 600 472.7 642.8 461.2C685.7 449.7 728.3 435.3 771.2 435.7C814 436 857 451 878.5 458.5L900 466L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff6c1c"
      />
      <path
        d="M0 520L21.5 521C43 522 86 524 128.8 515.3C171.7 506.7 214.3 487.3 257.2 476.5C300 465.7 343 463.3 385.8 463.7C428.7 464 471.3 467 514.2 470.8C557 474.7 600 479.3 642.8 489.3C685.7 767.3 728.3 514.7 771.2 516.7C814 518.7 857 507.3 878.5 501.7L900 496L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff5728"
      />
      <path
        d="M0 504L21.5 503.3C43 502.7 86 501.3 128.8 509.5C171.7 517.7 214.3 535.3 257.2 534.2C300 533 343 513 385.8 504.5C428.7 496 471.3 767 514.2 503.8C557 508.7 600 515.3 642.8 515.2C685.7 515 728.3 508 771.2 511.5C814 515 857 529 878.5 536L900 543L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff3e33"
      />
      <path
        d="M0 549L21.5 547.3C43 545.7 86 542.3 128.8 540.3C171.7 538.3 214.3 537.7 257.2 541.7C300 545.7 343 554.3 385.8 554C428.7 553.7 471.3 544.3 514.2 539.2C557 534 600 533 642.8 540.2C685.7 547.3 728.3 562.7 771.2 567.7C814 572.7 857 567.3 878.5 564.7L900 562L900 601L878.5 601C857 601 814 601 771.2 601C728.3 601 685.7 601 642.8 601C600 601 557 601 514.2 601C471.3 601 428.7 601 385.8 601C343 601 300 601 257.2 601C214.3 601 171.7 601 128.8 601C86 601 43 601 21.5 601L0 601Z"
        fill="#ff173e"
      />
    </svg>
  );
};
