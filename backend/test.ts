import { UserManagment } from './src/services/userManagment';

const main = async () => {
  console.log(await UserManagment.getUser('Leon'));
};

main();
