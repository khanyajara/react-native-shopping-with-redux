import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: { items: [] },
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
  },
});

const { addItem, editItem, deleteItem, setItems } = shoppingSlice.actions;
const store = configureStore({ reducer: { shopping: shoppingSlice.reducer } });

const ShoppingListApp = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.shopping.items);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterUrgency, setFilterUrgency] = useState('All');

  const categories = ['Groceries', 'Household', 'Personal Care', 'Electronics'];

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
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesUrgency = filterUrgency === 'All' || item.urgency === filterUrgency;
    return matchesCategory && matchesUrgency;
  });

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>{item.name}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Text>Category: {item.category}</Text>
      <Text>Urgency: {item.urgency}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => dispatch(deleteItem(item.id))}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>

      {/* Category Filter */}
      <Picker
        selectedValue={filterCategory}
        onValueChange={(value) => setFilterCategory(value)}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="All" />
        {categories.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      {/* Urgency Filter */}
      <Picker
        selectedValue={filterUrgency}
        onValueChange={(value) => setFilterUrgency(value)}
        style={styles.picker}
      >
        <Picker.Item label="All Urgencies" value="All" />
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>

      {/* Add Item Button */}
      <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
        <Text style={styles.buttonText}>Add Item</Text>
      </TouchableOpacity>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {/* Input Form Modal */}
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
      >
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
            {/* Category Picker */}
            <Picker
              selectedValue={category}
              onValueChange={(value) => setCategory(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>
            {/* Urgency Picker */}
            <Picker
              selectedValue={urgency}
              onValueChange={(value) => setUrgency(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Urgency" value="" />
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAddItem}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setShowForm(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  picker: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop:19,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default App;
