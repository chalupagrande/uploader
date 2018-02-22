const inputFile = document.getElementById("file-input")
const browseButton = document.getElementById('js-browse')
const inputForm = document.getElementById('input-form')
const fileDropArea = document.getElementById('js-uploader__file-drop')
const toUploadList = document.getElementById('js-uploader__file-list')
const uploadButton = document.getElementById('js-upload-button')
const parser = new DOMParser()
let fileLists = []

// FEATURE DETECTION
const canDragUpload = function() {
  let div = document.createElement('div');
  return (('draggable' in div) || 
          ('ondragstart' in div && 'ondrop' in div)) && 
        'FormData' in window && 'FileReader' in window;
}();

run()


// RUNNER FUNCTIONS 
// .~~~~~~~~~~~~~~~~~~~~~~~~~~~
function run(){
  //check for drag and change description accordingly
  if(canDragUpload){
    document.getElementById('browse-qualifier').classList.add('hide')
  } else {
    document.getElementById('drag-qualifier').classList.add('hide')
  }
  addEventListeners()
}

function addEventListeners(){
  //trigger file browser on browse click
  browseButton.addEventListener('click', ()=>{
    inputFile.click()
  })
  
  inputFile.addEventListener('change', e =>{
    fileLists.push(e.target.files)
    updateFileList()
  })
  
  uploadButton.addEventListener('click', e =>{
    submit()
  })
  //add drag and drop dettection
  addListenerMulti(fileDropArea, 'drag dragstart dragend dragover dragenter dragleave drop', e =>{
    e.preventDefault();
    e.stopPropagation();
  })
   
  addListenerMulti(fileDropArea, 'dragover dragenter', e =>{
    fileDropArea.classList.add('is-draggedOver');
    console.log('dragged over')
  })
  addListenerMulti(fileDropArea, 'dragleave dragend drop', e =>{
    fileDropArea.classList.remove('is-draggedOver');
  })
  fileDropArea.addEventListener('drop', e =>{
    fileLists.push(e.dataTransfer.files)
    updateFileList()
  });
}

function updateFileList(){
  toUploadList.innerHTML = ''
  for(var i = 0; i < fileLists.length; i++){
    let file = fileLists[i][0]
    let fileElement = buildFileElement(file,i)
    toUploadList.appendChild(fileElement)
  }
  toggleSubmit()
  addFileListeners()
}

function addFileListeners(){
  document.querySelectorAll('.status-icon.cancel').forEach(e =>{
    e.addEventListener('click',(event)=>{
      let id = event.target.getAttribute('data-file-id')
      fileLists.splice(id, 1)
      updateFileList()
    })
  })
}

function updateProgressBar(id){
  let bar = document.querySelector(`.file__progress--uploaded[data-file-id="${id}"]`)
  let mark = document.querySelector(`.status-icon.cancel[data-file-id="${id}"]`)
  bar.classList.add('done')
  mark.setAttribute('src','./imgs/icon-check.svg')
  mark.classList.remove('cancel')
  mark.classList.add('done')
  fileLists = []
  toggleSubmit()
}

function buildFileElement(file,i){
  const template = `
  <div class="file" id="file-id-${i}">
    <img class='icon' src='./imgs/icon-file-doc.svg' alt='file type' />
    <div class="file__content">
      <div class="file__meta">
        <p class="file-name">${file.name}</p>
        <img class='status-icon cancel' src='./imgs/icon-close.svg' alt='close' data-file-id="${i}"/>
      </div>
      <div class='file__progress'>
        <div class='file__progress--base'></div>
        <div class='file__progress--uploaded' data-file-id="${i}"></div>
      </div>
    </div>
  </div>
  `
  let element = parser.parseFromString(template, "text/html")
                  .querySelector('.file');
  return element
}


// Helper Functions
//~~~~~~~~~~~~~~~~~~~~~~
function toggleSubmit(){
  if(fileLists.length) uploadButton.classList.add('isVisible')
  else uploadButton.classList.remove('isVisible')
}

function submit(){

  fileLists.forEach((e,i)=>{
    let formData = new FormData()
    let data = e[0]
    formData.append('avatar', data)

    fetch('http://localhost:3000/upload', {
      method:'PUT',
      body: formData
    }).then((res)=> consume(res.body.getReader()))
    .then(res => updateProgressBar(i))
    .catch(err => console.log('ERROR', err))
  })
  

  function consume(reader) {
    var total = 0
    return new Promise((resolve, reject) => {
      function pump() {
        reader.read().then(({value, done}) => {
          if (done) {
            resolve()
            return
          }
          total += value.byteLength
          console.log(`${value.byteLength}/${total}`)
          pump()
        }).catch(reject)
      }
      pump()
    })
  }
}

function addListenerMulti(el, s, fn) {
  s.split(' ').forEach(e => {
    el.addEventListener(e, fn, false)
  });
}

