import React from "react";
import { SelectField } from "@/Components/Layout/FormComponents";

const MotivoRetiroSelect = ({
    value,
    onChange,
    error,
    label = "Motivo del Retiro",
    required = true,
}) => {
    // Definimos las opciones en un solo lugar
    const opciones = [
        "Cambio de Domicilio",
        "Proceso Administrativo",
        "Fuera del Pais",
        "Inasistencia",
    ];

    return (
        <SelectField
            label={label}
            value={value}
            options={opciones}
            onChange={onChange}
            error={error}
            required={required}
            optionSelecName="SELECCIONE UN MOTIVO..." // Placeholder por defecto
        />
    );
};

export default MotivoRetiroSelect;
