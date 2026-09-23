import { UI } from './ui.js';

export class ReviewsManager {
  constructor(store) {
    this.store = store;
    this.filterRating = 'all';
    this.init();
  }

  init() {
    this.container = document.getElementById('reviewsListContainer');
    this.store.subscribe('reviews:changed', () => this.render());

    // Filter pills
    const filterBtns = document.querySelectorAll('.review-filter-btn');
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterRating = btn.dataset.rating;
        this.render();
      };
    });

    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    let list = [...this.store.reviews];
    if (this.filterRating !== 'all') {
      const targetStar = parseInt(this.filterRating, 10);
      list = list.filter(r => r.rating === targetStar);
    }

    if (list.length === 0) {
      this.container.innerHTML = `
        <div style="text-align:center; padding: 48px; background:var(--bg-card); border-radius:var(--radius-xl); border:1px solid var(--border-subtle); color:var(--text-muted);">
          <div style="font-size: 2rem; margin-bottom: 8px;">⭐</div>
          <div style="font-weight:600; font-size:1rem; color:var(--text-primary);">No reviews found for this rating</div>
        </div>
      `;
      return;
    }

    list.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = 'var(--space-sm)';

      const starsHtml = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);

      card.innerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, var(--color-primary), var(--color-violet)); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem;">
              ${rev.avatar}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <strong style="color:var(--text-primary); font-size:0.95rem;">${rev.author}</strong>
                ${rev.verified ? `<span class="badge" style="background:var(--color-emerald-bg); color:var(--color-emerald); font-size:0.65rem;">Verified Buyer</span>` : ''}
              </div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Purchased: ${rev.productName} • ${rev.date}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="color:var(--color-amber); font-size:1rem; letter-spacing:2px;">${starsHtml}</span>
            <span class="badge" style="background:${rev.sentiment === 'positive' ? 'var(--color-emerald-bg)' : 'var(--color-rose-bg)'}; color:${rev.sentiment === 'positive' ? 'var(--color-emerald)' : 'var(--color-rose)'}; font-size:0.7rem;">
              ${rev.sentiment}
            </span>
          </div>
        </div>

        <h4 style="font-size:1rem; color:var(--text-primary); margin-top:4px;">${rev.title}</h4>
        <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.5;">${rev.content}</p>

        <!-- Admin Reply -->
        ${rev.reply ? `
          <div style="background:var(--bg-input); border-left:3px solid var(--color-primary); border-radius:0 var(--radius-sm) var(--radius-sm) 0; padding:10px 14px; margin-top:8px;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--color-primary); margin-bottom:2px;">Nexgenesis Customer Experience Team:</div>
            <div style="font-size:0.825rem; color:var(--text-secondary);">${rev.reply}</div>
          </div>
        ` : `
          <div class="reply-form-container" style="margin-top:8px;">
            <div style="display:flex; gap:8px;">
              <input type="text" class="form-input reply-input" placeholder="Post official admin response..." style="padding:6px 12px; font-size:0.825rem;">
              <button class="btn btn-primary btn-sm send-reply-btn">Reply</button>
            </div>
          </div>
        `}
      `;

      const sendReplyBtn = card.querySelector('.send-reply-btn');
      if (sendReplyBtn) {
        sendReplyBtn.onclick = () => {
          const input = card.querySelector('.reply-input');
          const replyText = input.value.trim();
          if (replyText) {
            this.store.addReviewReply(rev.id, replyText);
            UI.showToast('Reply published successfully', 'success');
          }
        };
      }

      this.container.appendChild(card);
    });
  }
}
