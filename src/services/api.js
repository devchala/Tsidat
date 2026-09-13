import { mockUser, mockDashboardStats, mockReports, mockWorkers, mockAssignments, mockNotifications } from '../mock/data';

// Simulate API delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  async loginAdmin(email, password) {
    await delay();
    if (email === 'admin@ecotrack.local' && password === 'admin') {
      localStorage.setItem('ecotrack_token', 'mock_jwt_token');
      return { user: mockUser, token: 'mock_jwt_token' };
    }
    throw new Error('Invalid credentials');
  }

  async logout() {
    await delay(200);
    localStorage.removeItem('ecotrack_token');
  }

  async getCurrentUser() {
    await delay(300);
    const token = localStorage.getItem('ecotrack_token');
    if (token) return mockUser;
    throw new Error('Not authenticated');
  }

  async getDashboardStats() {
    await delay();
    return mockDashboardStats;
  }

  async getReports() {
    await delay();
    return mockReports;
  }

  async getReportById(id) {
    await delay();
    const report = mockReports.find(r => r.id === id);
    if (!report) throw new Error('Report not found');
    return report;
  }

  async updateReportStatus(id, status) {
    await delay();
    return { success: true, status };
  }

  async assignWorker(reportId, workerId) {
    await delay();
    return { success: true, reportId, workerId };
  }

  async getWorkers() {
    await delay();
    return mockWorkers;
  }
  
  async getWorkerById(id) {
    await delay();
    return mockWorkers.find(w => w.id === id);
  }

  async getAssignments() {
    await delay();
    return mockAssignments;
  }

  async getNotifications() {
    await delay();
    return mockNotifications;
  }
}

export const api = new ApiService();
