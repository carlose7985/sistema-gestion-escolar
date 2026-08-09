// resources/js/lib/utils-acentos.js

export const NOMBRES_CON_TILDE = [
    "José",
    "Día",
    "Álvaro",
    "Dirección",
    "Subdirección",
    "Óscar",
    "Ramón",
    "María",
    "Jesús",
    "Ángel",
    "Mónica",
    "Simón",
    "Raúl",
    "Andrés",
    "Sofía",
    "Verónica",
    "César",
    "Félix",
    "Héctor",
    "Bermúdez",
    "Joaquín",
    "Sebastián",
    "Martín",
    "Fabián",
    "Julián",
    "Tomás",
    "Elías",
    "Bárbara",
    "Germán",
    "Lucía",
    "González",
    "Rodríguez",
    "Pérez",
    "Hernández",
    "García",
    "Sánchez",
    "Ramírez",
    "Díaz",
    "Vásquez",
    "Velásquez",
    "Fernández",
    "López",
    "Martínez",
    "Gómez",
    "Jiménez",
    "Álvarez",
    "Gutiérrez",
    "Núñez",
    "Suárez",
    "Méndez",
    "Chávez",
    "Carrión",
    "León",
    "Márquez",
    "Ríos",
    "Cortés",
    "Gascón",
    "Estadístico",
    "República",
];

// Función para limpiar tildes y comparar
export const quitarTildes = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const buscarSugerencia = (palabra) => {
    if (!palabra || palabra.length < 2) return null;

    // Normalizamos la palabra del input a una forma estándar (NFC)
    const limpia = palabra.trim().normalize("NFC");
    const baseInput = quitarTildes(limpia).toLowerCase();

    // Buscamos en el diccionario
    const coincidencia = NOMBRES_CON_TILDE.find(
        (d) => quitarTildes(d).toLowerCase() === baseInput,
    );

    if (coincidencia) {
        // Normalizamos la palabra del diccionario también
        const coincidenciaNorm = coincidencia.normalize("NFC");

        // IMPORTANTE: Solo sugerir si son realmente distintas tras normalizar
        if (limpia !== coincidenciaNorm) {
            if (limpia === limpia.toUpperCase())
                return coincidenciaNorm.toUpperCase();
            if (limpia[0] === limpia[0].toUpperCase()) {
                return (
                    coincidenciaNorm.charAt(0).toUpperCase() +
                    coincidenciaNorm.slice(1).toLowerCase()
                );
            }
            return coincidenciaNorm.toLowerCase();
        }
    }
    return null;
};

export const titleCaseFixed = (str) => {
    return str
        .split(" ")
        .map((w) =>
            w.length > 0 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w,
        )
        .join(" ");
};

export const aplicarMascara = (valor, patron) => {
    const limpio = valor.replace(/\D/g, "");
    let res = "";
    let i = 0;

    for (const char of patron) {
        if (i >= limpio.length) break;
        if (char === "0") {
            res += limpio[i];
            i++;
        } else {
            // Solo agrega el carácter separador si hay números después
            if (i < limpio.length) {
                res += char;
            }
        }
    }
    return res;
};
