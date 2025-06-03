import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export const downloadDocument = async (url: string, filename: string): Promise<void> => {
  try {
    // Create a temporary file path
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error('Failed to download file');
    }

    // Share the file
    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(fileUri);
    } else {
      // For Android, we can use the native share dialog
      await Sharing.shareAsync(fileUri, {
        mimeType: getMimeType(filename),
        dialogTitle: 'Share Document',
      });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    throw error;
  }
};

const getMimeType = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    default:
      return 'application/octet-stream';
  }
}; 