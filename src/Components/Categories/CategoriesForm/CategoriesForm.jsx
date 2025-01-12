import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";

import { BackButton, CKEditorField, InputField } from "../../Form";
import Button from "../../Button/Button";
import { getBase64 } from "../../../utils/getBase64";
import {
  createValidationSchema,
  editValidationSchema,
  initialValues,
} from "./constants";
import { defaultImage } from "../../../utils/defaultImage";

import "../../FormStyles.css";
import { onSubmitService } from "../../../Services/categoryService";
import { errorAlert } from "../../Feedback/AlertService";
import { apiCategory } from "../../../Services/apiService";

const CategoriesForm = () => {
  const { id } = useParams();
  const imageRef = useRef();
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [isFetching, setIsFetching] = useState(false);
  const validationSchema = id ? editValidationSchema : createValidationSchema;

  const onSubmit = () => {
    const file = imageRef.current.files[0];
    if (file) {
      getBase64(file)
        .then((result) => {
          setImagePreview(() => result);
          onSubmitService(
            id,
            {
              name: formik.values.name,
              description: formik.values.description,
              image: result,
            },
            resetForm,
            setSubmitting
          );
        })
        .catch(({ message }) => {
          setSubmitting(false);
          errorAlert("Error al procesar la imagen");
        })
        .finally(() => setImagePreview(defaultImage));
    } else {
      onSubmitService(
        id,
        { name: formik.values.name, description: formik.values.description },
        resetForm,
        setSubmitting
      );
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  const {
    handleSubmit,
    handleChange,
    handleBlur,
    setValues,
    setFieldValue,
    setFieldTouched,
    isSubmitting,
    setSubmitting,
    resetForm,
    values,
    touched,
    errors,
  } = formik;

  useEffect(() => {
    if (id) {
      setIsFetching(() => true);
      apiCategory
        .getSingle(`${id}`)
        .then((response) => {
          setValues(() => ({ ...response, image: "" }));
          setImagePreview(() => response.image);
          setIsFetching(() => false);
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.message || error.message;
          setIsFetching(() => false);
          errorAlert(errorMessage);
        });
    }
  }, [id, setValues]);

  const handleImageChange = (event) => {
    handleChange(event);
    const file = event.target.files[0];
    if (file.type.includes("image")) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const isLoading = isFetching || isSubmitting;

  return (
    <div className={isLoading ? "main-container pulse" : "main-container"}>
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="form-title">
          <BackButton />
          {id ? "Editar" : "Crear"} Categoría
        </h1>
        <div className="input-preview-image">
          <InputField
            label="Nombre"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ingrese el nombre de la categoria"
            errors={errors.name}
            touched={touched.name}
          />
          <img src={imagePreview} alt="preview" className="preview-container" />
        </div>
        <CKEditorField
          placeholder="Ingrese la descripción de la categoría"
          value={values.description}
          errors={errors.description}
          touched={touched.description}
          setFieldValue={setFieldValue}
          setFieldTouched={setFieldTouched}
          name="description"
          label="Descripción"
        />
        <InputField
          label={id ? "Modificar imagen" : "Cargar imagen"}
          name="image"
          value={values.image}
          onChange={handleImageChange}
          onBlur={handleBlur}
          errors={errors.image}
          touched={touched.image}
          type="file"
          ref={imageRef}
        />
        <Button
          type="submit"
          label="Enviar"
          variant="primary"
          className="form-button"
        />
      </form>
    </div>
  );
};

export default CategoriesForm;
