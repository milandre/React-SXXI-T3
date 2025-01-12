import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { getBase64 } from "../../../utils/getBase64";
import { BackButton, CKEditorField, InputField } from "../../Form";
import Button from "../../Button/Button";
import {
  createValidationSchema,
  editValidationSchema,
  initialValues,
} from "./constants";

import "../../FormStyles.css";
import { defaultImage } from "../../../utils/defaultImage";
import { errorAlert, infoAlert } from "../../Feedback/AlertService";
import { apiActivity } from "../../../Services/apiService";

const updateActivity = (activity, setSubmitting) => {
  apiActivity
    .put(`${activity.id}`, activity)
    .then((response) => {
      infoAlert();
    })
    .catch((err) => {
      errorAlert();
    })
    .finally(() => setSubmitting(false));
};

const createActivity = (activity, setSubmitting) => {
  apiActivity
    .post(activity)
    .then((response) => {
      infoAlert();
    })
    .catch((err) => {
      errorAlert();
    })
    .finally(() => setSubmitting(false));
};

const ActivitiesForm = () => {
  const [activity, setActivity] = useState();
  const [isFetching, setIsFetching] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const { id } = useParams();
  const validationSchema = id ? editValidationSchema : createValidationSchema;
  const imageRef = useRef();

  const onSubmit = () => {
    const file = imageRef.current.files[0];
    if (file) {
      getBase64(file)
        .then((result) => {
          let activityToSave = {
            id: activity?.id || null,
            name: values.name,
            description: values.description,
            image: result,
          };
          if (isEdit) updateActivity(activityToSave, setSubmitting);
          else createActivity(activityToSave, setSubmitting);
        })
        .catch(() => errorAlert("Error en cargar la imagen"))
        .finally(() => setImagePreview(defaultImage));
    } else {
      let activityToSave = {
        id: activity?.id,
        name: values.name,
        description: values.description,
      };
      if (isEdit) updateActivity(activityToSave, setSubmitting);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });

  const {
    handleChange,
    handleBlur,
    handleSubmit,
    errors,
    touched,
    values,
    setValues,
    setFieldTouched,
    setFieldValue,
    isSubmitting,
    setSubmitting,
  } = formik;
  useEffect(() => {
    if (id) {
      setIsFetching(true);
      apiActivity
        .getSingle(`${id}`)
        .then((response) => {
          setValues(() => ({ ...response, image: "" }));
          setImagePreview(() => response.image);
          setActivity(response);
        })
        .catch((error) => {
          errorAlert();
        });
      setIsFetching(false);
      setIsEdit(true);
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
          {id ? "Editar" : "Crear"} Actividad
        </h1>
        <div className="input-preview-image">
          <InputField
            label="Nombre"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ingrese el nombre de la actividad"
            errors={errors.name}
            touched={touched.name}
          />
          <img src={imagePreview} alt="preview" className="preview-container" />
        </div>
        <CKEditorField
          placeholder="Ingrese la descripción de la actividad"
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

export default ActivitiesForm;
