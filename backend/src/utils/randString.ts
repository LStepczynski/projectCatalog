export const randString = (length = 12) => {
  if (length < 4) {
    throw new Error(
      'Length must be at least 4 to include all required character types.'
    );
  }

  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialCharacters = '!@#$%^&*(),.?":{}|<>';

  // Ensure at least one character from each set
  const requiredCharacters = [
    lowerCase.charAt(Math.floor(Math.random() * lowerCase.length)),
    upperCase.charAt(Math.floor(Math.random() * upperCase.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    specialCharacters.charAt(
      Math.floor(Math.random() * specialCharacters.length)
    ),
  ];

  // Create the pool of characters for the remaining random characters
  const allCharacters = lowerCase + upperCase + numbers + specialCharacters;
  const remainingCharacters = Array.from({ length: length - 4 }, () =>
    allCharacters.charAt(Math.floor(Math.random() * allCharacters.length))
  );

  // Combine and shuffle
  const fullString = [...requiredCharacters, ...remainingCharacters];
  for (let i = fullString.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [fullString[i], fullString[j]] = [fullString[j], fullString[i]]; // Swap
  }

  return fullString.join('');
};
