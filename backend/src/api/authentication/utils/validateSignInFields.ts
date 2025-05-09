import { validatePassword } from '@utils/validations/validatePassword';
import { isValidString } from '@utils/validations/isValidString';
import { isValidEmail } from '@utils/validations/isValidEmail';

import { UserError } from '@utils/statusError';

/**
 * Validates the required fields in the sign-in request body.
 *
 * Checks for missing fields (`username`, `password`)
 * and checks the password strength based on predefined rules.
 *
 * @param body - The request body containing user input fields.
 * @throws UserError - If any field is missing, the email format is invalid, or the password does not meet requirements.
 */
export const validateSignInFields = (body: any) => {
  const invalidFields = ['username', 'password'].filter(
    (field) => !isValidString(body[field])
  );

  if (invalidFields.length > 0) {
    throw new UserError(`Missing fields: ${invalidFields.join(', ')}`, 400);
  }

  const passwordError = validatePassword(body.password);
  if (passwordError !== '') {
    throw new UserError(passwordError, 400);
  }
};
