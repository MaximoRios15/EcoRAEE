import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';
import * as ImagePicker from 'expo-image-picker';

// Los puntos base y multiplicadores ahora se obtienen de la base de datos

// Función para calcular puntos por peso (bonus por peso) - Movido fuera del componente
const calcularPuntosPorPeso = (peso) => {
  const pesoNum = parseFloat(peso) || 0;
  
  // Bonus progresivo por peso:
  // 0-1kg: +0 puntos
  // 1-5kg: +10 puntos
  // 5-10kg: +25 puntos
  // 10-20kg: +50 puntos
  // 20kg+: +75 puntos
  
  if (pesoNum <= 1) return 0;
  if (pesoNum <= 5) return 10;
  if (pesoNum <= 10) return 25;
  if (pesoNum <= 20) return 50;
  return 75;
};

export default function DonationScreen({ navigation }) {
  const { user, refreshProfile, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    idCategorias_Equipos: '',
    Marca_Equipos: '',
    Modelo_Equipos: '',
    Descripcion_Equipos: '',
    idEstados_Equipos: '',
    Cantidad_Equipos: '1',
    PesoKG_Equipos: '',
    DimencionesCM_Equipos: '',
    Accesorios_Equipos: '',
    ubicacion: '',
    Fotos_Equipos: [],
    // Campos para publicación
    puntos: '',
    descripcion_publicacion: '',
  });

  // Las ubicaciones ahora se cargan desde la base de datos



  // Cargar categorías, estados y ubicaciones al montar el componente
  useEffect(() => {
    loadCategoriesStatesAndLocations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', onPress: signOut, style: 'destructive' }
      ]
    );
  };

  const loadCategoriesStatesAndLocations = async () => {
    try {
      setLoadingData(true);
      
      // Cargar categorías, estados y ubicaciones en paralelo
      const [categoriesResponse, statesResponse, locationsResponse] = await Promise.all([
        ApiService.getCategories(),
        ApiService.getStates(),
        ApiService.getCollectionLocations()
      ]);

      if (categoriesResponse && categoriesResponse.success && categoriesResponse.data) {
        // Agregar opción por defecto
        const categoriesWithDefault = [
          { label: 'Seleccionar categoría', value: '', idCategorias: '', Nombres_Categorias: 'Seleccionar categoría', PuntosBase_Categorias: 0 }
        ];
        
        if (Array.isArray(categoriesResponse.data)) {
          categoriesResponse.data.forEach(category => {
            if (category && category.idCategorias && category.Nombres_Categorias) {
              categoriesWithDefault.push({
                label: category.Nombres_Categorias,
                value: category.idCategorias,
                idCategorias: category.idCategorias,
                Nombres_Categorias: category.Nombres_Categorias,
                PuntosBase_Categorias: category.PuntosBase_Categorias
              });
            }
          });
        }
        
        setCategories(categoriesWithDefault);
      }

      if (statesResponse && statesResponse.success && statesResponse.data) {
        // Agregar opción por defecto
        const statesWithDefault = [
          { label: 'Seleccionar estado', value: '', idEstados: '', Nombres_Estados: 'Seleccionar estado', MultiplicadorPuntos_Estados: 0 }
        ];
        
        if (Array.isArray(statesResponse.data)) {
          statesResponse.data.forEach(state => {
            if (state && state.idEstados && state.Nombres_Estados) {
              statesWithDefault.push({
                label: state.Nombres_Estados,
                value: state.idEstados,
                idEstados: state.idEstados,
                Nombres_Estados: state.Nombres_Estados,
                MultiplicadorPuntos_Estados: state.MultiplicadorPuntos_Estados
              });
            }
          });
        }
        
        setStates(statesWithDefault);
      }

      if (locationsResponse && locationsResponse.success && locationsResponse.data) {
        // Agregar opción por defecto
        const locationsWithDefault = [
          { label: 'Seleccionar ubicación', value: '', idUbicaciones: '', Direccion_Ubicaciones: 'Seleccionar ubicación', Municipios_Ubicaciones: '' }
        ];
        
        if (Array.isArray(locationsResponse.data)) {
          locationsResponse.data.forEach(location => {
            if (location && location.idUbicaciones && location.Direccion_Ubicaciones && location.Municipios_Ubicaciones) {
              const displayText = `${location.Direccion_Ubicaciones}, ${location.Municipios_Ubicaciones}`;
              locationsWithDefault.push({
                label: displayText,
                value: location.idUbicaciones,
                idUbicaciones: location.idUbicaciones,
                Direccion_Ubicaciones: location.Direccion_Ubicaciones,
                Municipios_Ubicaciones: location.Municipios_Ubicaciones,
                Provincia_Ubicaciones: location.Provincia_Ubicaciones,
                Latitud_Ubicaciones: location.Latitud_Ubicaciones,
                Longitud_Ubicaciones: location.Longitud_Ubicaciones
              });
            }
          });
        }
        
        setLocations(locationsWithDefault);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías, estados y ubicaciones. Intenta nuevamente.');
      
      // Establecer valores por defecto en caso de error
      setCategories([{ label: 'Seleccionar categoría', value: '', idCategorias: '', Nombres_Categorias: 'Seleccionar categoría', PuntosBase_Categorias: 0 }]);
      setStates([{ label: 'Seleccionar estado', value: '', idEstados: '', Nombres_Estados: 'Seleccionar estado', MultiplicadorPuntos_Estados: 0 }]);
      setLocations([{ label: 'Seleccionar ubicación', value: '', idUbicaciones: '', Direccion_Ubicaciones: 'Seleccionar ubicación', Municipios_Ubicaciones: '' }]);
    } finally {
      setLoadingData(false);
    }
  };

  // Memoizar el desglose de puntos para evitar re-cálculos innecesarios
  const desglosePuntos = useMemo(() => {
    if (!formData.idCategorias_Equipos || !formData.idEstados_Equipos || !formData.PesoKG_Equipos) {
      return null;
    }

    // Verificar que los arrays no estén vacíos
    if (!categories || categories.length === 0 || !states || states.length === 0) {
      return null;
    }

    const categoriaSeleccionada = categories.find(cat => cat.value == formData.idCategorias_Equipos);
    const estadoSeleccionado = states.find(state => state.value == formData.idEstados_Equipos);
    
    if (!categoriaSeleccionada || !estadoSeleccionado) return null;

    // Obtener puntos base desde la base de datos
    const puntosBase = parseInt(categoriaSeleccionada.PuntosBase_Categorias) || 50;
    // Obtener multiplicador desde la base de datos
    const multiplicador = parseFloat(estadoSeleccionado.MultiplicadorPuntos_Estados) || 0.3;
    const puntosConEstado = Math.round(puntosBase * multiplicador);
    const bonusPeso = calcularPuntosPorPeso(formData.PesoKG_Equipos);
    const cantidad = parseInt(formData.Cantidad_Equipos) || 1;
    const puntosPorUnidad = puntosConEstado + bonusPeso;
    const puntosFinales = puntosPorUnidad * cantidad;

    return {
      categoria: categoriaSeleccionada.Nombres_Categorias,
      estado: estadoSeleccionado.Nombres_Estados,
      peso: formData.PesoKG_Equipos,
      cantidad,
      puntosBase,
      multiplicador,
      puntosConEstado,
      bonusPeso,
      puntosPorUnidad,
      puntosFinales
    };
  }, [
    formData.idCategorias_Equipos,
    formData.idEstados_Equipos,
    formData.PesoKG_Equipos,
    formData.Cantidad_Equipos,
    categories,
    states
  ]);

  // Calcular puntos que generará la donación
  const calcularPuntos = () => {
    return desglosePuntos ? desglosePuntos.puntosFinales : 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para seleccionar imagen desde galería
  const seleccionarImagen = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesita permiso para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 3,
      });

      if (!result.canceled && result.assets) {
        const nuevasFotos = result.assets.map(asset => asset.uri);
        setFormData(prev => ({
          ...prev,
          Fotos_Equipos: [...prev.Fotos_Equipos, ...nuevasFotos].slice(0, 3) // Máximo 3 fotos
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Función para tomar foto con cámara
  const tomarFoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesita permiso para acceder a la cámara');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const nuevaFoto = result.assets[0].uri;
        setFormData(prev => ({
          ...prev,
          Fotos_Equipos: [...prev.Fotos_Equipos, nuevaFoto].slice(0, 3) // Máximo 3 fotos
        }));
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  // Función para eliminar foto
  const eliminarFoto = (index) => {
    setFormData(prev => ({
      ...prev,
      Fotos_Equipos: prev.Fotos_Equipos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.idCategorias_Equipos) {
      Alert.alert('Error', 'Por favor selecciona el tipo de RAEE');
      return false;
    }
    if (!formData.Marca_Equipos.trim()) {
      Alert.alert('Error', 'Por favor ingresa la marca');
      return false;
    }
    if (!formData.idEstados_Equipos) {
      Alert.alert('Error', 'Por favor selecciona el estado del RAEE');
      return false;
    }
    if (!formData.PesoKG_Equipos.trim()) {
      Alert.alert('Error', 'Por favor ingresa el peso del equipo');
      return false;
    }
    if (formData.Fotos_Equipos.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos una foto del dispositivo');
      return false;
    }
    if (!formData.ubicacion) {
      Alert.alert('Error', 'Por favor selecciona un punto de recolección');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Subir imágenes primero
      let uploadedImages = [];
      if (formData.Fotos_Equipos.length > 0) {
        try {
          const uploadResponse = await ApiService.uploadEquipmentImages(formData.Fotos_Equipos);
          if (uploadResponse.success) {
            uploadedImages = uploadResponse.data;
          } else {
            throw new Error('Error al subir imágenes');
          }
        } catch (uploadError) {
          console.error('[FOTOS] Error al subir imágenes:', uploadError);
          Alert.alert('Error', 'No se pudieron subir las imágenes. Intenta nuevamente.');
          setIsLoading(false);
          return;
        }
      }

      // Preparar datos para el backend (usar nuevos nombres de campos)
      const equipmentData = {
        idCategorias_Equipos: formData.idCategorias_Equipos,
        Marca_Equipos: formData.Marca_Equipos,
        Modelo_Equipos: formData.Modelo_Equipos,
        idEstados_Equipos: formData.idEstados_Equipos,
        Descripcion_Equipos: formData.Descripcion_Equipos,
        Cantidad_Equipos: formData.Cantidad_Equipos,
        PesoKG_Equipos: formData.PesoKG_Equipos,
        DimencionesCM_Equipos: formData.DimencionesCM_Equipos,
        Accesorios_Equipos: formData.Accesorios_Equipos,
        ubicacion: formData.ubicacion,
        ubicacionTipo: 'municipal',
        Fotos_Equipos: uploadedImages, // Usar las imágenes subidas
        // Campos para publicación
        puntos: calcularPuntos(),
        descripcion_publicacion: formData.descripcion_publicacion || formData.Descripcion_Equipos,
      };

      
      const response = await ApiService.createEquipment(equipmentData);
      
      if (response.success) {
        // Actualizar el perfil del usuario para reflejar los nuevos puntos
        try {
          await refreshProfile();
        } catch (error) {
          console.error('Error al actualizar perfil:', error);
        }

        Alert.alert(
          'Éxito',
          'Tu donación de RAEE ha sido registrada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  idCategorias_Equipos: '',
                  Marca_Equipos: '',
                  Modelo_Equipos: '',
                  Descripcion_Equipos: '',
                  idEstados_Equipos: '',
                  Cantidad_Equipos: '1',
                  PesoKG_Equipos: '',
                  DimencionesCM_Equipos: '',
                  Accesorios_Equipos: '',
                  ubicacion: '',
                  Fotos_Equipos: [],
                  puntos: '',
                  descripcion_publicacion: '',
                });
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo registrar la donación');
      }
    } catch (error) {
      console.error('Error al registrar donación:', error);
      Alert.alert('Error', error.message || 'No se pudo registrar la donación. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar indicador de carga mientras se cargan los datos
  if (loadingData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Cargando categorías, estados y ubicaciones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón volver y botón de cerrar sesión */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de Información */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Donar RAEE</Text>
          <Text style={styles.userName}>Registra tu residuo electrónico para donación</Text>
          
          {/* Información educativa */}
          <View style={styles.educationalInfo}>
            <Text style={styles.educationalTitle}>🌱 ¿Sabías que...?</Text>
            <Text style={styles.educationalText}>
              Al donar tus aparatos Eléctricos y Electrónicos, contribuyes a la economía circular 
              y reduces el impacto ambiental. ¡Recibirás puntos que podrás canjear por 
              productos o servicios técnicos!
            </Text>
          </View>

        </View>

        <View style={styles.form}>
          {/* Tipo de RAEE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de RAEE *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.idCategorias_Equipos}
                onValueChange={(value) => handleInputChange('idCategorias_Equipos', value)}
                style={styles.picker}
              >
                {categories.map((category) => (
                  <Picker.Item
                    key={category.value}
                    label={category.label}
                    value={category.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Marca */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marca *</Text>
            <TextInput
              style={styles.input}
              value={formData.Marca_Equipos}
              onChangeText={(value) => handleInputChange('Marca_Equipos', value)}
              placeholder="Ej: Samsung, Apple, HP..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Modelo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              style={styles.input}
              value={formData.Modelo_Equipos}
              onChangeText={(value) => handleInputChange('Modelo_Equipos', value)}
              placeholder="Ej: Galaxy S21, iPhone 12..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.idEstados_Equipos}
                onValueChange={(value) => handleInputChange('idEstados_Equipos', value)}
                style={styles.picker}
              >
                {states.map((state) => (
                  <Picker.Item
                    key={state.value}
                    label={state.label}
                    value={state.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Cantidad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cantidad</Text>
            <TextInput
              style={styles.input}
              value={formData.Cantidad_Equipos}
              onChangeText={(value) => handleInputChange('Cantidad_Equipos', value)}
              placeholder="1"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.Descripcion_Equipos}
              onChangeText={(value) => handleInputChange('Descripcion_Equipos', value)}
              placeholder="Describe el estado, accesorios incluidos, etc..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Fotos del dispositivo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fotos del dispositivo</Text>
            <Text style={styles.photoSubtext}>Máximo 3 fotos (requerido)</Text>
            
            {/* Botones para agregar fotos */}
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={tomarFoto}>
                <Text style={styles.photoButtonText}>📷 Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoButton} onPress={seleccionarImagen}>
                <Text style={styles.photoButtonText}>🖼️ Seleccionar Galería</Text>
              </TouchableOpacity>
            </View>

            {/* Mostrar fotos seleccionadas */}
            {formData.Fotos_Equipos.length > 0 && (
              <View style={styles.photosContainer}>
                {formData.Fotos_Equipos.map((foto, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: foto }} style={styles.photoPreview} />
                    <TouchableOpacity 
                      style={styles.deletePhotoButton}
                      onPress={() => eliminarFoto(index)}
                    >
                      <Text style={styles.deletePhotoText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Peso */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peso (kg) *</Text>
            <TextInput
              style={styles.input}
              value={formData.PesoKG_Equipos}
              onChangeText={(value) => handleInputChange('PesoKG_Equipos', value)}
              placeholder="Ej: 1.5"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Dimensiones */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dimensiones (cm)</Text>
            <TextInput
              style={styles.input}
              value={formData.DimencionesCM_Equipos}
              onChangeText={(value) => handleInputChange('DimencionesCM_Equipos', value)}
              placeholder="Ej: 30x20x5"
              placeholderTextColor="#999"
            />
          </View>

          {/* Accesorios incluidos */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Accesorios incluidos</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.Accesorios_Equipos}
              onChangeText={(value) => handleInputChange('Accesorios_Equipos', value)}
              placeholder="Ej: Cargador, cable USB, manual, caja..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Ubicación */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Punto de recolección *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.ubicacion}
                onValueChange={(value) => handleInputChange('ubicacion', value)}
                style={styles.picker}
              >
                {locations.map((location) => (
                  <Picker.Item
                    key={location.value}
                    label={location.label}
                    value={location.value}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.helpText}>
              Selecciona el punto de recolección municipal más cercano a tu ubicación
            </Text>
          </View>

          {/* Mostrar puntos que generará la donación */}
          {desglosePuntos && (
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsTitle}>
                🎯 Puntos que obtendrás por esta donación
              </Text>
              
              <View style={styles.pointsBreakdown}>
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Puntos base ({desglosePuntos.categoria}):</Text>
                  <Text style={styles.pointsValue}>+{desglosePuntos.puntosBase} pts</Text>
                </View>
                
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Estado ({desglosePuntos.estado}):</Text>
                  <Text style={styles.pointsValue}>
                    {desglosePuntos.multiplicador < 1 ? '-' : '+'}
                    {Math.round((1 - desglosePuntos.multiplicador) * 100)}% 
                    ({desglosePuntos.puntosBase - desglosePuntos.puntosConEstado} pts)
                  </Text>
                </View>
                
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Después del estado:</Text>
                  <Text style={styles.pointsValue}>{desglosePuntos.puntosConEstado} pts</Text>
                </View>
                
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Bonus por peso ({desglosePuntos.peso}kg):</Text>
                  <Text style={styles.pointsValue}>+{desglosePuntos.bonusPeso} pts</Text>
                </View>
                
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Por unidad:</Text>
                  <Text style={styles.pointsValue}>{desglosePuntos.puntosPorUnidad} pts</Text>
                </View>
                
                <View style={styles.pointsRow}>
                  <Text style={styles.pointsLabel}>Cantidad:</Text>
                  <Text style={styles.pointsValue}>x{desglosePuntos.cantidad}</Text>
                </View>
                
                <View style={[styles.pointsRow, styles.pointsTotal]}>
                  <Text style={styles.pointsTotalLabel}>TOTAL:</Text>
                  <Text style={styles.pointsTotalValue}>{desglosePuntos.puntosFinales} puntos</Text>
                </View>
              </View>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                navigation.goBack();
              }}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Registrar Donación</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20, // Espacio adicional en la parte inferior del scroll
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 15,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  picker: {
    height: 50,
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 40, // Aumentado para evitar la barra de navegación
    paddingHorizontal: 10,
    paddingBottom: 20, // Padding adicional en la parte inferior
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  submitButton: {
    flex: 0.45,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Nuevos estilos para funcionalidades agregadas
  educationalInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  educationalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  educationalText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  pointsContainer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pointsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
    marginBottom: 15,
  },
  pointsBreakdown: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
  },
  pointsValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },
  pointsTotal: {
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
    marginTop: 8,
    paddingTop: 8,
  },
  pointsTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  pointsTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  photoSubtext: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    position: 'relative',
    marginBottom: 10,
    width: '30%',
  },
  photoPreview: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
});