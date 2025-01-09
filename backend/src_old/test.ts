import { UserManagment } from './services/userManagment';

const main = async () => {
  console.log(await UserManagment.updateUser('Lodor', 'ProfilePicChange', 0));
  console.log(await UserManagment.getUser('Lodor'));
};
main();
