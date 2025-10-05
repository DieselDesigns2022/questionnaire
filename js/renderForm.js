document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("questionnaire-form");

  fetch("data/questions.json")
    .then((response) => response.json())
    .then((questions) => {
      questions.forEach((q) => {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.htmlFor = q.name;
        label.textContent = q.label;

        let input;

        if (q.type === "textarea") {
          input = document.createElement("textarea");
          input.rows = 3;
        } else if (q.type === "checkbox") {
          input = document.createElement("input");
          input.type = "checkbox";
          label.prepend(input);
          form.appendChild(label);
          return;
        } else {
          input = document.createElement("input");
          input.type = q.type || "text";
        }

        input.name = q.name;
        input.id = q.name;
        if (q.required) input.required = true;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        form.appendChild(wrapper);
      });

      // Add file upload
      const fileLabel = document.createElement("label");
      fileLabel.htmlFor = "logo";
      fileLabel.textContent = "Upload Logo (optional)";
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.name = "logo";
      fileInput.accept = "image/*";

      form.appendChild(fileLabel);
      form.appendChild(fileInput);

      // Add submit button
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.textContent = "Submit";
      form.appendChild(submit);
    })
    .catch((error) => {
      form.innerHTML = "<p>Failed to load questions.</p>";
      console.error("Error loading questions:", error);
    });
});
