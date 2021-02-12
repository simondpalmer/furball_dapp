import { makeStyles } from "@material-ui/core";
import React, { useState } from "react";

export interface FormValues {
  id: number;
  designTitle: string;
  accountId: string;
  designImageUrl: string;
  designDescription: string;
  designPrice: number;
  designFursona: string;
  designFeatureId: string;
  addedDate: Date;
}

const defaultFVals = {
  id: 0,
  designTitle: "",
  accountId: "",
  designImageUrl: "",
  designDescription: "",
  designPrice: 0,
  designFursona: "",
  designFeatureId: "",
  addedDate: new Date(),
};

// TODO: add me
function validate(inp: Partial<FormValues>) {
  return true;
}

export function useForm() {
  const [values, setValues] = useState(defaultFVals);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    validate({ [name]: value });
    setValues({
      ...values,
      [name]: value,
    });
  };

  const resetForm = () => {
    setValues(defaultFVals);
    setErrors({});
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    handleInputChange,
    resetForm,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiFormControl-root": {
      width: "80%",
      margin: theme.spacing(1),
    },
  },
}));

export function Form(props: any) {
  const classes = useStyles();
  const { children, ...other } = props;

  return (
    <form className={classes.root} {...other}>
      {props.children}
    </form>
  );
}
