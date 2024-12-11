// 延迟初始化 DeepSeek API
window.initializeDeepSeekAPI = () => {
    if (!window.deepseekAPI && window.DeepSeekAPI) {
        try {
            window.deepseekAPI = new DeepSeekAPI();
        } catch (error) {
            console.log('DeepSeek API 初始化延迟：等待登录');
        }
    }
};

// 性能优化器定义
window.optimizer = (() => {
    class PerformanceOptimizer {
        constructor() {
            this.cache = new Map();
            this.cacheLimit = 100;
        }

        // 缓存结果
        cacheResult(key, value, expirationTime = 3600000) {
            if (!key) return;
            
            if (this.cache.size >= this.cacheLimit) {
                const oldestKey = this.cache.keys().next().value;
                this.cache.delete(oldestKey);
            }

            this.cache.set(key, {
                value,
                timestamp: Date.now(),
                expirationTime
            });
        }

        // 获取缓存结果
        getCachedResult(key) {
            if (!key) return null;
            
            const cached = this.cache.get(key);
            if (!cached) return null;

            if (Date.now() - cached.timestamp > cached.expirationTime) {
                this.cache.delete(key);
                return null;
            }

            return cached.value;
        }

        // 生成缓存键
        generateCacheKey(text, type) {
            if (!text || !type) return null;
            return `${type}_${text.length}_${text.substring(0, 50)}`;
        }

        // 清理过期缓存
        cleanExpiredCache() {
            const now = Date.now();
            for (const [key, value] of this.cache.entries()) {
                if (now - value.timestamp > value.expirationTime) {
                    this.cache.delete(key);
                }
            }
        }
    }

    return new PerformanceOptimizer();
})(); 