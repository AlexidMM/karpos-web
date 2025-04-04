import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';
import { Chart } from 'chart.js';
import {
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
} from 'chart.js';
import type { ChartItem } from 'chart.js';
import { createCanvas } from 'canvas';

// Register Chart.js components
Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend
);

export const GET: RequestHandler = async ({ url, fetch, cookies }) => {
    try {
        // Get auth token if needed
        const accessToken = cookies.get('access_token');
        
        // Get URL parameters
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const patientId = url.searchParams.get('patientId');
        
        // Build API URL with filters
        const apiUrl = new URL('http://10.224.0.3:3001/iot');
        if (startDate) apiUrl.searchParams.append('startDate', startDate);
        if (endDate) apiUrl.searchParams.append('endDate', endDate);
        if (patientId && patientId !== 'all') apiUrl.searchParams.append('patientId', patientId);
        
        console.log('🔄 Fetching data from:', apiUrl.toString());
        
        // Fetch data with auth token if available
        const response = await fetch(apiUrl.toString(), {
            headers: accessToken ? {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            } : {}
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`Error fetching IoT data: ${response.status} ${response.statusText}`);
        }
        
        const iotData = await response.json();
        console.log('✅ Data received:', iotData.length, 'records');
        
        // Generate PDF
        const pdfBuffer = await generateIoTReport(iotData, {
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            patientId: patientId || undefined
        });
        
        // Return PDF as response
        return new Response(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="reporte-iot-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });
        
    } catch (error) {
        console.error('Error generating IoT report:', error);
        return json({ error: 'Error generating IoT report' }, { status: 500 });
    }
};

// Function to generate PDF with PDFKit
async function generateIoTReport(
    iotData: Array<any>,
    filters: { startDate?: string; endDate?: string; patientId?: string }
): Promise<Buffer> {
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
            const colorPrimary = '#4285f4';       // Primary blue
            const colorSecondary = '#34a853';     // Green
            const colorPulse = '#ea4335';         // Red for pulse
            const colorForce = '#4285f4';         // Blue for force
            const colorBackgroundLight = '#f8f9fa'; // Light background
            const colorTextDark = '#202124';      // Dark text
            const colorTextMedium = '#5f6368';    // Medium gray text
            
            // Header - Company name and branding
            doc.fillColor(colorPrimary)
               .rect(0, 0, doc.page.width, 80)
               .fill();
            
            // Logo or company name
            doc.fillColor('white')
               .font('Helvetica-Bold')
               .fontSize(28)
               .text('KARPOS', 50, 30, { align: 'left' });
            
            // Subtitle
            doc.fontSize(14)
               .text('Sistema de Gestión Médica', 50, 60, { align: 'left' });
            
            // Separator line
            doc.strokeColor(colorSecondary)
               .lineWidth(2)
               .moveTo(50, 90)
               .lineTo(doc.page.width - 50, 90)
               .stroke();
            
            // Start main content
            let currentY = 110;
            
            // Report title
            doc.fillColor(colorPrimary)
               .fontSize(20)
               .font('Helvetica-Bold')
               .text('IoT Data Report', 50, currentY, { align: 'center' });
            
            currentY += 40;
            
            // Filters section with background
            doc.fillColor(colorBackgroundLight)
               .roundedRect(50, currentY, doc.page.width - 100, 70, 10)
               .fill();
            
            currentY += 15;
            
            // Filters content
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor(colorTextDark);
            
            // First column of filters
            let leftX = 70;
            doc.text('Date Range:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold')
               .text(` ${filters.startDate || 'All'} to ${filters.endDate || 'All'}`, { 
                    continued: false,
                    underline: false
               })
               .font('Helvetica');
            
            currentY += 20;
            
            doc.text('Patient ID:', leftX, currentY, { continued: true })
               .font('Helvetica-Bold');
            
            if (filters.patientId && filters.patientId !== 'all') {
                doc.text(` ${filters.patientId}`);
            } else {
                doc.text(' All Patients');
            }
            
            currentY += 50;
            
            // Process the data and generate charts
            if (iotData.length > 0) {
                // Create pulse chart
                const pulseCanvas = createCanvas(400, 200);
                const pulseCtx = pulseCanvas.getContext('2d') as unknown as ChartItem;
                
                // Prepare pulse data
                const pulseData = iotData.map(record => {
                    return {
                        date: new Date(record.fecha).toLocaleDateString(),
                        values: record.pulso || [],
                        avg: record.pulso && record.pulso.length ? 
                            record.pulso.reduce((a: number, b: number) => a + b, 0) / record.pulso.length : 0
                    };
                });
                
                // Create consolidated data for chart
                const dataPoints = pulseData.flatMap((record, recordIndex) => 
                    record.values.map((value: number, index: number) => ({
                        x: `${record.date} - M${index+1}`,
                        y: value
                    }))
                );
                
                // Create pulse chart
                new Chart(pulseCtx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Pulse',
                            data: dataPoints,
                            borderColor: colorPulse,
                            backgroundColor: colorPulse + '40',
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
                                text: 'Pulse Measurements'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Measurements'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Pulse Value'
                                },
                                min: 0
                            }
                        }
                    }
                });
                
                // Add pulse chart to PDF
                doc.font('Helvetica-Bold')
                   .fontSize(14)
                   .fillColor(colorPrimary)
                   .text('Pulse Measurements', 50, currentY);
                
                currentY += 25;
                
                doc.image(pulseCanvas.toBuffer(), 50, currentY, {
                    fit: [400, 200],
                    align: 'center'
                });
                
                currentY += 220;
                
                // Create force chart
                const forceCanvas = createCanvas(400, 200);
                const forceCtx = forceCanvas.getContext('2d') as unknown as ChartItem;
                
                // Prepare force data
                const forceData = iotData.map(record => {
                    return {
                        date: new Date(record.fecha).toLocaleDateString(),
                        values: record.fuerza || [],
                        avg: record.fuerza && record.fuerza.length ? 
                            record.fuerza.reduce((a: number, b: number) => a + b, 0) / record.fuerza.length : 0
                    };
                });
                
                // Create consolidated data for chart
                const forceDataPoints = forceData.flatMap((record, recordIndex) => 
                    record.values.map((value: number, index: number) => ({
                        x: `${record.date} - M${index+1}`,
                        y: value
                    }))
                );
                
                // Check if we need a new page
                if (currentY > 600) {
                    doc.addPage();
                    currentY = 80;
                }
                
                // Create force chart
                new Chart(forceCtx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Force',
                            data: forceDataPoints,
                            borderColor: colorForce,
                            backgroundColor: colorForce + '40',
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
                                text: 'Force Measurements'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Measurements'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Force Value'
                                },
                                min: 0
                            }
                        }
                    }
                });
                
                // Add force chart to PDF
                doc.font('Helvetica-Bold')
                   .fontSize(14)
                   .fillColor(colorPrimary)
                   .text('Force Measurements', 50, currentY);
                
                currentY += 25;
                
                doc.image(forceCanvas.toBuffer(), 50, currentY, {
                    fit: [400, 200],
                    align: 'center'
                });
                
                currentY += 220;
                
                // Add detailed data table
                // Check if we need a new page
                if (currentY > 600) {
                    doc.addPage();
                    currentY = 80;
                }
                
                // Table title
                doc.font('Helvetica-Bold')
                   .fontSize(14)
                   .fillColor(colorPrimary)
                   .text('Detailed Data', 50, currentY);
                
                currentY += 25;
                
                // Table headers with background
                const colDate = 60;
                const colAppointment = 150;
                const colPulseAvg = 280;
                const colForceAvg = 420;
                
                // Draw header background
                doc.fillColor(colorPrimary)
                   .rect(50, currentY, doc.page.width - 100, 25)
                   .fill();
                
                // Draw headers
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica-Bold');
                
                doc.text('Date', colDate, currentY + 8);
                doc.text('Appointment ID', colAppointment, currentY + 8);
                doc.text('Pulse (Average)', colPulseAvg, currentY + 8);
                doc.text('Force (Average)', colForceAvg, currentY + 8);
                
                currentY += 25;
                
                // Table rows
                doc.font('Helvetica')
                   .fontSize(9)
                   .fillColor(colorTextDark);
                
                // Alternate row colors
                iotData.forEach((record, i) => {
                    // Calculate row height
                    const rowHeight = 25;
                    
                    // Check if need new page
                    if (currentY + rowHeight > doc.page.height - 70) {
                        doc.addPage();
                        currentY = 80;
                        
                        // Redraw headers on new page
                        doc.fillColor(colorPrimary)
                           .rect(50, currentY, doc.page.width - 100, 25)
                           .fill();
                        
                        doc.fillColor('white')
                           .fontSize(10)
                           .font('Helvetica-Bold');
                        
                        doc.text('Date', colDate, currentY + 8);
                        doc.text('Appointment ID', colAppointment, currentY + 8);
                        doc.text('Pulse (Average)', colPulseAvg, currentY + 8);
                        doc.text('Force (Average)', colForceAvg, currentY + 8);
                        
                        currentY += 25;
                        
                        doc.font('Helvetica')
                           .fontSize(9)
                           .fillColor(colorTextDark);
                    }
                    
                    // Alternate row background
                    if (i % 2 === 0) {
                        doc.fillColor(colorBackgroundLight)
                           .rect(50, currentY, doc.page.width - 100, rowHeight)
                           .fill();
                    }
                    
                    // Format date
                    let formattedDate = record.fecha;
                    try {
                        const date = new Date(record.fecha);
                        formattedDate = date.toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                    } catch (e) {
                        // Keep original format if error
                    }
                    
                    // Calculate averages
                    const pulseAvg = record.pulso && record.pulso.length ? 
                        (record.pulso.reduce((a: number, b: number) => a + b, 0) / record.pulso.length).toFixed(2) : 'N/A';
                    
                    const forceAvg = record.fuerza && record.fuerza.length ? 
                        (record.fuerza.reduce((a: number, b: number) => a + b, 0) / record.fuerza.length).toFixed(2) : 'N/A';
                    
                    // Draw row data
                    doc.fillColor(colorTextDark)
                       .text(formattedDate, colDate, currentY + 8);
                    doc.text(record.cita, colAppointment, currentY + 8);
                    
                    // Pulse with color indicator
                    if (pulseAvg !== 'N/A') {
                        const pulseValue = parseFloat(pulseAvg);
                        // Color coding based on pulse value
                        let pulseColor = colorPrimary;
                        if (pulseValue > 100) pulseColor = colorPulse; // High pulse
                        else if (pulseValue < 60) pulseColor = '#fbbc05'; // Low pulse
                        
                        doc.fillColor(pulseColor)
                           .text(pulseAvg, colPulseAvg, currentY + 8);
                    } else {
                        doc.fillColor(colorTextMedium)
                           .text(pulseAvg, colPulseAvg, currentY + 8);
                    }
                    
                    // Force value
                    doc.fillColor(colorTextDark)
                       .text(forceAvg, colForceAvg, currentY + 8);
                    
                    currentY += rowHeight;
                });

                // Add total row
                currentY += 10; // Add some spacing before total row
                
                // Draw total row background
                doc.fillColor(colorPrimary)
                   .rect(50, currentY, doc.page.width - 100, 30)
                   .fill();
                
                // Calculate overall totals
                const totalPulse = iotData.reduce((sum, record) => {
                    if (!record.pulso || !record.pulso.length) return sum;
                    return sum + (record.pulso.reduce((a: number, b: number) => a + b, 0) / record.pulso.length);
                }, 0);
                
                const totalForce = iotData.reduce((sum, record) => {
                    if (!record.fuerza || !record.fuerza.length) return sum;
                    return sum + (record.fuerza.reduce((a: number, b: number) => a + b, 0) / record.fuerza.length);
                }, 0);
                
                const avgPulse = (totalPulse / iotData.length).toFixed(2);
                const avgForce = (totalForce / iotData.length).toFixed(2);
                
                // Draw total row content
                doc.fillColor('white')
                   .fontSize(10)
                   .font('Helvetica-Bold');
                
                doc.text('TOTAL AVERAGE', colDate, currentY + 10);
                doc.text('-', colAppointment, currentY + 10);
                doc.text(avgPulse, colPulseAvg, currentY + 10);
                doc.text(avgForce, colForceAvg, currentY + 10);
                
                currentY += 40;
            } else {
                // No data message
                doc.fillColor(colorTextMedium)
                   .fontSize(12)
                   .font('Helvetica-Italic')
                   .text('No IoT data found for the selected filters.', 50, currentY, { align: 'center' });
            }
            
            // Get total pages
            const totalPages = doc.bufferedPageRange().count;
            
            // Add footer to all pages
            for (let i = 0; i < totalPages; i++) {
                doc.switchToPage(i);
                
                // Footer
                const footerTop = doc.page.height - 50;
                
                // Separator line
                doc.strokeColor(colorPrimary)
                   .lineWidth(1)
                   .moveTo(50, footerTop)
                   .lineTo(doc.page.width - 50, footerTop)
                   .stroke();   
            }
            
            // Finalize the PDF
            doc.end();
            
        } catch (err) {
            reject(err);
        }
    });
}