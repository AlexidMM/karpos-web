// src/routes/dashboard/doctor/reportes/historial/generate/+server.ts
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';
import { createCanvas } from 'canvas';
import { Chart, type ChartItem } from 'chart.js';
import {
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register Chart.js components
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler
);

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        // Get URL parameters
        const patientId = url.searchParams.get('patientId');
        
        if (!patientId) {
            throw error(400, "Se requiere el ID del paciente");
        }

        // Fetch patient data
        const patientResponse = await fetch(`http://10.224.0.3:3001/patients/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!patientResponse.ok) {
            throw error(patientResponse.status, "Error al obtener datos del paciente");
        }

        const patient = await patientResponse.json();
        console.log('Patient data received:', patient);

        // Get the first patient from the array
        const patientData = Array.isArray(patient) ? patient[0] : patient;
        if (!patientData) {
            throw error(404, "No se encontró el paciente");
        }

        // Fetch patient's appointments
        const appointmentsResponse = await fetch(`http://10.224.0.3:3001/patients/appointments/details?patientId=${patientId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener citas del paciente");
        }

        const appointments = await appointmentsResponse.json();

        // Fetch IoT data for each appointment
        const iotDataPromises = appointments.map(async (appointment: any) => {
            try {
                // Map appointment_id to id_ap
                const id_ap = appointment.appointment_id;
                if (!id_ap) {
                    console.log('Appointment missing ID:', appointment);
                    return null;
                }

                console.log('Fetching IoT data for appointment:', id_ap);
                const iotResponse = await fetch(`http://10.224.0.3:3001/iot?cita=${id_ap}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!iotResponse.ok) {
                    console.log('No IoT data found for appointment:', id_ap);
                    return null;
                }
                
                const iotData = await iotResponse.json();
                console.log('Received IoT data:', iotData);
                
                // Handle both array and single object responses
                const matchingData = Array.isArray(iotData) 
                    ? iotData.find((iot: any) => iot.cita === id_ap.toString())
                    : iotData;
                
                if (!matchingData) {
                    console.log('No matching IoT data found for appointment:', id_ap);
                    return null;
                }
                
                // Ensure we have the required arrays
                if (!matchingData.pulso || !matchingData.fuerza) {
                    console.log('Missing pulse or force data for appointment:', id_ap);
                    return null;
                }
                
                return matchingData;
            } catch (error) {
                console.error('Error fetching IoT data for appointment:', appointment?.appointment_id, error);
                return null;
            }
        });

        const iotData = await Promise.all(iotDataPromises);
        console.log('All IoT data:', iotData);

        // Filter out null values
        const validIotData = iotData.filter(data => data !== null);
        console.log('Valid IoT data:', validIotData);

        // Generate PDF
        const pdfBuffer = await generateMedicalHistoryReport(patientData, appointments, validIotData);

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="historial-medico-${patientData.nombre}-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });

    } catch (err) {
        console.error('Error generating medical history report:', err);
        throw error(500, "Error al generar el reporte de historial médico");
    }
};

async function generateMedicalHistoryReport(patient: any, appointments: any[], validIotData: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const chunks: Buffer[] = [];
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4',
                autoFirstPage: true,
                bufferPages: true
            });

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Define theme colors
            const colorPrimary = '#4285f4';
            const colorSecondary = '#34a853';
            const colorBackgroundLight = '#f8f9fa';
            const colorTextDark = '#202124';
            const colorTextMedium = '#5f6368';

            // Header
            doc.fillColor(colorPrimary)
               .rect(0, 0, doc.page.width, 80)
               .fill();

            doc.fillColor('white')
               .font('Helvetica-Bold')
               .fontSize(28)
               .text('KARPOS', 50, 30, { align: 'left' });

            doc.fontSize(14)
               .text('Historial Médico', 50, 60, { align: 'left' });

            // Separator line
            doc.strokeColor(colorSecondary)
               .lineWidth(2)
               .moveTo(50, 90)
               .lineTo(doc.page.width - 50, 90)
               .stroke();

            let currentY = 110;

            // Patient Information
            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Información del Paciente', 50, currentY);

            currentY += 30;

            // Patient details with background
            doc.fillColor(colorBackgroundLight)
               .roundedRect(50, currentY, doc.page.width - 100, 150, 10)
               .fill();

            currentY += 15;

            doc.fontSize(10)
               .font('Helvetica')
               .fillColor(colorTextDark);

            const patientInfo = [
                `Nombre: ${patient.nombre} ${patient.apellido_p} ${patient.apellido_m}`,
                `Edad: ${patient.age} años`,
                `Género: ${patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}`,
                `Tipo de Sangre: ${patient.blood_type}`,
                `Peso: ${patient.weight} kg`,
                `Altura: ${patient.height} cm`
            ];

            patientInfo.forEach(info => {
                doc.text(info, 70, currentY);
                currentY += 20;
            });

            currentY += 20;

            // Appointment History
            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Historial de Citas', 50, currentY);

            currentY += 30;

            // Create appointment progress chart
            const progressCanvas = createCanvas(400, 200);
            const progressCtx = progressCanvas.getContext('2d') as unknown as ChartItem;

            // Prepare data for progress chart
            const dates = appointments.map(app => new Date(app.appointment_date).toLocaleDateString());
            const statusValues = appointments.map(app => {
                switch(app.status) {
                    case 'completed': return 3;
                    case 'pending': return 2;
                    case 'cancelled': return 1;
                    default: return 0;
                }
            });

            new Chart(progressCtx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Progreso de Citas',
                        data: statusValues,
                        borderColor: colorPrimary,
                        backgroundColor: colorPrimary + '40',
                        fill: true,
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Progreso de Citas'
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: (value) => {
                                    switch(value) {
                                        case 3: return 'Completada';
                                        case 2: return 'Pendiente';
                                        case 1: return 'Cancelada';
                                        default: return '';
                                    }
                                }
                            }
                        }
                    }
                }
            });

            // Add progress chart to PDF
            doc.image(progressCanvas.toBuffer(), 50, currentY, {
                fit: [400, 200],
                align: 'center'
            });

            currentY += 220;

            // Detailed Appointment Information
            appointments.forEach((appointment, index) => {
                // Always start a new page for each appointment
                doc.addPage();
                currentY = 80;

                // Appointment header
                doc.fillColor(colorPrimary)
                   .fontSize(16)
                   .font('Helvetica-Bold')
                   .text(`Cita #${index + 1}`, 50, currentY);

                currentY += 30;

                // Appointment details with background
                doc.fillColor(colorBackgroundLight)
                   .roundedRect(50, currentY, doc.page.width - 100, 100, 10)
                   .fill();

                currentY += 15;

                doc.fontSize(10)
                   .font('Helvetica')
                   .fillColor(colorTextDark);

                const appointmentInfo = [
                    `Fecha: ${new Date(appointment.appointment_date).toLocaleDateString()}`,
                    `Hora: ${appointment.appointment_time}`,
                    `Estado: ${appointment.appointment_status}`,
                    `Doctor: ${appointment.doctor_name}`
                ];

                appointmentInfo.forEach(info => {
                    doc.text(info, 70, currentY);
                    currentY += 20;
                });

                currentY += 20;

                // Add IoT data if available
                const appointmentIotData = validIotData.find(data => data.cita === appointment.appointment_id.toString());
                if (appointmentIotData) {
                    // Create pulse chart
                    const pulseCanvas = createCanvas(400, 200);
                    const pulseCtx = pulseCanvas.getContext('2d') as unknown as ChartItem;

                    // Prepare pulse data for chart
                    const measurements = appointmentIotData.pulso || [];
                    const measurementTimes = measurements.map((_: any, i: number) => `M${i + 1}`);

                    new Chart(pulseCtx, {
                        type: 'line',
                        data: {
                            labels: measurementTimes,
                            datasets: [{
                                label: 'Pulso',
                                data: measurements,
                                borderColor: '#ea4335',
                                backgroundColor: '#ea433540',
                                fill: true,
                                tension: 0.2
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Datos de Pulso'
                                }
                            }
                        }
                    });

                    // Add pulse chart to PDF
                    doc.image(pulseCanvas.toBuffer(), 50, currentY, {
                        fit: [400, 200],
                        align: 'center'
                    });

                    currentY += 220;

                    // Create force chart
                    const forceCanvas = createCanvas(400, 200);
                    const forceCtx = forceCanvas.getContext('2d') as unknown as ChartItem;

                    // Prepare force data for chart
                    const forceMeasurements = appointmentIotData.fuerza || [];

                    new Chart(forceCtx, {
                        type: 'line',
                        data: {
                            labels: measurementTimes,
                            datasets: [{
                                label: 'Fuerza',
                                data: forceMeasurements,
                                borderColor: '#4285f4',
                                backgroundColor: '#4285f440',
                                fill: true,
                                tension: 0.2
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Datos de Fuerza'
                                }
                            }
                        }
                    });

                    // Add force chart to PDF
                    doc.image(forceCanvas.toBuffer(), 50, currentY, {
                        fit: [400, 200],
                        align: 'center'
                    });

                    currentY += 220;
                }
            });

            // Finalize the PDF
            doc.end();

        } catch (err) {
            reject(err);
        }
    });
} 