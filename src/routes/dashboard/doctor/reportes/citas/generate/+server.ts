// frontend: src/routes/dashboard/doctor/reportes/citas/generate/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }
        
        // Obtener parámetros de la URL
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const doctorId = url.searchParams.get('doctorId');
        const patientId = url.searchParams.get('patientId');
        const status = url.searchParams.get('status');
        
        // Construir URL para la API con los filtros
        let apiUrl = 'http://34.51.19.104:3001/reports/appointments';
        const queryParams = new URLSearchParams();
        
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        if (doctorId && doctorId !== 'all') queryParams.append('doctorId', doctorId);
        if (patientId && patientId !== 'all') queryParams.append('patientId', patientId);
        if (status && status !== 'all') queryParams.append('status', status);
        
        if (queryParams.toString()) {
            apiUrl += `?${queryParams.toString()}`;
        }
        
        // Obtener citas según los filtros
        const appointmentsResponse = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener citas");
        }
        
        const appointments = await appointmentsResponse.json();
        
        // Obtener información adicional si es necesario (nombres de doctores y pacientes)
        const doctorsResponse = await fetch('http://34.51.19.104:3001/doctors', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const patientsResponse = await fetch('http://34.51.19.104:3001/patients', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!doctorsResponse.ok || !patientsResponse.ok) {
            throw error(500, "Error al obtener información adicional");
        }
        
        const doctors = await doctorsResponse.json();
        const patients = await patientsResponse.json();
        
        // Crear un mapa para acceder fácilmente a los datos
        const doctorMap: Map<number, { id_dc: number; nombre: string; apellido_p: string; apellido_m: string }> = new Map(doctors.map((d: { id_dc: number; nombre: string; apellido_p: string, apellido_m: string }) => [d.id_dc, d]));
        const patientMap: Map<number, { id_pc: number; nombre: string; apellido_p: string; apellido_m: string }> = new Map(patients.map((p: { id_pc: number; nombre: string; apellido_p: string, apellido_m: string }) => [p.id_pc, p]));
        
        // Crear el documento PDF
        const pdfBuffer: Buffer = await generatePDF(appointments, doctorMap, patientMap, { 
            startDate: startDate || undefined, 
            endDate: endDate || undefined, 
            doctorId: doctorId || undefined, 
            patientId: patientId || undefined, 
            status: status || undefined 
        });
        
        // Devolver el PDF como respuesta
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="reporte-citas-karpos-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });
        
    } catch (err) {
        console.error('Error al generar el reporte:', err);
        throw error(500, "Error al generar el reporte");
    }
};

// Función para generar el PDF con PDFKit
async function generatePDF(appointments: Array<{ date: string; time: string; id_pc: number; id_dc: number; status: string; payment_amount: number }>, doctorMap: Map<number, { id_dc: number; nombre: string; apellido_p: string; apellido_m: string }>, patientMap: Map<number, { id_pc: number; nombre: string; apellido_p: string; apellido_m: string }>, filters: { startDate?: string; endDate?: string; doctorId?: string; patientId?: string; status?: string }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const chunks: Uint8Array[] = [];
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4',
                autoFirstPage: true,
                bufferPages: true // Importante para manejar correctamente las páginas
            });
            
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            
            // Colores principales
            const colorPrimario = '#1a73e8';          // Azul principal
            const colorSecundario = '#4285f4';        // Azul secundario
            const colorFondo = '#f0f7ff';             // Azul muy claro para fondos
            const colorFilaPar = '#e8f0fe';           // Azul claro para filas pares
            const colorTextoOscuro = '#202124';       // Gris oscuro para texto principal
            const colorTextoClaro = '#5f6368';        // Gris medio para texto secundario
            
            // Variables para controlar las páginas
            let paginasTotales = 0;
            
            // Encabezado - Nombre de la empresa y logo
            doc.fillColor(colorPrimario)
               .rect(0, 0, doc.page.width, 80)
               .fill();
            
            // Logo o nombre de la empresa (Karpos)
            doc.fillColor('white')
               .font('Helvetica-Bold')
               .fontSize(28)
               .text('KARPOS', 50, 30, { align: 'left' });
            
            // Subtítulo del documento
            doc.fontSize(14)
               .text('Sistema de Gestión Médica', 50, 60, { align: 'left' });
            
            // Línea separadora
            doc.strokeColor(colorSecundario)
               .lineWidth(2)
               .moveTo(50, 90)
               .lineTo(doc.page.width - 50, 90)
               .stroke();
               
            doc.moveDown(2);
            
            // Comenzamos el contenido principal en una posición adecuada después del encabezado
            let currentY = 110;
            
            // Título del reporte
            doc.fillColor(colorPrimario)
               .fontSize(20)
               .font('Helvetica-Bold')
               .text('Reporte de Citas', 50, currentY, { align: 'center' });
            
            currentY += 40;
            
            // Sección de filtros con fondo
            doc.fillColor(colorFondo)
               .roundedRect(50, currentY, doc.page.width - 100, 100, 10)
               .fill();
            
            currentY += 10;
            
            // Título de la sección de filtros
            doc.fillColor(colorPrimario)
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('Filtros aplicados', 70, currentY);
            
            currentY += 25;
            
            // Contenido de los filtros en dos columnas
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor(colorTextoOscuro);
            
            // Primera columna de filtros
            let leftX = 70;
            doc.text('Rango de fechas:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold')
               .text(` ${filters.startDate || 'Todas'} al ${filters.endDate || 'Todas'}`, { 
                    continued: false,
                    underline: false
               })
               .font('Helvetica');
            
            currentY += 20;
            
            doc.text('Doctor:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold');
            
            if (filters.doctorId && filters.doctorId !== 'all') {
                const doctor = doctorMap.get(Number(filters.doctorId));
                doc.text(` ${doctor ? `${doctor.nombre} ${doctor.apellido_p} ${doctor.apellido_m}` : filters.doctorId}`);
            } else {
                doc.text(' Todos');
            }
            doc.font('Helvetica');
            
            currentY += 20;
            
            doc.text('Paciente:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold');
            
            if (filters.patientId && filters.patientId !== 'all') {
                const patient = patientMap.get(Number(filters.patientId));
                doc.text(` ${patient ? `${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}` : filters.patientId}`);
            } else {
                doc.text(' Todos');
            }
            doc.font('Helvetica');
            
            // Segunda columna de filtros
            leftX = 320;
            currentY -= 40; // Volver arriba para la segunda columna
            
            doc.text('Estado:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold');
            
            if (filters.status && filters.status !== 'all') {
                doc.text(` ${filters.status}`);
            } else {
                doc.text(' Todos');
            }
            doc.font('Helvetica');
            
            currentY += 20;
            
            // Obtener estadísticas para mostrar
            const totalCitas = appointments.length;
            
            // Conteo por estado
            const statusCount = appointments.reduce((acc: Record<string, number>, app: { status: string }) => {
                acc[app.status] = (acc[app.status] || 0) + 1;
                return acc;
            }, {});
            
            // Mostrar total de citas
            doc.text('Total de citas:', leftX, currentY, { continued: true })
            .font('Helvetica-Bold')
            .text(` ${totalCitas}`)
            .font('Helvetica');

            // Mostrar total de citas completadas
            currentY += 20; // Ajuste de espacio
            const totalCompletadas = statusCount['completed'] || 0;

            doc.text('Citas completadas:', leftX, currentY, { continued: true })
            .font('Helvetica-Bold')
            .text(` ${totalCompletadas}`)
            .font('Helvetica');

            currentY += 40; // Ajuste de espacio después de mostrar datos

            
            // Título de la tabla
            doc.fillColor(colorPrimario)
               .fontSize(14)
               .font('Helvetica-Bold')
               .text('Detalle de Citas', 50, currentY);
            
            currentY += 20;
            
            // Tabla de citas
            if (appointments.length > 0) {
                // Definir posiciones para los encabezados
                const colFecha = 60;
                const colHora = 130;
                const colPaciente = 180;
                const colDoctor = 300;
                const colEstado = 420;
                const colMonto = 480;
                
                // Encabezados de columna con fondo
                doc.fillColor(colorPrimario)
                   .rect(50, currentY, doc.page.width - 100, 25)
                   .fill();
                
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica-Bold');
                
                doc.text('Fecha', colFecha, currentY + 8);
                doc.text('Hora', colHora, currentY + 8);
                doc.text('Paciente', colPaciente, currentY + 8);
                doc.text('Doctor', colDoctor, currentY + 8);
                doc.text('Estado', colEstado, currentY + 8);
                doc.text('Monto', colMonto, currentY + 8);
                
                currentY += 25;
                
                // Filas de datos
                appointments.forEach((appointment: any, i: number) => {
                    // Obtener información de doctor y paciente
                    const patient = patientMap.get(appointment.id_pc);
                    const doctor = doctorMap.get(appointment.id_dc);
                    
                    // Alternar colores de fondo para las filas
                    if (i % 2 === 0) {
                        doc.fillColor(colorFilaPar)
                           .rect(50, currentY - 5, doc.page.width - 100, 25)
                           .fill();
                    }
                    
                    // Formatear estado con color
                    let estadoColor = colorPrimario;
                    switch(appointment.status.toLowerCase()) {
                        case 'completada':
                        case 'completa':
                        case 'realizada':
                        case 'completed':
                            estadoColor = '#34a853'; // Verde
                            break;
                        case 'pendiente':
                        case 'pending':
                            estadoColor = '#fbbc05'; // Amarillo
                            break;
                        case 'cancelada':
                        case 'cancelled':
                        case 'canceled':
                            estadoColor = '#ea4335'; // Rojo
                            break;
                        default:
                            estadoColor = colorPrimario; // Azul por defecto
                    }
                    
                    // Escribir datos de la cita
                    doc.fillColor(colorTextoOscuro)
                       .font('Helvetica')
                       .fontSize(9);
                    
                    // Formatear la fecha
                    let fechaFormateada = appointment.date;
                    try {
                        const fecha = new Date(appointment.date);
                        fechaFormateada = fecha.toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                    } catch (e) {
                        // Mantener el formato original si hay error
                    }
                    
                    doc.text(fechaFormateada, colFecha, currentY);
                    doc.text(appointment.time, colHora, currentY);
                    
                    // Nombre del paciente (truncado si es muy largo)
                    const nombrePaciente = patient ? `${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}` : `ID: ${appointment.id_pc}`;
                    doc.text(nombrePaciente.length > 20 ? nombrePaciente.substring(0, 18) + '...' : nombrePaciente, colPaciente, currentY);
                    
                    // Nombre del doctor (truncado si es muy largo)
                    const nombreDoctor = doctor ? `${doctor.nombre} ${doctor.apellido_p} ${doctor.apellido_m}` : `ID: ${appointment.id_dc}`;
                    doc.text(nombreDoctor.length > 20 ? nombreDoctor.substring(0, 18) + '...' : nombreDoctor, colDoctor, currentY);
                    
                    // Estado con color
                    doc.fillColor(estadoColor)
                       .text(appointment.status, colEstado, currentY);
                    
                    // Monto
                    doc.fillColor(colorTextoOscuro)
                       .text(`$${appointment.payment_amount.toFixed(2)}`, colMonto, currentY);
                    
                    currentY += 25;
                });
            } else {
                // Mensaje de no hay resultados
                doc.fillColor(colorTextoClaro)
                   .fontSize(12)
                   .font('Helvetica-Italic')
                   .text('No se encontraron citas con los filtros seleccionados.', 50, currentY, { align: 'center' });
            }
            
            // Asegurarnos de que solo hay las páginas necesarias
            paginasTotales = doc.bufferedPageRange().count;
            
            // Agregar pie de página a todas las páginas
            for (let i = 0; i < paginasTotales; i++) {
                doc.switchToPage(i);
                
                // Pie de página
                const footerTop = doc.page.height - 50;
                
                // Línea separadora
                doc.strokeColor(colorSecundario)
                   .lineWidth(1)
                   .moveTo(50, footerTop)
                   .lineTo(doc.page.width - 50, footerTop)
                   .stroke();
                
            }
            
            // Finalizar el PDF
            doc.end();
            
        } catch (err) {
            reject(err);
        }
    });
}