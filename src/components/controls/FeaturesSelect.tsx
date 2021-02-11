import React from 'react'
import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core'

export default function FeaturesSelect(props: any) {
    const {name, label, value, onChange, options} = props;
    return(
        <FormControl
        variant="outlined">
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                name={name}
                value={value}
                onChange={onChange}>
                    <MenuItem value="">None</MenuItem>
                    {
                        // options.map(
                        //     item => (<MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)
                        // )
                    }
            </Select>
        </FormControl>
    )
}