/* MY DAILY — local storage + IndexedDB music storage */
const Storage = (() => {
  const KEY = 'mydaily_professional_2026';
  const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const defaults = {
    tasks: [
      {id:'seed-task-1',title:'Belajar / membaca',description:'Luangkan waktu untuk belajar hal baru.',date:today(),priority:'medium',completed:false},
      {id:'seed-task-2',title:'Olahraga ringan',description:'Gerakkan tubuh minimal 15 menit.',date:today(),priority:'low',completed:false},
      {id:'seed-task-3',title:'Rapikan ruang belajar',description:'Buat lingkungan tetap nyaman.',date:today(),priority:'low',completed:false},
      {id:'seed-task-4',title:'Review tugas hari ini',description:'Periksa tugas yang sudah dan belum selesai.',date:today(),priority:'high',completed:false}
    ],
    schedules: [
      {id:'seed-schedule-1',title:'Bangun & persiapan pagi',date:today(),start:'06:00',end:'06:30',description:'Mulai hari dengan tenang',completed:false},
      {id:'seed-schedule-2',title:'Olahraga ringan',date:today(),start:'06:30',end:'07:00',description:'Stretching atau jalan santai',completed:false},
      {id:'seed-schedule-3',title:'Belajar / sekolah',date:today(),start:'08:00',end:'12:00',description:'Fokus pada kegiatan utama',completed:false},
      {id:'seed-schedule-4',title:'Istirahat & makan',date:today(),start:'12:00',end:'13:00',description:'Recharge sejenak',completed:false},
      {id:'seed-schedule-5',title:'Waktu belajar mandiri',date:today(),start:'16:00',end:'17:00',description:'Belajar atau membaca',completed:false}
    ],
    routines: [
      {id:'seed-routine-1',title:'Minum air setelah bangun',time:'06:00',completed:false},
      {id:'seed-routine-2',title:'Rapikan tempat tidur',time:'06:10',completed:false},
      {id:'seed-routine-3',title:'Baca 10–15 menit',time:'20:00',completed:false}
    ],
    habits: [{id:'seed-habit-1',name:'Minum air cukup',log:[]},{id:'seed-habit-2',name:'Baca setiap hari',log:[]},{id:'seed-habit-3',name:'Olahraga',log:[]}],
    settings: { language: 'id', focusMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, volume: .7, accentColor: '#f5c400' },
    statistics: { focusSessions: 0, focusSeconds: 0 }
  };
  const clone = value => JSON.parse(JSON.stringify(value));
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved) return clone(defaults);
      return { ...clone(defaults), ...saved, settings: { ...defaults.settings, ...(saved.settings || {}) }, statistics: { ...defaults.statistics, ...(saved.statistics || {}) } };
    } catch { return clone(defaults); }
  }
  let data = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { console.warn('Storage full?', e); return false; } }
  function get(key) { return data[key]; }
  function set(key, value) { data[key] = value; save(); return value; }
  function update(key, callback) { data[key] = callback(data[key]); save(); return data[key]; }
  function getAll() { return clone(data); }
  function reset() { data = clone(defaults); save(); }
  function exportData() { return clone(data); }
  function importData(value) { if (!value || typeof value !== 'object') throw Error('Invalid backup'); data = { ...clone(defaults), ...value, settings: { ...defaults.settings, ...(value.settings || {}) }, statistics: { ...defaults.statistics, ...(value.statistics || {}) } }; save(); }
  const DB = 'mydaily_music_db', STORE = 'tracks';
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  async function musicSave(track) { const db = await openDB(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(track); tx.oncomplete = () => resolve(true); tx.onerror = () => reject(tx.error); }); }
  async function musicList() { const db = await openDB(); return new Promise((resolve, reject) => { const req = db.transaction(STORE, 'readonly').objectStore(STORE).getAll(); req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error); }); }
  async function musicDelete(id) { const db = await openDB(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); tx.oncomplete = () => resolve(true); tx.onerror = () => reject(tx.error); }); }
  return { get, set, update, getAll, reset, save, exportData, importData, musicSave, musicList, musicDelete };
})();
