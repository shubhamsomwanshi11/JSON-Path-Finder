document.addEventListener("DOMContentLoaded", () => {
  const json = {
    "store": {
      "book": [
        {
          "category": "reference",
          "author": "Nigel Rees",
          "title": "Sayings of the Century",
          "price": 8.95
        },
        {
          "category": "fiction",
          "author": "Evelyn Waugh",
          "title": "Sword of Honour",
          "price": 12.99
        },
        {
          "category": "fiction",
          "author": "Herman Melville",
          "title": "Moby Dick",
          "isbn": "0-553-21311-3",
          "price": 8.99
        },
        {
          "category": "fiction",
          "author": "J. R. R. Tolkien",
          "title": "The Lord of the Rings",
          "isbn": "0-395-19395-8",
          "price": 22.99
        }
      ],
      "bicycle": {
        "color": "red",
        "price": 19.95
      }
    }
  };

  const defaultJson = `${JSON.stringify(json, null, 2)}`;

  // Initialize CodeMirror on the input textarea
  const jsonInputEditor = CodeMirror.fromTextArea(document.getElementById("jsonInput"), {
    mode: "application/json",
    theme: "material-darker",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
  });
  jsonInputEditor.setValue(defaultJson);
  jsonInputEditor.setSize(null, "550px");
  // Initialize CodeMirror on the output textarea (read-only)
  // Assuming your CodeMirror editor is already initialized
  const jsonOutputEditor = CodeMirror.fromTextArea(document.getElementById("jsonOutput"), {
    mode: "application/json",
    theme: "material-darker",
    lineNumbers: true,
    readOnly: true, // Output editor should be read-only
  });

  // Add event listener for the copy button
  document.getElementById("copyButton").addEventListener("click", () => {
    // Get the content of the CodeMirror editor
    const content = jsonOutputEditor.getValue();
    copyText(content);
  });

  document.getElementById('copyDynamic').addEventListener("click", () => {
    const content = document.getElementById('clickedPathDisplay').value;
    copyText(content);
  });
  jsonOutputEditor.setSize(null, "550px");

  const updateResults = () => {
    const jsonpathEl = document.getElementById('jsonpath');

    const reportValidity = () => {
      setTimeout(() => {
        jsonpathEl.reportValidity();
      });
    };

    let json;
    try {
      json = JSON.parse(jsonInputEditor.getValue());
    } catch (err) {
      jsonpathEl.setCustomValidity('Error parsing JSON: ' + err.toString());
      reportValidity();
      return;
    }
    try {
      const result = new JSONPath.JSONPath({
        path: jsonpathEl.value,
        json,
        resultType: resultType,
        eval: document.getElementById('eval').value === 'false' ? false : document.getElementById('eval').value,
        ignoreEvalErrors: document.getElementById('ignoreEvalErrors').value === 'true'
      });
      jsonOutputEditor.setValue(JSON.stringify(result, null, 2)); // Use CodeMirror's API to set the output value
    } catch (err) {
      jsonpathEl.setCustomValidity(
        'Error executing JSONPath: ' + err.toString()
      );
      reportValidity();
      jsonOutputEditor.setValue(''); // Clear the output editor if there is an error
    }
  };

  document.getElementById('jsonpath').addEventListener('input', updateResults);
  jsonInputEditor.on('change', () => {
    updateResults();
    reader.init(JSON.parse(jsonInputEditor.getValue()));
  }); // Listen to changes in CodeMirror editor
  document.getElementById('eval').addEventListener('change', updateResults);
  document.getElementById('ignoreEvalErrors').addEventListener('change', updateResults);
  let resultType = 'value';
  let outputpath = document.getElementById('outputpath');
  outputpath.addEventListener("change", () => {
    resultType = outputpath.checked ? 'path' : 'value';
    updateResults();
  });
  updateResults(); // Initial execution on load
  const reader = new Reader();
  reader.init(json);
  const firstClickableElement = document.querySelector("#json-reader .json-reader-tree-property, #json-reader summary");

  if (firstClickableElement) {
    firstClickableElement.click(); // Simulate a click
  }
});

function toEntries(arrOrObj) {
  if (Array.isArray(arrOrObj)) {
    return arrOrObj.map((item, index) => [index, item]);
  }
  return Object.entries(arrOrObj);
}

class Reader {
  constructor() {
    this.rootPath = "x"; // Base path
  }

  static appendKeyToPath(key, path) {
    if (Number.isInteger(key)) {
      return `${path}[${key}]`;
    }
    if (/[^A-Za-z0-9_$]/.test(key)) {
      return `${path}["${key}"]`;
    }
    return `${path}.${key}`;
  }

  renderLeafNode({ key, value, path }) {
    const newPath = Reader.appendKeyToPath(key, path);

    const button = document.createElement("button");
    button.classList.add("json-reader-tree-property");
    button.addEventListener("click", () => {
      // Update path display on click
      document.getElementById('clickedPathDisplay').value = newPath;
    });

    const keySpan = document.createElement("span");
    keySpan.textContent = `${key}: `;
    button.appendChild(keySpan);

    const valSpan = document.createElement("span");
    valSpan.textContent = value?.toString() || "null";
    button.appendChild(valSpan);

    return button;
  }

  renderParentNode({ key, value, path }) {
    const newPath = Reader.appendKeyToPath(key, path);

    const details = document.createElement("details");

    const summary = document.createElement("summary");
    summary.classList.add("json-reader-tree-parent");
    summary.addEventListener("click", () => {
      // Update path display on click
      document.getElementById('clickedPathDisplay').value = newPath;
    });
    details.appendChild(summary);

    const keySpan = document.createElement("span");
    keySpan.textContent = `${key}: `;
    summary.appendChild(keySpan);

    const subtree = this.renderTree(value, { path: newPath, isSubtree: true });
    details.appendChild(subtree);

    return details;
  }

  renderTree(obj, { path = this.rootPath, isSubtree = false } = {}) {
    const entries = toEntries(obj);
    const rootDiv = document.createElement("div");

    entries.forEach(([key, value]) => {
      const property = this.isLeafNode(value)
        ? this.renderLeafNode({ key, value, path })
        : this.renderParentNode({ key, value, path });

      // Add indentation for child nodes
      if (isSubtree) {
        property.classList.add("json-child");
      }

      rootDiv.appendChild(property);
    });

    return rootDiv;
  }

  isLeafNode(value) {
    return value === null || value === undefined || typeof value !== "object";
  }

  renderReader(obj) {
    const rootDiv = this.renderTree(obj);
    const reader = document.getElementById("json-reader");
    reader.innerHTML = ""; // Clear previous content
    reader.appendChild(rootDiv);
  }

  init(jsonData) {
    this.renderReader(jsonData);
  }
}

function copyText(content) {
  // Create a temporary textarea to hold the content for copying
  const tempTextarea = document.createElement("textarea");
  tempTextarea.value = content;
  document.body.appendChild(tempTextarea);

  // Select the content
  tempTextarea.select();
  tempTextarea.setSelectionRange(0, 99999); // For mobile devices

  // Copy the selected text to the clipboard
  document.execCommand("copy");

  // Remove the temporary textarea
  document.body.removeChild(tempTextarea);

  // Optionally, show an alert or message that the content was copied
  alert("Copied to clipboard!");
}