/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  History, 
  Save, 
  Printer, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Search, 
  FileText, 
  X, 
  RotateCcw,
  Plus
} from 'lucide-react';

interface SoapRecord {
  id: string;
  savedAt: string;
  fecha: string;
  nombreCompleto: string;
  edad: string;
  fechaNacimiento: string;
  ocupacion: string;
  telefono: string;
  correo: string;
  motivoConsulta: string;
  opqrst_o: string;
  opqrst_p: string;
  opqrst_q: string;
  opqrst_r: string;
  nprs_act: string;
  nprs_peor: string;
  nprs_prom: string;
  opqrst_t: string;
  antecedentes: string;
  medicamentos: string;
  objetivosPaciente: string;
  inspeccionPostural: string;
  palpacion: string;
  romCervical: string;
  romLumbar: string;
  spurling: string; // '+' | '-' | ''
  spurling_text: string;
  slr: string;      // '+' | '-' | ''
  slr_text: string;
  kemp: string;     // '+' | '-' | ''
  kemp_text: string;
  patrick: string;  // '+' | '-' | ''
  patrick_text: string;
  otrosOrtopedicos: string;
  reflejos: string;
  dermatomas: string;
  miotomas: string;
  diagnostico: string;
  frecuenciaDuracion: string;
  tratamientoAjuste: boolean;
  tratamientoAjusteZonas: string;
  tratamientoMasaje: boolean;
  tratamientoEstiramientos: boolean;
  tratamientoHieloCalor: boolean;
  recomendacionesCasa: string;
  objetivosTratamiento: string;
  proximaCita: string;
}

const initialFormState: SoapRecord = {
  id: '',
  savedAt: '',
  fecha: new Date().toISOString().split('T')[0],
  nombreCompleto: '',
  edad: '',
  fechaNacimiento: '',
  ocupacion: '',
  telefono: '',
  correo: '',
  motivoConsulta: '',
  opqrst_o: '',
  opqrst_p: '',
  opqrst_q: '',
  opqrst_r: '',
  nprs_act: '',
  nprs_peor: '',
  nprs_prom: '',
  opqrst_t: '',
  antecedentes: '',
  medicamentos: '',
  objetivosPaciente: '',
  inspeccionPostural: '',
  palpacion: '',
  romCervical: '',
  romLumbar: '',
  spurling: '',
  spurling_text: '',
  slr: '',
  slr_text: '',
  kemp: '',
  kemp_text: '',
  patrick: '',
  patrick_text: '',
  otrosOrtopedicos: '',
  reflejos: '',
  dermatomas: '',
  miotomas: '',
  diagnostico: '',
  frecuenciaDuracion: '',
  tratamientoAjuste: false,
  tratamientoAjusteZonas: '',
  tratamientoMasaje: false,
  tratamientoEstiramientos: false,
  tratamientoHieloCalor: false,
  recomendacionesCasa: '',
  objetivosTratamiento: '',
  proximaCita: ''
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'form' | 'history'>('form');
  const [formData, setFormData] = useState<SoapRecord>(initialFormState);
  const [records, setRecords] = useState<SoapRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load records and draft on mount
  useEffect(() => {
    const storedRecords = localStorage.getItem('quiro_records');
    if (storedRecords) {
      try {
        setRecords(JSON.parse(storedRecords));
      } catch (e) {
        console.error('Error loading records', e);
      }
    }

    const draft = localStorage.getItem('quiro_active_draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft && parsedDraft.id === '') { // Only load if we are not editing an active record
          setFormData(parsedDraft);
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, []);

  // Show notification utility
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Auto-save active draft to localStorage
  useEffect(() => {
    if (formData.id === '') { // Only auto-save as temporary draft if not locked to an edited record
      localStorage.setItem('quiro_active_draft', JSON.stringify(formData));
    }
  }, [formData]);

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: keyof SoapRecord) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name] as any
    }));
  };

  const handleRadioChange = (name: keyof SoapRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetForm = () => {
    if (confirm('¿Estás seguro de que quieres limpiar todo el formulario? Se guardará un borrador nuevo vacío.')) {
      setFormData(initialFormState);
      localStorage.removeItem('quiro_active_draft');
      showNotification('info', 'Formulario limpiado e inicializado');
    }
  };

  const handleSaveRecord = () => {
    if (!formData.nombreCompleto.trim()) {
      showNotification('error', 'El nombre completo del paciente es obligatorio.');
      return;
    }

    let updatedRecords = [...records];
    let message = '';

    if (formData.id) {
      // Edit existing record
      updatedRecords = records.map(r => 
        r.id === formData.id 
          ? { ...formData, savedAt: new Date().toLocaleString('es-MX') } 
          : r
      );
      message = 'Expediente clínico actualizado con éxito.';
    } else {
      // Create new record
      const newRecord: SoapRecord = {
        ...formData,
        id: 'REQ_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        savedAt: new Date().toLocaleString('es-MX')
      };
      updatedRecords = [newRecord, ...records];
      message = 'Expediente clínico guardado con éxito.';
      // Reset active form
      setFormData(newRecord); // sync computed ID so they can print immediately
    }

    setRecords(updatedRecords);
    localStorage.setItem('quiro_records', JSON.stringify(updatedRecords));
    // Clear active draft limit
    localStorage.removeItem('quiro_active_draft');
    showNotification('success', message);
  };

  const handleEditRecord = (record: SoapRecord) => {
    setFormData(record);
    setCurrentTab('form');
    showNotification('info', `Expediente de ${record.nombreCompleto} cargado para edición`);
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar permanentemente este expediente? Esta acción no se puede deshacer.')) {
      const filtered = records.filter(r => r.id !== id);
      setRecords(filtered);
      localStorage.setItem('quiro_records', JSON.stringify(filtered));
      showNotification('success', 'Expediente eliminado con éxito');
      
      if (formData.id === id) {
        setFormData(initialFormState);
      }
    }
  };

  const handlePrint = () => {
    if (!formData.nombreCompleto.trim()) {
      if (!confirm('El expediente no tiene el nombre del paciente. ¿Deseas imprimir de todos modos?')) {
        return;
      }
    }
    window.print();
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Backup_QuiroSalud_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('success', 'Copia de seguridad descargada con éxito.');
  };

  // Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            const merged = [...parsed, ...records].reduce((acc: SoapRecord[], current) => {
              const x = acc.find(item => item.id === current.id);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            }, []);
            setRecords(merged);
            localStorage.setItem('quiro_records', JSON.stringify(merged));
            showNotification('success', `Se han importado ${parsed.length} expedientes clínicos con éxito.`);
          } else {
            showNotification('error', 'El archivo cargado no contiene un formato de historial de Quiro Salud válido.');
          }
        } catch (error) {
          showNotification('error', 'Ocurrió un error al analizar el archivo de copia de seguridad.');
        }
      };
    }
  };

  // Trigger file selection input
  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  const filteredRecords = records.filter(r => 
    r.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fecha.includes(searchTerm)
  );

  return (
    <div className="min-h-screen pb-24 print:pb-0 bg-slate-200 text-slate-900 font-sans">
      
      {/* Notificación Flotante */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] max-w-md p-4 rounded-xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform scale-100 ${
          notification.type === 'success' ? 'bg-[#76a734] text-white' : 
          notification.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#002147] text-white'
        } print:hidden`}>
          <div className="font-semibold text-sm">{notification.message}</div>
          <button onClick={() => setNotification(null)} className="ml-auto hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Fijo */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[#002147] p-4 shadow-md text-white print:hidden">
        <div>
          <h1 className="text-lg font-bold uppercase tracking-wider">Quiro Salud CDMX</h1>
          <p className="text-[10px] font-mono opacity-80 uppercase">Modo de Almacenamiento Seguro (localStorage)</p>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handlePrint}
            title="Imprimir / Exportar PDF"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#b59410] hover:bg-[#9d800d] text-white text-xs font-semibold uppercase transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </button>
          <img 
            src="1000206529.png" 
            alt="Logo" 
            className="h-12 w-12 rounded-full border-2 border-[#b59410] bg-white p-1 object-contain" 
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl p-4 print:hidden">
        
        {/* Navigation Indicator Bar */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-300">
          <div>
            <h2 className="text-xl font-bold text-[#002147] uppercase">
              {currentTab === 'form' ? 'HISTORIAL CLÍNICO INICIAL (SOAP)' : 'CONTROL DE EXPEDIENTES'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentTab === 'form' 
                ? (formData.id ? `Editando expediente de paciente registrado (ID: ${formData.id})` : 'Ingresando datos en borrador activo. Se auto-guarda localmente.')
                : `Tienes ${records.length} expedientes almacenados de forma segura en este navegador Chrome.`
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {currentTab === 'form' && (
              <>
                {formData.id && (
                  <button 
                    onClick={() => {
                      if (confirm('¿Deseas volver a crear un nuevo expediente vacío?')) {
                        setFormData(initialFormState);
                        showNotification('info', 'Creando nuevo registro en blanco');
                      }
                    }}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold uppercase rounded-lg text-white bg-[#002147] hover:bg-[#001733] border border-slate-300 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Nuevo</span>
                  </button>
                )}
                <button 
                  onClick={handleResetForm}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-1 px-3 py-2 text-xs font-bold uppercase rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                  title="Limpiar campos a blanco"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Limpiar</span>
                </button>
              </>
            )}
            
            {currentTab === 'history' && (
              <>
                <button 
                  onClick={handleExportBackup}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold uppercase rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                  title="Exportar base de datos a un archivo local de respaldo"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Exportar Copia (.json)</span>
                </button>
                <button 
                  onClick={triggerImportFile}
                  className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 text-xs font-bold uppercase rounded-lg bg-teal-700 hover:bg-teal-800 text-white transition-colors"
                  title="Restaurar de un respaldo previamente exportado"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importar Copia</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportBackup} 
                  accept=".json" 
                  className="hidden" 
                />
              </>
            )}
          </div>
        </div>

        {/* Tab Form */}
        {currentTab === 'form' && (
          <div className="space-y-6">
            
            {/* Datos Generales */}
            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#b59410] border-x border-b border-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="label-class">Fecha de la Consulta:</label>
                  <input 
                    type="date" 
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="input-class" 
                  />
                </div>
              </div>

              <h2 className="section-title">DATOS DEL PACIENTE</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-class">Nombre Completo del Paciente:</label>
                  <input 
                    type="text" 
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleInputChange}
                    className="input-class font-medium" 
                    placeholder="Nombre Apellido Paterno Apellido Materno" 
                  />
                </div>
                <div>
                  <label className="label-class">Edad:</label>
                  <input 
                    type="text" 
                    name="edad"
                    value={formData.edad}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Ej: 35" 
                  />
                </div>
                <div>
                  <label className="label-class">Fecha de Nacimiento:</label>
                  <input 
                    type="date" 
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className="input-class" 
                  />
                </div>
                <div>
                  <label className="label-class">Ocupación:</label>
                  <input 
                    type="text" 
                    name="ocupacion"
                    value={formData.ocupacion}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Ej: Ingeniero, Estudiante" 
                  />
                </div>
                <div>
                  <label className="label-class">Teléfono:</label>
                  <input 
                    type="tel" 
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Ej: 55 1234 5678" 
                  />
                </div>
                <div>
                  <label className="label-class">Correo Electrónico:</label>
                  <input 
                    type="email" 
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="ejemplo@dominio.com" 
                  />
                </div>
              </div>
            </div>

            {/* S (Subjetivo) */}
            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#b59410] border-x border-b border-slate-300">
              <h2 className="section-title">S (Subjetivo) - Lo que el Paciente Refiere</h2>
              
              <h3 className="sub-section-title">1. Motivo Principal de Consulta:</h3>
              <span className="sub-text">(¿Qué te trae por aquí hoy?)</span>
              <textarea 
                name="motivoConsulta"
                value={formData.motivoConsulta}
                onChange={handleInputChange}
                className="input-class h-20" 
                placeholder="Dolor de espalda baja, dolor de cuello, ciática, etc."
              ></textarea>

              <h3 className="sub-section-title">2. Historia del Padecimiento Actual (OPQRST):</h3>
              <div className="space-y-4 pl-2 border-l-2 border-slate-100 ml-1">
                <div>
                  <label className="label-class">**O (Onset/Inicio):** ¿Cuándo empezó? ¿Cómo empezó? (Súbito/Gradual)</label>
                  <input 
                    type="text" 
                    name="opqrst_o"
                    value={formData.opqrst_o}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Fecha de inicio, súbito o gradual" 
                  />
                </div>
                <div>
                  <label className="label-class">**P (Provocación/Paliación):** ¿Qué actividades lo empeoran? ¿Qué actividades o posturas lo alivian?</label>
                  <textarea 
                    name="opqrst_p"
                    value={formData.opqrst_p}
                    onChange={handleInputChange}
                    className="input-class h-16" 
                    placeholder="Ej: Empeora al estar sentado, mejora con el reposo"
                  ></textarea>
                </div>
                <div>
                  <label className="label-class">**Q (Quality/Calidad):** Describe el dolor (Punzante, sordo, ardor, calambre, etc.):</label>
                  <input 
                    type="text" 
                    name="opqrst_q"
                    value={formData.opqrst_q}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Ej: Punzante, sordo, quemante" 
                  />
                </div>
                <div>
                  <label className="label-class">**R (Radiation/Irradiación):** ¿El dolor se mueve o viaja a otra parte? (Sí/No) ¿A dónde?</label>
                  <input 
                    type="text" 
                    name="opqrst_r"
                    value={formData.opqrst_r}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Ej: Sí, hacia la pierna derecha" 
                  />
                </div>
                
                <div className="pt-2">
                  <label className="label-class">**S (Severity/Severidad) - NPRS:**</label>
                  <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mt-2 space-y-4">
                    
                    {/* NPRS Actual */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-48 text-sm font-medium text-slate-700">Dolor Actual:</span>
                      <div className="nprs-container">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <label key={`act-${num}`} className="nprs-item">
                            <span>{num}</span>
                            <input 
                              type="radio" 
                              name="nprs_act" 
                              value={num}
                              checked={formData.nprs_act === num.toString()}
                              onChange={() => handleRadioChange('nprs_act', num.toString())}
                              className="radio-btn" 
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* NPRS Peor */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-48 text-sm font-medium text-slate-700">Peor Dolor (última semana):</span>
                      <div className="nprs-container">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <label key={`peor-${num}`} className="nprs-item">
                            <span>{num}</span>
                            <input 
                              type="radio" 
                              name="nprs_peor" 
                              value={num}
                              checked={formData.nprs_peor === num.toString()}
                              onChange={() => handleRadioChange('nprs_peor', num.toString())}
                              className="radio-btn" 
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* NPRS Promedio */}
                    <div className="flex flex-col md:flex-row md:items-center">
                      <span className="w-48 text-sm font-medium text-slate-700">Dolor Promedio:</span>
                      <div className="nprs-container">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <label key={`prom-${num}`} className="nprs-item">
                            <span>{num}</span>
                            <input 
                              type="radio" 
                              name="nprs_prom" 
                              value={num}
                              checked={formData.nprs_prom === num.toString()}
                              onChange={() => handleRadioChange('nprs_prom', num.toString())}
                              className="radio-btn" 
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                <div>
                  <label className="label-class">**T (Timing/Temporalidad):** ¿Es constante o intermitente? ¿En qué momento del día es peor? (Mañana/Tarde/Noche)</label>
                  <input 
                    type="text" 
                    name="opqrst_t"
                    value={formData.opqrst_t}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Constante/Intermitente, Mañana/Tarde/Noche" 
                  />
                </div>
              </div>

              <h3 className="sub-section-title">3. Antecedentes Personales Patológicos:</h3>
              <span className="sub-text">(Cirugías, fracturas, accidentes, hospitalizaciones, enfermedades crónicas como Diabetes/Hipertensión, etc.)</span>
              <textarea 
                name="antecedentes"
                value={formData.antecedentes}
                onChange={handleInputChange}
                className="input-class h-20" 
                placeholder="Describa cualquier antecedente médico relevante."
              ></textarea>

              <h3 className="sub-section-title">4. Medicamentos Actuales:</h3>
              <input 
                type="text" 
                name="medicamentos"
                value={formData.medicamentos}
                onChange={handleInputChange}
                className="input-class" 
                placeholder="Liste los medicamentos que toma actualmente" 
              />

              <h3 className="sub-section-title">5. Objetivos del Paciente:</h3>
              <span className="sub-text">(¿Qué te gustaría lograr con el tratamiento? ¿Qué actividad deseas volver a hacer sin dolor?)</span>
              <textarea 
                name="objetivosPaciente"
                value={formData.objetivosPaciente}
                onChange={handleInputChange}
                className="input-class h-20" 
                placeholder="Ej: Eliminar el dolor de espalda, poder levantar a mis hijos sin molestias."
              ></textarea>
            </div>

            {/* O (Objetivo) */}
            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#b59410] border-x border-b border-slate-300">
              <h2 className="section-title">O (Objetivo) - Hallazgos del Examen Físico</h2>
              
              <h3 className="sub-section-title">1. Inspección Postural:</h3>
              <span className="sub-text">(Vista anterior, posterior y lateral. Describir desequilibrios: protracción de cabeza, hombros redondeados, inclinación pélvica, etc.)</span>
              <textarea 
                name="inspeccionPostural"
                value={formData.inspeccionPostural}
                onChange={handleInputChange}
                className="input-class h-20" 
                placeholder="Describa hallazgos posturales aquí."
              ></textarea>
              
              <h3 className="sub-section-title">2. Palpación:</h3>
              <span className="sub-text">(Describir hallazgos: espasmos musculares, puntos gatillo, edema, inflamación, restricciones, etc. y su ubicación)</span>
              <textarea 
                name="palpacion"
                value={formData.palpacion}
                onChange={handleInputChange}
                className="input-class h-20" 
                placeholder="Describa hallazgos de palpación aquí, con ubicación."
              ></textarea>

              <h3 className="sub-section-title">3. Rangos de Movimiento (ROM):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <div>
                  <label className="label-class">**Cervical:**</label>
                  <input 
                    type="text" 
                    name="romCervical"
                    value={formData.romCervical}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Flexión [ °/N], Extensión [ °/N], Inclinación Der/Izq [ °/N], Rotación Der/Izq [ °/N]" 
                  />
                </div>
                <div>
                  <label className="label-class">**Lumbar:**</label>
                  <input 
                    type="text" 
                    name="romLumbar"
                    value={formData.romLumbar}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Flexión [ cm/N], Extensión [ °/N], Inclinación Der/Izq [ °/N]" 
                  />
                </div>
              </div>

              <h3 className="sub-section-title">4. Pruebas Ortopédicas Relevantes:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                
                {/* Spurling */}
                <div className="flex items-center">
                  <label className="w-28 text-sm font-semibold">Spurling:</label>
                  <div className="flex space-x-2 mr-3">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="spurling" 
                        checked={formData.spurling === '+'} 
                        onChange={() => handleRadioChange('spurling', '+')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(+)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="spurling" 
                        checked={formData.spurling === '-'} 
                        onChange={() => handleRadioChange('spurling', '-')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(-)</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    name="spurling_text"
                    value={formData.spurling_text}
                    onChange={handleInputChange}
                    className="input-class flex-1" 
                    placeholder="Der / Izq" 
                  />
                </div>

                {/* SLR */}
                <div className="flex items-center">
                  <label className="w-28 text-sm font-semibold">SLR:</label>
                  <div className="flex space-x-2 mr-3">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="slr" 
                        checked={formData.slr === '+'} 
                        onChange={() => handleRadioChange('slr', '+')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(+)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="slr" 
                        checked={formData.slr === '-'} 
                        onChange={() => handleRadioChange('slr', '-')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(-)</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    name="slr_text"
                    value={formData.slr_text}
                    onChange={handleInputChange}
                    className="input-class flex-1" 
                    placeholder="Der / Izq a ____°" 
                  />
                </div>

                {/* Kemp */}
                <div className="flex items-center">
                  <label className="w-28 text-sm font-semibold">Kemp:</label>
                  <div className="flex space-x-2 mr-3">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="kemp" 
                        checked={formData.kemp === '+'} 
                        onChange={() => handleRadioChange('kemp', '+')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(+)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="kemp" 
                        checked={formData.kemp === '-'} 
                        onChange={() => handleRadioChange('kemp', '-')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(-)</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    name="kemp_text"
                    value={formData.kemp_text}
                    onChange={handleInputChange}
                    className="input-class flex-1" 
                    placeholder="Der / Izq" 
                  />
                </div>

                {/* Patrick */}
                <div className="flex items-center">
                  <label className="w-28 text-sm font-semibold">Patrick (FABER):</label>
                  <div className="flex space-x-2 mr-3">
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="patrick" 
                        checked={formData.patrick === '+'} 
                        onChange={() => handleRadioChange('patrick', '+')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(+)</span>
                    </label>
                    <label className="flex items-center space-x-1 cursor-pointer">
                      <input 
                        type="radio" 
                        name="patrick" 
                        checked={formData.patrick === '-'} 
                        onChange={() => handleRadioChange('patrick', '-')}
                        className="radio-btn" 
                      />
                      <span className="text-sm">(-)</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    name="patrick_text"
                    value={formData.patrick_text}
                    onChange={handleInputChange}
                    className="input-class flex-1" 
                    placeholder="Der / Izq" 
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="label-class">Otro:</label>
                  <input 
                    type="text" 
                    name="otrosOrtopedicos"
                    value={formData.otrosOrtopedicos}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="Especifique otras pruebas ortopédicas y sus resultados" 
                  />
                </div>
              </div>

              <h3 className="sub-section-title">5. Pruebas Neurológicas:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
                <div>
                  <label className="label-class">**Reflejos:**</label>
                  <input 
                    type="text" 
                    name="reflejos"
                    value={formData.reflejos}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="C5 [ /4], C6 [ /4], C7 [ /4], L4 [ /4], S1 [ /4] (Bilateral)" 
                  />
                </div>
                <div>
                  <label className="label-class">**Dermatomas:**</label>
                  <input 
                    type="text" 
                    name="dermatomas"
                    value={formData.dermatomas}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="(Normal / Anormal) Zonas:" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-class">**Miotomas:**</label>
                  <input 
                    type="text" 
                    name="miotomas"
                    value={formData.miotomas}
                    onChange={handleInputChange}
                    className="input-class" 
                    placeholder="(5/5 o describir debilidad) Zonas:" 
                  />
                </div>
              </div>
            </div>

            {/* A y P */}
            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#b59410] border-x border-b border-slate-300">
              <h2 className="section-title">A (Análisis) - Diagnóstico Quiropráctico</h2>
              <span className="sub-text">(Basado en S y O, este es tu diagnóstico clínico)</span>
              <textarea 
                name="diagnostico"
                value={formData.diagnostico}
                onChange={handleInputChange}
                className="input-class h-24" 
                placeholder="Escriba aquí el diagnóstico clínico."
              ></textarea>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#b59410] border-x border-b border-slate-300">
              <h2 className="section-title">P (Plan) - Plan de Tratamiento</h2>
              
              <h3 className="sub-section-title">1. Frecuencia y Duración Propuesta:</h3>
              <input 
                type="text" 
                name="frecuenciaDuracion"
                value={formData.frecuenciaDuracion}
                onChange={handleInputChange}
                className="input-class" 
                placeholder="Ej: 3 visitas por semana durante 4 semanas" 
              />
              
              <h3 className="sub-section-title">2. Tipo de Tratamiento:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2 mb-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                <div className="flex flex-col">
                  <label className="flex items-center space-x-2 cursor-pointer mb-2">
                    <input 
                      type="checkbox" 
                      checked={formData.tratamientoAjuste}
                      onChange={() => handleCheckboxChange('tratamientoAjuste')}
                      className="w-4 h-4 accent-[#002147]" 
                    />
                    <span className="text-sm font-medium">Ajuste Quiropráctico Específico</span>
                  </label>
                  <input 
                    type="text" 
                    name="tratamientoAjusteZonas"
                    value={formData.tratamientoAjusteZonas}
                    onChange={handleInputChange}
                    disabled={!formData.tratamientoAjuste}
                    className="input-class ml-6 w-[calc(100%-1.5rem)] disabled:opacity-40" 
                    placeholder={formData.tratamientoAjuste ? "Zonas a ajustar:" : "Habilita la casilla anterior primero"} 
                  />
                </div>
                <div className="flex flex-col space-y-3 justify-start mt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.tratamientoMasaje}
                      onChange={() => handleCheckboxChange('tratamientoMasaje')}
                      className="w-4 h-4 accent-[#002147]" 
                    />
                    <span className="text-sm font-medium">Masaje Terapéutico / Liberación de Tejido Blando</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.tratamientoEstiramientos}
                      onChange={() => handleCheckboxChange('tratamientoEstiramientos')}
                      className="w-4 h-4 accent-[#002147]" 
                    />
                    <span className="text-sm font-medium">Estiramientos Asistidos</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.tratamientoHieloCalor}
                      onChange={() => handleCheckboxChange('tratamientoHieloCalor')}
                      className="w-4 h-4 accent-[#002147]" 
                    />
                    <span className="text-sm font-medium">Aplicación de Hielo / Calor</span>
                  </label>
                </div>
              </div>

              <h3 className="sub-section-title">3. Recomendaciones en Casa:</h3>
              <textarea 
                name="recomendacionesCasa"
                value={formData.recomendacionesCasa}
                onChange={handleInputChange}
                className="input-class h-16" 
                placeholder="Ej: Ejercicios específicos, cambios posturales, hidratación."
              ></textarea>

              <h3 className="sub-section-title">4. Objetivos del Tratamiento:</h3>
              <textarea 
                name="objetivosTratamiento"
                value={formData.objetivosTratamiento}
                onChange={handleInputChange}
                className="input-class h-16" 
                placeholder="Ej: Reducción del dolor al 0/10, restaurar rango de movimiento."
              ></textarea>

              <h3 className="sub-section-title">5. Próxima Cita / Reevaluación:</h3>
              <input 
                type="date" 
                name="proximaCita"
                value={formData.proximaCita}
                onChange={handleInputChange}
                className="input-class md:w-1/2" 
              />
            </div>

            {/* Guardar Expediente Fila de Botones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleSaveRecord}
                className="flex items-center justify-center space-x-2 rounded-xl bg-[#76a734] hover:bg-[#65912c] py-4 text-white font-bold uppercase tracking-widest shadow-md border border-[#5d8528] transition-all duration-200"
              >
                <Save className="h-5 w-5" />
                <span>{formData.id ? 'Guardar Cambios' : 'Guardar en Expediente'}</span>
              </button>
              
              <button 
                onClick={handlePrint}
                className="flex items-center justify-center space-x-2 rounded-xl bg-[#002147] hover:bg-[#001733] py-4 text-white font-bold uppercase tracking-widest shadow-md border border-slate-700 transition-all duration-200"
              >
                <Printer className="h-5 w-5" />
                <span>Imprimir / Descargar PDF</span>
              </button>
            </div>
            
          </div>
        )}

        {/* Tab History / Consultas */}
        {currentTab === 'history' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-md border-t-4 border-[#002147] border-x border-b border-slate-300">
              
              {/* Search Bar */}
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-class pl-10" 
                  placeholder="Buscar por Nombre de Paciente, Diagnóstico, Fecha o ID..." 
                />
              </div>

              {records.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-md font-semibold">No hay expedientes clínicos guardados todavía.</p>
                  <p className="text-xs text-slate-400 mt-1">Los registros que guardes haciendo clic en "Guardar en Expediente" aparecerán en esta lista.</p>
                  <button 
                    onClick={() => setCurrentTab('form')}
                    className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-[#76a734] text-white font-bold text-xs uppercase rounded-lg shadow-md hover:bg-[#65912c]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Crear Nuevo SOAP</span>
                  </button>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-md font-semibold">No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-xs text-slate-400 mt-1">Prueba con palabras clave o términos médicos.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-[#002147] text-white">
                      <tr>
                        <th className="px-4 py-3 font-semibold uppercase text-xs">Paciente / ID</th>
                        <th className="px-4 py-3 font-semibold uppercase text-xs">Fecha Consulta</th>
                        <th className="px-4 py-3 font-semibold uppercase text-xs">Diagnóstico (A)</th>
                        <th className="px-4 py-3 font-semibold uppercase text-xs text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRecords.map((r) => (
                        <tr 
                          key={r.id} 
                          onClick={() => handleEditRecord(r)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors duration-150"
                        >
                          <td className="px-4 py-4">
                            <div className="font-bold text-slate-900 group-hover:text-[#002147]">{r.nombreCompleto}</div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{r.id}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                            <div className="font-medium">{r.fecha}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Editado: {r.savedAt}</div>
                          </td>
                          <td className="px-4 py-4 text-slate-600 max-w-xs truncate">
                            {r.diagnostico ? (
                              <p className="truncate" title={r.diagnostico}>{r.diagnostico}</p>
                            ) : (
                              <span className="italic text-slate-400 text-xs">Sin diagnóstico redactado</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end space-x-1.5">
                              <button 
                                onClick={() => handleEditRecord(r)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300"
                                title="Editar consulta"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setFormData(r);
                                  setTimeout(() => window.print(), 100);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-[#b59410]/20 text-[#b59410] rounded-lg border border-slate-300"
                                title="Generar PDF"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => handleDeleteRecord(r.id, e)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200"
                                title="Eliminar registro"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Nav Inferior */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-300 bg-white shadow-xl px-2 print:hidden">
        <button 
          onClick={() => setCurrentTab('form')}
          className={`flex flex-1 flex-col items-center py-2 transition-colors ${currentTab === 'form' ? 'text-[#002147]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">Nuevo SOAP</span>
        </button>
        <button 
          onClick={() => setCurrentTab('history')}
          className={`flex flex-1 flex-col items-center py-2 transition-colors ${currentTab === 'history' ? 'text-[#002147]' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="relative">
            <History className="h-5 w-5" />
            {records.length > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#76a734] text-[9px] font-bold text-white">
                {records.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase mt-1 tracking-wider">Historial</span>
        </button>
      </nav>

      {/* ========================================== */}
      {/* SECCIÓN OCULTA OPTIMIZADA PARA IMPRIMIR PDF */}
      {/* ========================================== */}
      <div className="hidden print:block bg-white p-6 text-black text-[11px] leading-tight font-sans">
        
        {/* Banner de Cabecera */}
        <div className="flex justify-between items-start border-b-2 border-[#b59410] pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide text-[#002147]">Quiro Salud CDMX</h1>
            <p className="text-[8px] tracking-widest text-[#b59410] uppercase font-semibold">Cuidado Quiropráctico Profesional e Integral</p>
            <p className="text-[9px] text-slate-500 mt-1">Expediente Clínico Digital • Mod. SOAP</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">
              EXPEDIENTE ID: {formData.id || 'NUEVO_BORRADOR'}
            </div>
            <p className="text-[9px] text-slate-500 mt-1">Fecha de Emisión: {formData.fecha}</p>
          </div>
        </div>

        <h2 className="text-center font-bold text-sm text-[#002147] tracking-wider uppercase bg-slate-100 py-1.5 mb-4 rounded border border-slate-200">
          HISTORIAL CLÍNICO INICIAL
        </h2>

        {/* 1. Datos del Paciente */}
        <div className="mb-4">
          <h3 className="font-bold text-[10px] text-[#002147] uppercase border-b border-slate-200 pb-0.5 mb-2">DATOS GENERALES DEL PACIENTE</h3>
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="py-1 w-1/4 font-semibold text-slate-700">Nombre Completo:</td>
                <td className="py-1 w-1/4 border-b border-slate-200" colSpan={3}>{formData.nombreCompleto || '____________________________________________________'}</td>
              </tr>
              <tr>
                <td className="py-1 w-1/4 font-semibold text-slate-700">Edad:</td>
                <td className="py-1 w-1/4 border-b border-slate-200">{formData.edad || '______'} años</td>
                <td className="py-1 w-1/4 font-semibold text-slate-700 pl-4">Fecha Nacimiento:</td>
                <td className="py-1 w-1/4 border-b border-slate-200">{formData.fechaNacimiento || '_________________'}</td>
              </tr>
              <tr>
                <td className="py-1 w-1/4 font-semibold text-slate-700">Ocupación:</td>
                <td className="py-1 w-1/4 border-b border-slate-200">{formData.ocupacion || '_________________'}</td>
                <td className="py-1 w-1/4 font-semibold text-slate-700 pl-4">Teléfono cel:</td>
                <td className="py-1 w-1/4 border-b border-slate-200">{formData.telefono || '_________________'}</td>
              </tr>
              <tr>
                <td className="py-1 w-1/4 font-semibold text-slate-700">Correo Electrónico:</td>
                <td className="py-1 w-1/4 border-b border-slate-200" colSpan={3}>{formData.correo || '_________________'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. S (Subjetivo) */}
        <div className="mb-4">
          <h3 className="font-bold text-[10px] text-[#002147] uppercase border-b border-slate-200 pb-0.5 mb-1">S (SUBJETIVO) - MOTIVO Y PADECIMIENTO</h3>
          <div className="space-y-1">
            <p><span className="font-semibold text-slate-700">Motivo Principal de Consulta:</span> {formData.motivoConsulta || 'Sin especificar.'}</p>
            <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10px] space-y-1">
              <p className="font-semibold text-[#002147] uppercase text-[8px] tracking-wider">Historial del dolor (OPQRST):</p>
              <div className="grid grid-cols-2 gap-x-4">
                <p><span className="font-semibold">O (Inicio):</span> {formData.opqrst_o || 'N/A'}</p>
                <p><span className="font-semibold">Q (Calidad):</span> {formData.opqrst_q || 'N/A'}</p>
                <p><span className="font-semibold">R (Irradiación):</span> {formData.opqrst_r || 'N/A'}</p>
                <p><span className="font-semibold">T (Temporalidad):</span> {formData.opqrst_t || 'N/A'}</p>
              </div>
              <p><span className="font-semibold">P (Provocación/Paliación):</span> {formData.opqrst_p || 'N/A'}</p>
              
              {/* NPRS Scale Representation */}
              <div className="mt-1 border-t border-slate-200 pt-1 flex justify-between">
                <div><span className="font-semibold">Dolor Actual (NPRS):</span> <span className="font-bold text-[#b59410]">{formData.nprs_act || 'Sin marcar'}</span>/10</div>
                <div><span className="font-semibold">Peor Dolor:</span> <span className="font-bold text-red-600">{formData.nprs_peor || 'Sin marcar'}</span>/10</div>
                <div><span className="font-semibold">Dolor Promedio:</span> <span className="font-bold text-blue-600">{formData.nprs_prom || 'Sin marcar'}</span>/10</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <p><span className="font-semibold text-slate-700">Antecedentes Clínicos:</span> {formData.antecedentes || 'Sin antecedentes patológicos registrados'}</p>
              <p><span className="font-semibold text-slate-700">Medicamentos Actuales:</span> {formData.medicamentos || 'Ninguno'}</p>
            </div>
            <p><span className="font-semibold text-slate-700">Objetivos del Paciente:</span> {formData.objetivosPaciente || 'Disminuir dolor de espalda.'}</p>
          </div>
        </div>

        {/* 3. O (Objetivo) */}
        <div className="mb-4">
          <h3 className="font-bold text-[10px] text-[#002147] uppercase border-b border-slate-200 pb-0.5 mb-1">O (OBJETIVO) - EXAMEN FÍSICO</h3>
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-4">
              <p><span className="font-semibold text-slate-700">Inspección Postural:</span> {formData.inspeccionPostural || 'Normal.'}</p>
              <p><span className="font-semibold text-slate-700">Palpación:</span> {formData.palpacion || 'Puntos gatillo locales.'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
              <div>
                <p className="font-semibold text-[8px] text-[#002147]">RANGOS DE MOVIMIENTO (ROM):</p>
                <p><span className="font-bold">Cervical:</span> {formData.romCervical || 'Dentro de límites normales'}</p>
                <p><span className="font-bold">Lumbar:</span> {formData.romLumbar || 'Dentro de límites normales'}</p>
              </div>
              <div>
                <p className="font-semibold text-[8px] text-[#002147]">PRUEBAS NEUROLÓGICAS:</p>
                <p><span className="font-bold">Reflejos:</span> {formData.reflejos || 'S/D'}</p>
                <p><span className="font-bold">Dermatomas:</span> {formData.dermatomas || 'S/D'}</p>
                <p><span className="font-bold">Miotomas:</span> {formData.miotomas || 'S/D'}</p>
              </div>
            </div>

            <div className="mt-1">
              <p className="font-semibold text-[8px] text-[#002147] uppercase mb-1">Pruebas Ortopédicas Realizadas:</p>
              <table className="w-full text-left border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-[8px] text-[#002147]">
                    <th className="p-1 border border-slate-200">Prueba Clinica</th>
                    <th className="p-1 border border-slate-200 w-16 text-center">Resultado</th>
                    <th className="p-1 border border-slate-200">Detalles e Irradiación Lateral</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 border border-slate-200 font-semibold">Prueba de Spurling</td>
                    <td className="p-1 border border-slate-200 text-center font-bold">{formData.spurling ? `(${formData.spurling})` : 'N/A'}</td>
                    <td className="p-1 border border-slate-200">{formData.spurling_text || 'Sin anomalías.'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-200 font-semibold">Elevación de Pierna Recta (SLR)</td>
                    <td className="p-1 border border-slate-200 text-center font-bold">{formData.slr ? `(${formData.slr})` : 'N/A'}</td>
                    <td className="p-1 border border-slate-200">{formData.slr_text || 'Sin dolor lumbar.'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-200 font-semibold">Prueba de Kemp</td>
                    <td className="p-1 border border-slate-200 text-center font-bold">{formData.kemp ? `(${formData.kemp})` : 'N/A'}</td>
                    <td className="p-1 border border-slate-200">{formData.kemp_text || 'Sin pinzamientos.'}</td>
                  </tr>
                  <tr>
                    <td className="p-1 border border-slate-200 font-semibold">Prueba de Patrick (FABER)</td>
                    <td className="p-1 border border-slate-200 text-center font-bold">{formData.patrick ? `(${formData.patrick})` : 'N/A'}</td>
                    <td className="p-1 border border-slate-200">{formData.patrick_text || 'Sin dolor coxofemoral o sacroiliaco.'}</td>
                  </tr>
                </tbody>
              </table>
              {formData.otrosOrtopedicos && <p className="mt-1"><span className="font-semibold">Otras pruebas:</span> {formData.otrosOrtopedicos}</p>}
            </div>
          </div>
        </div>

        {/* 4. A (Análisis) */}
        <div className="mb-4">
          <h3 className="font-bold text-[10px] text-[#002147] uppercase border-b border-slate-200 pb-0.5 mb-1">A (ANÁLISIS) - DIAGNÓSTICO CLÍNICO</h3>
          <p className="bg-slate-50 p-2 rounded border border-slate-200 font-medium whitespace-pre-line">{formData.diagnostico || 'Subluxación vertebral residual. Espasmo muscular secundario en trapecio medio.'}</p>
        </div>

        {/* 5. P (Plan) */}
        <div className="mb-4">
          <h3 className="font-bold text-[10px] text-[#002147] uppercase border-b border-slate-200 pb-0.5 mb-1">P (PLAN) - TRATAMIENTO Y RECOMENDACIONES</h3>
          <table className="w-full text-left">
            <tbody>
              <tr>
                <td className="py-1 w-1/3 font-semibold text-slate-700">Frecuencia y Duración:</td>
                <td className="py-1 border-b border-slate-200" colSpan={3}>{formData.frecuenciaDuracion || 'A definir.'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">Tratamiento Indicado:</td>
                <td className="py-1" colSpan={3}>
                  <div className="flex flex-wrap gap-4">
                    <span>- {formData.tratamientoAjuste ? ' [✓] Ajuste Quiropráctico específico ' : ' [ ] Ajuste Quiropráctico '} {formData.tratamientoAjusteZonas && `(${formData.tratamientoAjusteZonas})`}</span>
                    <span>- {formData.tratamientoMasaje ? ' [✓] Liberación miofascial ' : ' [ ] Liberación miofascial '}</span>
                    <span>- {formData.tratamientoEstiramientos ? ' [✓] Estiramientos asistidos ' : ' [ ] Estiramientos '}</span>
                    <span>- {formData.tratamientoHieloCalor ? ' [✓] Termo/Crioterapia ' : ' [ ] Termo/Crioterapia '}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">Ejercicios en Casa:</td>
                <td className="py-1 border-b border-slate-200" colSpan={3}>{formData.recomendacionesCasa || 'Ejercicios de McKenzie, hidratación y corrección postural.'}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-700">Próxima Cita de Control:</td>
                <td className="py-1 border-b border-slate-200" colSpan={3}>{formData.proximaCita || 'Sin programar.'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Firmas */}
        <div className="mt-12 flex justify-between px-12 pt-4 border-t border-slate-100">
          <div className="text-center w-52">
            <div className="border-b border-slate-400 h-8 mb-1"></div>
            <p className="font-bold text-[9px] text-[#002147] uppercase">Quiropráctico Responsable</p>
            <p className="text-[7px] text-slate-500 font-mono">Cédula Profesional / Firma</p>
          </div>

          <div className="text-center w-52">
            <div className="border-b border-slate-400 h-8 mb-1"></div>
            <p className="font-bold text-[9px] text-[#002147] uppercase">Firma del Paciente</p>
            <p className="text-[7px] text-slate-500">Aceptación y Conformidad</p>
          </div>
        </div>

        {/* Pie de Página PDF */}
        <div className="mt-10 text-center text-[7px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between font-sans">
          <p>Quiro Salud CDMX — Todos los derechos reservados. Confidencialidad bajo el Secreto Médico.</p>
          <p>Página 1 de 1</p>
        </div>

      </div>

    </div>
  );
}
