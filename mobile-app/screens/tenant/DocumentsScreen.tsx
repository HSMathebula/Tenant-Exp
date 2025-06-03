import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  AccessibilityInfo,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Document } from '../../types';
import { api } from '../../services/api';
import { LoadingOverlay } from '../../components/LoadingOverlay';
import { Toast, ToastType } from '../../components/Toast';
import { downloadDocument } from '../../utils/documentUtils';

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    type: 'info',
  });
  const { user } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/documents');
      setDocuments(response.data);
    } catch (error) {
      showToast('Failed to fetch documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      setLoading(true);
      await downloadDocument(document.url, document.name);
      showToast('Document downloaded successfully', 'success');
    } catch (error) {
      showToast('Failed to download document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <TouchableOpacity
      style={[styles.documentItem, { borderBottomColor: colors.border }]}
      onPress={() => handleDownload(item)}
      accessibilityRole="button"
      accessibilityLabel={`Download ${item.name}`}
      accessibilityHint="Double tap to download this document"
    >
      <View style={styles.documentInfo}>
        <Text style={[styles.documentName, { color: colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.documentDate, { color: colors.text + '80' }]}>
          {new Date(item.uploadedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.downloadButton, { backgroundColor: colors.primary }]}>
        <Text style={styles.downloadButtonText}>Download</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>My Documents</Text>
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        accessibilityRole="list"
        accessibilityLabel="List of documents"
      />
      <LoadingOverlay visible={loading} message="Loading documents..." />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  documentItem: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 14,
    marginTop: 4,
  },
  downloadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default DocumentsScreen; 