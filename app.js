const STORAGE_KEY = 'hygiene-tracker-entries';

const form = document.getElementById('interaction-form');
const entriesBody = document.getElementById('entries-body');
const metricsContainer = document.getElementById('metrics');
const snapshotDate = document.getElementById('snapshot-date');
const exportCsvBtn = document.getElementById('export-csv');
const exportJsonBtn = document.getElementById('export-json');
const resetDayBtn = document.getElementById('reset-day');

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString();
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const loadEntries = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveEntries = (entries) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const calculateMetrics = (entries) => {
  const total = entries.length;
  const contacted = entries.filter((entry) => entry.texted || entry.emailed || entry.voicemail || entry.called).length;
  const texts = entries.filter((entry) => entry.texted).length;
  const emails = entries.filter((entry) => entry.emailed).length;
  const voicemails = entries.filter((entry) => entry.voicemail).length;
  const calls = entries.filter((entry) => entry.called).length;
  const booked = entries.filter((entry) => entry.appointmentBooked === 'Yes').length;

  const percent = (count) => (total ? `${((count / total) * 100).toFixed(1)}%` : '0.0%');

  return [
    { label: 'Total Outreach Attempts', value: total },
    { label: 'People Contacted', value: `${contacted} (${percent(contacted)})` },
    { label: 'Texts Sent', value: texts },
    { label: 'Emails Sent', value: emails },
    { label: 'Voicemails Left', value: voicemails },
    { label: 'Calls Reached', value: calls },
    { label: 'Appointments Booked', value: `${booked} (${percent(booked)})` },
  ];
};

const renderMetrics = (entries) => {
  const metrics = calculateMetrics(entries);
  metricsContainer.innerHTML = '';
  for (const metric of metrics) {
    const item = document.createElement('article');
    item.className = 'metric';
    item.innerHTML = `<div class="label">${metric.label}</div><div class="value">${metric.value}</div>`;
    metricsContainer.appendChild(item);
  }
};

const renderTable = (entries) => {
  entriesBody.innerHTML = '';

  for (const entry of entries) {
    const channels = [
      entry.texted ? 'Text' : null,
      entry.emailed ? 'Email' : null,
      entry.voicemail ? 'Voicemail' : null,
      entry.called ? 'Call' : null,
    ]
      .filter(Boolean)
      .join(', ') || 'None';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.patientName}</td>
      <td>${formatDate(entry.contactDate)}</td>
      <td>${entry.owner || '—'}</td>
      <td>${channels}</td>
      <td>${entry.appointmentBooked}</td>
      <td>${entry.outcome}</td>
      <td>${formatDate(entry.followUpDate)}</td>
      <td>${entry.notes || '—'}</td>
    `;

    entriesBody.appendChild(row);
  }
};

const render = () => {
  const allEntries = loadEntries();
  const todaysEntries = allEntries.filter((entry) => entry.contactDate === todayISO());

  snapshotDate.textContent = `Date: ${formatDate(todayISO())}`;
  renderMetrics(todaysEntries);
  renderTable(todaysEntries);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const allEntries = loadEntries();

  const entry = {
    patientName: document.getElementById('patientName').value.trim(),
    contactDate: document.getElementById('contactDate').value,
    owner: document.getElementById('owner').value.trim(),
    texted: document.getElementById('texted').checked,
    emailed: document.getElementById('emailed').checked,
    voicemail: document.getElementById('voicemail').checked,
    called: document.getElementById('called').checked,
    appointmentBooked: document.getElementById('appointmentBooked').value,
    outcome: document.getElementById('outcome').value,
    followUpDate: document.getElementById('followUpDate').value,
    notes: document.getElementById('notes').value.trim(),
  };

  allEntries.push(entry);
  saveEntries(allEntries);
  form.reset();
  document.getElementById('contactDate').value = todayISO();
  render();
});

const download = (fileName, contents, mimeType) => {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
};

exportCsvBtn.addEventListener('click', () => {
  const entries = loadEntries().filter((entry) => entry.contactDate === todayISO());
  const headers = ['Patient Name', 'Contact Date', 'Owner', 'Texted', 'Emailed', 'Voicemail', 'Called', 'Appointment Booked', 'Outcome', 'Follow-up Date', 'Notes'];
  const rows = entries.map((entry) => [
    entry.patientName,
    entry.contactDate,
    entry.owner,
    entry.texted,
    entry.emailed,
    entry.voicemail,
    entry.called,
    entry.appointmentBooked,
    entry.outcome,
    entry.followUpDate,
    (entry.notes || '').replaceAll('"', '""'),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '')}"`).join(','))
    .join('\n');

  download(`hygiene-${todayISO()}.csv`, csv, 'text/csv');
});

exportJsonBtn.addEventListener('click', () => {
  const entries = loadEntries().filter((entry) => entry.contactDate === todayISO());
  const payload = JSON.stringify({ date: todayISO(), entries, metrics: calculateMetrics(entries) }, null, 2);
  download(`hygiene-${todayISO()}.json`, payload, 'application/json');
});

resetDayBtn.addEventListener('click', () => {
  const keep = loadEntries().filter((entry) => entry.contactDate !== todayISO());
  saveEntries(keep);
  render();
});

document.getElementById('contactDate').value = todayISO();
render();
