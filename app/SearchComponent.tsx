import { StyleSheet, TextInput, View ,Text} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value?: string;
  onChangeText: (e: string) => void;
}

const SearchComponent: React.FC<Props> = ({ value, onChangeText }) => {
  return (
    <View className='flex flex-row items-center justify-center border border-gray-300 bg-gray-500 p-2 rounded-lg '>
      <TextInput
      style={styles.textInput}
        className='flex-1 text-gray-100 text-2xl bg-gray-500 '
        value={value}
        onChangeText={onChangeText}
        placeholder='Search Word'
        placeholderTextColor='#ffffff'
        autoCorrect ={false}
      
      />
      <Ionicons className="absolute right-2" name="search-circle-outline" size={30} color="#ffffff"/>
    </View>
  );
}

export default SearchComponent;

const styles = StyleSheet.create({
  textInput:{
    padding:10,
   
  }
})
