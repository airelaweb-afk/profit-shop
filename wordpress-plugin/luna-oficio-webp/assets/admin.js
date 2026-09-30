(function () {
  "use strict";

  var cfg = window.lunaWebp || {};
  var start = document.getElementById("luna-webp-start");
  var stop = document.getElementById("luna-webp-stop");
  var restore = document.getElementById("luna-webp-restore");
  var log = document.getElementById("luna-webp-log");
  var progress = document.querySelector(".luna-webp-progress");
  var fill = document.getElementById("luna-webp-bar-fill");
  var text = document.getElementById("luna-webp-progress-text");
  var pendingEl = document.getElementById("luna-webp-pending");
  var convertedEl = document.getElementById("luna-webp-converted");
  var keptEl = document.getElementById("luna-webp-kept");
  if (!start || !stop || !log) return;

  var running = false;
  var stopRequested = false;

  function fmt(bytes) {
    if (!bytes) return "0 B";
    var units = ["B", "KB", "MB", "GB"];
    var i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    var value = bytes / Math.pow(1024, i);
    return (i === 0 ? value : value.toFixed(1)).toString().replace(".", ",") + " " + units[i];
  }

  function line(item) {
    var li = document.createElement("li");
    var title = item.title || "#" + item.id;
    if (item.status === "converted") {
      var saved = item.before > 0 ? Math.round((1 - item.after / item.before) * 100) : 0;
      li.textContent = title + " · " + fmt(item.before) + " → " + fmt(item.after) + " (−" + saved + " %)";
      li.className = "ok";
    } else if (item.status === "kept") {
      li.textContent = title + " · sin tocar: " + (item.reason || "");
      li.className = "info";
    } else if (item.status === "restored") {
      li.textContent = title + " · restaurada";
      li.className = "ok";
    } else if (item.status === "skipped") {
      li.textContent = title + " · omitida: " + (item.reason || "");
      li.className = "info";
    } else {
      li.textContent = title + " · error: " + (item.reason || "");
      li.className = "ko";
    }
    log.insertBefore(li, log.firstChild);
    while (log.children.length > 200) log.removeChild(log.lastChild);
  }

  function setCounts(counts) {
    if (!counts) return;
    if (pendingEl) pendingEl.textContent = counts.pending;
    if (convertedEl) convertedEl.textContent = counts.converted;
    if (keptEl) keptEl.textContent = counts.kept;
  }

  function post(action) {
    var body = new FormData();
    body.append("action", action);
    body.append("nonce", cfg.nonce || "");
    return fetch(cfg.ajaxUrl, { method: "POST", credentials: "same-origin", body: body }).then(function (res) {
      return res.json();
    });
  }

  function setRunning(state) {
    running = state;
    start.disabled = state;
    restore.disabled = state;
    stop.disabled = !state;
    if (progress) progress.hidden = !state && !progress.dataset.keep;
  }

  function loop(action, total, doneSoFar, remainingKey) {
    if (stopRequested) {
      text.textContent = "Parado. Puedes continuar cuando quieras: sigue donde lo dejó.";
      setRunning(false);
      return;
    }
    post(action)
      .then(function (json) {
        if (!json || !json.success) {
          throw new Error((json && json.data && json.data.message) || "Respuesta inesperada del servidor.");
        }
        var data = json.data;
        (data.items || []).forEach(line);
        setCounts(data.counts);
        var done = doneSoFar + (data.items || []).length;
        var remaining = remainingKey === "pending" ? data.counts.pending : data.remaining;
        var totalNow = Math.max(total, done + remaining);
        if (fill) fill.style.width = totalNow ? Math.round((done / totalNow) * 100) + "%" : "100%";
        text.textContent = done + " de " + totalNow + (remainingKey === "pending" ? " convertidas" : " restauradas") + "…";
        if (remaining > 0 && (data.items || []).length > 0) {
          loop(action, totalNow, done, remainingKey);
        } else {
          if (fill) fill.style.width = "100%";
          text.textContent = remainingKey === "pending"
            ? "Terminado: " + done + " imágenes procesadas. Revisa alguna entrada para comprobar que las imágenes cargan."
            : "Terminado: " + done + " imágenes restauradas.";
          progress.dataset.keep = "1";
          setRunning(false);
        }
      })
      .catch(function (err) {
        line({ status: "error", title: "Tanda", reason: err.message });
        text.textContent = "Se ha cortado. Pulsa de nuevo para continuar donde se quedó.";
        setRunning(false);
      });
  }

  start.addEventListener("click", function () {
    if (running) return;
    stopRequested = false;
    progress.hidden = false;
    if (fill) fill.style.width = "0%";
    text.textContent = "Empezando…";
    setRunning(true);
    var total = parseInt(pendingEl ? pendingEl.textContent : "0", 10) || 0;
    loop("luna_webp_batch", total, 0, "pending");
  });

  stop.addEventListener("click", function () {
    stopRequested = true;
    stop.disabled = true;
    text.textContent = "Parando al terminar la tanda actual…";
  });

  restore.addEventListener("click", function () {
    if (running) return;
    if (!window.confirm("¿Restaurar los JPG/PNG originales de todas las imágenes convertidas? Solo es posible si no se borraron.")) {
      return;
    }
    stopRequested = false;
    progress.hidden = false;
    if (fill) fill.style.width = "0%";
    text.textContent = "Restaurando…";
    setRunning(true);
    var total = (parseInt(convertedEl ? convertedEl.textContent : "0", 10) || 0) + (parseInt(keptEl ? keptEl.textContent : "0", 10) || 0);
    loop("luna_webp_restore_batch", total, 0, "remaining");
  });
})();
