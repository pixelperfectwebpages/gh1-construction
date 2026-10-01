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
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Submission failed');
          form.style.display = 'none';
          success.style.display = 'block';
        })
        .catch(function () {
          alert("Something went wrong sending your request. Please call or text (619) 405-5213, or email ghoraites@yahoo.com directly.");
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        });
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

  var liveGrid = document.getElementById('reviewsLiveGrid');
  var emptyState = document.getElementById('reviewsEmptyState');
  var scoreRow = document.getElementById('ratingScoreRow');
  if (liveGrid && emptyState) {
    function starRow(rating) {
      var full = Math.round(rating);
      var star = '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"></path></svg>';
      var out = '';
      for (var i = 0; i < 5; i++) out += star;
      return '<span style="display:inline-flex;gap:2px;color:' + '#FBBC04' + '">' + out + '</span>';
    }

    function initials(name) {
      return (name || '?').trim().charAt(0).toUpperCase();
    }

    function escapeHtml(str) {
      var div = document.createElement('div');
      div.textContent = str || '';
      return div.innerHTML;
    }

    fetch('/api/reviews')
      .then(function (res) { if (!res.ok) throw new Error('not ready'); return res.json(); })
      .then(function (data) {
        if (!data.reviews || !data.reviews.length) return;

        if (scoreRow && data.rating) {
          scoreRow.innerHTML =
            '<span class="rating-card__score">' + data.rating.toFixed(1) + '</span>' +
            '<div>' + starRow(data.rating) +
            '<div class="rating-card__count">Based on ' + data.reviewCount + ' review' + (data.reviewCount === 1 ? '' : 's') + '</div></div>';
        }

        liveGrid.innerHTML = data.reviews.map(function (r) {
          var avatar = r.photoUrl
            ? '<img src="' + r.photoUrl + '" alt="" style="width:100%;height:100%;border-radius:999px;object-fit:cover">'
            : initials(r.name);
          return (
            '<div class="review-card">' +
              '<div class="review-card__head">' +
                '<div class="review-card__who">' +
                  '<div class="review-card__avatar">' + avatar + '</div>' +
                  '<div><div class="review-card__name">' + escapeHtml(r.name) + '</div></div>' +
                '</div>' +
              '</div>' +
              '<div class="review-card__meta">' + starRow(r.rating) + '<span>' + escapeHtml(r.relativeTime) + '</span></div>' +
              '<p class="review-card__body">' + escapeHtml(r.text) + '</p>' +
            '</div>'
          );
        }).join('');

        emptyState.hidden = true;
        liveGrid.hidden = false;
      })
      .catch(function () {
        // Leave the honest "no reviews yet" empty state showing — nothing to do.
      });
  }
})();
