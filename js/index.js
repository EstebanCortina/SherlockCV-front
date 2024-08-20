const api_url = process_env.api_url;
console.log(api_url);
const dropArea = document.getElementById("drop-area");
const pdfContainer = document.getElementById("pdf-container");
const AnalyzeBtn = document.getElementById("analyze-btn");
const sortedPdfContainer = document.getElementById("sorted-pdfs-container");
const job_description = document.getElementById("job-description-area");

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

AnalyzeBtn.addEventListener("click", () => {
  sendDocs(docs_to_send);
});

async function handleFiles(files, container) {
  let currentRow = container.lastElementChild;
  for (const file of files) {
    if (file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
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
      docs_to_send.push(file);
    } else {
      alert("¡Por favor, selecciona solo archivos PDF!");
    }
  }
}

async function sendDocs(docs_to_send) {
  if (!docs_to_send.length) {
    alert("Agregue documentos al area de analisis");
    return false;
  }
  const formData = new FormData();

  // Agregar todos los archivos al FormData
  for (let i = 0; i < docs_to_send.length; i++) {
    const file = docs_to_send[i];
    formData.append("candidates_files", file);
  }
  formData.append("data", JSON.stringify({
    job_position_id: "1",
    job_position_name: 'Backend Developer',
    job_position_description: `
    Se busca desarrollador backend especializado en programación de APIs REST
    para desarrollar aplicación web. Es importante la comunicación, el trabajo en equipo y ser participativo.
    El trabajo es remoto y se requiere de un mínimo de 2 años de experiencia desarrollando.
    -Requisitos Obligatorios: Inglés intermedio o avanzado, experiencia laboral de 1 año mínimo, SQL, JavaScript,
     y Servicios en la nube.
    -Requisitos Opcionales(favorable a tener): Conocimiento en patrones de diseño, arquitectura de software,
    CI/CD, Terraform, Jenkins, Docker y certificaciones de cualquier tipo.`,
    score_list: {
      'ingles intermedio': 50,
      'experiencia': 50
    }
  }));

  // Enviar el FormData al servidor
  fetch(`${api_url}/start-analysis`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      data.data.final_analysis.forEach((item) => {
        sortedPdfContainer.innerHTML += `
        <div class="sorted-pdf-item">
          <div><span>${item.candidate_overall}</span></div>
          <div><img src=${item.front_page_url}></div><br>
          <div><strong>${item.file_name}</strong></div><br>       
          <div><strong>Nombre:</strong> ${item.candidate_name}</div><br>
          <div><strong>Resumen de candidato:</strong> ${item.candidate_resume}</div><br>
          <div><strong>Razones para contratar:</strong> ${item.candidate_reasons}</div><br>
          <div><strong>Fortalezas:</strong> ${item.candidate_strengths}</div><br>
          <div><strong>Debilidades:</strong> ${item.candidate_weaknesses}</div>
        </div>
          <br>
        `
       })
    });
}
