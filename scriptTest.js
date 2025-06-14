// main.js

const mainCanvas = document.getElementById('mainCanvas');
const mainCtx = mainCanvas.getContext('2d');

// ==========================================================
// == HIỆU ỨNG VÒNG XOÁY MÂY (CLOUD VORTEX) ==================
// ==========================================================
const cloudVortexEffect = {
    canvas: document.createElement('canvas'),
    ctx: null,
    noiseImageData: null,
    isReady: false,
    size: 512,

    // --- CẤU HÌNH ĐÃ ĐƯỢC TINH CHỈNH ---
    config: {
        // Hình dạng
        innerRadius: 0.12,
        outerRadius: 0.48,
        falloff: 0.2, // Tăng độ mềm của cạnh
        
        // Chuyển động
        speed: 0.1, // Tốc độ quay
        
        // Hiệu ứng xoắn (Twirl)
        twirlStrength: 1, // GIẢM MẠNH: Chỉ xoắn rất nhẹ để tạo hướng
        
        // Kết cấu mây (FBM)
        noiseOctaves: 1,
        noiseScaleBase: 1, // TĂNG: Làm cho các chi tiết nhiễu nhỏ và kéo dài hơn
        noiseLacunarity: 1.0,
        noiseGain: 1,

        // Màu sắc
        color: [175, 220, 240], // Màu xanh da trời nhạt
        opacity: 0.9
    },

    init() {
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        const noiseImage = new Image();
        noiseImage.crossOrigin = 'anonymous';
        noiseImage.onload = () => {
            const tempCtx = document.createElement('canvas').getContext('2d');
            tempCtx.canvas.width = noiseImage.width;
            tempCtx.canvas.height = noiseImage.height;
            tempCtx.drawImage(noiseImage, 0, 0);
            this.noiseImageData = tempCtx.getImageData(0, 0, noiseImage.width, noiseImage.height);
            this.isReady = true;
        };
        noiseImage.src = 'https://static.nodetoy.co/static/texture_library/noise/512/Noise_002.jpg';
    },

    // --- Các hàm tiện ích ---
    clamp: (val, min, max) => Math.max(min, Math.min(val, max)),
    smoothstep: (edge0, edge1, x) => {
        const t = cloudVortexEffect.clamp((x - edge0) / (edge1 - edge0), 0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    },
    getWrappedNoiseValue(u, v, s, d) {
        let su = (((u * s) % 1) + 1) % 1, sv = (((v * s) % 1) + 1) % 1;
        return d.data[(Math.floor(sv * d.height) * d.width + Math.floor(su * d.width)) * 4] / 255;
    },
    
    fbm(u, v) {
        let total = 0.0;
        let amplitude = 1.0;
        let scale = this.config.noiseScaleBase;
        for (let i = 0; i < this.config.noiseOctaves; i++) {
            total += this.getWrappedNoiseValue(u, v, scale, this.noiseImageData) * amplitude;
            scale *= this.config.noiseLacunarity;
            amplitude *= this.config.noiseGain;
        }
        return total;
    },

    update(time) {
        if (!this.isReady) return;

        const outputImageData = this.ctx.createImageData(this.size, this.size);
        const data = outputImageData.data;
        const cfg = this.config;
        const rotAngle = time * cfg.speed;
        const cosA = Math.cos(rotAngle);
        const sinA = Math.sin(rotAngle);

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const i = (y * this.size + x) * 4;
                const uvx = x / this.size, uvy = y / this.size;
                const dx = uvx - 0.5, dy = uvy - 0.5;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const shapeAlpha = this.smoothstep(cfg.innerRadius, cfg.innerRadius + cfg.falloff, dist) *
                                 (1.0 - this.smoothstep(cfg.outerRadius - cfg.falloff, cfg.outerRadius, dist));

                if (shapeAlpha <= 0) {
                    data[i + 3] = 0;
                    continue;
                }
                
                // Logic xoắn vẫn được giữ lại nhưng với cường độ thấp
                const twirlAngle = cfg.twirlStrength * (1.0 - this.clamp(dist / cfg.outerRadius, 0.0, 1.0));
                const cosTwirl = Math.cos(twirlAngle);
                const sinTwirl = Math.sin(twirlAngle);
                const twirled_dx = dx * cosTwirl - dy * sinTwirl;
                const twirled_dy = dx * sinTwirl + dy * cosTwirl;

                // Áp dụng xoay tròn tổng thể
                const final_x = (twirled_dx * cosA - twirled_dy * sinA) + 0.5;
                const final_y = (twirled_dx * sinA + twirled_dy * cosA) + 0.5;
                
                const noise = this.fbm(final_x, final_y);
                const finalAlpha = shapeAlpha * noise * cfg.opacity;
                
                data[i] = cfg.color[0];
                data[i + 1] = cfg.color[1];
                data[i + 2] = cfg.color[2];
                data[i + 3] = finalAlpha * 255;
            }
        }
        this.ctx.putImageData(outputImageData, 0, 0);
    }
};

// ==========================================================
// == VÒNG LẶP & KHỞI CHẠY ==================================
// ==========================================================

function handleResize() {
    mainCanvas.width = window.innerWidth;
    mainCanvas.height = window.innerHeight;
}

function animate(currentTime) {
    const timeInSeconds = currentTime / 1000;
    
    cloudVortexEffect.update(timeInSeconds);

    mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    
    if (cloudVortexEffect.isReady) {
        const scaleFactor = 1.5;
        const newWidth = cloudVortexEffect.canvas.width * scaleFactor;
        const newHeight = cloudVortexEffect.canvas.height * scaleFactor;
        const x = (mainCanvas.width - newWidth) / 2;
        const y = (mainCanvas.height - newHeight) / 2;
        mainCtx.drawImage(cloudVortexEffect.canvas, x, y, newWidth, newHeight);
    }

    requestAnimationFrame(animate);
}

// --- Khởi chạy ---
window.addEventListener('resize', handleResize);
cloudVortexEffect.init(); 
handleResize();
animate(0);