"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native"
import { TextInput, Button, RadioButton } from "react-native-paper"
import { Picker } from "@react-native-picker/picker"
import * as ImagePicker from "expo-image-picker"
import { Ionicons } from "@expo/vector-icons"

const CreateTicketScreen = ({ navigation }: any) => {
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [urgency, setUrgency] = useState("normal")
  const [accessInstructions, setAccessInstructions] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please allow access to your photo library to upload images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (images.length >= 5) {
        Alert.alert("Limit Reached", "You can only upload up to 5 images.")
        return
      }
      setImages([...images, result.assets[0].uri])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleSubmit = () => {
    if (!category || !title || !description || !urgency) {
      Alert.alert("Missing Information", "Please fill in all required fields.")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      Alert.alert("Ticket Submitted", "Your maintenance ticket has been submitted successfully.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("TicketsList"),
        },
      ])
    }, 1500)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Maintenance Ticket</Text>
        <Text style={styles.subtitle}>Submit a new maintenance request for your apartment.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select category" value="" />
              <Picker.Item label="Plumbing" value="plumbing" />
              <Picker.Item label="Electrical" value="electrical" />
              <Picker.Item label="HVAC / Air Conditioning" value="hvac" />
              <Picker.Item label="Appliance" value="appliance" />
              <Picker.Item label="Structural" value="structural" />
              <Picker.Item label="Pest Control" value="pest" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Brief description of the issue"
            mode="outlined"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Please provide detailed information about the issue"
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Urgency Level *</Text>
          <RadioButton.Group onValueChange={(value) => setUrgency(value)} value={urgency}>
            <View style={styles.radioOption}>
              <RadioButton value="emergency" />
              <Text style={styles.radioLabel}>
                Emergency - Requires immediate attention (water flooding, no electricity, etc.)
              </Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="urgent" />
              <Text style={styles.radioLabel}>Urgent - Should be addressed within 24 hours</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="normal" />
              <Text style={styles.radioLabel}>Normal - Can be addressed within a few days</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="low" />
              <Text style={styles.radioLabel}>Low - Not time-sensitive</Text>
            </View>
          </RadioButton.Group>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Photos</Text>
          <Text style={styles.helperText}>Add photos to help us better understand the issue. Maximum 5 photos.</Text>

          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
                <Ionicons name="camera" size={24} color="#3b82f6" />
                <Text style={styles.addImageText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Access Instructions</Text>
          <TextInput
            value={accessInstructions}
            onChangeText={setAccessInstructions}
            placeholder="Any special instructions for accessing your unit? (Optional)"
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.cancelButton}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          >
            Submit Ticket
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    flex: 1,
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  imageWrapper: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.5%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addImageButton: {
    width: "30%",
    aspectRatio: 1,
    margin: "1.5%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageText: {
    marginTop: 8,
    color: "#3b82f6",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#3b82f6",
  },
})

export default CreateTicketScreen
