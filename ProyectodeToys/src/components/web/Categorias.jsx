import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; 
import './categorias.css'
const Categorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [showSearchModal, setShowSearchModal] = useState(false);


    const cargarCategorias = async () => {
        await fetch('https://api-progra-h9esdegcdzeebjd4.eastus2-01.azurewebsites.net/categoria')
            .then(response => response.json())
            .then(data => setCategorias(data))
    }
    useEffect(() => {
        cargarCategorias();
    }, [])

    return (
        <>


            <div id="categorias" style={{ padding: "20px" }}>
                <h2>Categorías</h2>
                <div className="categorias-grid">
                    {categorias.map((categoria, index) => (
                        <div key={index} className="categoria-item">
                            <a href={`/categorias/${categoria.nombre}`}>{categoria.nombre}</a>

                            {/* Reemplaza `nombre` con la propiedad que uses */}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Categorias;