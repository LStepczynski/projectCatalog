import { useParams } from "react-router-dom";

export const Category = () => {
  const { categoryName } = useParams();

  return <p>{categoryName}</p>;
};
