const api_url = process_env.api_url_testing;
console.log(api_url);
const dropArea = document.getElementById("drop-area");
const pdfContainer = document.getElementById("pdf-container");
const docs_to_send = [];

// Escuchar evento drop en todo el documento
document.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  handleFiles(files, pdfContainer);
});

// Escuchar evento dragover en todo el documento
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});

async function handleFiles(files, container) {
  let currentRow = container.lastElementChild;
  for (const file of files) {
    if (file.type === "application/pdf") {
      const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
      const pdf = await loadingTask.promise;
      const pageNumber = 1;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(250 / viewport.width, 350 / viewport.height);
      const scaledViewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = 350;
      canvas.width = 250;
      canvas.classList.add("pdf-item");
      if (!currentRow || currentRow.children.length >= 3) {
        currentRow = document.createElement("div");
        currentRow.classList.add("row");
        container.appendChild(currentRow);
      }
      currentRow.appendChild(canvas);
      dropArea.scrollTop = dropArea.scrollHeight - dropArea.clientHeight;
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      await page.render(renderContext).promise;
      docs_to_send.push(pdf);
      console.log(docs_to_send);
    } else {
      alert("¡Por favor, selecciona solo archivos PDF!");
    }
  }
}
