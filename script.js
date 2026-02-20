let startDatum = new Date(localStorage.getItem("rhythmusStart") || "2024-01-01");

window.onload = function() {
    const input = document.getElementById("startDatumInput");
    if(input) input.value = startDatum.toISOString().split('T')[0];
};

function updateStartDatum() {
    const neues = document.getElementById("startDatumInput").value;
    if(neues) {
        localStorage.setItem("rhythmusStart", neues);
        startDatum = new Date(neues);
        if(document.getElementById("dateInput").value) checkDate();
        alert("Rhythmus angepasst!");
    }
}

function calculateShift(selectedDate) {
    const datum = new Date(selectedDate);
    const diffTime = datum - startDatum;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let cycleDay = diffDays % 6;
    if (cycleDay < 0) cycleDay += 6;
    return cycleDay < 4 ? 
        { text: `Dienst (${cycleDay + 1}/4)`, class: "dienst" } : 
        { text: `Frei (${cycleDay - 3}/2)`, class: "frei" };
}

function checkDate() {
    const val = document.getElementById("dateInput").value;
    const res = document.getElementById("result");
    const note = document.getElementById("noteText");
    if (val) {
        const info = calculateShift(val);
        res.innerHTML = `<div class="${info.class}">${info.text}</div>`;
        document.getElementById("notesBox").style.display = "block";
        note.value = localStorage.getItem("note_" + val) || "";
    }
}

function saveNote() {
    const val = document.getElementById("dateInput").value;
    const txt = document.getElementById("noteText").value;
    if (val) {
        localStorage.setItem("note_" + val, txt);
        if (document.getElementById("monthView").style.display === "block") renderMonthContent();
        alert("Gespeichert!");
    }
}

function generateMonth() {
    const div = document.getElementById("monthView");
    if (div.style.display === "block") {
        div.style.display = "none";
    } else {
        renderMonthContent();
        div.style.display = "block";
    }
}

function renderMonthContent() {
    const div = document.getElementById("monthView");
    const inp = document.getElementById("dateInput");
    let ref = inp.value ? new Date(inp.value) : new Date();
    const y = ref.getFullYear(), m = ref.getMonth();
    
    div.innerHTML = `<h3 style="text-align:center">${ref.toLocaleString('de-DE', {month:'long'})} ${y}</h3>`;
    const grid = document.createElement("div");
    grid.className = "monthGrid";

    ["Mo","Di","Mi","Do","Fr","Sa","So"].forEach(d => {
        grid.innerHTML += `<div style="text-align:center;font-weight:bold;font-size:0.7rem">${d}</div>`;
    });

    const first = new Date(y, m, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    for (let i = 0; i < offset; i++) grid.appendChild(document.createElement("div"));

    for (let i = 1; i <= new Date(y, m + 1, 0).getDate(); i++) {
        const dStr = `${y}-${String(m+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        const s = calculateShift(dStr);
        const cell = document.createElement("div");
        cell.className = `dayCell ${s.class === 'dienst' ? 'dayDienst' : 'dayFrei'}`;
        
        // Heute im Kalender markieren
        const heuteStr = new Date().toISOString().split('T')[0];
        if (dStr === heuteStr) cell.classList.add("today");
        
        cell.innerHTML = `<div>${i}</div>${localStorage.getItem("note_"+dStr) ? '<div class="noteIcon">📝</div>' : ''}`;
        cell.onclick = () => { inp.value = dStr; checkDate(); renderMonthContent(); };
        grid.appendChild(cell);
    }
    div.appendChild(grid);
}

function generateHalfYear() {
    const div = document.getElementById("halfYear");
    if (div.style.display === "block") { div.style.display = "none"; return; }
    div.innerHTML = "<h3 style='text-align:center'>Wochen-Vorschau</h3>";
    
    const inpVal = document.getElementById("dateInput").value;
    const start = inpVal ? new Date(inpVal) : new Date();
    const heuteStr = new Date().toLocaleDateString('de-DE');
    
    for (let i = 0; i < 7; i++) {
        const d = new Date(start); d.setDate(d.getDate() + i);
        const dStr = d.toISOString().split('T')[0];
        const s = calculateShift(dStr);
        const hasNote = localStorage.getItem("note_" + dStr);
        
        const row = document.createElement("div");
        row.className = s.class;
        
        // Markierung für Heute in der Liste
        let borderStyle = "";
        if (d.toLocaleDateString('de-DE') === heuteStr) {
            borderStyle = "outline: 3px solid #3498db; outline-offset: -3px;";
        }

        row.style.cssText = `margin:5px 0; padding:10px; border-radius:8px; display:flex; justify-content:space-between; font-size:0.85rem; align-items:center; ${borderStyle}`;
        row.innerHTML = `<span><b>${d.toLocaleDateString('de-DE', {weekday: 'short'})}</b>, ${d.getDate()}.${d.getDate()+1}.</span> <span>${s.text} ${hasNote ? '📝' : ''}</span>`;
        div.appendChild(row);
    }
    div.style.display = "block";
}
