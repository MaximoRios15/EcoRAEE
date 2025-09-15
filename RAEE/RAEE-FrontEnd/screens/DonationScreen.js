import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

export default function DonationScreen({ navigation }) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    tipo_raee: '',
    marca: '',
    modelo: '',
    descripcion: '',
    estado: '',
    cantidad: '1',
  });

  const tiposRAEE = [
    { label: 'Seleccionar tipo de RAEE', value: '' },
    { label: 'Teléfono móvil', value: 'telefono_movil' },
    { label: 'Computadora', value: 'computadora' },
    { label: 'Laptop', value: 'laptop' },
    { label: 'Tablet', value: 'tablet' },
    { label: 'Televisor', value: 'televisor' },
    { label: 'Monitor', value: 'monitor' },
    { label: 'Impresora', value: 'impresora' },
    { label: 'Electrodoméstico pequeño', value: 'electrodomestico_pequeno' },
    { label: 'Electrodoméstico grande', value: 'electrodomestico_grande' },
    { label: 'Otro', value: 'otro' },
  ];

  const estadosRAEE = [
    { label: 'Seleccionar estado', value: '' },
    { label: 'Funcional', value: 'funcional' },
    { label: 'Parcialmente funcional', value: 'parcialmente_funcional' },
    { label: 'No funcional', value: 'no_funcional' },
    { label: 'Para repuestos', value: 'para_repuestos' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.tipo_raee) {
      Alert.alert('Error', 'Por favor selecciona el tipo de RAEE');
      return false;
    }
    if (!formData.marca.trim()) {
      Alert.alert('Error', 'Por favor ingresa la marca');
      return false;
    }
    if (!formData.estado) {
      Alert.alert('Error', 'Por favor selecciona el estado del RAEE');
      return false;
    }
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'Por favor ingresa una descripción');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Preparar datos para el backend (mapear nombres de campos)
      const donationData = {
        tipoDispositivo: formData.tipo_raee,
        marca: formData.marca,
        modelo: formData.modelo,
        estadoDispositivo: formData.estado,
        descripcionAdicional: formData.descripcion,
        // Campos adicionales que el backend puede usar
        informacionDispositivo: `Cantidad: ${formData.cantidad}`,
      };

      console.log('Enviando datos de donación:', donationData);
      
      const response = await ApiService.createDonation(donationData);
      
      if (response.success) {
        Alert.alert(
          'Éxito',
          'Tu donación de RAEE ha sido registrada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  tipo_raee: '',
                  marca: '',
                  modelo: '',
                  descripcion: '',
                  estado: '',
                  cantidad: '1',
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Donar RAEE</Text>
          <Text style={styles.subtitle}>
            Registra tu residuo electrónico para donación
          </Text>
        </View>

        <View style={styles.form}>
          {/* Tipo de RAEE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de RAEE *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.tipo_raee}
                onValueChange={(value) => handleInputChange('tipo_raee', value)}
                style={styles.picker}
              >
                {tiposRAEE.map((tipo) => (
                  <Picker.Item
                    key={tipo.value}
                    label={tipo.label}
                    value={tipo.value}
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
              value={formData.marca}
              onChangeText={(value) => handleInputChange('marca', value)}
              placeholder="Ej: Samsung, Apple, HP..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Modelo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              style={styles.input}
              value={formData.modelo}
              onChangeText={(value) => handleInputChange('modelo', value)}
              placeholder="Ej: Galaxy S21, iPhone 12..."
              placeholderTextColor="#999"
            />
          </View>

          {/* Estado */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estado *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
                style={styles.picker}
              >
                {estadosRAEE.map((estado) => (
                  <Picker.Item
                    key={estado.value}
                    label={estado.label}
                    value={estado.value}
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
              value={formData.cantidad}
              onChangeText={(value) => handleInputChange('cantidad', value)}
              placeholder="1"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.descripcion}
              onChangeText={(value) => handleInputChange('descripcion', value)}
              placeholder="Describe el estado, accesorios incluidos, etc..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d5016',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});