import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';

const { width } = Dimensions.get('window');

export default function StatisticsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalDonations: 0,
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
    currentPoints: 0,
    categoriesDonated: [],
    monthlyStats: [],
  });

  useEffect(() => {
    loadStatistics();
  }, []);


  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      // Obtener datos reales del usuario
      const userId = user?.idUsuarios;
      if (!userId) {
        Alert.alert('Error', 'Usuario no identificado');
        return;
      }

      // Obtener equipos del usuario desde la tabla equipos
      const equiposResponse = await ApiService.getUserEquipos(userId);
      
      let totalDonations = 0;
      let totalPointsEarned = 0;
      let categoriesData = {};
      let monthlyData = {};

      if (equiposResponse.success && equiposResponse.data) {
        const equipos = equiposResponse.data;
        totalDonations = equipos.length;

        // Procesar cada equipo
        equipos.forEach(equipo => {
          // Usar puntos reales desde historial_puntos (convertir a número)
          const realPoints = parseInt(equipo.Puntos_Equipos) || 0;
          totalPointsEarned += realPoints;
          

          // Crear objeto de equipo con información completa desde tabla equipos
          const equipment = {
            id: equipo.idEquipos,
            title: equipo.Descripcion_Equipos || `${equipo.Marca_Equipos} ${equipo.Modelo_Equipos}` || 'Equipo sin nombre',
            brand: equipo.Marca_Equipos || 'Sin marca',
            model: equipo.Modelo_Equipos || 'Sin modelo',
            quantity: equipo.Cantidad_Equipos || 1,
            weight: equipo.PesoKG_Equipos || 0,
            dimensions: equipo.DimencionesCM_Equipos || 'No especificado',
            accessories: equipo.Accesorios_Equipos || 'Sin accesorios',
            points: realPoints,
            FechaIngreso_Equipos: equipo.FechaIngreso_Equipos,
            categoryId: equipo.idCategorias_Equipos,
            categoryName: equipo.Nombres_Categorias || 'Sin categoría',
            estadoId: equipo.idEstados_Equipos,
            estadoName: equipo.Nombres_Estados || 'Sin estado',
            fechaMovimientoPuntos: equipo.FechaMovimiento_Puntos
          };

          // Agrupar equipos por categoría
          const categoryName = equipo.Nombres_Categorias || 'Sin categoría';
          if (!categoriesData[categoryName]) {
            categoriesData[categoryName] = [];
          }
          categoriesData[categoryName].push(equipment);

          // Agrupar por mes (formato: YYYY-MM)
          const date = new Date(equipo.FechaIngreso_Equipos);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
          
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].donations += 1;
            monthlyData[monthKey].points += realPoints;
          } else {
            monthlyData[monthKey] = {
              month: monthName,
              donations: 1,
              points: realPoints
            };
          }
        });
      }

      // Convertir objetos a arrays y ordenar
      const categoriesDonated = Object.keys(categoriesData).map(categoryName => ({
        name: categoryName,
        equipments: categoriesData[categoryName].sort((a, b) => 
          new Date(b.FechaIngreso_Equipos) - 
          new Date(a.FechaIngreso_Equipos)
        )
      })).sort((a, b) => b.equipments.length - a.equipments.length);

      const monthlyStats = Object.values(monthlyData)
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .slice(-4); // Últimos 4 meses
      

      const realStats = {
        totalDonations,
        totalPointsEarned: 0, // Fijo en 0 por el momento
        totalPointsRedeemed: 0, // Fijo en 0 por el momento
        currentPoints: user?.Puntos_Usuarios || 0,
        categoriesDonated,
        monthlyStats
      };
      
      setStatistics(realStats);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
      
      // En caso de error, mostrar datos básicos
      setStatistics({
        totalDonations: 0,
        totalPointsEarned: user?.Puntos_Usuarios || 0,
        totalPointsRedeemed: 0,
        currentPoints: user?.Puntos_Usuarios || 0,
        categoriesDonated: [],
        monthlyStats: []
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const renderStatCard = (title, value, subtitle, icon, color = '#4CAF50') => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.statCardTitle}>{title}</Text>
      </View>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statCardSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderEquipmentItem = (equipment, index) => (
    <View key={equipment.id || index} style={styles.equipmentItem}>
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentTitle}>{equipment.title}</Text>
        <Text style={styles.equipmentBrand}>{equipment.brand} {equipment.model}</Text>
        <Text style={styles.equipmentDetails}>
          {equipment.quantity} unidad(es) • {equipment.weight} kg
        </Text>
        <Text style={styles.equipmentDate}>
          {new Date(equipment.FechaIngreso_Equipos).toLocaleDateString('es-ES')}
        </Text>
      </View>
      <Text style={styles.equipmentPoints}>+{equipment.points} pts</Text>
    </View>
  );

  const renderCategorySection = (categoryName, equipments) => (
    <View key={categoryName} style={styles.categorySection}>
      <Text style={styles.categorySectionTitle}>{categoryName}</Text>
      {equipments.map(renderEquipmentItem)}
    </View>
  );

  const renderMonthlyItem = (month, index) => (
    <View key={index} style={styles.monthlyItem}>
      <Text style={styles.monthName}>{month.month}</Text>
      <View style={styles.monthlyStats}>
        <Text style={styles.monthlyDonations}>{month.donations} donaciones</Text>
        <Text style={styles.monthlyPoints}>{month.points} puntos</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadStatistics}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Título */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mis Estadísticas</Text>
          <Text style={styles.subtitle}>Tu impacto ambiental y progreso</Text>
        </View>

        {/* Resumen general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Donaciones\nTotales',
              statistics.totalDonations,
              'equipos donados',
              'gift',
              '#4CAF50'
            )}
            {renderStatCard(
              'Puntos Ganados',
              0,
              'puntos acumulados',
              'star',
              '#FF9800'
            )}
            {renderStatCard(
              'Puntos Canjeados',
              0,
              'puntos utilizados',
              'card',
              '#2196F3'
            )}
            {renderStatCard(
              'Puntos Actuales',
              statistics.currentPoints,
              'puntos disponibles',
              'wallet',
              '#9C27B0'
            )}
          </View>
        </View>


        {/* Equipos donados por categorías */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipos Donados</Text>
          <View style={styles.categoriesCard}>
            {statistics.categoriesDonated.length > 0 ? (
              statistics.categoriesDonated.map(category => 
                renderCategorySection(category.name, category.equipments)
              )
            ) : (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>No tienes equipos donados aún</Text>
              </View>
            )}
          </View>
        </View>

        {/* Estadísticas mensuales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso Mensual</Text>
          <View style={styles.monthlyCard}>
            {statistics.monthlyStats.map(renderMonthlyItem)}
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
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    width: (width - 60) / 2,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  categoriesCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categorySection: {
    marginBottom: 20,
  },
  categorySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  equipmentBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  equipmentDetails: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  equipmentDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  equipmentPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  monthlyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  monthlyStats: {
    alignItems: 'flex-end',
  },
  monthlyDonations: {
    fontSize: 14,
    color: '#666',
  },
  monthlyPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 2,
  },
});
