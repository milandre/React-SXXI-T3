import { useFormik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { post, put } from "../../../Services/userService";
import { BackButton, InputField, SelectField } from "../../Form";
import Button from "../../Button/Button";
import {
  createValidationSchema,
  editValidationSchema,
  initialValues,
} from "./constants";

import "../../FormStyles.css";
import { errorAlert } from "../../Feedback/AlertService";
import { apiUser } from "../../../Services/apiService";
import { getBase64 } from "../../../utils/getBase64";
import { defaultImage } from "../../../utils/defaultImage";

const UsersForm = () => {
  const { id } = useParams();
  const imageRef = useRef();
  const [imagePreview, setImagePreview] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const validationSchema = id ? editValidationSchema : createValidationSchema;
  const roleOptions = [
    { label: "Administrador", value: "1" },
    { label: "Regular", value: "2" },
  ];

  const onSubmit = () => {
    const file = imageRef.current.files[0];
    if (file) {
      getBase64(file)
        .then((result) => {
          if (id) {
            put(
              id,
              {
                name: values.name,
                email: values.email,
                password: values.password,
                profile_image: result,
                role_id: values.role,
              },
              resetForm,
              setSubmitting
            );
          } else {
            post(
              {
                name: values.name,
                email: values.email,
                password: values.password,
                profile_image: result,
                role_id: values.role,
              },
              resetForm,
              setSubmitting
            );
          }
        })
        .catch(({ message }) => {
          setSubmitting(false);
          errorAlert("Error al procesar la imagen");
        })
        .finally(() => setImagePreview(defaultImage));
    } else {
      post(
        {
          name: values.name,
          email: values.email,
          password: values.password,
          role_id: values.role,
        },
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
      apiUser
        .getSingle(`${id}`)
        .then((response) => {
          setValues(() => ({ ...response, image: "", role: response.role_id }));
          setImagePreview(() => response.profile_image);
          setIsFetching(false);
        })
        .catch((error) => {
          setIsFetching(false);
          errorAlert();
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

  const isLoading = isSubmitting || isFetching;

  return (
    <div className={isLoading ? "main-container pulse" : "main-container"}>
      <form className="form-container" onSubmit={handleSubmit}>
        <h1 className="form-title">
          <BackButton />
          {id ? "Editar" : "Crear"} Usuario
        </h1>
        <div className="input-preview-image">
          <InputField
            label="Nombre"
            value={values.name}
            name="name"
            onChange={handleChange("name")}
            onBlur={handleBlur("name")}
            errors={errors.name}
            touched={touched.name}
            type="text"
            placeholder="Escriba el nombre del usuario"
          />
          <img src={imagePreview} alt="preview" className="preview-container" />
        </div>
        <InputField
          label="Email"
          value={values.email}
          name="email"
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          errors={errors.email}
          touched={touched.email}
          type="text"
          placeholder="Escriba el email del usuario"
        />
        <InputField
          label="Contraseña"
          value={values.password}
          name="password"
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          errors={errors.password}
          touched={touched.password}
          type="password"
          placeholder="Escriba la password del usuario"
        />
        <InputField
          label="Agregar una imagen"
          value={values.image}
          name="image"
          ref={imageRef}
          onChange={handleImageChange}
          onBlur={handleBlur("image")}
          errors={errors.image}
          touched={touched.image}
          type="file"
        />
        <SelectField
          label="Selecciona un rol"
          value={values.role}
          name="role"
          onChange={handleChange}
          onBlur={handleBlur}
          errors={errors.role}
          touched={touched.role}
          optionsList={roleOptions}
        />
        <Button
          label="Enviar"
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          className="form-button"
        />
      </form>
    </div>
  );
};

export default UsersForm;
