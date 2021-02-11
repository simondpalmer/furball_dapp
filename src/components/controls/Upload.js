import { PausePresentationSharp } from '@material-ui/icons';
import React, {useEffect, useState} from 'react';
import {useDropzone} from 'react-dropzone';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
};

const thumb = {
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
     
export default function Upload(props) {
  const { name, label, value } = props
  const [buffer, setBuffer] = useState([]);
  const [files, setFiles] = useState([]);

  const IPFS = require('ipfs-api');

  const {getRootProps, getInputProps} = useDropzone({
    accept: 'image/jpeg, image/png',
    maxFiles:1,
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(acceptedFiles[0])
      reader.onloadend = () => {
        setBuffer(Buffer(reader.result))
      };
    }
  });

  const thumbs = files.map(file => (
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
    const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });
    ipfs.files.add(buffer, (error, result) => {
      console.log('Ipfs result', result)
      value = 'https://ipfs.infura.io/ipfs/' + result[0].hash
    })
  },[buffer])

  useEffect(() => () => {
    // Make sure to revoke the data uris to avoid memory leaks
    files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);


  console.log(value)

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop file here, or click to select file</p>
        <em>(Only 1 *.jpeg or *.png image will be accepted)</em>
      </div>
      <aside style={thumbsContainer}>
        {thumbs}
      </aside>
    </section>
  );
}