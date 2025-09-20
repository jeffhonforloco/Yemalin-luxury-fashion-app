import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { trpc } from '@/lib/trpc';

export default function BackendTest() {
  const [name, setName] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const hiMutation = trpc.example.hi.useMutation({
    onSuccess: (data) => {
      setResult(`${data.hello} - ${data.date}`);
    },
    onError: (error) => {
      setResult(`Error: ${error.message}`);
    },
  });

  const handleTest = () => {
    if (name.trim()) {
      hiMutation.mutate({ name: name.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Test</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#666"
      />
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleTest}
        disabled={hiMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {hiMutation.isPending ? 'Testing...' : 'Test Backend'}
        </Text>
      </TouchableOpacity>
      {result ? (
        <Text style={styles.result}>{result}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    textAlign: 'center',
  },
});