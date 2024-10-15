document.addEventListener("DOMContentLoaded", () => {

    const defaultJson = `{
        "firstName": "John",
        "lastName": "doe",
        "age": 26,
        "address": {
            "streetAddress": "naist street",
            "city": "Nara",
            "postalCode": "630-0192"
        },
        "phoneNumbers": [
            {
                "type": "iPhone",
                "number": "0123-4567-8888"
            },
            {
                "type": "home",
                "number": "0123-4567-8910"
            }
        ]
    }`;

    const jsonInputEditor = CodeMirror.fromTextArea(document.getElementById("jsonInput"), {
        mode: "application/json",
        theme: "material-darker",
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
    });

    jsonInputEditor.setValue(defaultJson);

    // Initialize CodeMirror on the output textarea (read-only)
    const jsonOutputEditor = CodeMirror.fromTextArea(document.getElementById("jsonOutput"), {
        mode: "application/json",
        theme: "material-darker",
        lineNumbers: true,
        readOnly: true, // Output editor should be read-only
    });

    // Function to format the input and show in the output
    jsonInputEditor.on("change", () => {
        const inputContent = jsonInputEditor.getValue();
        try {
            const parsedJson = JSON.parse(inputContent); // Parse input JSON
            const formattedJson = JSON.stringify(parsedJson, null, 2); // Format JSON with indentation
            jsonOutputEditor.setValue(formattedJson);
        } catch (e) {
            jsonOutputEditor.setValue("Invalid JSON");
        }
    });
});