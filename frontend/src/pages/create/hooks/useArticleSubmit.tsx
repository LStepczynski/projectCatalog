import { useSearchParams } from 'react-router-dom';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';

interface FormData {
  Title: string;
  Description: string;
  Body: string;
  PrimaryCategory: string;
  Difficulty: string;
  S3Link: string;
}

interface SubmitProps {
  formData: FormData;
  user: any;
  bannerFile: any;
  tags: string[];
  setSaved: any;
}

export const useArticleSubmit = (props: SubmitProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { formData, user, bannerFile, tags, setSaved } = props;

  const [searchParams] = useSearchParams();
  const existingId = searchParams.get('id') || '';

  const validate = (): boolean => {
    // Extract required fields
    const { S3Link, ...requiredFields } = formData;

    const reqiredFieldsKeys = Object.keys(requiredFields) as (keyof FormData)[];

    // Check if all required fields are filled
    for (const field of reqiredFieldsKeys) {
      if (formData[field].trim() === '') {
        ShowInformationPopup(
          'Error',
          'Please fill out all of the fields in order to save.'
        );
        return false;
      }
    }

    // Check if at least one tag has been selected
    if (tags.length == 0) {
      ShowInformationPopup(
        'Error',
        'Please fill out all of the fields in order to save.'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (status: string) => {
    if (!validate()) return;

    try {
      // Submit article data
      const articleData = await fetchWrapper(
        `${backendUrl}/articles?id=${existingId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            body: formData.Body,
            metadata: {
              Title: formData.Title,
              Description: formData.Description,
              Author: user.Username,
              AuthorProfilePic: user.ProfilePic,
              PrimaryCategory: formData.PrimaryCategory,
              SecondaryCategories: tags,
              Difficulty: formData.Difficulty,
              Image: formData.S3Link,
              Status: status,
            },
          }),
        }
      );

      if (articleData.status != 200)
        throw new Error(articleData.response.message);

      sessionStorage.removeItem(
        `${backendUrl}/articles/get?id=${existingId}&visibility=private`
      );

      sessionStorage.removeItem(
        `${backendUrl}/articles/author?authorName=${user.Username}&visibility=private`
      );

      if (bannerFile[0] == null) {
        ShowInformationPopup(
          'Success',
          `Your article has been ${
            status == 'private' ? 'saved' : 'submited for review'
          }.`,
          () => {
            setSaved(true);
            setTimeout(() => (window.location.href = '/myArticles/1'), 500);
          }
        );
        return;
      }
      // Submit image data
      const articleId = articleData.response.id;

      const bannerData = await fetchWrapper(
        `${backendUrl}/articles/image?id=${articleId}&visibility=private`,
        {
          method: 'POST',
          body: JSON.stringify({
            image: bannerFile[1],
          }),
        }
      );

      if (bannerData.status != 200)
        throw new Error(bannerData.response.message);
    } catch (error: any) {
      return ShowInformationPopup('Error', capitalize(error.message));
    }
    ShowInformationPopup(
      'Success',
      `Your article has been ${
        status == 'private' ? 'saved' : 'submited for review'
      }.`,
      () => {
        setSaved(true);
        setTimeout(() => (window.location.href = '/myArticles/1'), 500);
      }
    );
  };

  return { handleSubmit };
};
