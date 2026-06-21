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
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@velocore_bikes_data';

export default function App() {
  // --- СОСТОЯНИЯ (STATE) ---
  const [screen, setScreen] = useState('home'); 
  const [selectedBike, setSelectedBike] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [bikes, setBikes] = useState([
    {
      id: '1',
      name: 'Hardtail Trail',
      type: 'hardtail',
      image: require('./Gemini_Generated_Image_jw6uojjw6uojjw6u.png'),
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
      image: require('./Gemini_Generated_Image_bm9taibm9taibm9t.png'),
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
      setSelectedBike(null);
    }
  };

  const handleBikeSelect = (bike) => {
    setSelectedBike(bike);
    setScreen('bike-details');
  };

  const handleComponentPress = (componentKey) => {
    const compData = selectedBike.components[componentKey] || { brand: '', model: '', weight: '', price: '' };
    setSelectedComponent
