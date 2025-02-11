const pdfMake = require('pdfmake');

module.exports = async (req, res) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://pdf-dahhpqff1-affanhabibs-projects-8bf99f86.vercel.app",
    "https://resume-builder-nu-three.vercel.app/resume/preview",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { html } = req.body;
  if (!html) {
    return res.status(400).json({ error: "HTML content is required" });
  }

  try {
    // pdfmake requires a document definition
    const documentDefinition = {
      content: [
        {
          text: 'Generated PDF from HTML',
          style: 'header'
        },
        {
          html: html
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        }
      }
    };

    const pdfDoc = new pdfMake({
      Roboto: {
        normal: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(require('pdfmake/build/vfs_fonts.js').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
      }
    }).createPdfKitDocument(documentDefinition);

    let chunks = [];
    pdfDoc.on('data', chunk => {
      chunks.push(chunk);
    });
    pdfDoc.on('end', () => {
      const result = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=generated-from-html.pdf');
      res.send(result);
    });
    pdfDoc.end();

  } catch (error) {
    console.error("Error generating PDF from HTML:", error);
    res.status(500).json({ error: "Failed to generate PDF from HTML" });
  }
};
