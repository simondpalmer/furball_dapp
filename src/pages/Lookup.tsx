import Paper from '@material-ui/core/Paper';
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Redirect } from 'react-router-dom';
//@ts-ignore
import stegasus from "../../../stegasus/Cargo.toml";
import { getArtworkCidFromOriginalCid } from '../api/token';

export interface LookupProps { }

export function Lookup(props: LookupProps) {

  const [cid, setCID] = useState<string | null>(null);
  const [redirect, setRedirect] = useState(false);


  const handleLookup = async (buf: Buffer) => {
    const imgBuf = new Uint8Array(buf);
    const stegoData = stegasus.decode_img(imgBuf);
    const originalCID = Buffer.from(stegoData).toString();
    console.log(originalCID);
    const artCid = await getArtworkCidFromOriginalCid(originalCID)
    setCID(artCid)
  }

  useEffect(() => {
    if (cid) {
      setRedirect(true)
    }
  }, [cid])

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: "image/png",
    onDropAccepted: (files, _e) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(acceptedFiles[0])
      reader.onloadend = () => {
        if (!reader.result) {
          throw new Error("failed to read image into buffer!")
        }
        if (typeof reader.result == "string") {
          const buf = Buffer.from(reader.result)
          handleLookup(buf)
        } else {
          const buf = Buffer.from(reader.result)
          handleLookup(buf)
        }
      };
    }
  })

  if (redirect) {
    return <Redirect push to={`/artwork/:${cid}`} />
  }


  return (
    <Paper>
      <section className="container">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Upload an image to search in the Furball registry</p>
        </div>
      </section>
    </Paper>
  )
}