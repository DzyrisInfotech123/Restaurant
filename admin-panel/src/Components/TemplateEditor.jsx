import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const PDFInvoiceGenerator = () => {
  const [pdfTemplate, setPdfTemplate] = useState(null);

  // Handle PDF Template Upload
  const handleUpload = (info) => {
    const file = info.file;
    const isPdf = file.type === "application/pdf";

    if (!isPdf) {
      message.error("Only PDF files are supported!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPdfTemplate(e.target.result);
      message.success(`${file.name} uploaded successfully`);
    };
    reader.readAsArrayBuffer(file);
  };

  // Generate and Download the Updated PDF
  const generateInvoice = async (orderDetails) => {
    if (!pdfTemplate) {
      message.error("Please upload a PDF template first!");
      return;
    }

    try {
      // Load the uploaded PDF template
      const pdfDoc = await PDFDocument.load(pdfTemplate);

      // Get the first page of the PDF
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Order Details
      const { orderNumber, date, products, total } = orderDetails;

      // Define text properties
      const fontSize = 12;
      const color = rgb(0, 0, 0);

      // Add Order Number and Date
      firstPage.drawText(`Order Number: ${orderNumber}`, {
        x: 50,
        y: 700,
        size: fontSize,
        color,
      });
      firstPage.drawText(`Date: ${date}`, {
        x: 50,
        y: 680,
        size: fontSize,
        color,
      });

      // Add Product Details
      let yPosition = 650;
      products.forEach((product, index) => {
        firstPage.drawText(`${index + 1}. ${product.name}`, {
          x: 50,
          y: yPosition,
          size: fontSize,
          color,
        });
        firstPage.drawText(`Quantity: ${product.quantity}`, {
          x: 200,
          y: yPosition,
          size: fontSize,
          color,
        });
        firstPage.drawText(`Price: ₹${product.price.toFixed(2)}`, {
          x: 300,
          y: yPosition,
          size: fontSize,
          color,
        });
        yPosition -= 20;
      });

      // Add Total Amount
      firstPage.drawText(`Total: ₹${total.toFixed(2)}`, {
        x: 50,
        y: yPosition - 10,
        size: fontSize,
        color,
      });

      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();

      // Trigger download
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      saveAs(blob, `Invoice_${orderNumber}.pdf`);
      message.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error generating invoice:", error);
      message.error("Failed to generate invoice.");
    }
  };

  return (
    <div>
      <h3>Upload PDF Template</h3>
      <Upload
        accept=".pdf"
        beforeUpload={(file) => {
          handleUpload({ file });
          return false; // Prevent automatic upload
        }}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Upload PDF Template</Button>
      </Upload>

      <Button
        type="primary"
        style={{ marginTop: "20px" }}
        onClick={() =>
          generateInvoice({
            orderNumber: "1044",
            date: "27-Jan-2025",
            products: [
              { name: "Chicken Fillet", quantity: 10, price: 100 },
              { name: "Chicken Strips", quantity: 5, price: 200 },
            ],
            total: 2000,
          })
        }
      >
        Download Invoice
      </Button>
    </div>
  );
};

export default PDFInvoiceGenerator;
