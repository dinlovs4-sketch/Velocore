import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  TextInput, 
  Modal,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@velocore_bikes_data_v3';

// Карта ассетов с новыми упрощенными именами файлов
const BIKE_IMAGES = {
  hardtail: require('./assets/hardtail.png'),
  enduro: require('./assets/podves.png'),
};

export default function App() {
  // --- СОСТОЯНИЯ (STATE) ---
  const [screen, setScreen] = useState('home'); 
  const [selectedBikeId, setSelectedBikeId] = useState(null); 
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [bikes, setBikes] = useState([
    {
      id: '1',
      name: 'Hardtail Trail',
      type: 'hardtail',
      components: {
        fork: { brand: 'RockShox', model: 'Lyrik', weight: '2000', price: '750' },
        brakes: { brand: 'Shimano', model: 'XT M8120', weight: '610', price: '320' },
        wheels: { brand: 'DT Swiss', model: 'M1900', weight: '1950', price: '450' },
        drivetrain: { brand: 'SRAM', model: 'GX Eagle', weight: '1750', price: '500' },
      }
    },
    {
      id: '2',
      name: 'Enduro Full-Suspension',
      type: 'enduro',
      components: {
        fork: { brand: 'Fox', model: '38 Factory', weight: '2400', price: '1200' },
        shock: { brand: 'Fox', model: 'Float X2', weight: '650', price: '680' },
        brakes: { brand: 'Magura', model: 'MT7', weight: '570', price: '380' },
        wheels: { brand: 'Hope', model: 'Fortus 30', weight: '2200', price: '550' },
        drivetrain: { brand: 'Shimano', model: 'XT M8100', weight: '1800', price: '600' },
      }
    }
  ]);

  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const selectedBike = bikes.find(b => b.id === selectedBikeId);

  // --- ЛОГИКА ПАМЯТИ УСТРОЙСТВА ---
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData !== null) {
          setBikes(JSON.parse(savedData));
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить данные из памяти устройства.');
      }
    };
    loadSavedData();
  }, []);

  const saveBikesToStorage = async (updatedBikes) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBikes));
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить изменения в память.');
    }
  };

  // --- ОБРАБОТЧИКИ НАЖАТИЙ ---
  const handleBackPress = () => {
    if (screen === 'bike-details') {
      setScreen('home');
      setSelectedBikeId(null);
    }
  };

  const handleBikeSelect = (bike) => {
    setSelectedBikeId(bike.id);
    setScreen('bike-details');
  };

  const handleComponentPress = (componentKey) => {
    if (!selectedBike) return;
    const compData = selectedBike.components?.[componentKey] || { brand: '', model: '', weight: '', price: '' };
    
    setSelectedComponent(componentKey);
    setEditBrand(compData.brand || '');
    setEditModel(compData.model || '');
    setEditWeight(compData.weight ? String(compData.weight) : '');
    setEditPrice(compData.price ? String(compData.price) : '');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditBrand('');
    setEditModel('');
    setEditWeight('');
    setEditPrice('');
    setSelectedComponent(null);
  };

  const handleSaveComponent = () => {
    if (!editBrand.trim() && !editModel.trim()) {
      Alert.alert('Внимание', 'Заполните хотя бы бренд или модель компонента.');
      return;
    }

    const cleanWeight = editWeight.replace(/[^0-9]/g, '') || '0';
    const cleanPrice = editPrice.replace(/[^0-9]/g, '') || '0';

    const updatedBikes = bikes.map(b => {
      if (b.id === selectedBikeId) {
        const updatedComponents = { ...b.components };
        updatedComponents[selectedComponent] = {
          brand: editBrand.trim(),
          model: editModel.trim(),
          weight: cleanWeight,
          price: cleanPrice
        };
        return { ...b, components: updatedComponents };
      }
      return b;
    });

    setBikes(updatedBikes);
    saveBikesToStorage(updatedBikes);
    closeModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка приложения */}
      <View style={styles.header}>
        {screen !== 'home' ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={styles.headerTitle}>Velocore</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Экран 1: Главное меню выбора велосипеда */}
      {screen === 'home' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Мой гараж</Text>
          {bikes.map((bike) => (
            <TouchableOpacity 
              key={bike.id} 
              style={styles.bikeCard} 
              onPress={() => handleBikeSelect(bike)}
            >
              <Image 
                source={BIKE_IMAGES[bike.type]} 
                style={styles.bikeCardImage} 
                resizeMode="cover" 
              />
              <View style={styles.bikeCardOverlay}>
                <Text style={styles.bikeCardName}>{bike.name}</Text>
                <Text style={styles.bikeCardSub}>
                  Компонентов: {bike.components ? Object.keys(bike.components).length : 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Экран 2: Схема и спецификация */}
      {screen === 'bike-details' && selectedBike && (
        <View style={{ flex: 1 }}>
          <View style={styles.canvasContainer}>
            <Image 
              source={BIKE_IMAGES[selectedBike.type]} 
              style={styles.bikeCanvasImage} 
              resizeMode="contain" 
            />
            
            {/* Точка: Вилка */}
            <TouchableOpacity 
              style={[styles.dot, selectedBike.type === 'hardtail' ? { top: '48%', left: '22%' } : { top: '46%', left: '20%' }]} 
              onPress={() => handleComponentPress('fork')}
            >
              <Text style={styles.dotText}>F</Text>
            </TouchableOpacity>

            {/* Точка: Задний амортизатор */}
            {selectedBike.type === 'enduro' && (
              <TouchableOpacity 
                style={[styles.dot, { top: '45%', left: '50%' }]} 
                onPress={() => handleComponentPress('shock')}
              >
                <Text style={styles.dotText}>S</Text>
              </TouchableOpacity>
            )}

            {/* Точка: Тормоза */}
            <TouchableOpacity 
              style={
