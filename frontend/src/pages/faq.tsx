import { Box, Heading, Text } from '@primer/react';

export const Faq = () => {
  return (
    <Box
      sx={{
        display: 'grid',
        justifyContent: 'center',
        gap: 3,
        mt: '120px',
      }}
    >
      <Box sx={{ display: 'grid', justifyContent: 'center' }}>
        <Heading
          sx={{
            fontFamily: 'inter tight',
            fontWeight: '600',
            fontSize: '40px',
          }}
        >
          Frequently Asked Questions
        </Heading>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 8,
          mt: 4,
        }}
      >
        <Box>
          <Heading>What is Project Catalog?</Heading>
          <Text>
            Project Catalog is a community-driven platform designed to empower
            individuals through education. It offers a wide range of educational
            articles and tutorials created by users, making it a place where
            people can share knowledge, learn new skills, and grow together.
            Whether you're looking to gain new insights or share your expertise,
            Project Catalog provides the tools to connect and inspire learners
            worldwide.
          </Text>
        </Box>
        <Box>
          <Heading>What makes a good article?</Heading>
          <Text>
            A good article is informative, well-researched, and easy to
            understand. It should be engaging, provide value to the reader, and
            include clear explanations with relevant examples. Additionally, a
            good article should stay closely connected to its category, ensuring
            the content is relevant and useful to those interested in that
            specific topic. Structuring the content logically and maintaining a
            concise, conversational tone can make the article more accessible
            and enjoyable for a wider audience.
          </Text>
        </Box>
        <Box>
          <Heading>What makes a good tutorial?</Heading>
          <Text>
            A good tutorial is one that effectively guides the reader through a
            process step by step, making it easy for them to follow along and
            achieve the desired outcome. It should break down complex concepts
            into manageable parts, using clear instructions and descriptions
            where applicable. Each step should be well-documented, with detailed
            explanations and practical examples to help the reader understand
            the purpose and context. A good tutorial anticipates potential
            challenges, offers troubleshooting tips, and ensures that learners
            can confidently complete each stage of the process.
          </Text>
        </Box>
        <Box>
          <Heading>How does the article review process look like?</Heading>
          <Text>
            The article review process begins when a user submits their content
            for review. Once submitted, the article is evaluated by moderators
            to ensure it meets the platform's quality standards, including
            accuracy, relevance to its category, and clarity of presentation.
            Feedback may be provided to help the author improve their work, and
            the article is approved once it meets all the necessary criteria.
            This process ensures that all published content is informative,
            well-structured, and valuable to the readers.
          </Text>
        </Box>
        <Box>
          <Heading>What kind of content is allowed on Project Catalog?</Heading>
          <Text>
            Project Catalog welcomes educational content that helps others
            learn, grow, and explore new topics. Articles and tutorials should
            be informative, accurate, and relevant to the categories available
            on the platform. Examples of allowed content include how-to guides,
            tutorials, informative articles, and project walkthroughs. We do not
            allow content that is misleading, promotional, or offensive. All
            submissions must adhere to our quality and community standards to
            maintain a high level of value for our users.
          </Text>
        </Box>
        <Box>
          <Heading>How long does the article review process take?</Heading>
          <Text>
            The article review process typically takes a few days, depending on
            the current number of submissions. Once you submit your article, our
            moderators will review it for quality, accuracy, and relevance. We
            aim to provide feedback and approval as quickly as possible to
            ensure your content gets published in a timely manner. You will be
            notified once your article is approved or if any changes are needed.
          </Text>
        </Box>
        <Box>
          <Heading>What topics can I write about on Project Catalog?</Heading>
          <Text>
            Project Catalog offers a wide range of categories for you to explore
            and contribute to. These categories include technology, science, DIY
            projects, arts and crafts, programming, and many more. Each category
            is designed to foster learning and creativity in a specific area,
            allowing users to dive deep into their interests. We encourage
            authors to stay relevant to their chosen category and provide
            detailed, well-researched content that benefits the community.
          </Text>
        </Box>
        <Box>
          <Heading>
            Is there a way to provide feedback on someone else's article?
          </Heading>
          <Text>
            We understand the importance of constructive feedback in improving
            content quality. In the future, we plan to introduce a comments
            section for articles and tutorials, allowing readers to share their
            thoughts, ask questions, and engage with the authors. This feature
            will help foster a collaborative learning environment where users
            can learn from each other, discuss ideas, and provide valuable
            insights.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
