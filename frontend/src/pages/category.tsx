import { useParams } from "react-router-dom";
import React from "react";

export const Category = () => {
  const { categoryName, page } = useParams();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  React.useEffect(() => {
    fetch(`${backendUrl}/articles/${categoryName}?page=${page}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json(); 
    })
    .then(data => {
      console.log(data); 
    })
    .catch(error => {
      console.error('There has been a problem with calling the API:', error);
    });
  }, []);

  return <p>{categoryName}</p>;
};
