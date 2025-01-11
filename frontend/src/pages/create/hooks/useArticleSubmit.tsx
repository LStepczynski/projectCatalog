import { useSearchParams } from 'react-router-dom';

import { ShowInformationPopup } from '@components/common/popups/informationPopup';

import { fetchWrapper } from '@utils/fetchWrapper';
import { capitalize } from '@utils/capitalize';
import { getUser } from '@utils/getUser';

interface FormData {
  title: string;
  description: string;
  body: string;
  category: string;
  difficulty: string;
  image: string;
  tags: string[];
}

interface SubmitProps {
  formData: FormData;
  setSaved: any;
}

/**
 * Custom hook to handle article submission.
 *
 * @param {SubmitProps} props - The properties required for submission.
 * @param {FormData} props.formData - The form data containing article details.
 * @param {User} props.user - The user information.
 * @param {File[]} props.bannerFile - The banner file to be uploaded.
 * @param {string[]} props.tags - The tags associated with the article.
 * @param {React.Dispatch<React.SetStateAction<boolean>>} props.setSaved - The function to set the saved state.
 *
 * @returns {Object} - An object containing the handleSubmit function.
 *
 * @function validate
 * Validates the form data to ensure all required fields are filled and at least one tag is selected.
 *
 * @returns {boolean} - Returns true if validation passes, otherwise false.
 *
 * @function handleSubmit
 * Handles the submission of the article data and banner image.
 *
 * @param {string} status - The status of the article (e.g., 'private' or 'public').
 *
 * @throws {Error} - Throws an error if the submission fails.
 */
export const useArticleSubmit = (props: SubmitProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { formData, setSaved } = props;

  const [searchParams] = useSearchParams();
  const existingId = searchParams.get('id');

  const user = getUser();

  const validate = (): boolean => {
    // Extract required fields
    const { image, tags, ...requiredFields } = formData;

    const reqiredFieldsKeys = Object.keys(requiredFields) as (keyof Omit<
      FormData,
      'tags'
    >)[];

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

    return true;
  };

  const handleSubmit = async (status: string) => {
    if (!validate()) return;

    try {
      // Submit article data
      const articleData = await fetchWrapper(
        `${backendUrl}/articles/${existingId ? 'update' : 'create'}`,
        {
          method: existingId ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...(existingId && { id: existingId }),
            body: formData.body,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            tags: formData.tags,
            difficulty: formData.difficulty,
            image: formData.image,
            status: status,
          }),
        }
      );

      if (articleData.status != 'success') throw new Error(articleData.message);

      sessionStorage.removeItem(
        `${backendUrl}/articles/get/${existingId}?visibility=private`
      );

      sessionStorage.removeItem(
        `${backendUrl}/articles/author/${user!.username}?visibility=private`
      );
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
