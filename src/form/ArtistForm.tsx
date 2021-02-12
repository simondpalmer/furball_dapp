import { Grid } from "@material-ui/core";
import React, { useState } from "react";
import stegasus from "../../../stegasus/Cargo.toml";
import { createToken } from "../api/token";
import Button from "../components/controls/Button";
import Input from "../components/controls/Input";
import Upload from "../components/controls/Upload";
import { Form, useForm } from "../components/useForm";
import { createArtMetadata } from "../db/ceramic";
import { ArtMetadata } from "../interface";

const fursonaItems = [
  { id: "musclefur", title: "Musclefur" },
  { id: "fluffer", title: "Fluffer" },
  { id: "other", title: "Other" },
];

interface ArtistFormProps { }

export default function ArtistForm(props: ArtistFormProps) {
  const [selectedBuffer, setSelectedBuffer] = useState<Buffer | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    values,
    setValues,
    errors,
    setErrors,
    handleInputChange,
    resetForm,
  } = useForm();

  async function uploadNewToken(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    // TODO: loading wheel
    e.preventDefault();
    if (!selectedBuffer) {
      alert("Please upload a file");
      return;
    }
    // const bufFile = (e.target as any).files[0];
    console.log(selectedBuffer);
    // throw "asasas"
    // const originalCID = await uploadArt(selectedBuffer);
    const originalCID = (await window.ipfs.add(selectedBuffer)).path
    // TODO: stego
    const stegMsg = originalCID;
    console.log(`stegoing message "${stegMsg}" into image`);
    const stegod = stegasus.encode_img(
      new Uint8Array(selectedBuffer),
      new Uint8Array(Buffer.from(stegMsg))
    );
    const stegoCID = (await window.ipfs.add(stegod)).path
    // const stegoCID = await uploadArtStegod(new Uint8Array(stegod));
    console.log(`Stegod CID: ${stegoCID}`);

    const artData: ArtMetadata = {
      stegod: stegoCID,
      original: originalCID,
      //   TODO: add in bases
      bases: [],
      //   bases: bases.length === 0 ? undefined : bases
    };
    const artDataCID = await createArtMetadata(artData);
    await createToken(artDataCID, originalCID);
    alert("Uploaded!");
    // setBases([]);
    setSelectedBuffer(null);
    // TODO: add back in
    // await updateTokenBalances();
    // window.location.reload();
  }

  return (
    <Form onSubmit={uploadNewToken}>
      <Grid container>
        {loading && (
          <Grid item xs={12}>
            Loading...
          </Grid>
        )}
        <Grid item xs={6}>
          <Input
            name="designTitle"
            label="Name"
            value={values.designTitle}
            onChange={handleInputChange}
            required
          />
          <Input
            name="designDescription"
            label="Description"
            value={values.designDescription}
            onChange={handleInputChange}
            required
          />
          <Input
            name="designPrice"
            label="Price"
            type="number"
            value={values.designPrice}
            onChange={handleInputChange}
            required
          />
        </Grid>
        <Grid item xs={6}>
          {/* <FurryGroup
            name="designFursona"
            label="Fursona"
            value={values.designFursona}
            onChange={handleInputChange}
            items={fursonaItems}
          /> */}
          {/* <FeaturesSelect
            name="designFeatureId"
            label="Features"
            onChange={handleInputChange}
            // options={artistService.getfeatureCollection()}
          /> */}
          <Upload
            uploadText="Drag and drop your image or click here!"
            onBufferComplete={setSelectedBuffer}
          />
          <div>
            <Button type="submit" text="Submit" />
            <Button text="Reset" color="default" onClick={resetForm} />
          </div>
        </Grid>
      </Grid>
    </Form>
  );
}
