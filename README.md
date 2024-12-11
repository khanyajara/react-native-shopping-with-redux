# Shopping List App with Redux

## Overview

The Shopping List App is a React Native application that allows users to manage their shopping lists effectively. It uses Redux for state management and AsyncStorage for data persistence. Users can add, edit, and delete items from their shopping list, ensuring a smooth and user-friendly experience.

---

## Features

- **Add Items**: Add new items to the shopping list with a name and quantity.
- **Edit Items**: Modify the name and quantity of existing items.
- **Delete Items**: Remove items from the shopping list.
- **Persist Data**: Save shopping list data locally using AsyncStorage.
- **Dynamic UI**: Responsive and interactive interface for managing the shopping list.

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Metro Bundler:

   ```bash
   npm start
   ```

4. Run the app on an emulator or connected device:

   - For Android:
     ```bash
     npm run android
     ```
   - For iOS:
     ```bash
     npm run ios
     ```

---

## Usage

1. Launch the app.
2. Use the input fields to add an item (name and quantity) to the shopping list.
3. Tap the "Edit" button on an item to modify its details.
4. Tap the "Delete" button to remove an item from the list.

---

## Redux Setup

The application uses Redux for state management. Below are the key components:

### Actions:

- **addItem**: Add a new item to the list.
- **editItem**: Modify the details of an existing item.
- **deleteItem**: Remove an item from the list.
- **setItems**: Initialize the list with saved items from AsyncStorage.

### Reducer:

The reducer listens to dispatched actions and updates the state accordingly.

### Store:

The Redux store is configured using `@reduxjs/toolkit` and provides the application state.

---

## AsyncStorage Integration

The app uses AsyncStorage to save and retrieve shopping list data:

- **Save Items**: Automatically saves the list whenever it changes.
- **Load Items**: Loads the list from storage when the app is launched.

---

## Styles

The app uses React Native's `StyleSheet` to provide:

- A clean and responsive layout.
- Separate styling for buttons, inputs, and item containers.

---

## Testing

1. Ensure the app builds and runs without errors.
2. Test adding, editing, and deleting items to confirm functionality.
3. Close and reopen the app to verify data persistence with AsyncStorage.

---

## Future Enhancements

- Add a "mark as purchased" feature.
- Integrate accessibility improvements.
- Implement cloud sync for data.

---

##

