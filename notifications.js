// ─── NOTIFICAÇÕES PWA ─────────────────────────────────────────────────────────
// Lembretes de aula (15 min antes) + alertas de faltas (75% do limite / RF).
// Sem backend: tudo local via Service Worker + Notifications API.
//
// LIMITAÇÃO CONHECIDA (aceitável para o uso atual):
// Os lembretes de aula usam setTimeout no processo da página. Só disparam
// enquanto o app está aberto ou em background no Android Chrome. Se o usuário
// fechar o app por completo, os timers são cancelados (não há push server).
// Já os alertas de falta são reavaliados a cada abertura/mudança de faltas,
// então aparecem quando o usuário reabre o app.

import { calcAbsence } from "./curriculumData";

// ─── PERMISSÃO ───────────────────────────────────────────
export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

// ─── ENVIO VIA SERVICE WORKER ────────────────────────────
async function sendNotification(title, body, tag) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker?.ready;
  if (reg?.active) {
    // Preferencial: o SW (Workbox) exibe via sw-notifications.js
    reg.active.postMessage({ type: "SHOW_NOTIFICATION", title, body, tag });
  } else if (reg) {
    reg.showNotification(title, { body, tag });
  } else {
    new Notification(title, { body, tag });
  }
}

// ─── LEMBRETES DE AULA ───────────────────────────────────
const _classTimers = [];
const REMINDER_BEFORE = 15; // minutos antes da aula

// SCHEDULE.day usa nomes curtos ("Segunda", "Terça"...) — casar com getDay().
const DAY_NAMES = { 1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta" };

export function scheduleClassReminders(schedule) {
  // Cancela timers anteriores
  _classTimers.forEach(clearTimeout);
  _classTimers.length = 0;

  if (getNotificationPermission() !== "granted") return;

  const now = new Date();
  const todayName = DAY_NAMES[now.getDay()]; // 0=Dom .. 6=Sáb
  if (!todayName) return; // fim de semana

  const today = schedule.find((d) => d.day === todayName);
  if (!today) return;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  today.blocks.forEach((block) => {
    const reminderAt = block.start - REMINDER_BEFORE;
    const diffMs = (reminderAt - nowMinutes) * 60 * 1000;
    if (diffMs <= 0) return; // a janela do lembrete já passou

    const timer = setTimeout(() => {
      const h = String(Math.floor(block.start / 60)).padStart(2, "0");
      const m = String(block.start % 60).padStart(2, "0");
      sendNotification(
        `🎓 ${block.name} começa em ${REMINDER_BEFORE} min`,
        `Sua aula começa às ${h}:${m}. Bora!`,
        `class-${block.id}-${block.start}`
      );
    }, diffMs);

    _classTimers.push(timer);
  });
}

// ─── ALERTAS DE FALTAS ───────────────────────────────────
const ATTENDANCE_NOTIF_KEY = "painel-academico:attendance-notified";
const COOLDOWN = 24 * 60 * 60 * 1000; // 24h entre alertas por disciplina

export function checkAttendanceAlerts(attendanceMeta, faltas) {
  if (getNotificationPermission() !== "granted") return;

  let notified = {};
  try {
    notified = JSON.parse(localStorage.getItem(ATTENDANCE_NOTIF_KEY) || "{}");
  } catch {
    notified = {};
  }
  const now = Date.now();

  Object.entries(attendanceMeta).forEach(([id, meta]) => {
    const current = faltas[id] || 0;
    // Limite/estado reais vêm de calcAbsence (⌊cargaHoraria×0,25⌋).
    const { limite, restam, pct, state } = calcAbsence(meta, current);
    const nome = meta.shortName || id;

    if (now - (notified[id] || 0) <= COOLDOWN) return; // ainda em cooldown

    if (state === "danger") {
      // RF — limite estourado
      sendNotification(
        `🚨 RF em ${nome}`,
        `Você atingiu o limite de ${limite} faltas. Situação crítica!`,
        `rf-${id}`
      );
      notified[id] = now;
    } else if (pct >= 75) {
      // Alerta — 75% do limite ou mais
      sendNotification(
        `⚠️ Atenção: ${nome}`,
        `${current}/${limite} faltas. Você pode faltar mais ${restam} ${restam === 1 ? "vez" : "vezes"}.`,
        `alert-${id}`
      );
      notified[id] = now;
    }
  });

  localStorage.setItem(ATTENDANCE_NOTIF_KEY, JSON.stringify(notified));
}
