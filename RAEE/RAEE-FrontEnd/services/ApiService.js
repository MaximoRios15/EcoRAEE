import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    // URL base del backend CodeIgniter 4
    this.baseURL = 'http://192.168.1.2/EcoRAEE/RAEE/RAEE-BackEnd/public/api';
  }

  // Configurar headers por defecto
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    return headers;
  }


  // Verificar conectividad con el servidor
  async checkServerConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getHeaders(false),
        timeout: 5000 // 5 segundos de timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('Server connection check failed:', error);
      return false;
    }
  }

  // Método genérico para hacer peticiones HTTP
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        headers: this.getHeaders(),
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
          // Manejar errores específicos por código de estado
          if (response.status === 403) {
            throw new Error('No tienes permisos para realizar esta acción.');
          } else if (response.status === 404) {
            throw new Error('El recurso solicitado no fue encontrado.');
          } else if (response.status >= 500) {
            throw new Error('Error del servidor. Intenta nuevamente más tarde.');
          }
          
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
      
      // Manejar errores de red específicos
      if (error.message.includes('Network request failed')) {
        throw new Error('Error de red: Verifica tu conexión a internet.');
      }
      
      // Manejar errores de timeout
      if (error.message.includes('timeout')) {
        throw new Error('La petición tardó demasiado. Intenta nuevamente.');
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
    // Validar que se proporcionen las credenciales necesarias
    if (!credentials || !credentials.DNI_Usuarios || !credentials.Password_Usuarios) {
      throw new Error('DNI y contraseña son requeridos.');
    }
    
    // El backend espera exactamente estos nombres de campos
    const loginData = {
      DNI_Usuarios: credentials.DNI_Usuarios,
      Password_Usuarios: credentials.Password_Usuarios
    };
    
    const response = await this.makeRequest('login', 'POST', loginData);
    
    return response;
  }

  // Obtener perfil del usuario
  async getProfile(userId) {
    return await this.makeRequest(`profile?user_id=${userId}`, 'GET');
  }

  // Actualizar perfil del usuario
  async updateUserProfile(profileData) {
    return await this.makeRequest('usuarios/update-profile', 'PUT', profileData);
  }

  // Obtener puntos del usuario
  async getUserPoints(userId) {
    return await this.makeRequest(`user/points?user_id=${userId}`, 'GET');
  }

  // Obtener estadísticas del usuario
  async getUserStatistics(userId) {
    return await this.makeRequest(`user/statistics?user_id=${userId}`, 'GET');
  }

  // Obtener ubicaciones de recolección
  async getCollectionLocations() {
    return await this.makeRequest('locations', 'GET');
  }

  // ==================== PUBLICACIONES/DONACIONES ====================
  async getUserPublications(userId, page = 1, perPage = 10) {
    return await this.makeRequest(`publications/user?user_id=${userId}&page=${page}&per_page=${perPage}`, 'GET');
  }

  // Obtener carrito del usuario
  async getCart() {
    return await this.makeRequest('cart', 'GET');
  }

  // Agregar item al carrito
  async addToCart(itemData) {
    return await this.makeRequest('cart', 'POST', itemData);
  }

  // Remover item del carrito
  async removeFromCart(itemId) {
    return await this.makeRequest(`cart/${itemId}`, 'DELETE');
  }

  // Limpiar carrito
  async clearCart() {
    return await this.makeRequest('cart/clear', 'DELETE');
  }

  // Validar DNI
  async validateDni(dni) {
    return await this.makeRequest('validate-dni', 'POST', { dni }, false);
  }

  // Validar Email
  async validateEmail(email) {
    return await this.makeRequest('validate-email', 'POST', { email }, false);
  }

  // Validar Teléfono
  async validateTelefono(telefono) {
    return await this.makeRequest('validate-telefono', 'POST', { telefono }, false);
  }

  // Actualizar perfil de usuario
  async updateProfile(profileData, userId = null) {
    // Obtener user_id del AsyncStorage si no se proporciona
    if (!userId) {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.idUsuarios;
        }
      } catch (error) {
        console.error('Error getting user ID from storage:', error);
      }
    }
    
    if (!userId) {
      throw new Error('ID de usuario requerido para actualizar perfil');
    }
    
    return await this.makeRequest(`usuarios/update-profile?user_id=${userId}`, 'PUT', profileData);
  }

  // Cerrar sesión
  async logout() {
    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  // ==================== EQUIPOS ====================

  // Crear nuevo equipo
  async createEquipment(equipmentData, userId = null, userRole = null) {
    // Obtener user_id y user_role del AsyncStorage si no se proporcionan
    if (!userId || !userRole) {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          userId = user.idUsuarios;
          userRole = user.Roles_Usuarios;
        }
      } catch (error) {
        console.error('Error getting user data from storage:', error);
      }
    }
    
    if (!userId || !userRole) {
      throw new Error('ID de usuario y rol requeridos para crear equipo');
    }
    
    return await this.makeRequest(`donations?user_id=${userId}&user_role=${userRole}`, 'POST', equipmentData);
  }

  // Obtener todas las publicaciones para la tienda de canjes
  async getAllEquipment() {
    return await this.makeRequest('publications', 'GET');
  }

  // Obtener equipos del usuario
  async getUserEquipment() {
    return await this.makeRequest('donations', 'GET');
  }

  // Obtener equipos del usuario desde la tabla equipos
  async getUserEquipos(userId) {
    return await this.makeRequest(`user-equipos?user_id=${userId}`, 'GET');
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

  // ==================== PUNTOS ====================

  // Obtener puntos del usuario
  async getUserPoints(userId) {
    return await this.makeRequest(`user/points?user_id=${userId}`, 'GET');
  }

  // Obtener estadísticas del usuario
  async getUserStatistics(userId) {
    return await this.makeRequest(`user/statistics?user_id=${userId}`, 'GET');
  }

  // Obtener historial de puntos del usuario
  async getUserPointsHistory(userId) {
    return await this.makeRequest(`user/points/history?user_id=${userId}`, 'GET');
  }

  // ==================== IMÁGENES ====================

  // Subir imágenes de equipos
  async uploadEquipmentImages(images) {
    try {
      const formData = new FormData();
      
      // Agregar cada imagen al FormData
      images.forEach((imageUri, index) => {
        formData.append('images[]', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `equipment_${index}.jpg`
        });
      });

      const response = await fetch(`${this.baseURL}/images/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  }

  // Obtener URL de imagen
  getImageUrl(filename) {
    return `${this.baseURL.replace('/api', '')}/images/${filename}`;
  }

  // Eliminar imagen
  async deleteImage(filename) {
    return await this.makeRequest(`images/${filename}`, 'DELETE');
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