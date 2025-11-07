import React, { useRef, useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { SketchPicker } from 'react-color';

const RichTextEditor = ({ value, onChange, placeholder = "Escribe tu contenido aquí..." }) => {
    const quillRef = useRef(null);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
    const [color, setColor] = useState('#000000');
    const [currentFormat, setCurrentFormat] = useState('color');

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
            ],
        },
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'list', 'bullet',
        'link', 'image',
    ];

    // Función para manejar el clic en los botones personalizados
    const handleCustomButtonClick = (e, format) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.target.getBoundingClientRect();
        setPickerPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
        });
        setCurrentFormat(format);

        // Obtener el color actual
        const quill = quillRef.current?.getEditor();
        const currentColor = quill?.getFormat()?.[format] || (format === 'background' ? '#FFFFFF' : '#000000');
        setColor(currentColor);

        setShowPicker(true);
    };

    const handleColorChange = (newColor) => {
        setColor(newColor.hex);
        const quill = quillRef.current?.getEditor();
        if (quill) {
            quill.format(currentFormat, newColor.hex);
        }
    };

    const handleClosePicker = (e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setShowPicker(false);
    };

    // Efecto para agregar los botones personalizados a la toolbar
    useEffect(() => {
        const timeout = setTimeout(() => {
            const toolbar = quillRef.current?.editor?.root?.previousSibling ||
                quillRef.current?.container?.previousSibling;

            if (!toolbar) {
                console.warn('No se encontró la toolbar de Quill');
                return;
            }

            // Buscar contenedores existentes
            const colorContainer = toolbar.querySelector('.ql-color');
            const backgroundContainer = toolbar.querySelector('.ql-background');

            // Función para crear botones personalizados
            const createCustomButton = (container, format, label) => {
                if (container) {
                    // Limpiar botones existentes
                    const existingBtn = container.querySelector('.ql-custom-picker');
                    if (existingBtn) {
                        existingBtn.remove();
                    }

                    const customBtn = document.createElement('button');
                    customBtn.className = 'ql-custom-picker';
                    customBtn.innerHTML = '🎨';
                    customBtn.title = `Paleta para ${label}`;
                    customBtn.style.cssText = `
                        cursor: pointer;
                        background: none;
                        border: none;
                        margin-left: 8px;
                        font-size: 16px;
                        padding: 4px 6px;
                        border-radius: 3px;
                        border: 1px solid #ccc;
                    `;

                    customBtn.addEventListener('click', (e) => handleCustomButtonClick(e, format));
                    customBtn.addEventListener('mousedown', (e) => e.preventDefault());

                    container.appendChild(customBtn);
                }
            };

            createCustomButton(colorContainer, 'color', 'texto');
            createCustomButton(backgroundContainer, 'background', 'fondo');

        }, 1000); // Dar tiempo para que Quill cargue completamente

        return () => clearTimeout(timeout);
    }, []);

    // Efecto para manejar clics fuera del picker
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPicker &&
                !event.target.closest('.sketch-picker') &&
                !event.target.closest('.ql-custom-picker') &&
                !event.target.closest('.color-picker-container')) {
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    return (
        <div style={{ position: 'relative' }}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: '300px' }}
            />

            {showPicker && (
                <div
                    className="color-picker-container"
                    style={{
                        position: 'absolute',
                        top: pickerPos.top,
                        left: Math.min(pickerPos.left, window.innerWidth - 300), // Evitar que se salga de la pantalla
                        zIndex: 9999,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        borderRadius: '8px',
                        background: '#fff',
                        padding: '12px',
                        border: '1px solid #e1e1e1',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{
                        marginBottom: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#333',
                        textAlign: 'center'
                    }}>
                        {currentFormat === 'color' ? '🎨 Color de Texto' : '🎨 Color de Fondo'}
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        <SketchPicker
                            color={color}
                            onChange={handleColorChange}
                            onChangeComplete={handleColorChange}
                            disableAlpha={true}
                            presetColors={[
                                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
                                '#FFFF00', '#00FFFF', '#FF00FF', '#FFA500', '#800080',
                                '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0', '#FF6B6B',
                                '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'
                            ]}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '12px',
                            gap: '8px'
                        }}
                    >
                        <button
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: '#6c757d',
                                color: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: 'none',
                                fontWeight: 'bold'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                const quill = quillRef.current?.getEditor();
                                if (quill) {
                                    quill.format(currentFormat, false);
                                }
                                setShowPicker(false);
                            }}
                        >
                            Quitar Color
                        </button>
                        <button
                            style={{
                                flex: 1,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: '#007bff',
                                color: 'white',
                                padding: '8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                border: 'none',
                                fontWeight: 'bold'
                            }}
                            onClick={handleClosePicker}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RichTextEditor;