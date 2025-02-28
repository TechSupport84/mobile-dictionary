import { useState, useEffect } from "react";
import { Image, StatusBar, Text, TouchableOpacity, View, ScrollView } from "react-native";
import SearchComponent from "./SearchComponent";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface License {
  name: string;
  url: string;
}

interface Phonetic {
  text?: string;
  audio?: string;
  sourceUrl?: string;
  license?: License;
}

interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
}

interface WordData {
  word: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license?: License;
  sourceUrls?: string[];
}

export default function Index() {
  const [word, setWord] = useState<string>("");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [error, setError] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    if (!word.trim()) return;
    fetchWordDefinition();
  }, [word]);

  const fetchWordDefinition = async () => {
    try {
      const response = await axios.get<WordData[]>(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      setWordData(response.data[0]);
      setError("");
    } catch (err) {
      setWordData(null);
      console.log(err);
      setError("Word not found. Please try another word.");
    }
  };

  const playAudio = async (audioUrl: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing audio", error);
    }
  };

  const loadBookmarks = async () => {
    const storedBookmarks = await AsyncStorage.getItem("bookmarks");
    if (storedBookmarks) {
      setBookmarks(JSON.parse(storedBookmarks));
    }
  };

  const toggleBookmark = async () => {
    let updatedBookmarks = [...bookmarks];
    if (bookmarks.includes(word)) {
      updatedBookmarks = bookmarks.filter((item) => item !== word);
    } else {
      updatedBookmarks.push(word);
    }
    setBookmarks(updatedBookmarks);
    await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
  };

  return (
    <View className="flex flex-1 bg-gray-800 p-4">
      <StatusBar barStyle="light-content" className="bg-gray-800" />
      <Text className="text-3xl text-white text-center font-bold">Dictionary</Text>

      <View className="flex items-center mt-5">
        <Image
          source={require("../assets/images/dictionary.png")}
          style={{ width: 150, height: 150, resizeMode: "contain", opacity: 0.6 }}
        />
      </View>

      <View className="mt-4">
        <SearchComponent value={word} onChangeText={(e) => setWord(e)} />
      </View>

      <TouchableOpacity onPress={toggleBookmark} className="self-end mt-2">
        <Ionicons
          name={bookmarks.includes(word) ? "bookmark" : "bookmark-outline"}
          size={28}
          color="white"
        />
      </TouchableOpacity>

      {error ? (
        <Text className="text-red-500 text-center mt-2">{error}</Text>
      ) : wordData ? (
        <ScrollView className="mt-4">
          {wordData.phonetics.length > 0 && (
            <View className="mt-2">
              {wordData.phonetics.map((phonetic, index) => (
                <View key={index} className="flex flex-row items-center gap-2 mt-2">
                  {phonetic.text && <Text className="text-gray-100 italic ">{phonetic.text}</Text>}
                  {phonetic.audio && (
                    <TouchableOpacity onPress={() => phonetic.audio && playAudio(phonetic.audio)}>
                      <Ionicons name="volume-high-outline" size={24} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          <Text className="mt-2 text-lg font-semibold text-white text-2xl">Definitions:</Text>
          <View className="ml-4">
            {wordData.meanings.map((meaning, idx) => (
              <View key={idx} className="mt-2">
                <Text className="text-gray-100 font-bold">{meaning.partOfSpeech}</Text>
                <Text className="text-gray-300 ">{meaning.definitions[0].definition}</Text>
                {meaning.definitions[0].example && (
                  <Text className="text-sm text-green-400">Example: {meaning.definitions[0].example}</Text>
                )}
              </View>
            ))}
          </View>

          {wordData.sourceUrls && wordData.sourceUrls.length > 0 && (
            <Text className="mt-4 text-sm text-gray-500">
              Source: <Text className="text-blue-500 underline">{wordData.sourceUrls[0]}</Text>
            </Text>
          )}
          {wordData.license && (
            <Text className="text-sm text-gray-500">
              License: <Text className="text-blue-500 underline">{wordData.license.name}</Text>
            </Text>
          )}
        </ScrollView>
      ) : (
        <Text className="text-gray-400 text-center mt-2">Type a word to get its definition.</Text>
      )}
    </View>
  );
}
