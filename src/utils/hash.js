import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createHash = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const isValidPassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};