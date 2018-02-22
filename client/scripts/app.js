'use strict';

var inputFile = document.getElementById("file-input");
var browseButton = document.getElementById('js-browse');
var inputForm = document.getElementById('input-form');
var fileDropArea = document.getElementById('js-uploader__file-drop');
var toUploadList = document.getElementById('js-uploader__file-list');
var uploadButton = document.getElementById('js-upload-button');
var parser = new DOMParser();
var fileLists = [];

// FEATURE DETECTION
var canDragUpload = function () {
  var div = document.createElement('div');
  return ('draggable' in div || 'ondragstart' in div && 'ondrop' in div) && 'FormData' in window && 'FileReader' in window;
}();

run();

// RUNNER FUNCTIONS 
// .~~~~~~~~~~~~~~~~~~~~~~~~~~~
function run() {
  //check for drag and change description accordingly
  if (canDragUpload) {
    document.getElementById('browse-qualifier').classList.add('hide');
  } else {
    document.getElementById('drag-qualifier').classList.add('hide');
  }
  addEventListeners();
}

function addEventListeners() {
  //trigger file browser on browse click
  browseButton.addEventListener('click', function () {
    inputFile.click();
  });

  inputFile.addEventListener('change', function (e) {
    fileLists.push(e.target.files);
    updateFileList();
  });

  uploadButton.addEventListener('click', function (e) {
    submit();
  });
  //add drag and drop dettection
  addListenerMulti(fileDropArea, 'drag dragstart dragend dragover dragenter dragleave drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  addListenerMulti(fileDropArea, 'dragover dragenter', function (e) {
    fileDropArea.classList.add('is-draggedOver');
    console.log('dragged over');
  });
  addListenerMulti(fileDropArea, 'dragleave dragend drop', function (e) {
    fileDropArea.classList.remove('is-draggedOver');
  });
  fileDropArea.addEventListener('drop', function (e) {
    fileLists.push(e.dataTransfer.files);
    updateFileList();
  });
}

function updateFileList() {
  toUploadList.innerHTML = '';
  for (var i = 0; i < fileLists.length; i++) {
    var file = fileLists[i][0];
    var fileElement = buildFileElement(file, i);
    toUploadList.appendChild(fileElement);
  }
  toggleSubmit();
  addFileListeners();
}

function addFileListeners() {
  document.querySelectorAll('.status-icon.cancel').forEach(function (e) {
    e.addEventListener('click', function (event) {
      var id = event.target.getAttribute('data-file-id');
      fileLists.splice(id, 1);
      updateFileList();
    });
  });
}

function updateProgressBar(id) {
  var bar = document.querySelector('.file__progress--uploaded[data-file-id="' + id + '"]');
  var mark = document.querySelector('.status-icon.cancel[data-file-id="' + id + '"]');
  bar.classList.add('done');
  mark.setAttribute('src', './imgs/icon-check.svg');
  mark.classList.remove('cancel');
  mark.classList.add('done');
  fileLists = [];
  toggleSubmit();
}

function buildFileElement(file, i) {
  var template = '\n  <div class="file" id="file-id-' + i + '">\n    <img class=\'icon\' src=\'./imgs/icon-file-doc.svg\' alt=\'file type\' />\n    <div class="file__content">\n      <div class="file__meta">\n        <p class="file-name">' + file.name + '</p>\n        <img class=\'status-icon cancel\' src=\'./imgs/icon-close.svg\' alt=\'close\' data-file-id="' + i + '"/>\n      </div>\n      <div class=\'file__progress\'>\n        <div class=\'file__progress--base\'></div>\n        <div class=\'file__progress--uploaded\' data-file-id="' + i + '"></div>\n      </div>\n    </div>\n  </div>\n  ';
  var element = parser.parseFromString(template, "text/html").querySelector('.file');
  return element;
}

// Helper Functions
//~~~~~~~~~~~~~~~~~~~~~~
function toggleSubmit() {
  if (fileLists.length) uploadButton.classList.add('isVisible');else uploadButton.classList.remove('isVisible');
}

function submit() {

  fileLists.forEach(function (e, i) {
    var formData = new FormData();
    var data = e[0];
    formData.append('avatar', data);

    fetch('http://localhost:3000/upload', {
      method: 'PUT',
      body: formData
    }).then(function (res) {
      return consume(res.body.getReader());
    }).then(function (res) {
      return updateProgressBar(i);
    }).catch(function (err) {
      return console.log('ERROR', err);
    });
  });

  function consume(reader) {
    var total = 0;
    return new Promise(function (resolve, reject) {
      function pump() {
        reader.read().then(function (_ref) {
          var value = _ref.value,
              done = _ref.done;

          if (done) {
            resolve();
            return;
          }
          total += value.byteLength;
          console.log(value.byteLength + '/' + total);
          pump();
        }).catch(reject);
      }
      pump();
    });
  }
}

function addListenerMulti(el, s, fn) {
  s.split(' ').forEach(function (e) {
    el.addEventListener(e, fn, false);
  });
}
//# sourceMappingURL=app.js.map
