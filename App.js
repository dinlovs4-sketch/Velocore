import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  SafeAreaView,
  StatusBar,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Базовый список компонентов
const COMPONENT_LIST = [
  { key: 'frame', label: 'Рама', category: 'РАМА И ПОДВЕСКА' },
  { key: 'fork', label: 'Вилка', category: 'РАМА И ПОДВЕСКА' },
  { key: 'f_wheel', label: 'Переднее колесо', category: 'КОЛЁСА' },
  { key: 'r_wheel', label: 'Заднее колесо', category: 'КОЛЁСА' },
  { key: 'f_brake', label: 'Передний тормоз', category: 'ТОРМОЗА' },
  { key: 'r_brake', label: 'Задний тормоз', category: 'ТОРМОЗА' },
  { key: 'crankset', label: 'Система (шатуны)', category: 'ТРАНСМИССИЯ' },
  { key: 'cassette', label: 'Кассета', category: 'ТРАНСМИССИЯ' },
  { key: 'chain', label: 'Цепь', category: 'ТРАНСМИССИЯ' },
  { key: 'f_derailleur', label: 'Передний переключатель', category: 'ТРАНСМИССИЯ' },
  { key: 'r_derailleur', label: 'Задний переключатель', category: 'ТРАНСМИССИЯ' },
  { key: 'handlebar', label: 'Руль', category: 'УПРАВЛЕНИЕ' },
  { key: 'saddle', label: 'Седло', category: 'УПРАВЛЕНИЕ' },
  { key: 'pedals', label: 'Педали', category: 'ТРАНСМИССИЯ' },
];

// Точные координаты интерактивных точек (hotspots) из видеозаписи прототипа
const HOTSPOTS_BY_TYPE = {
  'Хардтейл': {
    saddle: { top: '21%', left: '33%' },
    handlebar: { top: '15%', left: '62%' },
    frame: { top: '42%', left: '46%' },
    fork: { top: '42%', left: '66%' },
    f_brake: { top: '58%', left: '69%' },
    f_wheel: { top: '65%', left: '83%' },
    r_brake: { top: '55%', left: '21%' },
    cassette: { top: '63%', left: '21%' },
    r_derailleur: { top: '74%', left: '23%' },
    r_wheel: { top: '65%', left: '10%' },
    f_derailleur: { top: '58%', left: '43%' },
    crankset: { top: '69%', left: '43%' },
    pedals: { top: '73%', left: '49%' },
    chain: { top: '70%', left: '33%' },
  },
  'Двухподвес': {
    saddle: { top: '21%', left: '34%' },
    handlebar: { top: '15%', left: '62%' },
    frame: { top: '38%', left: '46%' }, // Смещено чуть выше, чтобы аккуратно лечь над задним амортизатором
    fork: { top: '42%', left: '66%' },
    f_brake: { top: '58%', left: '69%' },
    f_wheel: { top: '65%', left: '83%' },
    r_brake: { top: '55%', left: '21%' },
    cassette: { top: '63%', left: '21%' },
    r_derailleur: { top: '74%', left: '23%' },
    r_wheel: { top: '65%', left: '10%' },
    f_derailleur: { top: '58%', left: '43%' },
    crankset: { top: '69%', left: '43%' },
    pedals: { top: '73%', left: '49%' },
    chain: { top: '70%', left: '33%' },
  }
};

const createEmptyComponents = () => {
  const comps = {};
  COMPONENT_LIST.forEach(c => {
    comps[c.key] = { filled: false, brand: '', model: '', year: '', weight: '', price: '', notes: '' };
  });
  return comps;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('GARAGE');
  const [bikes, setBikes] = useState([
    {
      id: '1',
      name: 'Cannondale Fat CAAD 3',
      frameType: 'Хардтейл',
      components: createEmptyComponents()
    }
  ]);

  const [selectedBikeId, setSelectedBikeId] = useState(null);
  const [newBikeFrame, setNewBikeFrame] = useState('Хардтейл');
  const [newBikeName, setNewBikeName] = useState('');

  // Стейты формы компонента
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCompKey, setActiveCompKey] = useState(null);
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const currentBike = bikes.find(b => b.id === selectedBikeId);

  const getFilledCount = (bike) => {
    return Object.values(bike.components).filter(c => c.filled).length;
  };

  const handleCreateBike = () => {
    if (!newBikeName.trim()) return;
    const newBike = {
      id: Date.now().toString(),
      name: newBikeName,
      frameType: newBikeFrame,
      components: createEmptyComponents()
    };
    setBikes([...bikes, newBike]);
    setNewBikeName('');
    setCurrentScreen('GARAGE');
  };

  const openComponentModal = (compKey) => {
    if (!currentBike) return;
    const compData = currentBike.components[compKey];
    setActiveCompKey(compKey);
    setFormBrand(compData.brand);
    setFormModel(compData.model);
    setFormYear(compData.year);
    setFormWeight(compData.weight);
    setFormPrice(compData.price);
    setFormNotes(compData.notes);
    setModalVisible(true);
  };

  const saveComponentData = () => {
    setBikes(bikes.map(b => {
      if (b.id === selectedBikeId) {
        return {
          ...b,
          components: {
            ...b.components,
            [activeCompKey]: {
              filled: true,
              brand: formBrand,
              model: formModel,
              year: formYear,
              weight: formWeight,
              price: formPrice,
              notes: formNotes
            }
          }
        };
      }
      return b;
    }));
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* ================= ЭКРАН 1: ГАРАЖ ================= */}
      {currentScreen === 'GARAGE' && (
        <View style={styles.screen}>
          <Text style={styles.subHeaderText}>— ГАРАЖ —</Text>
          <Text style={styles.headerText}>Мои велосипеды</Text>
          <Text style={styles.hintText}>Выберите велосипед или добавьте новый</Text>
          
          <ScrollView style={styles.scrollContainer}>
            {bikes.map(bike => (
              <TouchableOpacity 
                key={bike.id} 
                style={styles.bikeCard}
                onPress={() => { setSelectedBikeId(bike.id); setCurrentScreen('BIKE_DETAIL'); }}
              >
                <Ionicons name="bicycle-outline" size={32} color="#4b5563" style={styles.bikeIcon} />
                <View style={styles.bikeCardInfo}>
                  <Text style={styles.bikeCardName}>{bike.name}</Text>
                  <Text style={styles.bikeCardMeta}>{bike.frameType} • {getFilledCount(bike)}/14 компонентов</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setCurrentScreen('CHOOSE_FRAME')}>
            <Text style={styles.primaryButtonText}>+ Добавить велосипед</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= ЭКРАН 2: ВЫБОР ТИПА РАМЫ ================= */}
      {currentScreen === 'CHOOSE_FRAME' && (
        <View style={styles.screen}>
          <Text style={styles.subHeaderText}>— ГАРАЖ —</Text>
          <Text style={styles.headerText}>Выберите тип рамы</Text>
          
          <View style={styles.frameSelectionContainer}>
            <TouchableOpacity 
              style={[styles.frameCard, newBikeFrame === 'Хардтейл' && styles.frameCardActive]}
              onPress={() => { setNewBikeFrame('Хардтейл'); setCurrentScreen('ENTER_NAME'); }}
            >
              <Image 
                source={require('./Gemini_Generated_Image_jw6uojjw6uojjw6u.png')} 
                style={styles.frameMenuImage} 
              />
              <Text style={styles.frameTitle}>Хардтейл</Text>
              <Text style={styles.frameDesc}>Жесткая задняя часть, амортизационная вилка спереди</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.frameCard, newBikeFrame === 'Двухподвес' && styles.frameCardActive]}
              onPress={() => { setNewBikeFrame('Двухподвес'); setCurrentScreen('ENTER_NAME'); }}
            >
              <Image 
                source={require('./Gemini_Generated_Image_bm9taibm9taibm9t.png')} 
                style={styles.frameMenuImage} 
              />
              <Text style={styles.frameTitle}>Двухподвес</Text>
              <Text style={styles.frameDesc}>Амортизация спереди и сзади, задний маятник с амортизатором</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setCurrentScreen('GARAGE')}>
            <Text style={styles.secondaryButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= ЭКРАН 3: ВВОД НАЗВАНИЯ ================= */}
      {currentScreen === 'ENTER_NAME' && (
        <View style={styles.screen}>
          <Text style={styles.subHeaderText}>— ГАРАЖ —</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>{newBikeFrame}</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('CHOOSE_FRAME')}>
              <Text style={styles.changeLink}>Изменить тип</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Название велосипеда</Text>
          <TextInput 
            style={styles.textInput}
            placeholder="Например: Trek Marlin 7, мой эндуро..."
            value={newBikeName}
            onChangeText={setNewBikeName}
            autoFocus
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.primaryButton, {flex: 1, marginRight: 8}]} onPress={handleCreateBike}>
              <Text style={styles.primaryButtonText}>Создать</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, {marginTop: 0}]} onPress={() => setCurrentScreen('GARAGE')}>
              <Text style={styles.secondaryButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= ЭКРАН 4: ПРОФИЛЬ ВЕЛОСИПЕДА И КОМПОНЕНТЫ ================= */}
      {currentScreen === 'BIKE_DETAIL' && currentBike && (
        <View style={styles.screen}>
          {/* Хедер профиля */}
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('GARAGE')}>
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <View style={{marginLeft: 16, flex: 1}}>
              <Text style={styles.detailBikeName}>{currentBike.name}</Text>
              <Text style={styles.detailBikeMeta}>{currentBike.frameType} • {getFilledCount(currentBike)}/14</Text>
            </View>
          </View>

          {/* Интерактивная схема велосипеда */}
          <View style={styles.schematicContainer}>
            <Image 
              source={
                currentBike.frameType === 'Хардтейл' 
                  ? require('./Gemini_Generated_Image_jw6uojjw6uojjw6u.png') 
                  : require('./Gemini_Generated_Image_bm9taibm9taibm9t.png')
              }
              style={styles.bikeBackgroundBlueprint} 
            />

            {/* Отрисовка интерактивных точек с привязкой к типу геометрии */}
            {COMPONENT_LIST.map(c => {
              const isFilled = currentBike.components[c.key]?.filled;
              const coords = HOTSPOTS_BY_TYPE[currentBike.frameType]?.[c.key] || { top: '50%', left: '50%' };
              
              return (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.hotspot, 
                    { top: coords.top, left: coords.left },
                    isFilled && styles.hotspotFilled
                  ]}
                  onPress={() => openComponentModal(c.key)}
                >
                  <Text style={styles.hotspotText}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.listSectionTitle}>КОМПЛЕКТУЮЩИЕ</Text>

          {/* Текстовый список деталей */}
          <ScrollView style={styles.componentsScroll}>
            {COMPONENT_LIST.map(c => {
              const compData = currentBike.components[c.key];
              return (
                <TouchableOpacity 
                  key={c.key} 
                  style={styles.componentRow}
                  onPress={() => openComponentModal(c.key)}
                >
                  <View style={[styles.statusIndicator, compData.filled && styles.statusIndicatorFilled]} />
                  <View style={{flex: 1}}>
                    <Text style={styles.componentRowLabel}>{c.label}</Text>
                    {compData.filled ? (
                      <Text style={styles.componentRowValue}>{compData.brand} {compData.model}</Text>
                    ) : (
                      <Text style={styles.componentRowPlaceholder}>Не заполнено</Text>
                    )}
                  </View>
                  <Ionicons name="create-outline" size={18} color="#9ca3af" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ================= МОДАЛЬНОЕ ОКНО ДЛЯ РЕДАКТИРОВАНИЯ КОМПОНЕНТА ================= */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeCompKey && COMPONENT_LIST.find(c => c.key === activeCompKey)?.category}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubTitle}>
              {activeCompKey && COMPONENT_LIST.find(c => c.key === activeCompKey)?.label}
            </Text>

            <ScrollView style={styles.modalForm}>
              <TouchableOpacity style={styles.photoUploadPlaceholder}>
                <Ionicons name="camera-outline" size={28} color="#9ca3af" />
                <Text style={styles.photoPlaceholderText}>Нажмите, чтобы добавить фото</Text>
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Бренд</Text>
              <TextInput style={styles.modalInput} placeholder="Shimano, SRAM..." value={formBrand} onChangeText={setFormBrand} />

              <Text style={styles.fieldLabel}>Модель</Text>
              <TextInput style={styles.modalInput} placeholder="Deore XT M8100" value={formModel} onChangeText={setFormModel} />

              <View style={styles.formRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.fieldLabel}>Год</Text>
                  <TextInput style={styles.modalInput} placeholder="2024" keyboardType="numeric" value={formYear} onChangeText={setFormYear} />
                </View>
                <View style={{flex: 1, marginLeft: 8}}>
                  <Text style={styles.fieldLabel}>Вес (г)</Text>
                  <TextInput style={styles.modalInput} placeholder="420" keyboardType="numeric" value={formWeight} onChangeText={setFormWeight} />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Цена (₽)</Text>
              <TextInput style={styles.modalInput} placeholder="15 000" keyboardType="numeric" value={formPrice} onChangeText={setFormPrice} />

              <Text style={styles.fieldLabel}>Заметки</Text>
              <TextInput 
                style={[styles.modalInput, {height: 80, textAlignVertical: 'top'}]} 
                placeholder="Спецификации, особенности установки..." 
                multiline
                value={formNotes}
                onChangeText={setFormNotes}
              />
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitButton} onPress={saveComponentData}>
              <Text style={styles.modalSubmitButtonText}>Добавить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ================= СТИЛИ ПРИЛОЖЕНИЯ =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  screen: { flex: 1, padding: 20 },
  scrollContainer: { flex: 1, marginTop: 15 },
  subHeaderText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5, marginBottom: 5 },
  headerText: { fontSize: 24, fontWeight: '800', color: '#111827' },
  hintText: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 10 },
  
  primaryButton: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  secondaryButtonText: { color: '#4b5563', fontSize: 16, fontWeight: '600' },
  
  bikeCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  bikeIcon: { marginRight: 16 },
  bikeCardInfo: { flex: 1 },
  bikeCardName: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  bikeCardMeta: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  frameSelectionContainer: { flex: 1, justifyContent: 'center' },
  frameCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 2, borderColor: '#e5e7eb', alignItems: 'center' },
  frameCardActive: { borderColor: '#22c55e' },
  frameMenuImage: { width: '100%', height: 120, resizeMode: 'contain', borderRadius: 8 },
  frameTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginTop: 10 },
  frameDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4, paddingHorizontal: 10 },

  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  typeBadge: { backgroundColor: '#e5e7eb', color: '#374151', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: '600', marginRight: 10 },
  changeLink: { color: '#22c55e', fontSize: 13, fontWeight: '600' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4b5563', marginBottom: 8 },
  textInput: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, padding: 14, fontSize: 16, color: '#1f2937', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', alignItems: 'center' },

  detailHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailBikeName: { fontSize: 20, fontWeight: '800', color: '#1f2937' },
  detailBikeMeta: { fontSize: 13, color: '#6b7280' },
  
  // Контейнер интерактивной схемы
  schematicContainer: { height: 240, backgroundColor: '#ffffff', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', position: 'relative', overflow: 'hidden', marginBottom: 15 },
  
  bikeBackgroundBlueprint: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%', 
    resizeMode: 'contain',
    opacity: 1.0 
  },
  
  // Оформление интерактивных точек в соответствии с видео прототипа
  hotspot: { 
    position: 'absolute', 
    backgroundColor: 'rgba(55, 65, 81, 0.85)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 12, 
    zIndex: 10, 
    borderWidth: 1, 
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2
  },
  hotspotFilled: { backgroundColor: '#22c55e' },
  hotspotText: { color: '#ffffff', fontSize: 9, fontWeight: '700' },

  listSectionTitle: { fontSize: 12, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.2, marginBottom: 8 },
  componentsScroll: { flex: 1 },
  
  componentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  statusIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb', marginRight: 12 },
  statusIndicatorFilled: { backgroundColor: '#22c55e' },
  componentRowLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  componentRowPlaceholder: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  componentRowValue: { fontSize: 12, color: '#22c55e', fontWeight: '500', marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 1.5 },
  modalSubTitle: { fontSize: 20, fontWeight: '800', color: '#1f2937', marginTop: 4, marginBottom: 15 },
  modalForm: { marginBottom: 15 },
  
  photoUploadPlaceholder: { height: 100, backgroundColor: '#f3f4f6', borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  photoPlaceholderText: { fontSize: 12, color: '#9ca3af', marginTop: 6 },
  
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#4b5563', marginBottom: 6, marginTop: 10 },
  modalInput: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 15, color: '#1f2937' },
  formRow: { flexDirection: 'row' },
  modalSubmitButton: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  modalSubmitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' }
});