export const printImage = (imageBase64: string | null) => {
    if (!imageBase64) {
      alert("No image to print.");
      return;
    }
  
    const img = new Image();
    img.src = imageBase64;
  
    img.onload = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`<img src="${imageBase64}" alt="Print Image" />`);
        printWindow.document.close();
        printWindow.print();
      }
    };
  };
  
  export const saveImage = (imageBase64: string | null) => {
    if (!imageBase64) {
      alert("No image to save.");
      return;
    }
  
    const byteString = atob(imageBase64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'image.png';
    link.click();
  };
  