(function () {
  if (window.lucide) window.lucide.createIcons();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('is-open'); });
    });
  }

  var chips = document.querySelectorAll('.filter-chip');
  var tiles = document.querySelectorAll('.gallery-tile');
  if (chips.length && tiles.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        var cat = chip.getAttribute('data-filter');
        tiles.forEach(function (tile) {
          var tags = (tile.getAttribute('data-category') || '').split(' ');
          var show = cat === 'all' || tags.indexOf(cat) !== -1;
          tile.classList.toggle('gallery-tile--hidden', !show);
        });
      });
    });
  }

  var lightbox = document.querySelector('.lightbox');
  if (lightbox && tiles.length) {
    var titleEl = lightbox.querySelector('.lightbox__title');
    var subtitleEl = lightbox.querySelector('.lightbox__subtitle');
    var imageEl = lightbox.querySelector('.lightbox__image');
    var tagEl = lightbox.querySelector('.lightbox__tag');
    var counterEl = lightbox.querySelector('.lightbox__counter');
    var prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    var nextBtn = lightbox.querySelector('.lightbox__nav--next');
    var closeBtn = lightbox.querySelector('.lightbox__close');

    var currentPhotos = [];
    var currentIndex = 0;

    function renderPhoto() {
      var p = currentPhotos[currentIndex];
      imageEl.src = p.src;
      imageEl.alt = p.alt || '';
      if (p.label) {
        tagEl.textContent = p.label;
        tagEl.className = 'gallery-tile__ba-tag lightbox__tag ' + (p.label === 'Before' ? 'gallery-tile__ba-tag--before' : 'gallery-tile__ba-tag--after');
        tagEl.hidden = false;
      } else {
        tagEl.hidden = true;
      }
      var multi = currentPhotos.length > 1;
      prevBtn.hidden = !multi;
      nextBtn.hidden = !multi;
      counterEl.hidden = !multi;
      if (multi) counterEl.textContent = (currentIndex + 1) + ' / ' + currentPhotos.length;
    }

    function showPhoto(index) {
      currentIndex = (index + currentPhotos.length) % currentPhotos.length;
      renderPhoto();
    }

    function openLightbox(tile) {
      var photos;
      try { photos = JSON.parse(tile.getAttribute('data-photos') || '[]'); } catch (e) { photos = []; }
      if (!photos.length) return;
      titleEl.textContent = tile.getAttribute('data-title') || '';
      subtitleEl.textContent = tile.getAttribute('data-subtitle') || '';
      currentPhotos = photos;
      showPhoto(0);
      lightbox.classList.add('is-open');
      if (window.lucide) window.lucide.createIcons();
    }

    function closeLightbox() { lightbox.classList.remove('is-open'); }

    tiles.forEach(function (tile) {
      tile.addEventListener('click', function () { openLightbox(tile); });
    });
    prevBtn.addEventListener('click', function () { showPhoto(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { showPhoto(currentIndex + 1); });
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') showPhoto(currentIndex - 1);
      else if (e.key === 'ArrowRight') showPhoto(currentIndex + 1);
    });
  }

  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var card = form.closest('.contact-form-card');
      var success = card.querySelector('.form-success');
      form.style.display = 'none';
      success.style.display = 'block';
    });
    var again = document.querySelector('.form-success__again');
    if (again) {
      again.addEventListener('click', function () {
        var card = again.closest('.contact-form-card');
        card.querySelector('.form-success').style.display = 'none';
        card.querySelector('.contact-form').style.display = 'block';
        form.reset();
      });
    }
  }
})();
