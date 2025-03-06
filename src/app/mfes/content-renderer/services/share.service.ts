import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class ShareService {


  async shareAsPDF(elementId: string, filename: string, theme: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

      // Create a wrapper div with padding  
    try {
      // Wait for images to load
      await Promise.all(
        Array.from(element.getElementsByTagName('img'))
          .map(img => new Promise(resolve => {
            if (img.complete) resolve(true);
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
          }))
      );

      let backgroundColor = theme === 'light' ? 'white' : 'black';
      const canvas = await html2canvas(element, {
        backgroundColor: backgroundColor,
        
        scale: 1,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth ,
        windowHeight: element.scrollHeight ,
        onclone: (doc) => {
          const el = doc.getElementById(elementId);
          if (el) {
            el.style.width = 'auto';
            el.style.height = 'auto';
            el.style.position = 'relative';
          }
        }
      });

      const imgWidth = 210; // A4 width in mm
      // const pageHeight = canvas.height; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.setFillColor(backgroundColor);

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        imgWidth,
        imgHeight,
        '',
        'FAST'
      );
      

      const pdfBlob = pdf.output('blob');
      if (navigator.share) {
        const file = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: filename,
        });
      } else {
        pdf.save(`${filename}.pdf`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }


  async shareAsImageInPDF(elementId: string, filename: string, theme: string) {
    let element = document.getElementById(elementId);
    if (!element) return;
    let backgroundColor = theme === 'light' ? 'white' : 'black';

    // element.style.padding = '60px';

    const canvas = await html2canvas(element, {
      backgroundColor: backgroundColor,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [(canvas.width / 4) , canvas.height / 4] // Adjust the size as needed
    });

    pdf.setFillColor(backgroundColor);

    pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());

    const pdfBlob = pdf.output('blob');
    if (navigator.share) {
      const file = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });
      await navigator.share({
        files: [file],
        title: filename,
      });
    } else {
      pdf.save(`${filename}.pdf`);
    }

    return pdf;

  }
} 
