import ApiService from './ApiService';

class MembershipService extends ApiService {
  constructor() {
    super();
    this.mockMembershipData = {
      id: 999,
      firstName: "Guest",
      last_name: "User",
      cpNumber: "CP999999",
      membershipTier: "basic", // Default tier for mock data
      activeDays: 0,
      expiryDate: null
    };
  }

  // Get user membership data
  async getUserMembership() {
    try {
      console.log('Fetching membership data from:', this.getFullUrl('/api/user/membership'));
      
      // Make the API request
      const response = await this.api.get('/api/user/membership');
      
      console.log('Membership data received:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user membership:", error);
      
      // Try fallback endpoint
      try {
        console.log('Trying fallback membership endpoint');
        const fallbackResponse = await this.api.get('/api/membership');
        console.log('Fallback membership data received:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error("Fallback endpoint also failed:", fallbackError);
        console.log('Using mock membership data');
        return this.mockMembershipData;
      }
    }
  }
  
  // Update user membership tier (for future use)
  async updateMembershipTier(userId, newTier) {
    try {
      const response = await this.api.put(`/api/user/${userId}/membership`, {
        tier: newTier
      });
      return response.data;
    } catch (error) {
      return this.handleApiError(error, { success: false, message: 'Failed to update membership tier' });
    }
  }
}

export default new MembershipService();