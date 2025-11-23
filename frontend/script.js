const API_BASE = "http://127.0.0.1:8000";

function setMessage(text, type = "info") {
    const el = document.getElementById("message");
    if (!el) return;
    el.textContent = text;
    el.className = type ? `message ${type}` : "message";
}

async function fetchJSON(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return res.json();
    }
    return {};
}

async function loadMedicines() {
    try {
        setMessage("Loading medicines...", "info");
        const data = await fetchJSON(`${API_BASE}/medicines`);
        const medicines = Array.isArray(data) ? data : (data.medicines || []);
        renderMedicines(medicines);
        setMessage("Medicines loaded.", "success");
    } catch (err) {
        console.error(err);
        setMessage("Error loading medicines.", "error");
    }
}

function renderMedicines(medicines) {
    const tbody = document.getElementById("medicines-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    medicines.forEach((med) => {
        const tr = document.createElement("tr");

        const nameTd = document.createElement("td");
        nameTd.textContent = med.name;

        const priceTd = document.createElement("td");
        priceTd.textContent = med.price;

        const actionsTd = document.createElement("td");

        const deleteBtn = document.createElement("button");
        const changePrice = document.createElement("button");

        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-delete";
        deleteBtn.addEventListener("click", () => handleDelete(med.name));

        changePrice.textContent = "Change Price";
        changePrice.className = "btn btn-change";
        changePrice.addEventListener("click", () => handleChangePrice(med.name));

        actionsTd.appendChild(deleteBtn);
        actionsTd.appendChild(changePrice);

        tr.appendChild(nameTd);
        tr.appendChild(priceTd);
        tr.appendChild(actionsTd);

        tbody.appendChild(tr);
    });
}

async function handleCreate(event) {
    event.preventDefault();
    const form = event.target;

    const name = document.getElementById("create-name").value.trim();
    const price = document.getElementById("create-price").value;

    if (!name || !price) {
        setMessage("Name and price are required.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", parseFloat(price));

    try {
        await fetchJSON(`${API_BASE}/create`, {
            method: "POST",
            body: formData
        });
        setMessage("Medicine created.", "success");
        form.reset();
        await loadMedicines();
    } catch (err) {
        console.error(err);
        setMessage("Failed to create medicine.", "error");
    }
}

async function handleUpdate(event) {
    event.preventDefault();
    const name = document.getElementById("update-name").value.trim();
    const price = document.getElementById("update-price").value;

    if (!name || !price) {
        setMessage("Name and new price are required.", "error");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", parseFloat(price));

    try {
        await fetchJSON(`${API_BASE}/update`, {
            method: "POST",
            body: formData
        });
        setMessage("Medicine updated.", "success");
        event.target.reset();
        await loadMedicines();
    } catch (err) {
        console.error(err);
        setMessage("Failed to update medicine.", "error");
    }
}

async function handleChangePrice(name) {
    const confirmed = window.confirm(`Change Price "${name}"?`);
    if (!confirmed) return;

    const newprice = window.prompt("Enter new price:");
    if (newprice == null) return;

    const correctedPrice = parseFloat(newprice);
    if (isNaN(correctedPrice) || correctedPrice <= 0) {
        alert("Invalid price. Must be a positive number.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", correctedPrice);

    try {
        await fetchJSON(`${API_BASE}/update`, {
            method: "POST",
            body: formData
        });
        setMessage("Medicine price updated.", "success");
        await loadMedicines();
    } catch (err) {
        console.error(err);
        setMessage("Failed to update medicine price.", "error");
    }
}

async function handleDelete(name) {
    if (!name) return;

    const confirmed = window.confirm(`Delete "${name}"?`);
    if (!confirmed) return;

    const formData = new FormData();
    formData.append("name", name);

    try {
        await fetchJSON(`${API_BASE}/delete`, {
            method: "DELETE",
            body: formData
        });
        setMessage(`Deleted "${name}".`, "success");
        await loadMedicines();
    } catch (err) {
        console.error(err);
        setMessage(`Failed to delete "${name}".`, "error");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const createForm = document.getElementById("create-form");
    const updateForm = document.getElementById("update-form");
    const refreshBtn = document.getElementById("refresh-medicines");

    if (createForm) createForm.addEventListener("submit", handleCreate);
    if (updateForm) updateForm.addEventListener("submit", handleUpdate);
    if (refreshBtn) refreshBtn.addEventListener("click", loadMedicines);

    loadMedicines();
});
