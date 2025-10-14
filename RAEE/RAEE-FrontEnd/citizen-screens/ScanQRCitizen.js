import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ScanQRCitizenScreen({ navigation }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  // Cargar preferencia del tema y verificar permisos
  useEffect(() => {
    loadThemePreference();
    getCameraPermissions();
  }, []);

  // Cargar preferencia de tema
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  // Solicitar permisos de cámara
  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  // Colores dinámicos del tema
  const themeColors = {
    background: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    surface: isDarkMode ? '#2C2C3E' : '#F8F9FA',
    primary: isDarkMode ? '#4CAF50' : '#2E7D32',
    text: isDarkMode ? '#FFFFFF' : '#212121',
    textSecondary: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(33, 33, 33, 0.7)',
    card: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
    header: isDarkMode ? '#1A1A2E' : '#FFFFFF',
    overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
  };

  // Función para manejar el escaneo de códigos QR
  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanResult({ 
      type, 
      data,
      timestamp: new Date().toISOString()
    });
    setShowResult(true);
    
    // Vibración opcional (si está disponible)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  // Función para procesar el código QR escaneado
  const procesarQR = async () => {
    if (!scanResult) return;

    setIsLoading(true);
    try {
      console.log('Procesando código QR:', scanResult.data);
      console.log('Tipo de código:', scanResult.type);
      console.log('Timestamp:', scanResult.timestamp);
      
      // Aquí iría la lógica real para procesar el QR
      // Por ejemplo, validar URL, hacer petición a API, etc.
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '¡Éxito!',
        `Código QR procesado correctamente:\n\n${scanResult.data}`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetScanner();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al procesar QR:', error);
      Alert.alert('Error', 'No se pudo procesar el código QR');
    } finally {
      setIsLoading(false);
    }
  };

  // Resetear el escáner
  const resetScanner = () => {
    setShowResult(false);
    setScanResult(null);
    setScanned(false);
    setIsLoading(false);
  };

  // Verificar permisos
  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.text }]}>
            Verificando permisos...
          </Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header con gradiente */}
        <LinearGradient
          colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#4CAF50', '#2E7D32']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            Escanear QR
          </Text>
          
          <View style={styles.headerSpacer} />
        </LinearGradient>

        <View style={styles.permissionContainer}>
          <View style={[styles.permissionCard, { backgroundColor: themeColors.surface }]}>
            <LinearGradient
              colors={['#4CAF50', '#2E7D32']}
              style={styles.permissionIconContainer}
            >
              <Ionicons name="camera-outline" size={60} color="#FFFFFF" />
            </LinearGradient>
            
            <Text style={[styles.permissionTitle, { color: themeColors.text }]}>
              Permiso de Cámara Requerido
            </Text>
            <Text style={[styles.permissionText, { color: themeColors.textSecondary }]}>
              Necesitamos acceso a tu cámara para escanear códigos QR y procesar tus donaciones
            </Text>
            
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={getCameraPermissions}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.permissionButtonGradient}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.permissionButtonText}>Conceder Permiso</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={isDarkMode ? ['#1A1A2E', '#2C2C3E'] : ['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          Escanear QR
        </Text>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      {/* Contenido Principal */}
      <View style={styles.content}>
        {!showResult ? (
          /* Vista de Escaneo con Cámara Real */
          <View style={styles.scanContainer}>
            {/* Instrucciones */}
            <View style={[styles.instructionsCard, { backgroundColor: themeColors.surface }]}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.instructionsIconContainer}
              >
                <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.instructionsTextContainer}>
                <Text style={[styles.instructionsTitle, { color: themeColors.text }]}>
                  Escanea tu código QR
                </Text>
                <Text style={[styles.instructionsText, { color: themeColors.textSecondary }]}>
                  Coloca el código QR dentro del marco para procesarlo
                </Text>
              </View>
            </View>

            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              
              {/* Overlay con marco de escaneo - posicionado absolutamente */}
              <View style={styles.overlay}>
                <View style={styles.scanArea}>
                  <View style={styles.scanFrame}>
                    <View style={[styles.corner, styles.topLeft, { borderColor: '#4CAF50' }]} />
                    <View style={[styles.corner, styles.topRight, { borderColor: '#4CAF50' }]} />
                    <View style={[styles.corner, styles.bottomLeft, { borderColor: '#4CAF50' }]} />
                    <View style={[styles.corner, styles.bottomRight, { borderColor: '#4CAF50' }]} />
                  </View>
                  <View style={styles.scanTextContainer}>
                    <Text style={styles.scanText}>
                      Coloca el código QR dentro del marco
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Resultado del Escaneo */
          <View style={styles.resultContainer}>
            <View style={[styles.resultCard, { backgroundColor: themeColors.surface }]}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.resultIconContainer}
              >
                <Ionicons name="checkmark-circle" size={60} color="#FFFFFF" />
              </LinearGradient>
              
              <Text style={[styles.resultTitle, { color: themeColors.text }]}>
                ¡Código QR Escaneado!
              </Text>
              
              <View style={[styles.resultDataContainer, { backgroundColor: themeColors.card }]}>
                <View style={styles.resultDataRow}>
                  <Text style={[styles.resultDataLabel, { color: themeColors.textSecondary }]}>
                    Tipo de código:
                  </Text>
                  <Text style={[styles.resultDataValue, { color: themeColors.text }]}>
                    {scanResult?.type}
                  </Text>
                </View>
                
                <View style={styles.resultDataRow}>
                  <Text style={[styles.resultDataLabel, { color: themeColors.textSecondary }]}>
                    Contenido:
                  </Text>
                  <Text style={[styles.resultDataValue, { color: themeColors.text }]}>
                    {scanResult?.data}
                  </Text>
                </View>
                
                <View style={styles.resultDataRow}>
                  <Text style={[styles.resultDataLabel, { color: themeColors.textSecondary }]}>
                    Escaneado:
                  </Text>
                  <Text style={[styles.resultDataValue, { color: themeColors.text }]}>
                    {new Date(scanResult?.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
              
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={[styles.loadingText, { color: themeColors.text }]}>
                    Procesando...
                  </Text>
                </View>
              )}

              {/* Botones de acción */}
              <View style={styles.resultButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={resetScanner}
                >
                  <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Escanear Otro</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={procesarQR}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#CCCCCC', '#999999'] : ['#4CAF50', '#2E7D32']}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>
                      {isLoading ? 'Procesando...' : 'Procesar'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  permissionIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  permissionButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    padding: 10,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scanContainer: {
    flex: 1,
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructionsTextContainer: {
    flex: 1,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 5,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 10,
  },
  scanTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  resultDataContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
  },
  resultDataRow: {
    marginBottom: 15,
  },
  resultDataLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  resultDataValue: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});