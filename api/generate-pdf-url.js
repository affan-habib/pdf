const puppeteer = require("puppeteer");
const chromium = require("chrome-aws-lambda");

module.exports = async (req, res) => {
  const allowedOrigins = [
    "http://localhost:5173",
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

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || puppeteer.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=generated-from-url.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF from URL:", error);
    res.status(500).json({ error: "Failed to generate PDF from URL" });
  }
};
