(function () {
  "use strict";

  var roomsByCategory = {
    luxury: [
      { id: "lux-suite", name: "Presidential Suite", image: "Images/lux-suite.jpg", description: "Spacious suite with panoramic city views, private lounge, and marble bathroom.", features: ["85 m² living space", "King bed + sofa bed", "Butler service on request", "Rain shower & soaking tub"], pricePerNight: 520 },
      { id: "lux-deluxe", name: "Deluxe King Room", image: "Images/lux-deluxe.jpg", description: "Elegant room with premium linens, smart lighting, and curated minibar.", features: ["42 m²", "King bed", "Nespresso machine", "City or garden view"], pricePerNight: 310 }
    ],
    business: [
      { id: "biz-workstation", name: "Executive Work Room", image: "Images/biz-workstation.jpg", description: "Designed for productivity: ergonomic desk, fast Wi‑Fi, and quiet floor.", features: ["Standing desk + monitor hookup", "Soundproof windows", "Express laundry", "Meeting room access (2h/day)"], pricePerNight: 189 },
      { id: "biz-twin", name: "Twin Business", image: "Images/biz-twin.jpg", description: "Two single beds ideal for colleagues sharing on short trips.", features: ["Twin beds", "Dual work desks", "Complimentary printing", "Airport shuttle slot"], pricePerNight: 145 }
    ],
    family: [
      { id: "fam-connect", name: "Connecting Family Rooms", image: "Images/fam-connect.jpg", description: "Two connecting rooms with extra space for children and a kitchenette.", features: ["Sleeps up to 5", "Microwave & fridge", "Kids’ welcome pack", "Pool access"], pricePerNight: 265 },
      { id: "fam-bunk", name: "Adventure Bunk Room", image: "Images/fam-bunk.jpg", description: "Themed bunk beds, game console, and blackout curtains for early bedtimes.", features: ["Bunk + queen", "Game console", "Night light", "Family breakfast included"], pricePerNight: 198 }
    ],
    budget: [
      { id: "bud-standard", name: "Standard Queen", image: "Images/bud-standard.jpg", description: "Clean, comfortable room with essentials for a great value stay.", features: ["Queen bed", "Private bath", "Free Wi‑Fi", "LED TV"], pricePerNight: 72 },
      { id: "bud-compact", name: "Compact Single", image: "Images/bud-compact.jpg", description: "Efficient layout for solo travellers who spend the day exploring.", features: ["Single bed", "Shared lounge access", "Locker storage", "AC"], pricePerNight: 49 }
    ],
    beach: [
      { id: "beach-villa", name: "Beachfront Villa", image: "Images/beach-villa.jpg", description: "Steps from the sand with private deck, outdoor shower, and plunge pool.", features: ["Private pool", "Outdoor dining", "Beach cabana reserved", "Full kitchen"], pricePerNight: 640 },
      { id: "beach-bungalow", name: "Ocean Bungalow", image: "Images/beach-bungalow.jpg", description: "Thatched-roof charm with hammock and direct lagoon access.", features: ["King bed", "Hammock on deck", "Snorkel gear included", "Sunset cruise voucher"], pricePerNight: 395 }
    ]
  };

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function renderRoomsPage() {
    var container = document.getElementById("room-list");
    var reserveContainer = document.getElementById("reserve-rows");
    var totalEl = document.getElementById("reserve-total");
    if (!container || !reserveContainer || !totalEl) return;

    var filter = getQueryParam("cat") || "all";
    if (!roomsByCategory[filter] && filter !== "all") filter = "all";

    var links = document.querySelectorAll(".filter-bar a");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      var match = href.match(/cat=([^&]+)/);
      var cat = match ? match[1] : "all";
      if (cat === filter || (filter === "all" && cat === "all")) {
        links[i].classList.add("is-active");
      } else {
        links[i].classList.remove("is-active");
      }
    }

    var flatRooms = [];
    if (filter === "all") {
      for (var key in roomsByCategory) {
        if (roomsByCategory.hasOwnProperty(key)) {
          for (var j = 0; j < roomsByCategory[key].length; j++) flatRooms.push(roomsByCategory[key][j]);
        }
      }
    } else {
      flatRooms = roomsByCategory[filter].slice();
    }

    container.innerHTML = "";
    reserveContainer.innerHTML = "";

    for (var r = 0; r < flatRooms.length; r++) {
      var room = flatRooms[r];
      var article = document.createElement("article");
      article.className = "room-card";
      article.setAttribute("data-room-id", room.id);

      var featuresHtml = "";
      for (var f = 0; f < room.features.length; f++) featuresHtml += "<li>" + escapeHtml(room.features[f]) + "</li>";

      article.innerHTML =
        '<div class="room-card__image"><img src="' + escapeAttr(room.image) + '" alt="' + escapeAttr(room.name) + '" width="800" height="600" loading="lazy"></div>' +
        '<div class="room-card__body"><h2>' + escapeHtml(room.name) + '</h2><p class="room-meta">' + formatPrice(room.pricePerNight) + ' per night</p><p>' + escapeHtml(room.description) + '</p><ul class="room-features">' + featuresHtml + '</ul></div>';

      container.appendChild(article);

      var row = document.createElement("div");
      row.className = "reserve-row";
      row.innerHTML =
        '<label><input type="checkbox" class="room-select" data-id="' + escapeAttr(room.id) + '" data-price="' + room.pricePerNight + '"><span>' + escapeHtml(room.name) + '</span></label>' +
        '<span>Nights: </span>' +
        '<input type="number" class="room-nights" min="1" max="30" value="1" data-id="' + escapeAttr(room.id) + '" disabled aria-label="Nights for ' + escapeAttr(room.name) + '">' +
        '<span class="row-price" data-id="' + escapeAttr(room.id) + '">' + formatPrice(0) + '</span>';

      reserveContainer.appendChild(row);
    }

    bindReservation(flatRooms, totalEl);
    updateTotal(flatRooms, totalEl);
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function formatPrice(n) { return "$" + (Math.round(n * 100) / 100).toFixed(2); }

  function bindReservation(flatRooms, totalEl) {
    var reserveContainer = document.getElementById("reserve-rows");
    if (!reserveContainer) return;
    reserveContainer.addEventListener("change", function () { updateTotal(flatRooms, totalEl); });
    reserveContainer.addEventListener("input", function () { updateTotal(flatRooms, totalEl); });
    reserveContainer.addEventListener("change", function (e) {
      if (e.target && e.target.classList.contains("room-select")) {
        var id = e.target.getAttribute("data-id");
        var nightsInput = reserveContainer.querySelector('.room-nights[data-id="' + id + '"]');
        if (nightsInput) { nightsInput.disabled = !e.target.checked; if (!e.target.checked) nightsInput.value = 1; }
      }
    });
  }

  function updateTotal(flatRooms, totalEl) {
    var reserveContainer = document.getElementById("reserve-rows");
    if (!reserveContainer || !totalEl) return;
    var priceMap = {};
    for (var i = 0; i < flatRooms.length; i++) priceMap[flatRooms[i].id] = flatRooms[i].pricePerNight;

    var checkboxes = reserveContainer.querySelectorAll(".room-select");
    var total = 0;
    for (var c = 0; c < checkboxes.length; c++) {
      var cb = checkboxes[c];
      var id = cb.getAttribute("data-id");
      var nightsEl = reserveContainer.querySelector('.room-nights[data-id="' + id + '"]');
      var rowPriceEl = reserveContainer.querySelector('.row-price[data-id="' + id + '"]');
      if (!cb.checked) { if (rowPriceEl) rowPriceEl.textContent = formatPrice(0); continue; }
      var nights = nightsEl ? parseInt(nightsEl.value, 10) : 1;
      if (isNaN(nights) || nights < 1) nights = 1;
      if (nights > 30) nights = 30;
      if (nightsEl && String(nights) !== nightsEl.value) nightsEl.value = nights;
      var price = priceMap[id] || 0;
      var line = price * nights;
      total += line;
      if (rowPriceEl) rowPriceEl.textContent = formatPrice(line);
    }
    totalEl.textContent = formatPrice(total);
  }

  function contactFormDemo(e) {
    e.preventDefault();
    alert("Thank you for your message. This is a demo form for the graduation project.");
  }

  var form = document.getElementById("contact-form");
  if (form) form.addEventListener("submit", contactFormDemo);
  if (document.getElementById("room-list")) renderRoomsPage();
})();