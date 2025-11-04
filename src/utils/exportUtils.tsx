
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  FileText, // Using FileText instead of FilePdf
  Printer,
  ArrowDown 
} from 'lucide-react';

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(dataBlob, `${fileName}.xlsx`);
};

export const exportToPDF = (tableId: string, fileName: string) => {
  const doc = new jsPDF();
  const table = document.getElementById(tableId);
  if (table) {
    doc.text(fileName, 14, 16);
    const tableHTML = table.innerHTML;
    doc.html(tableHTML, {
      callback: function (doc) {
        doc.save(`${fileName}.pdf`);
      },
      x: 15,
      y: 25
    });
  }
};

export const printTable = (tableId: string) => {
  const printContents = document.getElementById(tableId)?.innerHTML;
  if (printContents) {
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }
};

export const ExportIcons = {
  Excel: <ArrowDown size={18} />,
  PDF: <FileText size={18} />,
  Print: <Printer size={18} />
};