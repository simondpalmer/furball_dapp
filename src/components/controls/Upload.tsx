import React, { CSSProperties, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const thumbsContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb: CSSProperties = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: 'border-box'
};

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
};

const img = {
  display: 'block',
  width: 'auto',
  height: '100%'
};

interface UploadProps {
  uploadText: string;
  onBufferComplete: (buf: Buffer) => void;
}

export default function Upload(props: UploadProps) {
  const { uploadText, onBufferComplete } = props
  const [buffer, setBuffer] = useState<Buffer | null>();
  const [files, setFiles] = useState<File[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/png',
    maxFiles: 1,
    onDrop: <T extends File>(acceptedFiles: T[]) => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(acceptedFiles[0])
      reader.onloadend = () => {
        if (!reader.result) {
          throw new Error("failed to read image into buffer!")
        }
        if (typeof reader.result == "string") {
          setBuffer(Buffer.from(reader.result))
        } else {
          setBuffer(Buffer.from(reader.result))
        }
      };
    }
  });

  const thumbs = files.map((file: any) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img
          src={file.preview}
          style={img}
        />
      </div>
    </div>
  ));

  //Upload to Ipfs
  useEffect(() => {
    if (buffer) {
      onBufferComplete(buffer)
    }
  }, [buffer])

  return (
    <section className="container">
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p>{uploadText}</p>
        <em>(Only 1 *.jpeg or *.png image will be accepted)</em>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
    </section>
  );
}