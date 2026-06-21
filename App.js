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
    setSelectedComponent(componentKey);
    setEditBrand(compData.brand);
    setEditModel(compData.model);
    setEditWeight(compData.weight);
    setEditPrice(compData.price);
    setIsModalVisible(true);
  };

  const handleSaveComponent = () => {
    const updatedBikes = bikes.map(b => {
      if (b.id === selectedBike.id) {
        const updatedComponents = { ...b.components };
        updatedComponents[selectedComponent] = {
          brand: editBrand,
          model: editModel,
          weight: editWeight,
          price: editPrice
        };
        setSelectedBike({ ...b, components: updatedComponents });
        return { ...b, components: updatedComponents };
      }
      return b;
    });

    setBikes(updatedBikes);
    saveBikesToStorage(updatedBikes);
    setIsModalVisible(false);
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
              <Image source={bike.image} style={styles.bikeCardImage} resizeMode="cover" />
              <View style={styles.bikeCardOverlay}>
                <Text style={styles.bikeCardName}>{bike.name}</Text>
                <Text style={styles.bikeCardSub}>
                  Компонентов: {Object.keys(bike.components).length}
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
            <Image source={selectedBike.image} style={styles.bikeCanvasImage} resizeMode="contain" />
            
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
              style={[styles.dot, selectedBike.type === 'hardtail' ? { top: '35%', left: '38%' } : { top: '32%', left: '36%' }]} 
              onPress={() => handleComponentPress('brakes')}
            >
              <Text style={styles.dotText}>B</Text>
            </TouchableOpacity>

            {/* Точка: Колеса */}
            <TouchableOpacity 
              style={[styles.dot, { bottom: '25%', left: '15%' }]} 
              onPress={() => handleComponentPress('wheels')}
            >
              <Text style={styles.dotText}>W</Text>
            </TouchableOpacity>

            {/* Точка: Трансмиссия */}
            <TouchableOpacity 
              style={[styles.dot, { bottom: '28%', right: '28%' }]} 
              onPress={() => handleComponentPress('drivetrain')}
            >
              <Text style={styles.dotText}>D</Text>
            </TouchableOpacity>
          </View>

          {/* Список деталей */}
          <ScrollView style={styles.specsList}>
            <Text style={styles.specsTitle}>Спецификация {selectedBike.name}</Text>
            {Object.keys(selectedBike.components).map((key) => {
              const item = selectedBike.components[key];
              const labels = { fork: 'Вилка', shock: 'Амортизатор', brakes: 'Тормоза', wheels: 'Колеса', drivetrain: 'Трансмиссия' };
              return (
                <TouchableOpacity 
                  key={key} 
                  style={styles.specItem}
                  onPress={() => handleComponentPress(key)}
                >
                  <Text style={styles.specKey}>{labels[key] || key}</Text>
                  <Text style={styles.specValue}>
                    {item.brand ? `${item.brand} ${item.model} (${item.weight}г / ${item.price}$)` : 'Не указано'}
                  </Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}

      {/* Модальное окно редактирования */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Редактировать компонент</Text>
            
            <TextInput style={styles.input} placeholder="Бренд (напр. Shimano)" value={editBrand} onChangeText={setEditBrand} />
            <TextInput style={styles.input} placeholder="Модель (напр. XT M8100)" value={editModel} onChangeText={setEditModel} />
            <TextInput style={styles.input} placeholder="Вес, грамм" keyboardType="numeric" value={editWeight} onChangeText={setEditWeight} />
            <TextInput style={styles.input} placeholder="Цена, $" keyboardType="numeric" value={editPrice} onChangeText={setEditPrice} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.btnText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveComponent}>
                <Text style={styles.btnText}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- СТИЛИ ИНТЕРФЕЙСА ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { 
    height: 60, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderBottomWidth: 1, 
    borderBottomColor: '#222', 
    paddingHorizontal: 10 
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: '#ff3e3e', fontSize: 28, fontWeight: 'bold' },
  content: { flex: 1, padding: 15 },
  sectionTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  bikeCard: { height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 15, backgroundColor: '#1e1e1e' },
  bikeCardImage: { width: '100%', height: '100%' },
  bikeCardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end', padding: 15 },
  bikeCardName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bikeCardSub: { color: '#aaa', fontSize: 14, marginTop: 4 },
  canvasContainer: { height: '40%', width: '100%', backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  bikeCanvasImage: { width: '95%', height: '95%' },
  dot: { 
    position: 'absolute', 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#ff3e3e', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.5
  },
  dotText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  specsList: { flex: 1, backgroundColor: '#121212', padding: 15 },
  specsTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  specItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#222' 
  },
  specKey: { color: '#888', fontSize: 16, fontWeight: '600' },
  specValue: { color: '#fff', fontSize: 15, textAlign: 'right', flex: 1, marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1e1e1e', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  input: { backgroundColor: '#2a2a2a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  btn: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  btnCancel: { backgroundColor: '#333' },
  btnSave: { backgroundColor: '#ff3e3e' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
