import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function convertColorToRgb(colorStr: string, ctx: CanvasRenderingContext2D | null): string {
  if (!ctx) return '#4f46e5';
  try {
    ctx.fillStyle = 'rgb(1, 2, 3)';
    ctx.fillStyle = colorStr;
    const res = ctx.fillStyle;
    if (res && !res.includes('oklch') && !res.includes('oklab') && !res.includes('lab')) {
      return res;
    }
  } catch {
    // fallback
  }
  return '#4f46e5';
}

function replaceUnsupportedColors(cssText: string, ctx: CanvasRenderingContext2D | null): string {
  if (!cssText) return cssText;
  return cssText
    .replace(/oklch\([^)]+\)/gi, (match) => convertColorToRgb(match, ctx))
    .replace(/oklab\([^)]+\)/gi, (match) => convertColorToRgb(match, ctx))
    .replace(/lab\([^)]+\)/gi, (match) => convertColorToRgb(match, ctx));
}

export async function exportReportToPDF(elementId: string, filename: string = 'รายงานสรุปผลการประเมิน_ม2.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('ไม่พบองค์ประกอบรายงานสำหรับสร้าง PDF');
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc: Document) => {
        try {
          const helperCanvas = document.createElement('canvas');
          helperCanvas.width = 1;
          helperCanvas.height = 1;
          const ctx = helperCanvas.getContext('2d');

          // 1. Convert all <style> blocks
          const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
          styleElements.forEach((styleEl) => {
            if (
              styleEl.textContent &&
              (styleEl.textContent.includes('oklch') ||
                styleEl.textContent.includes('oklab') ||
                styleEl.textContent.includes('lab('))
            ) {
              styleEl.textContent = replaceUnsupportedColors(styleEl.textContent, ctx);
            }
          });

          // 2. Convert all inline style attributes
          const styledElements = Array.from(
            clonedDoc.querySelectorAll<HTMLElement>('[style*="oklch"], [style*="oklab"], [style*="lab"]')
          );
          styledElements.forEach((el) => {
            const styleAttr = el.getAttribute('style');
            if (styleAttr) {
              el.setAttribute('style', replaceUnsupportedColors(styleAttr, ctx));
            }
          });

          // 3. Safe computed style replacement using clonedDoc's window view
          const clonedTarget = clonedDoc.getElementById(elementId);
          if (clonedTarget) {
            const docWin = clonedDoc.defaultView || window;
            const allNodes = [clonedTarget, ...Array.from(clonedTarget.querySelectorAll<HTMLElement>('*'))];
            allNodes.forEach((node) => {
              try {
                const computed = docWin.getComputedStyle(node);
                if (computed) {
                  ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach((prop) => {
                    const val = computed.getPropertyValue(prop);
                    if (
                      val &&
                      (val.includes('oklch') || val.includes('oklab') || val.includes('lab('))
                    ) {
                      const converted = replaceUnsupportedColors(val, ctx);
                      node.style.setProperty(prop, converted, 'important');
                    }
                  });
                }
              } catch {
                // Ignore node style lookup errors
              }
            });
          }
        } catch (e) {
          console.warn('onclone style conversion warning:', e);
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First Page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add extra pages if long document
    while (heightLeft >= 10) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (canvasErr) {
    console.error('Canvas/jsPDF generation failed, falling back to browser print:', canvasErr);
    window.print();
  }
}


