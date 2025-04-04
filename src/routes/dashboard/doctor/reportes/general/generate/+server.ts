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
    Filler,
    ArcElement,
    DoughnutController,
    BarController,
    BarElement
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
    Filler,
    ArcElement,
    DoughnutController,
    BarController,
    BarElement
);

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        
        if (!accessToken) {
            throw error(401, "No estás autenticado");
        }

        // Get URL parameters
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Fetch all appointments
        const appointmentsResponse = await fetch('http://10.224.0.3:3001/appointments', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!appointmentsResponse.ok) {
            throw error(appointmentsResponse.status, "Error al obtener citas");
        }

        const appointments = await appointmentsResponse.json();

        // Fetch all doctors
        const doctorsResponse = await fetch('http://10.224.0.3:3001/doctors', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!doctorsResponse.ok) {
            throw error(doctorsResponse.status, "Error al obtener doctores");
        }

        const doctors = await doctorsResponse.json();

        // Filter appointments by date range if provided
        let filteredAppointments = appointments;
        if (startDate && endDate) {
            filteredAppointments = appointments.filter((app: any) => {
                const appDate = new Date(app.date);
                return appDate >= new Date(startDate) && appDate <= new Date(endDate);
            });
        }

        // Generate PDF
        const pdfBuffer = await generateGeneralReport(filteredAppointments, doctors);

        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="reporte-general-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });

    } catch (err) {
        console.error('Error generating general report:', err);
        throw error(500, "Error al generar el reporte general");
    }
};

async function generateGeneralReport(appointments: any[], doctors: any[]): Promise<Buffer> {
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
               .text('Reporte General', 50, 60, { align: 'left' });

            // Separator line
            doc.strokeColor(colorSecondary)
               .lineWidth(2)
               .moveTo(50, 90)
               .lineTo(doc.page.width - 50, 90)
               .stroke();

            let currentY = 110;

            // Total Appointments
            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Total de Citas', 50, currentY);

            currentY += 30;

            // Total appointments box
            doc.fillColor(colorBackgroundLight)
               .roundedRect(50, currentY, doc.page.width - 100, 60, 10)
               .fill();

            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor(colorPrimary)
               .text(appointments.length.toString(), 70, currentY + 15);

            doc.fontSize(12)
               .font('Helvetica')
               .fillColor(colorTextMedium)
               .text('Citas en el período seleccionado', 70, currentY + 40);

            currentY += 80;

            // Appointment Status Distribution
            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Distribución por Estado', 50, currentY);

            currentY += 30;

            // Create status distribution chart
            const statusCanvas = createCanvas(400, 200);
            const statusCtx = statusCanvas.getContext('2d') as unknown as ChartItem;

            const statusCounts = {
                completed: appointments.filter((app: any) => app.status === 'completed').length,
                pending: appointments.filter((app: any) => app.status === 'pending').length,
                cancelled: appointments.filter((app: any) => app.status === 'cancelled').length
            };

            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: [
                        `Completadas (${statusCounts.completed})`,
                        `Pendientes (${statusCounts.pending})`,
                        `Canceladas (${statusCounts.cancelled})`
                    ],
                    datasets: [{
                        data: [statusCounts.completed, statusCounts.pending, statusCounts.cancelled],
                        backgroundColor: ['#34a853', '#fbbc05', '#ea4335']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        title: {
                            display: true,
                            text: 'Distribución de Estados'
                        }
                    }
                }
            });

            // Add status chart to PDF
            doc.image(statusCanvas.toBuffer(), 50, currentY, {
                fit: [400, 200],
                align: 'center'
            });

            currentY += 220;

            // Doctor Statistics
            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Estadísticas por Doctor', 50, currentY);

            currentY += 30;

            // Create doctor statistics chart
            const doctorCanvas = createCanvas(400, 200);
            const doctorCtx = doctorCanvas.getContext('2d') as unknown as ChartItem;

            const doctorStats = doctors.map(doctor => {
                // Validar que el doctor tenga un ID válido
                if (!doctor || !doctor.id_dc) {
                    console.warn('Doctor sin ID válido:', doctor);
                    return {
                        name: 'Doctor sin nombre',
                        count: 0
                    };
                }

                const doctorAppointments = appointments.filter((app: any) => {
                    // Validar que la cita tenga un id_dc válido
                    if (!app || !app.id_dc) {
                        console.warn('Cita sin id_dc válido:', app);
                        return false;
                    }
                    return app.id_dc.toString() === doctor.id_dc.toString();
                });

                return {
                    name: `${doctor.nombre || 'Sin nombre'} ${doctor.apellido_p || ''}`,
                    count: doctorAppointments.length
                };
            });

            // Filtrar doctores sin citas si no hay datos
            const validDoctorStats = doctorStats.filter(stat => stat.count > 0);

            if (validDoctorStats.length > 0) {
                new Chart(doctorCtx, {
                    type: 'bar',
                    data: {
                        labels: validDoctorStats.map(stat => stat.name),
                        datasets: [{
                            label: 'Citas por Doctor',
                            data: validDoctorStats.map(stat => stat.count),
                            backgroundColor: colorPrimary
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top'
                            },
                            title: {
                                display: true,
                                text: 'Citas por Doctor'
                            }
                        }
                    }
                });

                // Add doctor chart to PDF
                doc.image(doctorCanvas.toBuffer(), 50, currentY, {
                    fit: [400, 200],
                    align: 'center'
                });

                currentY += 220;
            } else {
                // Si no hay datos de doctores, mostrar un mensaje
                doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor(colorTextMedium)
                   .text('No hay datos de citas por doctor en el período seleccionado', 50, currentY);
                
                currentY += 40;
            }

            // Time Trends - Start new page
            doc.addPage();

            doc.fillColor(colorPrimary)
               .fontSize(16)
               .font('Helvetica-Bold')
               .text('Tendencias en el Tiempo', 50, 50);

            currentY = 80;

            // Create time trends chart
            const trendCanvas = createCanvas(400, 200);
            const trendCtx = trendCanvas.getContext('2d') as unknown as ChartItem;

            // Group appointments by date
            const appointmentsByDate = appointments.reduce((acc: any, app: any) => {
                // Usamos la fecha de la cita (date) en lugar de appointment_date
                const date = new Date(app.date).toLocaleDateString();
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            const dates = Object.keys(appointmentsByDate).sort();
            const counts = dates.map(date => appointmentsByDate[date]);

            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Citas por Día',
                        data: counts,
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
                            position: 'top'
                        },
                        title: {
                            display: true,
                            text: 'Tendencia de Citas'
                        }
                    }
                }
            });

            // Add trend chart to PDF
            doc.image(trendCanvas.toBuffer(), 50, currentY, {
                fit: [400, 200],
                align: 'center'
            });

            // Finalize the PDF
            doc.end();

        } catch (err) {
            reject(err);
        }
    });
} 