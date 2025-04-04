// src/routes/dashboard/doctor/pacientes/[id]/pdf/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';

export const GET: RequestHandler = async ({ fetch, params, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        const patientId = params.id;
        
        // Obtener datos del paciente
        const patientResponse = await fetch(`http://10.224.0.3:3001/patients/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!patientResponse.ok) {
            throw error(patientResponse.status, `Error obteniendo paciente: ${patientResponse.statusText}`);
        }

        const patients = await patientResponse.json();
        const patient = patients[0];

        // Obtener historial médico
        const medicalRecordsResponse = await fetch(`http://10.224.0.3:3001/medical-records`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!medicalRecordsResponse.ok) {
            throw error(medicalRecordsResponse.status, `Error obteniendo historial médico: ${medicalRecordsResponse.statusText}`);
        }

        const allMedicalRecords = await medicalRecordsResponse.json();
        const medicalRecord = allMedicalRecords.find((record: { id_pc: string }) => record.id_pc === patient.id_pc);

        if (!medicalRecord) {
            throw error(404, "No se encontró historial médico para este paciente");
        }

        // Crear PDF
        const pdfBuffer = await generatePDF(patient, medicalRecord);

        // Devolver el PDF como respuesta
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="expediente_clinico_${patient.apellido_p}_${patient.apellido_m}_${patient.nombre}.pdf"`
            }
        });
    } catch (err) {
        console.error('Error generando PDF:', err);
        throw error(500, "Error inesperado al generar el PDF");
    }
};

// Función para generar el PDF
async function generatePDF(patient: any, medicalRecord: any): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        try {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            // Recopilar chunks
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Configuración de fuentes
            doc.font('Helvetica');
            
            // Encabezado con logo de Karpos
            doc.fontSize(20).fillColor('#0047AB').text('KARPOS', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(16).fillColor('#0047AB').text('Expediente Clínico', { align: 'center' });
            doc.moveDown(1);

            // Línea divisoria
            doc.strokeColor('#0047AB').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
            doc.moveDown(1);

            // Información del paciente
            doc.fontSize(14).fillColor('#000000').text('Información del Paciente', { underline: true });
            doc.moveDown(0.5);
            
            // Crear una tabla para los datos del paciente
            const patientInfo = [
                ['Nombre completo:', `${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}`],
                ['Edad:', `${patient.age} años`],
                ['Género:', patient.gender],
                ['Tipo de sangre:', patient.blood_type],
                ['Peso:', `${patient.weight} kg`],
                ['Altura:', `${patient.height} cm`]
            ];

            // Dibujar la tabla
            let yPosition = doc.y;
            patientInfo.forEach((row, i) => {
                doc.fontSize(11).fillColor('#333333');
                doc.font('Helvetica-Bold').text(row[0], 60, yPosition, { continued: true, width: 150 });
                doc.font('Helvetica').text(row[1], { width: 300 });
                yPosition = doc.y + 5;
            });

            doc.moveDown(1);

            // Línea divisoria
            doc.strokeColor('#0047AB').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
            doc.moveDown(1);

            // Historial Médico
            doc.fontSize(14).fillColor('#000000').text('Expediente Clínico', { underline: true });
            doc.moveDown(0.5);

            // Diagnóstico
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Diagnóstico:');
            doc.font('Helvetica').fontSize(11).text(medicalRecord.diagnosis);
            doc.moveDown(0.5);

            // Tratamiento
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Tratamiento:');
            doc.font('Helvetica').fontSize(11).text(medicalRecord.treatment);
            doc.moveDown(0.5);

            // Notas (si existen)
            if (medicalRecord.notes) {
                doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Notas:');
                doc.font('Helvetica').fontSize(11).text(medicalRecord.notes);
            }
            
            doc.moveDown(1);

            // Fechas
            doc.fontSize(10).fillColor('#666666');
            doc.text(`Fecha de creación: ${new Date(medicalRecord.created_at).toLocaleString()}`);
            doc.text(`Última actualización: ${new Date(medicalRecord.updated_at).toLocaleString()}`);

            // Finalizar el documento
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}