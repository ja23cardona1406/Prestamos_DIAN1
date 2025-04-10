import React, { useState, useEffect } from 'react';
import { Plus, Search, Laptop, Printer, Monitor, X, Edit2, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { fetchEquipment, createEquipment, updateEquipment } from '../lib/supabase';
import type { Equipment, EquipmentType, EquipmentStatus } from '../types';

export function Inventory() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    try {
      setLoading(true);
      const data = await fetchEquipment();
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el inventario');
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (eq: Equipment) => {
    setEditingEquipment(eq);
    setIsModalOpen(true);
  };

  const handleImageClick = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setIsImageModalOpen(true);
  };

  const filteredEquipment = equipment.filter(eq =>
    eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    eq.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedEquipment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Inventario de Equipos</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Equipo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md">
                Total: {equipment.length}
              </div>
              <div className="px-4 py-2 bg-green-50 text-green-600 rounded-md">
                Disponibles: {equipment.filter(eq => eq.status === 'available').length}
              </div>
              <div className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-md">
                En préstamo: {equipment.filter(eq => eq.status === 'loaned').length}
              </div>
              <div className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md">
                Inactivos: {equipment.filter(eq => eq.status === 'inactive').length}
              </div>
            </div>
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por modelo, serial o tipo..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo con No Serial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Placa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Actualización
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {eq.type === 'laptop' ? (
                          <Laptop className="h-5 w-5 text-gray-500 mr-2" />
                        ) : eq.type === 'printer' ? (
                          <Printer className="h-5 w-5 text-gray-500 mr-2" />
                        ) : (
                          <Monitor className="h-5 w-5 text-gray-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-900 capitalize">{eq.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {eq.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {eq.serial_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EquipmentStatus status={eq.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(eq.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(eq)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleImageClick(eq)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Ver imágenes"
                        >
                          <Image className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EquipmentModal
          onClose={closeModal}
          onSubmit={async (equipmentData) => {
            try {
              if (editingEquipment) {
                await updateEquipment(editingEquipment.id, equipmentData);
              } else {
                await createEquipment(equipmentData);
              }
              await loadEquipment();
              closeModal();
            } catch (err) {
              console.error('Error saving equipment:', err);
              setError('Error al guardar el equipo');
            }
          }}
          equipment={editingEquipment}
        />
      )}

      {isImageModalOpen && selectedEquipment && (
        <ImageModal
          equipment={selectedEquipment}
          onClose={closeImageModal}
        />
      )}
    </div>
  );
}

function ImageModal({ 
  equipment,
  onClose
}: {
  equipment: Equipment;
  onClose: () => void;
}) {
  if (!equipment.imagenes?.length) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Imágenes de {equipment.model}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-8 text-gray-500">
            No hay imágenes disponibles para este equipo
          </div>
        </div>
      </div>
    );
  }

  if (equipment.imagenes.length === 1) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Imagen de {equipment.model}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="relative aspect-video">
            <img
              src={equipment.imagenes[0]}
              alt={`${equipment.model}`}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Imágenes de {equipment.model}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            pagination={{ clickable: true }}
            className="w-full aspect-video"
          >
            {equipment.imagenes.map((imagen, index) => (
              <SwiperSlide key={index}>
                <img
                  src={imagen}
                  alt={`${equipment.model} - Imagen ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <button className="swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md">
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button className="swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-md">
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EquipmentModal({ 
  onClose, 
  onSubmit,
  equipment
}: { 
  onClose: () => void;
  onSubmit: (equipmentData: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  equipment?: Equipment | null;
}) {
  const [formData, setFormData] = useState({
    type: (equipment?.type || 'laptop') as EquipmentType,
    model: equipment?.model || '',
    serial_number: equipment?.serial_number || '',
    status: (equipment?.status || 'available') as EquipmentStatus,
    imagenes: equipment?.imagenes || []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {equipment ? 'Editar Equipo' : 'Nuevo Equipo'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.type}
              onChange={e => setFormData(prev => ({ 
                ...prev, 
                type: e.target.value as EquipmentType
              }))}
              disabled={!!equipment}
            >
              <option value="laptop">Laptop</option>
              <option value="printer">Impresora</option>
              <option value="desktop">Computador de mesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo con No Serial</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.model}
              onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Placa</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.serial_number}
              onChange={e => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as EquipmentStatus }))}
            >
              <option value="available">Disponible</option>
              <option value="maintenance">En mantenimiento</option>
              <option value="lost">Extraviado</option>
              <option value="damaged">Dañado</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {equipment ? 'Guardar Cambios' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EquipmentStatus({ status }: { status: Equipment['status'] }) {
  const statusConfig = {
    available: {
      className: 'bg-green-100 text-green-800',
      text: 'Disponible'
    },
    loaned: {
      className: 'bg-yellow-100 text-yellow-800',
      text: 'En préstamo'
    },
    maintenance: {
      className: 'bg-blue-100 text-blue-800',
      text: 'En mantenimiento'
    },
    lost: {
      className: 'bg-red-100 text-red-800',
      text: 'Extraviado'
    },
    damaged: {
      className: 'bg-red-100 text-red-800',
      text: 'Dañado'
    },
    inactive: {
      className: 'bg-purple-100 text-purple-800',
      text: 'Inactivo'
    },
    unavailable: {
      className: 'bg-gray-100 text-gray-800',
      text: 'No disponible'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.text}
    </span>
  );
}

export default Inventory;