import { FormControl, RadioGroup, FormLabel, FormControlLabel, Radio } from '@material-ui/core';
import React from 'react'

export default function FurryGroup(props) {
    const {name,label,value,onChange,items}= props;
    
    return(
        <FormControl>
            <FormLabel>{label}</FormLabel>
            <RadioGroup row
                name={name}
                value={value}
                onChange={onChange}
                >
                {
                    items.map(
                        item => (
                            <FormControlLabel key={item.id} value={item.id} control={<Radio />} label={item.title} />
                        )
                    )
                }                      
            </RadioGroup>
        </FormControl>
    )
}