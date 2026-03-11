const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const generateCertificatePDF = async (data) => {
  // 1️⃣ Read HTML template
  const templatePath = path.join(
    process.cwd(),
    "templates",
    "certificate.html"
  );

  let html = fs.readFileSync(templatePath, "utf8");

  html = html
    .replace("{{USER_NAME}}", data.userName)
    .replace("{{COURSE_NAME}}", data.courseName)
    .replace("{{INSTRUCTOR_NAME}}", data.instructorName)
    .replace("{{DATE}}", new Date().toDateString());

  // 2️⃣ Generate PDF buffer
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  await page.setViewport({
    width: 1100,
    height: 700
  });

  // PDF
  const pdfBuffer = await page.pdf({
    format: "A4",
    landscape: true,
    printBackground: true
  });

  // PNG preview
  const pngBuffer = await page.screenshot({
    type: "png",
    fullPage: false,
    omitBackground: true
  });

  await browser.close();

   // Upload PDF
  const pdfUpload = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "certificates",
        public_id: data.certificateId
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
  });


   // Upload PNG
  const pngUpload = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "certificates",
        public_id: data.certificateId + "-preview"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(pngBuffer).pipe(uploadStream);
  });

  // 4️⃣ Return Cloud URL
   return {
    pdfUrl: pdfUpload.secure_url,
    pngUrl: pngUpload.secure_url
  };
};

module.exports = {
  generateCertificatePDF
}