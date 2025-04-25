import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

const fields = [
  { name: 'FRONTEND_URL', description: 'The url of the frontend' },
  {
    name: 'AWS_S3_REGION',
    description: 'The region of the S3 bucket (ex. us-east-2)',
  },
  {
    name: 'AWS_S3_LINK',
    description: 'Link to the S3 bucket (Or local MinIO bucket)',
  },
  {
    name: 'AWS_S3_BUCKET_NAME',
    description: 'Name of the S3 bucket (Or local MinIO bucket)',
  },
  {
    name: 'JWT_KEY',
    description: "Secret string for verifying access JWT's",
  },
  {
    name: 'JWT_EXPIRATION',
    description: 'Time in hours for the access JWT to expire. (0.5)',
  },
  {
    name: 'JWT_REFRESH_KEY',
    description: "Secret string for verifying refresh JWT's.",
  },
  {
    name: 'JWT_REFRESH_EXPIRATION',
    description: 'Time in hours for the refresh JWT to expire. (72)',
  },
  {
    name: 'SES_REGION',
    description: 'The region of the AWS SES service',
  },
  {
    name: 'AWS_ACCESS_KEY_ID',
    description:
      'The AWS access key credentials (needed for local development)',
  },
  {
    name: 'AWS_SECRET_ACCESS_KEY',
    description:
      'The AWS secret key credentials (needed for local development)',
  },
  {
    name: 'DEV_STATE',
    description: 'The state of the application. (development / production)',
  },
];

(async () => {
  const values: string[] = [];

  for (const field of fields) {
    console.log(field.description);
    const answer = await ask(`${field.name} >> `);
    console.log('XXXXXXXXXXXXXXX');
    values.push(answer);
  }

  rl.close();

  const ending =
    values[values.length - 1] == 'development' ? 'dev' : 'production';

  const envPath = path.join(__dirname, '../../.env.aa' + ending);
  const envContent = fields
    .map((field, i) => `${field.name}=${values[i]}`)
    .join('\n');

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ .env file created at ${envPath}`);
  console.log(
    `A .env file with a .${ending} extention was created. It will be used only in the ${ending} stage.`
  );
})();
