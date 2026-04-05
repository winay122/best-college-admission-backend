import jwt from 'jsonwebtoken';

const SECONDS_IN_DAY = 86400;

export const generateToken = (userId: string, role: string) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_college_select_2026';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: SECONDS_IN_DAY,
  });
};

export const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET || 'fallback_dev_secret_college_select_2026';
  return jwt.verify(token, secret);
};
