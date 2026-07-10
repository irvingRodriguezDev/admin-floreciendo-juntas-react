import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import * as ExcelJS from 'exceljs';

export const useExcelExport = () => {
    const [exportingExcel, setExportingExcel] = useState(false);

    const exportToExcel = useCallback(async ({ data, title, fileName }) => {
        if (!data || data.length === 0) {
            Swal.fire({
                title: 'Información',
                text: 'No hay datos para exportar',
                icon: 'info',
                confirmButtonColor: '#FF69B4'
            });
            return;
        }

        try {
            setExportingExcel(true);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Ganadores');

            // Título
            const titleRow = worksheet.addRow([title]);
            titleRow.font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FFFF1493' } };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A1:D1');
            titleRow.height = 30;

            // Fecha
            const infoRow = worksheet.addRow([
                `Fecha de exportación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
            ]);
            worksheet.mergeCells('A2:D2');
            infoRow.font = { size: 11, color: { argb: 'FF666666' } };
            infoRow.alignment = { horizontal: 'center' };

            // Encabezados
            const headerRow = worksheet.addRow(['Nombre', 'Email', 'Teléfono', 'Premio']);
            headerRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF69B4' } };
                cell.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                    right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                };
            });

            // Datos
            data.forEach((item, idx) => {
                const row = worksheet.addRow([item.name, item.email, item.phone, item.prize_name]);
                row.eachCell(cell => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : 'FFFFF5F9' }
                    };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFE6E6E6' } },
                        left: { style: 'thin', color: { argb: 'FFE6E6E6' } },
                        bottom: { style: 'thin', color: { argb: 'FFE6E6E6' } },
                        right: { style: 'thin', color: { argb: 'FFE6E6E6' } }
                    };
                    cell.alignment = { vertical: 'middle' };
                });
            });

            // Ajustar columnas
            worksheet.columns.forEach(col => {
                let mx = 0;
                col.eachCell({ includeEmpty: true }, c => {
                    const l = c.value ? c.value.toString().length : 10;
                    if (l > mx) mx = l;
                });
                col.width = Math.min(mx + 5, 50);
            });

            // Descargar
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            Swal.fire({
                title: '✅ Exportación Exitosa',
                html: `<div style="text-align:center;">
                    <p>Archivo <strong>${fileName}</strong> descargado.</p>
                    <p style="color:#666;font-size:0.9rem;">${data.length} registros exportados</p>
                </div>`,
                icon: 'success',
                confirmButtonColor: '#FF69B4',
                timer: 3000
            });
        } catch (error) {
            Swal.fire({
                title: '❌ Error',
                text: 'No se pudo exportar el archivo',
                icon: 'error',
                confirmButtonColor: '#FF69B4'
            });
        } finally {
            setExportingExcel(false);
        }
    }, []);

    return { exportingExcel, exportToExcel };
};