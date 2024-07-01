import jest from 'jest-mock';

import { generateTokenAndSetCookie } from './generateToken';

describe('generateToken', () => {
  it('should generate a JWT token and set it as a cookie', () => {
    const userId = '12345';
    const res = {
      cookie: jest.fn()
    };
    generateTokenAndSetCookie(userId, res);
    expect(res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), {
      maxAge: 1000 * 60 * 60 * 24 * 15,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV !== 'development'
    });
  });
});