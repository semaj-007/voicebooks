const request = require('supertest');
const app = require('../../src/app.js');
const { db } = require('../../src/db/index.js');

// Mock the database module
jest.mock('../../src/db/index.js', () => {
  const mockPrepare = jest.fn();
  const mockDb = {
    prepare: mockPrepare,
    transaction: jest.fn()
  };
  
  return { db: mockDb };
});

// Mock the accounts model
jest.mock('../../src/models/accounts.js', () => {
  const mockFindRowByEmail = jest.fn();
  const mockFindRowById = jest.fn();
  const mockToPublic = jest.fn();
  const mockCreateUserWithBusiness = jest.fn();
  const mockSaveResetToken = jest.fn();
  const mockFindValidResetToken = jest.fn();
  const mockConsumeResetToken = jest.fn();
  const mockRecentResetTokenExists = jest.fn();
  
  return {
    findRowByEmail: mockFindRowByEmail,
    findRowById: mockFindRowById,
    toPublic: mockToPublic,
    createUserWithBusiness: mockCreateUserWithBusiness,
    saveResetToken: mockSaveResetToken,
    findValidResetToken: mockFindValidResetToken,
    consumeResetToken: mockConsumeResetToken,
    recentResetTokenExists: mockRecentResetTokenExists
  };
});

// Mock the security utilities
jest.mock('../../src/utils/security.js', () => {
  const mockHashPassword = jest.fn().mockResolvedValue('hashed_password');
  const mockVerifyPassword = jest.fn().mockResolvedValue(true);
  const mockSignToken = jest.fn().mockReturnValue('test_token');
  const mockVerifyToken = jest.fn();
  const mockSetAuthCookie = jest.fn();
  const mockClearAuthCookie = jest.fn();
  const mockNewResetToken = jest.fn().mockReturnValue({ raw: 'test_token_raw', hash: 'test_token_hash' });
  const mockSha256 = jest.fn().mockReturnValue('hashed_token');
  
  return {
    hashPassword: mockHashPassword,
    verifyPassword: mockVerifyPassword,
    signToken: mockSignToken,
    verifyToken: mockVerifyToken,
    setAuthCookie: mockSetAuthCookie,
    clearAuthCookie: mockClearAuthCookie,
    newResetToken: mockNewResetToken,
    sha256: mockSha256,
    DUMMY_HASH: 'dummy_hash',
    COOKIE_NAME: 'vb_token'
  };
});

// Mock the mailer
jest.mock('../../src/utils/mailer.js', () => ({
  mailConfigured: false,
  sendInBackground: jest.fn()
}));

// Mock the config
jest.mock('../../src/config.js', () => ({
  config: {
    clientOrigin: 'http://localhost:5173',
    isProd: false,
    resetTokenTtlMinutes: 15
  }
}));

const accounts = require('../../src/models/accounts.js');
const security = require('../../src/utils/security.js');

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(res.body.ok).toBe(true);
    });
  });

  describe('GET /', () => {
    it('should return API info', async () => {
      const res = await request(app)
        .get('/')
        .expect(200);
      
      expect(res.body.application).toBe('VoiceBooks API');
      expect(res.body.status).toBe('running');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        role: 'business_owner',
        business: {
          businessName: 'Test Business',
          industry: 'Technology',
          businessSize: '1',
          country: 'US',
          currency: 'USD'
        }
      };

      accounts.findRowByEmail.mockReturnValue(null);
      accounts.createUserWithBusiness.mockReturnValue(1);
      accounts.findRowById.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        password_hash: 'hashed_password'
      });
      accounts.toPublic.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'business_owner'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(res.body.message).toBe('Account created.');
      expect(res.body.user).toBeDefined();
      expect(security.setAuthCookie).toHaveBeenCalled();
    });

    it('should reject duplicate email', async () => {
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
        role: 'business_owner',
        business: {
          businessName: 'Test Business',
          industry: 'Technology',
          businessSize: '1',
          country: 'US',
          currency: 'USD'
        }
      };

      accounts.findRowByEmail.mockReturnValue({ id: 1 });

      const res = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(409);

      expect(res.body.message).toBe('An account with this email already exists.');
    });

    it('should reject invalid data', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'User',
        email: 'invalid-email',
        password: 'short',
        confirmPassword: 'short',
        role: 'business_owner'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'ValidPass123'
      };

      accounts.findRowByEmail.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      });
      
      accounts.toPublic.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(res.body.message).toBe('Signed in.');
      expect(res.body.user).toBeDefined();
      expect(security.setAuthCookie).toHaveBeenCalled();
    });

    it('should reject invalid credentials', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      accounts.findRowByEmail.mockReturnValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(res.body.message).toBe('Incorrect email or password.');
    });

    it('should reject invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };

      const res = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should handle forgot password request', async () => {
      const forgotData = {
        email: 'test@example.com'
      };

      accounts.findRowByEmail.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test'
      });
      
      accounts.recentResetTokenExists.mockReturnValue(false);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(res.body.message).toContain('reset link');
      expect(accounts.saveResetToken).toHaveBeenCalled();
    });

    it('should return same response for non-existent email', async () => {
      const forgotData = {
        email: 'nonexistent@example.com'
      };

      accounts.findRowByEmail.mockReturnValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(200);

      expect(res.body.message).toContain('reset link');
      expect(accounts.saveResetToken).not.toHaveBeenCalled();
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        email: 'invalid-email'
      };

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/verify-reset-token', () => {
    it('should verify valid reset token', async () => {
      const verifyData = {
        token: 'valid_token_raw'
      };

      accounts.findValidResetToken.mockReturnValue({ id: 1, user_id: 1 });

      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send(verifyData)
        .expect(200);

      expect(res.body.valid).toBe(true);
    });

    it('should reject invalid reset token', async () => {
      const verifyData = {
        token: 'invalid_token'
      };

      accounts.findValidResetToken.mockReturnValue(null);

      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send(verifyData)
        .expect(200);

      expect(res.body.valid).toBe(false);
    });

    it('should reject invalid token format', async () => {
      const invalidData = {
        token: 'invalid'
      };

      const res = await request(app)
        .post('/api/auth/verify-reset-token')
        .send(invalidData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      const resetData = {
        token: 'valid_token_raw',
        password: 'NewValidPass123',
        confirmPassword: 'NewValidPass123'
      };

      accounts.findValidResetToken.mockReturnValue({ id: 1, user_id: 1 });
      accounts.findRowById.mockReturnValue({
        id: 1,
        email: 'test@example.com',
        first_name: 'Test'
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(200);

      expect(res.body.message).toBe('Password updated. You can now sign in.');
      expect(accounts.consumeResetToken).toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      const resetData = {
        token: 'invalid_token_raw',
        password: 'NewValidPass123',
        confirmPassword: 'NewValidPass123'
      };

      accounts.findValidResetToken.mockReturnValue(null);

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(res.body.message).toContain('invalid or has expired');
    });

    it('should reject invalid password', async () => {
      const resetData = {
        token: 'valid_token_raw',
        password: 'short',
        confirmPassword: 'short'
      };

      accounts.findValidResetToken.mockReturnValue({ id: 1, user_id: 1 });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(res.body.message).toBe('Signed out.');
      expect(security.clearAuthCookie).toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(res.body.message).toBe('Authentication required');
    });
  });
});
