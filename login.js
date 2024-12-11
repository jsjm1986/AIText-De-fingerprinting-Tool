document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    // 检查是否已经登录
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
        // 验证保存的API Key是否有效
        validateAndRedirect(savedApiKey);
    }

    // 登录按钮点击事件
    loginBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showError('请输入API Key');
            return;
        }

        await validateAndRedirect(apiKey);
    });

    // 输入框回车事件
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    // 输入时隐藏错误信息
    apiKeyInput.addEventListener('input', () => {
        errorMessage.style.display = 'none';
    });

    // 验证API Key并跳转
    async function validateAndRedirect(apiKey) {
        loginBtn.disabled = true;
        loginBtn.classList.add('loading');
        loginBtn.textContent = '验证中...';

        try {
            // 创建测试用的API实例
            const api = new DeepSeekAPI(apiKey);
            
            // 简单的API测试
            const response = await fetch(api.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{
                        role: "user",
                        content: "测试消息"
                    }],
                    temperature: 0.7,
                    max_tokens: 10
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            // 验证成功，保存API Key
            localStorage.setItem('deepseek_api_key', apiKey);
            
            // 跳转到主页面
            window.location.href = 'index.html';
        } catch (error) {
            console.error('API Key验证失败：', error);
            showError('API Key无效，请检查后重试');
            
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.textContent = '登录';
        }
    }

    // 显示错误信息
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}); 