async function generatePDF() {
    const url = document.getElementById('url').value;
    const htmlContent = document.getElementById('html').value;
    const pdfPreviewDiv = document.getElementById('pdf-preview');
    pdfPreviewDiv.innerHTML = 'Generating PDF...';

    let apiUrl;
    let payload;

    if (url) {
        apiUrl = 'http://localhost:3000/api/generate-pdf-url';
        payload = { url };
    } else if (htmlContent) {
        apiUrl = 'http://localhost:3000/api/generate-pdf-html';
        payload = { html: htmlContent };
    } else {
        pdfPreviewDiv.innerHTML = 'Please provide either a URL or HTML content.';
        return;
    }

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'generated-pdf.pdf';
            link.textContent = 'Download PDF';
            pdfPreviewDiv.innerHTML = '';
            pdfPreviewDiv.appendChild(link);
        } else {
            const errorText = await response.text();
            pdfPreviewDiv.innerHTML = `Error generating PDF: ${errorText}`;
        }
    } catch (error) {
        pdfPreviewDiv.innerHTML = 'Failed to generate PDF. Please check the console for errors.';
        console.error('Error:', error);
    }
}