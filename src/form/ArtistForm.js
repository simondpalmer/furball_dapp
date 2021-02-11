import React,{useState, useEffect} from 'react'
import { Grid, TextField, makeStyles, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core'
import { useForm, Form } from '../components/useForm';
import Upload from '../components/controls/Upload';
import Input from '../components/controls/Input';
import Button from '../components/controls/Button';
import FeaturesSelect from '../components/controls/FeaturesSelect';
import * as artistService from '../components/services/ArtistService';
import FurryGroup from '../components/controls/FurryGroup';

const fursonaItems = [
    {id:'musclefur', title:'Musclefur'},
    {id:'fluffer', title:'Fluffer'},
    {id:'other', title:'Other'},
]

const initialFValues = {
    id: 0,
    designTitle:"",
    accountId:"",
    designImageUrl:"",
    designDescription:"",
    designPrice:1,
    designFursona:"other",
    designFeatureId:"",
    addedDate:new Date(),

}
export default function ArtistForm(props) {
    const { addOrEdit } = props

    const validate = (fieldValues = values) => {
        let temp = {...errors}
        if('designTitle' in fieldValues)  
            temp.designTitle = fieldValues.designTitle?"":"give it a furry name"
        if('designDescription' in fieldValues) 
            temp.designDescription = fieldValues.designDescription?"":"give it a furry description"
        if('designPrice' in fieldValues) 
            temp.designPrice = fieldValues.designPrice?"":"name your price"
        setErrors({
            ...temp
        })

        if (fieldValues == values)
            return Object.values(temp).every(x => x == "")
    }

    const {
        values,
        setValues,
        errors,
        setErrors,
        handleInputChange,
        resetForm
    } = useForm(initialFValues, true, validate);

    const handleSubmit= e => {
        e.preventDefault()
        if (validate()) {
            addOrEdit(values, resetForm)
        }
    }

    return (
            <Form onSubmit={handleSubmit}>
            <Grid container>
                <Grid item xs={6}>
                    <Input
                    name="designTitle"
                    label="Name"
                    value={values.designTitle}
                    onChange = {handleInputChange}
                    error={errors.designTitle}
                    />
                    <Input
                        name="designDescription"
                        label="Description"
                        value={values.designDescription}
                        onChange = {handleInputChange}
                        error={errors.designDescription}
                    />
                    <Input
                        name="designPrice"
                        label="Price"
                        value={values.designPrice}
                        onChange = {handleInputChange}
                        error={errors.designPrice}
                    />
                </Grid>
                <Grid item xs={6}>
                    <FurryGroup
                        name="designFursona"
                        label="Fursona"
                        value={values.designFursona}
                        onChange={handleInputChange} 
                        items={fursonaItems}
                    /> 
                    <FeaturesSelect
                        name="designFeatureId"
                        label="Features"
                        value={values.designFeatureId}
                        onChange={handleInputChange} 
                        options={artistService.getfeatureCollection()} 
                    />
                    <Upload 
                        name="designImageUrl"
                        label="Image"
                        value = {values.designImageUrl}
                        onChange={handleInputChange} 
                    />   
                    <div>
                        <Button 
                        type="submit"
                        text="Submit" />
                        <Button 
                        text="Reset"
                        color="default"
                        onClick={resetForm} />
                    </div>            
                </Grid>
            </Grid>
            </Form>
    )
}