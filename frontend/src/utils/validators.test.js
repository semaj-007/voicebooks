import { validateLogin } from './validators.js';

describe('validateLogin', () => {
  it('returns errors for an invalid email and missing password', () => {
    const errors = validateLogin({
      email: 'not-an-email',
      password: '',
    });

    expect(errors).toEqual({
      email: 'Enter a valid email address',
      password: 'Password is required',
    });
  });
});
