declare module '@/components/ui/use-toast' {
  export function useToast(): {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => void;
  };
}

declare module '@/components/FileUploader' {
  import { FC } from 'react';

  interface FileUploaderProps {
    accept?: string;
    maxSize?: number;
    onFileSelect: (file: File | null) => void;
    file: File | null;
  }

  export const FileUploader: FC<FileUploaderProps>;
} 