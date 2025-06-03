import {  XMarkIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../../components/common/ThemeContext"; // ajuste según tu estructura

const AgregarVehiculo = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [vehiculo, setVehiculo] = useState({
    marca: "",
    modelo: "",
    anio: "",
    placa: "",
    color: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  ///marcar aceptadas
  const marcas = ["Toyota", "Honda", "Ford", "Nissan", "BMW", "Volkswagen"];

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const url = `${API_URL}/client/${userId}/vehicle`;

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  // Para la placa, aplicamos upper y el formato especial
  if (name === "placa") {
    let newValue = value.toUpperCase();

    // Permitir solo letras, números y guion
    newValue = newValue.replace(/[^A-Z0-9-]/g, "");

    // Evitar guiones dobles consecutivos
    newValue = newValue.replace(/-+/g, "-");

    // Separar por guiones para trabajar con los grupos
    const parts = newValue.split("-");

    parts[0] = parts[0].slice(0, 3);
    if (parts.length > 1) parts[1] = parts[1].slice(0, 3);
    if (parts.length > 2) parts[2] = parts[2].slice(0, 2);

    // Armar el valor según la lógica
    if (newValue.length > 3) {
      if (newValue[3] !== "-") {
        newValue = parts[0] + "-" + (parts[1] || "");
      } else {
        newValue = parts[0] + "-" + (parts[1] || "");
      }

      if ((parts[1]?.length ?? 0) === 2) {
        if (newValue.length > 5 && newValue[6] !== "-") {
          newValue = newValue.slice(0, 6) + "-" + (parts[2] || "");
        } else if (parts.length > 2) {
          newValue = newValue.slice(0, 6) + "-" + parts[2];
        }
      } else if (parts.length > 2) {
        newValue = parts.slice(0, 3).join("-");
      }
    } else {
      newValue = parts[0];
    }

    const hyphenCount = (newValue.match(/-/g) || []).length;
    if (hyphenCount > 2) {
      const firstTwoHyphensIndex = nthIndex(newValue, "-", 2);
      newValue = newValue.slice(0, firstTwoHyphensIndex) + newValue.slice(firstTwoHyphensIndex).replace(/-/g, "");
    }

    setVehiculo(prev => ({
      ...prev,
      [name]: newValue,
    }));
    return;
  }

  // Para los demás campos (como marca), deja el valor tal cual
  setVehiculo(prev => ({
    ...prev,
    [name]: value,
  }));
};


// Función para obtener la posición del enésimo guion
function nthIndex(str: string, pat: string, n: number): number {
  const L = str.length, i = -1;
  let idx = i;
  while (n-- && idx++ < L) {
    idx = str.indexOf(pat, idx);
    if (idx < 0) break;
  }
  return idx;
}

  const validateForm = () => {
    if (
      !vehiculo.marca ||
      !vehiculo.modelo ||
      !vehiculo.anio ||
      !vehiculo.placa ||
      !vehiculo.color
    ) {
      toast.error("Por favor, completa todos los campos.");
      return false;
    }

    if (vehiculo.anio.length !== 4 || isNaN(Number(vehiculo.anio))) {
      /// como estamos en el 2025  no debe ser menor a 4 y no creo que el sistema funcionne en el 10000 para ponerlo mayor que 4
      toast.error("Ingrese un año verdadero.");
      return false;
    }

    return true;
  };

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowModal(true);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehiculo),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        toast.error("No se pudo registrar el vehículo. Intenta más tarde.");
        setShowModal(false);
        return;
      }

      const data = await response.json();
      toast.success("Vehículo registrado correctamente");
      setVehiculo({
        marca: "",
        modelo: "",
        anio: "",
        placa: "",
        color: "",
      });
      console.log("Vehículo agregado:", data.vehicle);
      setShowModal(false);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error("Hubo un error al registrar el vehículo.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const { darkMode } = useTheme();

  return (
<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 dark:bg-gray-900">
  <ToastContainer
    position="top-right"
    autoClose={1500}
    theme={darkMode ? "dark" : "light"}
    toastClassName="rounded-md shadow-lg"
  />
  <div className="max-w-2xl mx-auto">
    {/* Encabezado */}
    <div className="text-center mb-8">
      <div className="flex items-center justify-center">
        <svg className="w-8 h-8 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-200">
          Registrar Nuevo Vehículo
        </h2>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Complete todos los campos requeridos
      </p>
    </div>

    {/* Tarjeta del formulario */}
    <div className="bg-white shadow-xl rounded-xl overflow-hidden dark:bg-gray-800">
      <div className="p-6 sm:p-8">
        <form onSubmit={handleOpenModal} className="space-y-6">
          {/* Campo Marca */}
          <div className="space-y-2">
            <label
              htmlFor="marca"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Marca del vehículo <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <select
                id="marca"
                name="marca"
                value={vehiculo.marca}
                onChange={handleChange}
                className="block w-full pl-10 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition dark:bg-gray-700 dark:border-gray-700"
                required
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca.toLowerCase()}>
                    {marca}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              </div>
            </div>
          </div>

          {/* Campo Modelo */}
          <div className="space-y-2">
            <label
              htmlFor="modelo"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              Modelo <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={vehiculo.modelo}
                onChange={handleChange}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-700"
                placeholder="Ej. Corolla, Civic, etc."
                required
              />
            </div>
          </div>

          {/* Grupo Año y Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campo Año */}
            <div className="space-y-2">
              <label
                htmlFor="anio"
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Año <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="number"
                  id="anio"
                  name="anio"
                  value={vehiculo.anio}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-700"
                  required
                  placeholder="2025"
                />
              </div>
            </div>

            {/* Campo Color */}
            <div className="space-y-2">
              <label
                htmlFor="color"
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Color <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={vehiculo.color}
                  onChange={handleChange}
                  className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-700"
                  placeholder="Ej. Rojo, Azul, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Campo Placa */}
          <div className="space-y-2">
            <label
              htmlFor="placa"
              className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Placa <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <input
                type="text"
                id="placa"
                name="placa"
                value={vehiculo.placa}
                onChange={handleChange}
                className="block w-full pl-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition uppercase dark:bg-gray-700 dark:border-gray-700"
                placeholder="Ej. ABC-123"
                required
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row-reverse justify-between gap-4 pt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Registrar Vehículo
            </button>
            <Link
              to="/client/perfil"
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition dark:bg-gray-500 dark:border-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>

    {/* Modal de Confirmación */}
    {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4 ">
              <div className="flex items-center  ">
                <svg className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Confirmar Registro
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Por favor verifique que los datos del vehículo sean correctos:
              </p>

              <div className="bg-gray-50 p-4 border-gray-50 rounded-lg dark:bg-gray-800 ">
                <div className="grid grid-cols-2 gap-4 ">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Marca</p>
                      <p className="font-medium">{vehiculo.marca}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Modelo</p>
                      <p className="font-medium">{vehiculo.modelo}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Año</p>
                      <p className="font-medium">{vehiculo.anio}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Color</p>
                      <p className="font-medium">{vehiculo.color}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Placa</p>
                      <p className="font-medium uppercase">{vehiculo.placa}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Corregir
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
  );
};

export default AgregarVehiculo;
