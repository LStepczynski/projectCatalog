export const useGetContainerWidth = (screenWidth: number) => {
  if (screenWidth < 430) {
    return '270px';
  }
  if (screenWidth < 500) {
    return '300px';
  }
  if (screenWidth < 700) {
    return '450px';
  }
  return '600px';
};
