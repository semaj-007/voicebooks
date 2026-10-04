// Test the toPublic function which is a pure function
const accounts = require('../../src/models/accounts.js');

describe('Accounts Model - toPublic', () => {
  describe('toPublic', () => {
    it('should convert user row to public object without sensitive data', () => {
      const userRow = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890',
        role: 'business_owner',
        role_label: 'Business Owner',
        onboarding_completed: 1,
        created_at: '2024-01-01',
        business_id: 1,
        business_name: 'Test Business',
        registration_number: 'REG123',
        vat_number: 'VAT123',
        industry: 'Technology',
        business_size: '1',
        country: 'US',
        currency: 'USD',
        sage_status: 'connected',
        sage_region: 'UK'
      };
      
      const result = accounts.toPublic(userRow);
      
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        role: 'business_owner',
        roleLabel: 'Business Owner',
        onboardingCompleted: true,
        createdAt: '2024-01-01',
        business: {
          name: 'Test Business',
          registrationNumber: 'REG123',
          vatNumber: 'VAT123',
          industry: 'Technology',
          size: '1',
          country: 'US',
          currency: 'USD',
          sageStatus: 'connected',
          sageRegion: 'UK'
        }
      });
    });

    it('should return null for null input', () => {
      const result = accounts.toPublic(null);
      expect(result).toBeNull();
    });

    it('should handle user without business', () => {
      const userRow = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'business_owner',
        role_label: 'Business Owner',
        onboarding_completed: 0,
        created_at: '2024-01-01'
      };
      
      const result = accounts.toPublic(userRow);
      
      expect(result.business).toBeNull();
    });

    it('should handle user with partial business data', () => {
      const userRow = {
        id: 1,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'business_owner',
        role_label: 'Business Owner',
        onboarding_completed: 1,
        created_at: '2024-01-01',
        business_id: 1,
        business_name: 'Test Business',
        industry: 'Technology',
        business_size: '1',
        country: 'US',
        currency: 'USD'
      };
      
      const result = accounts.toPublic(userRow);
      
      expect(result.business).toEqual({
        name: 'Test Business',
        registrationNumber: undefined,
        vatNumber: undefined,
        industry: 'Technology',
        size: '1',
        country: 'US',
        currency: 'USD',
        sageStatus: undefined,
        sageRegion: undefined
      });
    });
  });
});
