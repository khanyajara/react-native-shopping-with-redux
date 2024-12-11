import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const shoppingSlice = createSlice({
  name: 'shopping',
  initialState: { items: [] },
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    editItem: (state, action) => {
      const { id, name, quantity } = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.name = name;
        item.quantity = quantity;
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
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      const savedItems = await AsyncStorage.getItem('shoppingItems');
      if (savedItems) {
        dispatch(setItems(JSON.parse(savedItems)));
      }
    };
    loadItems();
  }, [dispatch]);

  useEffect(() => {
    const saveItems = async () => {
      await AsyncStorage.setItem('shoppingItems', JSON.stringify(items));
    };
    saveItems();
  }, [items]);

  const handleAddItem = () => {
    if (name.trim() && quantity.trim()) {
      const newItem = { id: Date.now().toString(), name, quantity, purchased: false };
      dispatch(addItem(newItem));
      setName('');
      setQuantity('');
    }
  };

  const handleEditItem = () => {
    if (name.trim() && quantity.trim()) {
      dispatch(editItem({ id: editId, name, quantity }));
      setEditMode(false);
      setEditId(null);
      setName('');
      setQuantity('');
    }
  };

  const handleDeleteItem = (id) => {
    dispatch(deleteItem(id));
  };

  const handleEditInit = (item) => {
    setEditMode(true);
    setEditId(item.id);
    setName(item.name);
    setQuantity(item.quantity);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text>{item.name}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <View style={styles.buttonsContainer}>
        <Button title="Edit" onPress={() => handleEditInit(item)} />
        <Button title="Delete" onPress={() => handleDeleteItem(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shopping List</Text>
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
      <Button
        title={editMode ? 'Update Item' : 'Add Item'}
        onPress={editMode ? handleEditItem : handleAddItem}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default App;
