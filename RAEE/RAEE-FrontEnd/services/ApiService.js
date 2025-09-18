import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    // URL base del backend CodeIgniter 4
    this.baseURL = 'http://192.168.1.2/EcoRAEE/RAEE/RAEE-BackEnd/public/api';
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
      
      // Manejar errores de conexión de manera más específica
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica que el servidor esté ejecutándose.');
      }
      
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
    
    if (response.success && response.data && response.data.token) {
      await this.saveToken(response.data.token);
    }
    
    return response;
  }

  // Obtener perfil del usuario
  async getProfile() {
    return await this.makeRequest('profile', 'GET');
  }

  // Obtener puntos del usuario
  async getUserPoints() {
    return await this.makeRequest('user/points', 'GET');
  }

  // Cerrar sesión
  async logout() {
    await this.removeToken();
    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  // ==================== EQUIPOS ====================

  // Crear nuevo equipo
  async createEquipment(equipmentData) {
    return await this.makeRequest('donations', 'POST', equipmentData);
  }

  // Obtener todos los equipos
  async getAllEquipment() {
    return await this.makeRequest('donations', 'GET');
  }

  // Obtener equipos del usuario
  async getUserEquipment() {
    return await this.makeRequest('donations', 'GET');
  }

  // Obtener equipo específico
  async getEquipment(equipmentId) {
    return await this.makeRequest(`donations/${equipmentId}`, 'GET');
  }

  // Actualizar estado de equipo
  async updateEquipmentStatus(equipmentId, status) {
    return await this.makeRequest(`donations/${equipmentId}/status`, 'PUT', { estado: status });
  }

  // Crear publicación para equipo
  async createPublication(equipmentId, publicationData) {
    return await this.makeRequest(`donations/${equipmentId}/publication`, 'POST', publicationData);
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

  // ==================== CATEGORÍAS Y ESTADOS ====================

  // Obtener todas las categorías de equipos
  async getCategories() {
    return await this.makeRequest('categories', 'GET', null, false);
  }

  // Obtener todos los estados de equipos
  async getStates() {
    return await this.makeRequest('states', 'GET', null, false);
  }
}

// Exportar una instancia única del servicio (Singleton)
export default new ApiService();