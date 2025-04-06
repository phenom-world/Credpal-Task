export const emailValidator = {
  validator: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  message: 'Please provide a valid email address',
};

export const passwordValidator = {
  validator: (password: string) => {
    return password.length >= 8;
  },
  message: 'Password must be at least 8 characters long',
};
