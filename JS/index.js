document.addEventListener("DOMContentLoaded", () => {
  const defaultJson = `{
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
}
`;

  // Initialize CodeMirror on the input textarea
  const jsonInputEditor = CodeMirror.fromTextArea(document.getElementById("jsonInput"), {
    mode: "application/json",
    theme: "material-darker",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
  });
  jsonInputEditor.setValue(defaultJson);
  jsonInputEditor.setSize(null, "500px");
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
  });
  jsonOutputEditor.setSize(null, "500px");

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
  jsonInputEditor.on('change', updateResults); // Listen to changes in CodeMirror editor
  document.getElementById('eval').addEventListener('change', updateResults);
  document.getElementById('ignoreEvalErrors').addEventListener('change', updateResults);
  let resultType = 'value';
  let outputpath = document.getElementById('outputpath');
  outputpath.addEventListener("change", () => {
    resultType = outputpath.checked ? 'path' : 'value';
    updateResults();
  });
  updateResults(); // Initial execution on load
});
