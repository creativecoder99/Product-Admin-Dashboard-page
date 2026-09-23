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
        <div style="text-align:center; padding: 32px; background:var(--bg-surface); border-radius:var(--radius-xs); border:1px solid var(--border-default); color:var(--text-muted); font-size:0.875rem;">
          No customer reviews found for the selected rating.
        </div>
      `;
      return;
    }

    list.forEach(rev => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = 'var(--space-xs)';

      card.innerHTML = `
        <div style="display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <strong style="color:var(--text-primary); font-size:0.9rem;">${rev.author}</strong>
              ${rev.verified ? `<span class="badge badge-in-stock" style="font-size:0.7rem;">Verified Purchase</span>` : ''}
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              Hardware: ${rev.productName} • Recorded ${rev.date}
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="badge" style="font-weight:700;">${rev.rating}.0 / 5.0</span>
          </div>
        </div>

        <h4 style="font-size:0.95rem; font-weight:650; color:var(--text-primary); margin-top:4px;">${rev.title}</h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.55;">${rev.content}</p>

        <!-- Official Brand Response -->
        ${rev.reply ? `
          <div style="background:var(--bg-subtle); border-left:2px solid var(--color-accent); padding:8px 12px; margin-top:6px; font-size:0.8125rem;">
            <div style="font-size:0.725rem; font-weight:650; color:var(--color-accent); margin-bottom:2px;">Operations Response:</div>
            <div style="color:var(--text-secondary);">${rev.reply}</div>
          </div>
        ` : `
          <div class="reply-form-container" style="margin-top:6px;">
            <div style="display:flex; gap:6px;">
              <input type="text" class="form-input reply-input" placeholder="Submit official operational response..." style="padding:5px 10px; font-size:0.8125rem;">
              <button class="btn btn-secondary btn-sm send-reply-btn">Publish Response</button>
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
            UI.showToast('Response published', 'success');
          }
        };
      }

      this.container.appendChild(card);
    });
  }
}
