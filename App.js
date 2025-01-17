import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Accordion from 'react-native-collapsible/Accordion';

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: {
    items: [],
    categories: ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Snacks', 'Pantry'],
    filteredCategory: '',
  },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    editItem: (state, action) => {
      const { id, name, quantity, category, urgency } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.name = name;
        item.quantity = quantity;
        item.category = category;
        item.urgency = urgency;
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setFilteredCategory: (state, action) => {
      state.filteredCategory = action.payload;
    },
  },
});

const { addItem, editItem, deleteItem, setItems, setFilteredCategory } = shoppingSlice.actions;
const store = configureStore({ reducer: { shopping: shoppingSlice.reducer } });

const ShoppingListApp = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.shopping.items);
  const categories = useSelector((state) => state.shopping.categories);
  const filteredCategory = useSelector((state) => state.shopping.filteredCategory);

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeSections, setActiveSections] = useState([]);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const savedItems = await AsyncStorage.getItem('shoppingItems');
        if (savedItems) {
          dispatch(setItems(JSON.parse(savedItems)));
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadItems();
  }, [dispatch]);

  useEffect(() => {
    const saveItems = async () => {
      try {
        await AsyncStorage.setItem('shoppingItems', JSON.stringify(items));
      } catch (error) {
        console.error(error);
      }
    };
    saveItems();
  }, [items]);

  const handleAddItem = () => {
    if (name.trim() && quantity.trim() && category.trim() && urgency.trim()) {
      const newItem = { id: Date.now().toString(), name, quantity, category, urgency };
      dispatch(addItem(newItem));
      setName('');
      setQuantity('');
      setCategory('');
      setUrgency('');
      setShowForm(false);
    } else {
      Alert.alert('All fields are required!');
    }
  };

  const handleEditItem = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
    setCategory(item.category);
    setUrgency(item.urgency);
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (name.trim() && quantity.trim() && category.trim() && urgency.trim()) {
      const editedItem = { id: editId, name, quantity, category, urgency };
      dispatch(editItem(editedItem));
      setName('');
      setQuantity('');
      setCategory('');
      setUrgency('');
      setEditMode(false);
      setEditId(null);
      setShowForm(false);
    }
  };

  const ShareList = async () => {
    try {
      const listContent = items
        .map(
          (item) =>
            `Item: ${item.name}, Quantity: ${item.quantity}, Category: ${item.category}, Urgency: ${item.urgency}`
        )
        .join('\n');

      await Share.share({
        message: `Shopping List:\n${listContent}`,
      });
    } catch (error) {
      console.error('Error sharing list:', error);
    }
  };

  const filteredItems = filteredCategory
    ? items.filter((item) => item.category === filteredCategory)
    : items;

  const sections = filteredItems.map((item) => ({
    id: item.id,
    title: item.name,
    content: `Quantity: ${item.quantity}\nCategory: ${item.category}\nUrgency: ${item.urgency}`,
  }));

  const renderHeader = (section, _, isActive) => (
    <View style={[styles.itemContainer, isActive && styles.activeHeader]}>
      <ScrollView>
        <Text style={styles.itemHeaderText}>{section.title}</Text>
      </ScrollView>
    </View>
  );

  const renderContent = (section) => (
    <View style={styles.itemContentContainer}>
      <Text style={styles.itemContentText}>{section.content}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleEditItem(section)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => dispatch(deleteItem(section.id))}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      <ScrollView horizontal style={styles.categoryScrollView}>
        {categories.map((categoryItem) => (
          <TouchableOpacity
            key={categoryItem}
            style={[
              styles.categoryButton,
              filteredCategory === categoryItem && styles.selectedCategory,
            ]}
            onPress={() => dispatch(setFilteredCategory(categoryItem))}
          >
            <Text style={styles.categoryText}>{categoryItem}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.categoryButton, !filteredCategory && styles.selectedCategory]}
          onPress={() => dispatch(setFilteredCategory(''))}
        >
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>
      </ScrollView>

      <Accordion
        sections={sections}
        activeSections={activeSections}
        renderHeader={renderHeader}
        renderContent={renderContent}
        onChange={(newActiveSections) => setActiveSections(newActiveSections)}
        underlayColor="#f0f0f0"
      />

      <Modal visible={showForm} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
            />
            <ScrollView horizontal style={styles.categoryScrollView}>
              {categories.map((categoryItem) => (
                <TouchableOpacity
                  key={categoryItem}
                  style={[
                    styles.categoryButton,
                    category === categoryItem && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(categoryItem)}
                >
                  <Text style={styles.categoryText}>{categoryItem}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Urgency"
              value={urgency}
              onChangeText={setUrgency}
            />
            <View style={styles.modalButtonsContainer}>
              {editMode ? (
                <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                  <Text style={styles.buttonText}>Save Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleAddItem}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.button} onPress={() => setShowForm(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.addItemButtonContainer}>
        <TouchableOpacity style={styles.buttons} onPress={() => setShowForm(true)}>
          <Text style={styles.buttonText}>Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttons} onPress={ShareList}>
          <Text style={styles.buttonText}>Share List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => (
  <Provider store={store}>
    <ShoppingListApp />
  </Provider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'black',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  categoryScrollView: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#009688',
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
    height: 50,
  },
  selectedCategory: {
    backgroundColor: '#004d40',
  },
  categoryText: {
    color: 'white',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#009688',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttons: {
    backgroundColor: '#009688',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  itemContainer: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
  },
  activeHeader: {
    backgroundColor: '#afbed2',
  },
  itemHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  itemContentContainer: {
    padding: 10,
    backgroundColor: '#fafafa',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  itemContentText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#666',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 8,
    borderRadius: 5,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addItemButtonContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingBottom: 20,
  },
});

export default App;
