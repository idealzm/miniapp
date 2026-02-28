// Telegram Web App initialization
// Safe check for Telegram WebApp - works in both Telegram and regular browsers
const tg = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

// Store instructions data
let instructionsData = {};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Snow effect
let snowInterval;
let isSnowing = false;

// Create confetti from top of screen
function startConfetti() {
    const colors = ['#2481cc', '#64b5f6', '#4caf50', '#ff6b6b', '#ffd700', '#ffffff'];
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    // Create 60 confetti pieces quickly
    for (let i = 0; i < 60; i++) {
        setTimeout(() => createConfetti(colors), i * 20);
    }
}

function createConfetti(colors) {
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    const size = Math.random() * 6 + 4;
    const left = Math.random() * 100;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const duration = Math.random() * 1 + 1; // 1-2s

    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.left = `${left}%`;
    confetti.style.backgroundColor = color;
    confetti.style.animationDuration = `${duration}s`;

    container.appendChild(confetti);

    // Remove after animation completes
    confetti.addEventListener('animationend', () => {
        confetti.remove();
    });
}

// Load snow state from localStorage
function loadSnowState() {
    try {
        const saved = localStorage.getItem('snowEnabled');
        return saved === 'true';
    } catch (e) {
        return false;
    }
}

// Save snow state to localStorage
function saveSnowState(enabled) {
    try {
        localStorage.setItem('snowEnabled', enabled ? 'true' : 'false');
    } catch (e) {
        // localStorage may be unavailable (incognito, blocked cookies, etc.)
        console.warn('localStorage not available:', e);
    }
}

// Create a single snowflake
function createSnowflake() {
    const container = document.getElementById('snowContainer');
    if (!container) return;

    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    // Random properties
    const size = Math.random() * 4 + 3; // 3-7px
    const left = Math.random() * 100; // 0-100%
    const duration = Math.random() * 3 + 5; // 5-8s
    const opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8

    snowflake.style.width = `${size}px`;
    snowflake.style.height = `${size}px`;
    snowflake.style.left = `${left}%`;
    snowflake.style.animationDuration = `${duration}s`;
    snowflake.style.opacity = opacity;

    container.appendChild(snowflake);

    // Remove after animation
    setTimeout(() => {
        snowflake.remove();
    }, duration * 1000);
}

// Start snow effect
function startSnow() {
    if (isSnowing) return;
    isSnowing = true;
    
    const container = document.getElementById('snowContainer');
    if (container) container.style.display = 'block';
    
    // Create snowflakes every 100ms for smooth effect
    snowInterval = setInterval(createSnowflake, 100);
    saveSnowState(true);
}

// Stop snow effect
function stopSnow() {
    isSnowing = false;
    clearInterval(snowInterval);
    
    const container = document.getElementById('snowContainer');
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
    saveSnowState(false);
}

// Toggle snow effect
function toggleSnow() {
    if (isSnowing) {
        stopSnow();
    } else {
        startSnow();
    }
}

// Parse markdown text
function parseMarkdown(text) {
    if (!text) return '';
    
    let html = String(text)
        // Subtitle: ### text
        .replace(/### (.+?)$/gm, '<h5>$1</h5>')
        // Bold: **text** or __text__
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/__(.+?)__/g, '<b>$1</b>')
        // Italic: *text* or _text_
        .replace(/\*(.+?)\*/g, '<i>$1</i>')
        .replace(/_(.+?)_/g, '<i>$1</i>')
        // Highlight: ==text==
        .replace(/==(.+?)==/g, '<mark>$1</mark>')
        // Code: `text`
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Line breaks: \n or <br>
        .replace(/\n/g, '<br>')
        .replace(/<br>/g, '<br>');

    return html;
}

// Initialize Telegram Web App
if (tg && tg.expand && typeof tg.expand === 'function') {
    tg.expand();
}

// Set header color (only in Telegram)
if (tg && tg.setHeaderColor && typeof tg.setHeaderColor === 'function') {
    tg.setHeaderColor('#0f0f0f');
}

// Initialize snow toggle button
const snowToggle = document.getElementById('snowToggle');
if (snowToggle) {
    snowToggle.addEventListener('click', () => {
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('light');
        }
        toggleSnow();
    });

    // Set button size to match status badge height
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        const badgeHeight = statusBadge.offsetHeight;
        snowToggle.style.width = badgeHeight + 'px';
        snowToggle.style.height = badgeHeight + 'px';
    }

    // Load saved state
    try {
        if (loadSnowState()) {
            startSnow();
        }
    } catch (e) {
        // localStorage may be unavailable
        console.warn('localStorage not available:', e);
    }
}

// Load cards from JSON
loadCards();

// Load cards from data.json
async function loadCards() {
    const container = document.getElementById('cardsContainer');
    
    try {
        const response = await fetch('data.json', {
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error('Invalid JSON format in data.json');
        }

        if (!container) {
            console.error('cardsContainer not found');
            return;
        }
        container.innerHTML = '';

        if (!data || !data.cards || !Array.isArray(data.cards)) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка: неверный формат данных</p>';
            return;
        }

        // Sort cards: NEW! cards first, then others
        const sortedCards = [...data.cards].sort((a, b) => {
            const aHasNew = a.title && a.title.includes('NEW!');
            const bHasNew = b.title && b.title.includes('NEW!');
            
            if (aHasNew && !bHasNew) return -1; // a before b
            if (!aHasNew && bHasNew) return 1;  // b before a
            return 0; // keep original order
        });

        sortedCards.forEach(card => {
            // Store instruction data
            if (card.instruction) {
                instructionsData[card.id] = card.instruction;
            }

            // Create card element
            const cardElement = document.createElement('div');
            cardElement.className = 'card';

            // Check if title has "NEW!" badge
            const hasBadge = card.title && card.title.includes('NEW!');
            const titleHtml = hasBadge
                ? `<span class="new-badge">NEW!</span> ${escapeHtml(card.title.replace('NEW! ', ''))}`
                : escapeHtml(card.title);

            // Build button HTML
            let buttonsHtml = '';
            if (card.buttonText && card.buttonAction) {
                buttonsHtml += `<button class="btn btn-primary" data-action="${escapeHtml(card.buttonAction)}" data-card-id="${escapeHtml(card.id)}">${escapeHtml(card.buttonText)}</button>`;
            }
            if (card.websiteUrl && card.websiteText) {
                buttonsHtml += `<a href="${escapeHtml(card.websiteUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${parseMarkdown(card.websiteText)}</a>`;
            }

            cardElement.innerHTML = `
                <div class="card-header">
                    <h3>${titleHtml}</h3>
                </div>
                <p>${parseMarkdown(card.description)}</p>
                <div class="card-actions">${buttonsHtml}</div>
            `;

            container.appendChild(cardElement);
        });
        
        // Attach event listeners to dynamically created buttons
        container.querySelectorAll('[data-action="openInstruction"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                    tg.HapticFeedback.impactOccurred('light');
                }
                openInstruction(btn.getAttribute('data-card-id'));
            });
        });

        // Add haptic feedback to website buttons
        container.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => {
                if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                    tg.HapticFeedback.impactOccurred('light');
                }
            });
        });
    } catch (error) {
        console.error('Error loading cards:', error);
        if (container) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки данных</p>';
        }
    }
}

// Send data to Telegram bot
function sendData(data) {
    if (tg && tg.sendData && typeof tg.sendData === 'function') {
        tg.sendData(data);
        if (tg.HapticFeedback && typeof tg.HapticFeedback.notificationOccurred === 'function') {
            tg.HapticFeedback.notificationOccurred('success');
        }
    } else {
        console.log('Data to send:', data);
    }
    return false;
}

// Open instruction modal
function openInstruction(cardId) {
    const instruction = instructionsData[cardId];
    if (!instruction) {
        console.warn(`Instruction not found for cardId: ${cardId}`);
        return;
    }

    const instructionTitle = document.getElementById('instructionTitle');
    const instructionBody = document.getElementById('instructionBody');

    if (!instructionTitle || !instructionBody) {
        console.error('Modal elements not found');
        return;
    }

    instructionTitle.textContent = instruction.title || 'Инструкция';

    // Check if download attribute should be applied to all links
    const globalDownload = instruction.download === true;

    let stepsHtml = '';

    if (!instruction.steps || !Array.isArray(instruction.steps)) {
        stepsHtml = '<p>Инструкция недоступна</p>';
    } else {
        instruction.steps.forEach((step, index) => {
            if (!step) return;

            // Handle links step
            if (step.type === 'links' && step.links) {
                const linkButtons = step.links
                    .filter(link => link && link.url)
                    .map(link => {
                        const url = escapeHtml(link.url);
                        const name = escapeHtml(link.name);
                        // Add download attribute for raw GitHub and GitHub Releases links
                        const isRawGithub = url.includes('raw.githubusercontent.com');
                        const isGithubRelease = url.includes('/releases/download/');
                        const hasDownload = globalDownload || link.download || isRawGithub || isGithubRelease;
                        const downloadAttr = hasDownload ? ` download="${escapeHtml(link.download === true ? '' : link.download)}"` : '';
                        const targetAttr = hasDownload ? '' : ' target="_blank" rel="noopener noreferrer"';
                        return `<a href="${url}"${downloadAttr}${targetAttr} class="platform-btn">${name}</a>`;
                    })
                    .join('');

                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    ${step.text ? `<p class="platform-text">${parseMarkdown(step.text)}</p>` : ''}
                    <div class="platforms-grid">${linkButtons}</div>
                `;
            }
            // Handle copy step (must be before list check because both have items)
            else if (step.type === 'copy' && step.items) {
                const copyButtons = step.items
                    .filter(item => item && item.text)
                    .map((item, index) => {
                        const copyText = item.text;
                        const buttonLabel = item.label ? escapeHtml(item.label) : 'Скопировать';
                        const encodedText = encodeURIComponent(copyText);
                        return `<button class="copy-btn" data-copy="${encodedText}"><span class="icon">📋</span>${buttonLabel}</button>`;
                    })
                    .join('');

                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    ${step.text ? `<p class="platform-text">${parseMarkdown(step.text)}</p>` : ''}
                    <div class="platforms-grid">${copyButtons}</div>
                `;
            }
            // Handle regular list step
            else if (step.type === 'list' || step.items) {
                let listHtml = '';
                let currentSection = [];
                let currentSubtitle = '';
                
                (step.items || []).forEach(item => {
                    if (!item) return;
                    
                    // Check if item starts with ### (subtitle)
                    const subtitleMatch = item.match(/^### (.+)$/);
                    if (subtitleMatch) {
                        // Render previous section if exists
                        if (currentSection.length > 0) {
                            listHtml += `<ol>${currentSection.map(i => `<li>${parseMarkdown(i || '')}</li>`).join('')}</ol>`;
                            currentSection = [];
                        }
                        // Add subtitle
                        currentSubtitle = subtitleMatch[1];
                        listHtml += `<h5>${escapeHtml(currentSubtitle)}</h5>`;
                    } else {
                        currentSection.push(item);
                    }
                });
                
                // Render last section
                if (currentSection.length > 0) {
                    listHtml += `<ol>${currentSection.map(i => `<li>${parseMarkdown(i || '')}</li>`).join('')}</ol>`;
                }
                
                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    ${listHtml}
                `;
            }
            // Handle text step
            else if (step.type === 'text') {
                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    <p>${parseMarkdown(step.text || '')}</p>
                `;
            }
        });
    }

    // Handle footer
    let footerHtml = '';
    if (instruction.footer) {
        if (typeof instruction.footer === 'string') {
            footerHtml = `<p class="instruction-footer-text">${escapeHtml(instruction.footer)}</p>`;
        } else if (typeof instruction.footer === 'object') {
            footerHtml = `
                <p class="instruction-footer-text">${escapeHtml(instruction.footer.text || '')}</p>
                ${instruction.footer.buttonText ? `<button class="btn btn-footer" onclick="finishInstruction()">${escapeHtml(instruction.footer.buttonText)}</button>` : ''}
            `;
        }
    }

    instructionBody.innerHTML = `
        ${stepsHtml}
        ${footerHtml}
    `;

    // Add haptic feedback to platform buttons
    instructionBody.querySelectorAll('.platform-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    });

    // Add haptic feedback to copy buttons
    instructionBody.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                tg.HapticFeedback.impactOccurred('light');
            }
            const encodedText = btn.getAttribute('data-copy');
            if (encodedText) {
                copyToClipboard(decodeURIComponent(encodedText));
            }
        });
    });

    // Add haptic feedback to footer button
    const footerBtn = instructionBody.querySelector('.btn-footer');
    if (footerBtn) {
        footerBtn.addEventListener('click', () => {
            if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    }

    const modal = document.getElementById('instructionModal');
    if (modal) {
        modal.classList.add('active');
    }

    // Блокировка прокрутки body
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');

    // Сохраняем текущую позицию прокрутки
    window.scrollY;

    // Dim the snow
    const snowContainer = document.getElementById('snowContainer');
    if (snowContainer) {
        snowContainer.classList.add('dimmed');
    }

    if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Finish instruction with confetti
function finishInstruction() {
    startConfetti();

    if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.notificationOccurred === 'function') {
        tg.HapticFeedback.notificationOccurred('success');
    }

    setTimeout(() => {
        closeInstruction();
    }, 500);
}

// Close instruction modal
function closeInstruction() {
    const modal = document.getElementById('instructionModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');

    // Add closing animation
    if (modalContent) {
        modalContent.classList.add('closing');
    }

    // Wait for animation to finish
    setTimeout(() => {
        modal.classList.remove('active');
        if (modalContent) {
            modalContent.classList.remove('closing');
        }

        // Восстановление прокрутки body
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');

        // Restore snow brightness
        const snowContainer = document.getElementById('snowContainer');
        if (snowContainer) {
            snowContainer.classList.remove('dimmed');
        }

        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('light');
        }
    }, 300);

    // Clear all confetti immediately
    const confettiContainer = document.getElementById('confettiContainer');
    if (confettiContainer) {
        confettiContainer.innerHTML = '';
    }
}

// Close modal on outside click
window.onclick = function(event) {
    const modal = document.getElementById('instructionModal');
    if (event.target === modal) {
        closeInstruction();
    }
};

// Close modal on close button click
const closeBtn = document.querySelector('.modal-close');
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.impactOccurred === 'function') {
            tg.HapticFeedback.impactOccurred('light');
        }
        closeInstruction();
    });
}

// Copy text to clipboard with toast notification
function copyToClipboard(text, buttonElement) {
    if (!text) return;

    // Copy using modern API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showToast).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }

    function fallbackCopy() {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast();
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        document.body.removeChild(textArea);
    }

    function showToast() {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = '<span class="toast-icon">✓</span><span>Скопировано</span>';
        document.body.appendChild(toast);

        // Trigger reflow for animation
        toast.offsetHeight;

        // Show toast
        toast.classList.add('show');

        // Haptic feedback
        if (tg && tg.HapticFeedback && typeof tg.HapticFeedback.notificationOccurred === 'function') {
            tg.HapticFeedback.notificationOccurred('success');
        }

        // Hide after 2 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Блокировка прокрутки вне модального окна
const modalEl = document.getElementById('instructionModal');
let touchStartY = 0;
let touchEndY = 0;

if (modalEl) {
    modalEl.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modalEl.addEventListener('touchmove', (e) => {
        touchEndY = e.touches[0].clientY;
        const modalBody = e.target.closest('.modal-body');
        
        // Если касание не внутри modal-body - блокируем
        if (!modalBody) {
            e.preventDefault();
            return;
        }
        
        // Если modal-body не скроллится (достигнут край) - блокируем
        const atTop = modalBody.scrollTop === 0;
        const atBottom = modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight;
        
        if ((atTop && touchEndY > touchStartY) || (atBottom && touchEndY < touchStartY)) {
            e.preventDefault();
        }
    }, { passive: false });

    modalEl.addEventListener('wheel', (e) => {
        const modalBody = e.target.closest('.modal-body');
        
        // Если касание не внутри modal-body - блокируем
        if (!modalBody) {
            e.preventDefault();
            return;
        }
        
        // Если modal-body не скроллится (достигнут край) - блокируем
        const atTop = modalBody.scrollTop === 0;
        const atBottom = modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight;
        
        if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInstruction();
    }
});

// Log initialization
console.log('Telegram Web App initialized');
