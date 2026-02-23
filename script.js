// Telegram Web App initialization
const tg = window.Telegram.WebApp || {};

// Store instructions data
let instructionsData = {};

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Country flags mapping
const countryFlags = {
    'DE': '🇩🇪',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'NL': '🇳🇱',
    'PL': '🇵🇱',
    'UA': '🇺🇦',
    'BY': '🇧🇾',
    'KZ': '🇰🇿',
    'TR': '🇹🇷',
    'AE': '🇦🇪',
    'SG': '🇸🇬',
    'JP': '🇯🇵',
    'KR': '🇰🇷',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'RU': '🇷🇺',
    'FI': '🇫🇮',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'CH': '🇨🇭',
    'AT': '🇦🇹',
    'BE': '🇧🇪',
    'PT': '🇵🇹',
    'GR': '🇬🇷',
    'CZ': '🇨🇿',
    'RO': '🇷🇴',
    'BG': '🇧🇬',
    'HU': '🇭🇺',
    'SK': '🇸🇰',
    'HR': '🇭🇷',
    'RS': '🇷🇸',
    'IL': '🇮🇱',
    'ZA': '🇿🇦',
    'MX': '🇲🇽',
    'AR': '🇦🇷',
    'CL': '🇨🇱',
    'CO': '🇨🇴',
    'ID': '🇮🇩',
    'TH': '🇹🇭',
    'VN': '🇻🇳',
    'PH': '🇵🇭',
    'MY': '🇲🇾',
    'HK': '🇭🇰',
    'TW': '🇹🇼',
    'NZ': '🇳🇿'
};

// Get country flag and name
function getCountryInfo(countryCode) {
    if (!countryCode || typeof countryCode !== 'string') return null;
    const code = countryCode.toUpperCase();
    const flag = countryFlags[code] || '🌍';
    return { flag, code };
}

// Snow effect
let snowInterval;
let isSnowing = false;

// Confetti effect
let confettiAnimation;

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
    
    let html = text
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
document.addEventListener('DOMContentLoaded', async () => {
    // Check if running inside Telegram
    const isTelegram = tg && tg.initParams;
    
    if (tg && tg.expand) {
        tg.expand();
    }

    // Set header color (only in Telegram)
    if (tg && tg.setHeaderColor) {
        tg.setHeaderColor('#0f0f0f');
    }

    // Initialize snow toggle button
    const snowToggle = document.getElementById('snowToggle');
    if (snowToggle) {
        snowToggle.addEventListener('click', toggleSnow);

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
    await loadCards();
});

// Load cards from data.json
async function loadCards() {
    try {
        const response = await fetch('data.json', { 
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        const container = document.getElementById('cardsContainer');
        if (!container) {
            console.error('cardsContainer not found');
            return;
        }
        container.innerHTML = '';

        if (!data.cards || !Array.isArray(data.cards)) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка: неверный формат данных</p>';
            return;
        }

        data.cards.forEach(card => {
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

            // Country badge
            const countryInfo = getCountryInfo(card.country);
            const countryBadge = countryInfo
                ? `<span class="country-badge" title="Страна: ${countryInfo.code}"><span class="flag">${countryInfo.flag}</span><span class="code">${countryInfo.code}</span></span>`
                : '';

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
                    ${countryBadge}
                </div>
                <p>${parseMarkdown(card.description)}</p>
                <div class="card-actions">${buttonsHtml}</div>
            `;

            container.appendChild(cardElement);
        });
        
        // Attach event listeners to dynamically created buttons
        container.querySelectorAll('[data-action="openInstruction"]').forEach(btn => {
            btn.addEventListener('click', () => {
                openInstruction(btn.getAttribute('data-card-id'));
            });
        });
    } catch (error) {
        console.error('Error loading cards:', error);
        const container = document.getElementById('cardsContainer');
        if (container) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Ошибка загрузки данных. Проверьте консоль для деталей.</p>';
        }
    }
}

// Send data to Telegram bot
function sendData(data) {
    if (tg && tg.sendData) {
        tg.sendData(data);
        if (tg.HapticFeedback) {
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
                    .map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="platform-btn">${escapeHtml(link.name)}</a>`)
                    .join('');

                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    ${step.text ? `<p class="platform-text">${parseMarkdown(step.text)}</p>` : ''}
                    <div class="platforms-grid">${linkButtons}</div>
                `;
            }
            // Handle regular list step
            else if (step.type === 'list' || step.items) {
                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    <ol>
                        ${(step.items || []).map(item => `<li>${parseMarkdown(item)}</li>`).join('')}
                    </ol>
                `;
            }
            // Handle text step
            else if (step.type === 'text') {
                stepsHtml += `
                    <h4>${escapeHtml(step.title)}</h4>
                    <p>${parseMarkdown(step.text)}</p>
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

    const modal = document.getElementById('instructionModal');
    if (modal) {
        modal.classList.add('active');
    }

    // Dim the snow
    const snowContainer = document.getElementById('snowContainer');
    if (snowContainer) {
        snowContainer.classList.add('dimmed');
    }

    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Finish instruction with confetti
function finishInstruction() {
    startConfetti();
    
    if (tg && tg.HapticFeedback) {
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

        // Restore snow brightness
        const snowContainer = document.getElementById('snowContainer');
        if (snowContainer) {
            snowContainer.classList.remove('dimmed');
        }

        if (tg && tg.HapticFeedback) {
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

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInstruction();
    }
});

// Log initialization
console.log('Telegram Web App initialized');
