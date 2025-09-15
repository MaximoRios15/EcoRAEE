import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    // URL base del backend CodeIgniter 4
    this.baseURL = 'http://192.168.0.9/EcoRAEE/RAEE/RAEE-BackEnd/public/api';
    this.token = null;
  }

  // Configurar headers por defecto
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Cargar token desde AsyncStorage
  async loadToken() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  // Guardar token en AsyncStorage
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('userToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  // Eliminar token
  async removeToken() {
    try {
      await AsyncStorage.removeItem('userToken');
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Método genérico para hacer peticiones HTTP
  async makeRequest(endpoint, method = 'GET', data = null, includeAuth = true) {
    try {
      await this.loadToken();

      const config = {
        method,
        headers: this.getHeaders(includeAuth),
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}/${endpoint}`, config);
      
      // Verificar si la respuesta es JSON válida
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        
        return result;
      } else {
        // Si no es JSON, obtener el texto de la respuesta
        const text = await response.text();
        throw new Error(`Server returned non-JSON response: ${text}`);
      }
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== AUTENTICACIÓN ====================

  // Registro de usuario
  async register(userData) {
    return await this.makeRequest('register', 'POST', userData, false);
  }

  // Inicio de sesión
  async login(credentials) {
    const response = await this.makeRequest('login', 'POST', credentials, false);
    
    if (response.success && response.token) {
      await this.saveToken(response.token);
    }
    
    return response;
  }

  // Obtener perfil del usuario
  async getProfile() {
    return await this.makeRequest('profile', 'GET');
  }

  // Cerrar sesión
  async logout() {
    await this.removeToken();
    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  // ==================== DONACIONES ====================

  // Crear nueva donación
  async createDonation(donationData) {
    return await this.makeRequest('donations', 'POST', donationData);
  }

  // Obtener todas las donaciones
  async getAllDonations() {
    return await this.makeRequest('donations', 'GET');
  }

  // Obtener donaciones del usuario
  async getUserDonations() {
    return await this.makeRequest('donations/user', 'GET');
  }

  // Obtener donación específica
  async getDonation(donationId) {
    return await this.makeRequest(`donations/${donationId}`, 'GET');
  }

  // Actualizar estado de donación
  async updateDonationStatus(donationId, status) {
    return await this.makeRequest(`donations/${donationId}/status`, 'PUT', { status });
  }

  // ==================== ENTREGAS ====================

  // Crear nueva entrega
  async createDelivery(deliveryData) {
    return await this.makeRequest('deliveries', 'POST', deliveryData);
  }

  // Obtener todas las entregas
  async getAllDeliveries() {
    return await this.makeRequest('deliveries', 'GET');
  }

  // Obtener entregas del usuario
  async getUserDeliveries() {
    return await this.makeRequest('deliveries/user', 'GET');
  }

  // Obtener entrega específica
  async getDelivery(deliveryId) {
    return await this.makeRequest(`deliveries/${deliveryId}`, 'GET');
  }

  // Actualizar estado de entrega
  async updateDeliveryStatus(deliveryId, status) {
    return await this.makeRequest(`deliveries/${deliveryId}/status`, 'PUT', { status });
  }

  // Obtener horarios disponibles
  async getAvailableTimeSlots() {
    return await this.makeRequest('deliveries/timeslots', 'GET');
  }

  // ==================== TÉCNICOS ====================

  // Registro de técnico
  async registerTechnician(technicianData) {
    return await this.makeRequest('technician/register', 'POST', technicianData);
  }

  // Obtener perfil de técnico
  async getTechnicianProfile() {
    return await this.makeRequest('technician/profile', 'GET');
  }

  // Actualizar perfil de técnico
  async updateTechnicianProfile(profileData) {
    return await this.makeRequest('technician/profile', 'PUT', profileData);
  }

  // Obtener todos los técnicos
  async getAllTechnicians() {
    return await this.makeRequest('technicians', 'GET');
  }

  // ==================== INSTITUCIONES ====================

  // Registro de institución
  async registerInstitution(institutionData) {
    return await this.makeRequest('institution/register', 'POST', institutionData);
  }

  // Obtener perfil de institución
  async getInstitutionProfile() {
    return await this.makeRequest('institution/profile', 'GET');
  }

  // Actualizar perfil de institución
  async updateInstitutionProfile(profileData) {
    return await this.makeRequest('institution/profile', 'PUT', profileData);
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new ApiService();