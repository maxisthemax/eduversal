import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

//*utils
import axios from "@/utils/axios";

export default function useVideoUpload(
  uploadPath: string,
  options?: { multiple?: boolean }
) {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const multiple = options?.multiple ?? true;

  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      if (multiple)
        setFiles((files) => {
          return [...files, ...acceptedFiles];
        });
      else setFiles(acceptedFiles);
    },
    [multiple]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDropAccepted,
    multiple,
    onError: (error) => {
      console.log(error);
    },
    accept: {
      "video/mp4": [],
    },
    onDropRejected: (fileRejections) => {
      toast.error(
        fileRejections.map((file) => file.errors[0].message).join(`\n`)
      );
    },
    validator: (file) => {
      if (file.size > 300 * 1024 * 1024) {
        return {
          code: "size-too-large",
          message: `file is larger than 300MB`,
        };
      }
      return null;
    },
  });

  const handleUpload = async (name?: string) => {
    const formData = new FormData();
    formData.append("folderPath", uploadPath);
    files.forEach((file) => {
      const myRenamedFile = new File([file], name, { type: file.type });
      formData.append("files", name ? myRenamedFile : file);
    });
    try {
      setIsUploading(true);
      const res = await axios.post("admin/photo/uploadVideo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsUploading(false);
      setFiles([]);
      return res.data;
    } catch (error) {
      setIsUploading(false);
      console.error("Error uploading files:", error);
      return null;
    }
  };

  return {
    files,
    setFiles,
    isUploading,
    getRootProps,
    getInputProps,
    handleUpload,
    open,
  };
}
