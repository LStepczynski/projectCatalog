import React from 'react';

import { fetchWrapper } from '@utils/fetchWrapper';

/**
 * Custom hook to fill the form with existing article information.
 *
 * @param {string} articleId - The ID of the article to fetch.
 * @param {Function} setFormData - Function to set the form data.
 * @param {Function} setTags - Function to set the tags.
 * @param {Function} setBannerFile - Function to set the banner file.
 *
 * @returns {void}
 *
 * @example
 * useFillExistingInfo(articleId, setFormData, setTags, setBannerFile);
 *
 * @remarks
 * This hook fetches the data for an existing article using the provided article ID
 * and fills the form with the fetched data. It also sets the tags and banner file.
 * The fetch request is aborted when the component is unmounted.
 */
export const useFillExistingInfo = (
  articleId: string,
  setFormData: any,
  setTags: any,
  setBannerFile: any
) => {
  React.useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Fetch the data for the existing article and fill the form with it
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    fetchWrapper(
      `${backendUrl}/articles/get?id=${articleId}&visibility=private`,
      { signal },
      true,
      60 * 10
    ).then((data) => {
      const article = data.response.return;
      setFormData({
        Title: article.metadata.Title,
        Description: article.metadata.Description,
        Body: article.body,
        PrimaryCategory: article.metadata.PrimaryCategory,
        Difficulty: article.metadata.Difficulty,
        S3Link: article.metadata.Image,
      });
      setTags(article.metadata.SecondaryCategories);
      setBannerFile((prev: any) => [prev[0], article.metadata.Image]);
    });

    return () => {
      controller.abort();
    };
  }, []);
};
