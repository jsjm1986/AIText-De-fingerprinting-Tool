document.addEventListener('DOMContentLoaded', () => {
    // 初始化 DeepSeek API
    window.initializeDeepSeekAPI();

    // 获取DOM元素
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const processBtn = document.getElementById('processBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyBtn = document.getElementById('copyBtn');
    const compareBtn = document.getElementById('compareBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const naturalScore = document.getElementById('naturalScore');
    const apiStatus = document.getElementById('apiStatus');
    const analysisResult = document.getElementById('analysisResult');
    
    // 获取处理选项
    const useDeepSeek = document.getElementById('useDeepSeek');
    const synonymReplace = document.getElementById('synonymReplace');
    const sentenceRestructure = document.getElementById('sentenceRestructure');
    const punctuationVariation = document.getElementById('punctuationVariation');
    const addInvisibleChars = document.getElementById('addInvisibleChars');
    const textStyle = document.getElementById('textStyle');

    // 获取进度相关元素
    const progressContainer = document.getElementById('progressContainer');
    const cancelBtn = document.getElementById('cancelBtn');
    const timeEstimate = document.getElementById('timeEstimate');
    const progressStatus = document.getElementById('progressStatus');

    // 获取分析面板相关元素
    const analysisPanel = document.getElementById('analysisPanel');
    const closeAnalysisBtn = document.getElementById('closeAnalysisBtn');
    const processingDetails = document.getElementById('processingDetails');
    const textComparison = document.getElementById('textComparison');
    const optimizationSuggestions = document.getElementById('optimizationSuggestions');
    const originalWordCount = document.getElementById('originalWordCount');
    const processedWordCount = document.getElementById('processedWordCount');
    const changeRate = document.getElementById('changeRate');
    const scoreValue = document.getElementById('scoreValue');

    // 历史记录管理
    const MAX_HISTORY = 10;
    let textHistory = JSON.parse(localStorage.getItem('textHistory') || '[]');

    function addToHistory(originalText, processedText, analysis) {
        const timestamp = new Date().toISOString();
        const historyItem = {
            timestamp,
            originalText,
            processedText,
            analysis
        };

        textHistory.unshift(historyItem);
        if (textHistory.length > MAX_HISTORY) {
            textHistory.pop();
        }

        localStorage.setItem('textHistory', JSON.stringify(textHistory));
        updateHistoryDisplay();
    }

    // 更新历史记录显示
    function updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        historyList.innerHTML = textHistory.map((item, index) => `
            <div class="history-item" data-index="${index}">
                <div class="history-header">
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                    <div class="history-actions">
                        <button class="compare-btn" title="与当前文本比较">比较</button>
                        <button class="restore-btn" title="恢复此版本">恢复</button>
                    </div>
                </div>
                <div class="history-preview">${item.processedText.substring(0, 100)}...</div>
            </div>
        `).join('');

        // 添加事件监听器
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const index = e.target.closest('.history-item').dataset.index;
                await compareWithHistoricalVersion(index);
            });
        });

        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.history-item').dataset.index;
                restoreHistoricalVersion(index);
            });
        });
    }

    // 与历史版本比较
    async function compareWithHistoricalVersion(index) {
        const historicalItem = textHistory[index];
        const currentText = outputText.value;

        if (!currentText) {
            showNotification('请先处理当前文本！', 'warning');
            return;
        }

        try {
            showNotification('正在比较文本版本...', 'info');
            const comparisonResult = await window.deepseekAPI.compareWithHistory(
                currentText,
                [historicalItem.processedText]
            );

            // 显示比较结果
            showComparisonResult(comparisonResult);
        } catch (error) {
            console.error('比较文本版本时出错：', error);
            showNotification('比较文本版本时出错', 'error');
        }
    }

    // 恢复历史版本
    function restoreHistoricalVersion(index) {
        const historicalItem = textHistory[index];
        if (confirm('确定要恢复此版本吗？当前文本将被替换。')) {
            inputText.value = historicalItem.originalText;
            outputText.value = historicalItem.processedText;
            showNotification('已恢复历史版本', 'success');
        }
    }

    // 导出报告
    async function exportReport(format = 'html') {
        const originalText = inputText.value;
        const processedText = outputText.value;
        
        if (!processedText) {
            showNotification('没有可导出的内容！', 'warning');
            return;
        }

        try {
            showNotification('正在生成报告...', 'info');
            
            // 获取分析结果
            const analysisResult = await window.deepseekAPI.getNaturalnessScore(processedText);
            
            // 获取历史比较结果（如果有历史记录）
            let comparisonResult = null;
            if (textHistory.length > 0) {
                comparisonResult = await window.deepseekAPI.compareWithHistory(
                    processedText,
                    textHistory.map(item => item.processedText)
                );
            }

            // 生成报告
            const report = await window.deepseekAPI.generateReport(
                originalText,
                analysisResult,
                comparisonResult
            );

            // 导出报告
            switch (format) {
                case 'html':
                    exportHtmlReport(report);
                    break;
                case 'pdf':
                    await exportPdfReport(report);
                    break;
                case 'markdown':
                    exportMarkdownReport(report);
                    break;
            }

            showNotification('报告导出成功！', 'success');
        } catch (error) {
            console.error('导出报告时出错：', error);
            showNotification('导出报告时出错', 'error');
        }
    }

    // 导出HTML报告
    function exportHtmlReport(report) {
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>文本分析报告</title>
                <style>
                    body {
                        font-family: 'Microsoft YaHei', sans-serif;
                        line-height: 1.6;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 2rem;
                    }
                    h1, h2, h3 { color: #2c3e50; }
                    .section { margin-bottom: 2rem; }
                    .chart { margin: 1rem 0; }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        padding: 0.5rem;
                        border: 1px solid #e0e0e0;
                    }
                    .highlight { background-color: #f8f9fa; }
                </style>
            </head>
            <body>
                <h1>文本分析报告</h1>
                <div class="report-content">
                    ${report}
                </div>
                <script>
                    // 可以添加图表等交互功能
                </script>
            </body>
            </html>
        `);
    }

    // 导出PDF报告
    async function exportPdfReport(report) {
        // 这里可以使用html2pdf.js或其他PDF生成库
        // 示例使用html2pdf.js
        const element = document.createElement('div');
        element.innerHTML = report;
        
        const opt = {
            margin: 1,
            filename: '文本分析报告.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
    }

    // 导出Markdown报告
    function exportMarkdownReport(report) {
        // 将HTML转换为Markdown格式
        const markdown = convertHtmlToMarkdown(report);
        
        // 创建下载链接
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '文本分析报告.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // HTML转Markdown的简单实现
    function convertHtmlToMarkdown(html) {
        // 这里可以使用turndown.js或其他转换库
        // 示例使用简单的替换
        return html
            .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
            .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
            .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
            .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
            .replace(/<br\s*\/?>/g, '\n')
            .replace(/<[^>]+>/g, '');
    }

    // 添加导出按钮事件监听器
    document.getElementById('exportHtmlBtn').addEventListener('click', () => exportReport('html'));
    document.getElementById('exportPdfBtn').addEventListener('click', () => exportReport('pdf'));
    document.getElementById('exportMarkdownBtn').addEventListener('click', () => exportReport('markdown'));

    // 初始化历史记录显示
    updateHistoryDisplay();

    // 更新API状态显示
    function updateAPIStatus(status, message = '') {
        const apiStatusElements = document.querySelectorAll('.api-status span');
        apiStatusElements.forEach(element => {
            element.className = status ? 'online' : 'offline';
            element.textContent = status ? '在线' : (message || '离线');
        });
    }

    // 检查API状态
    async function checkAPIStatus() {
        try {
            const apiKey = localStorage.getItem('deepseek_api_key');
            if (!apiKey) {
                updateAPIStatus(false, '请填写API Key');
                return false;
            }

            // 尝试调用API检查状态
            const response = await window.deepseekAPI.checkStatus();
            const isOnline = response && response.status === 'ok';
            updateAPIStatus(isOnline);
            return isOnline;
        } catch (error) {
            console.error('检查API状态时出错：', error);
            updateAPIStatus(false, '连接失败');
            return false;
        }
    }

    // 初始化时检查API状态
    checkAPIStatus();

    // 定期检查API状态
    setInterval(checkAPIStatus, 5 * 60 * 1000); // 每5分钟检查一次

    // 监听API Key的变化
    window.addEventListener('storage', (e) => {
        if (e.key === 'deepseek_api_key') {
            checkAPIStatus();
        }
    });

    // 在设置API Key后立即检查状态
    function setAPIKey(apiKey) {
        localStorage.setItem('deepseek_api_key', apiKey);
        checkAPIStatus();
    }

    // 更新文本统计
    function updateTextStats(original = '', processed = '') {
        // 处理单个文本的统计
        if (arguments.length === 1) {
            const text = original || '';
            const charCount = document.getElementById('charCount');
            const wordCount = document.getElementById('wordCount');
            
            if (charCount) {
                charCount.textContent = `字数：${text.length}`;
            }
            
            if (wordCount) {
                const words = text.split(/[，。！？；：、\s]/g).filter(word => word.trim().length > 0);
                wordCount.textContent = `词数：${words.length}`;
            }
            
            return;
        }

        // 处理两个文本的对比统计
        const originalCount = (original || '').length;
        const processedCount = (processed || '').length;
        const rate = originalCount === 0 ? 0 : 
            ((processedCount - originalCount) / originalCount * 100).toFixed(1);

        const originalWordCount = document.getElementById('originalWordCount');
        const processedWordCount = document.getElementById('processedWordCount');
        const changeRate = document.getElementById('changeRate');

        if (originalWordCount) {
            originalWordCount.textContent = originalCount;
        }
        if (processedWordCount) {
            processedWordCount.textContent = processedCount;
        }
        if (changeRate) {
            changeRate.textContent = `${rate}%`;
        }
    }

    // 输入文本变化时更新统计
    inputText.addEventListener('input', () => {
        updateTextStats(inputText.value);
        naturalScore.textContent = '自然度：-';
        analysisResult.classList.remove('show');
    });

    // 处理进度更新
    function handleProgress(step, progress, status) {
        // 步骤映射
        const stepMapping = {
            'analysis': 'analysis',                 // 获取优化建议
            'detailed_analysis': 'detailed_analysis', // 详细分析
            'apply_suggestions': 'apply_suggestions', // 应用整体建议
            'segmentation': 'segmentation',         // 文本分段
            'optimization': 'segment_optimization', // 逐段优化
            'combination': 'combination'           // 文本组合
        };

        const mappedStep = stepMapping[step] || step;
        const stepElement = document.querySelector(`.step[data-step="${mappedStep}"]`);
        if (!stepElement) return;

        // 更新进度条
        const progressBar = stepElement.querySelector('.progress-bar');
        const progressText = stepElement.querySelector('.progress-text');
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = status || `${progress}%`;

        // 更新步骤��态
        document.querySelectorAll('.step').forEach(el => {
            const stepNumber = parseInt(el.querySelector('.step-icon').textContent);
            const currentStepNumber = parseInt(stepElement.querySelector('.step-icon').textContent);
            
            // 移除所有活动状态
            el.classList.remove('active');
            
            // 为已完成的步骤添加completed类
            if (stepNumber < currentStepNumber || (stepNumber === currentStepNumber && progress === 100)) {
                el.classList.add('completed');
            }
            
            // 为当前步骤添加active类
            if (stepNumber === currentStepNumber && progress < 100) {
                el.classList.add('active');
            }
        });

        // 更新状态文本
        progressStatus.textContent = status || '正在处理中...';

        // 添加处理详情
        addProcessingDetail(status, progress === 100 ? 'success' : 'info');
    }

    // 重置进度显示
    function resetProgress() {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active', 'completed');
            const progressBar = step.querySelector('.progress-bar');
            const progressText = step.querySelector('.progress-text');
            if (progressBar) progressBar.style.width = '0';
            if (progressText) progressText.textContent = '等待中';
        });

        timeEstimate.textContent = '预计剩余时间：计算中...';
        progressStatus.textContent = '准备开始...';
    }

    // 处理按钮点击事件
    processBtn.addEventListener('click', async () => {
        const text = inputText.value;
        if (!text.trim()) {
            showNotification('请输入需要处理的文本！', 'error');
            return;
        }

        const options = {
            useDeepSeek: useDeepSeek && useDeepSeek.checked && !useDeepSeek.disabled,
            synonymReplace: synonymReplace.checked,
            sentenceRestructure: sentenceRestructure.checked,
            punctuationVariation: punctuationVariation.checked,
            addInvisibleChars: addInvisibleChars.checked,
            style: textStyle ? textStyle.value : 'default'
        };

        if (!Object.values(options).some(value => value === true)) {
            showNotification('请至少选择一种处理方式！', 'warning');
            return;
        }

        try {
            // 显示进度容器并重置进度
            progressContainer.style.display = 'block';
            resetProgress();
            
            // 禁用处理按钮
            processBtn.disabled = true;
            processBtn.classList.add('loading');
            processBtn.textContent = '处理中...';

            // 设置进度回调
            window.deepseekAPI.setProgressCallback(handleProgress);
            
            // 开始处理
            const result = await window.deepseekAPI.optimizeText(text, options);
            outputText.value = result.optimizedText;
            
            // 保存优化建议到分析面板
            if (result.suggestions) {
                const optimizationSuggestions = document.getElementById('optimizationSuggestions');
                if (optimizationSuggestions) {
                    optimizationSuggestions.innerHTML = result.suggestions;
                }
            }
            
            showNotification('文本处理完成！', 'success');

            // 如果API在线，自动进行评分
            if (await checkAPIStatus()) {
                analyzeText(result.optimizedText);
            }
        } catch (error) {
            if (error.message === '操作已取消') {
                showNotification('已取消处理', 'info');
            } else {
                console.error('处理文本时发生错误：', error);
                showNotification('处理文本时发生错误，请检查输入文本格式！', 'error');
            }
        } finally {
            processBtn.disabled = false;
            processBtn.classList.remove('loading');
            processBtn.textContent = '处理文本';
            
            // 3秒后隐藏进度容器
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 3000);
        }
    });

    // 分析文本
    async function analyzeText(text) {
        if (!text) {
            showNotification('没有可分析的文本！', 'warning');
            return;
        }

        try {
            // 显示分析面板
            const analysisPanel = document.getElementById('analysisPanel');
            if (analysisPanel) {
                analysisPanel.classList.add('show');
            }

            // 开始分析
            const analysis = await window.deepseekAPI.getNaturalnessScore(text);
            
            // 解析评分结果
            const scores = parseScoreResult(analysis);
            
            // 更新评分显示
            updateScoreDisplay(scores);
            
            // 更新文本统计
            const inputText = document.getElementById('inputText');
            const outputText = document.getElementById('outputText');
            if (inputText && outputText) {
                updateTextStats(inputText.value, outputText.value);
            }

        } catch (error) {
            console.error('分析文本时出错：', error);
            showNotification('分析文本时发生错误', 'error');
        }
    }

    // 重置按钮点击事件
    resetBtn.addEventListener('click', () => {
        inputText.value = '';
        outputText.value = '';
        naturalScore.textContent = '自然度：-';
        analysisResult.classList.remove('show');
        updateTextStats('');
        showNotification('已重置所有内容', 'info');
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', () => {
        copyToClipboard(outputText.value);
    });

    // 对比按钮点击事件
    compareBtn.addEventListener('click', () => {
        if (!inputText.value || !outputText.value) {
            showNotification('需要有输入文本和处理后的文本才能进行对比！', 'warning');
            return;
        }
        showComparison(inputText.value, outputText.value);
    });

    // 分析按钮点击事件
    analyzeBtn.addEventListener('click', async () => {
        const originalText = inputText.value;
        const processedText = outputText.value;
        
        if (!processedText) {
            showNotification('没有可分析的文本！', 'warning');
            return;
        }

        try {
            // 清空之前的分析结果
            processingDetails.innerHTML = '';
            optimizationSuggestions.innerHTML = '';
            
            // 显示分析面板
            showAnalysisPanel();
            
            // 更新文本统计
            updateTextStats(originalText, processedText);
            
            // 显示文本对比
            showTextComparison(originalText, processedText);
            
            // 获取自然度评分
            const analysis = await window.deepseekAPI.getNaturalnessScore(processedText);
            
            // 解析评分结果
            const scores = parseScoreResult(analysis);
            updateScoreDisplay(scores);
            
            // 添加优化建议
            scores.suggestions.forEach(suggestion => {
                addOptimizationSuggestion(suggestion.title, suggestion.description);
            });
            
        } catch (error) {
            console.error('分析文本时发生错误：', error);
            showNotification('分析文本时发生错误', 'error');
        }
    });

    // 复制到剪贴板功能
    async function copyToClipboard(text) {
        if (!text) {
            showNotification('没有可复制的文本！', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(text);
            showNotification('文本已复制到剪贴板！', 'success');
        } catch (err) {
            console.error('复制失败：', err);
            showNotification('复制失败，请手动复制本', 'error');
        }
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // 显示文本对比
    function showComparison(original, processed) {
        const comparisonWindow = window.open('', '_blank', 'width=1200,height=800');
        comparisonWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>文本对比</title>
                <style>
                    body { font-family: 'Microsoft YaHei', sans-serif; margin: 2rem; }
                    .comparison-container { display: flex; gap: 2rem; }
                    .text-panel { flex: 1; }
                    .text-panel h2 { color: #2c3e50; }
                    .text-content { 
                        white-space: pre-wrap; 
                        padding: 1rem;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        background-color: #f8f9fa;
                        min-height: 300px;
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .stats { 
                        margin-top: 1rem; 
                        color: #666;
                        display: flex;
                        gap: 1rem;
                    }
                    .highlight { background-color: #fff3cd; }
                </style>
            </head>
            <body>
                <h1>文本对比分析</h1>
                <div class="comparison-container">
                    <div class="text-panel">
                        <h2>原始文本</h2>
                        <div class="text-content">${original}</div>
                        <div class="stats">
                            <span>字数：${original.length}</span>
                            <span>词组：${original.split(/[，。！？；：、]/g).filter(word => word.trim().length > 0).length}</span>
                        </div>
                    </div>
                    <div class="text-panel">
                        <h2>处理后文本</h2>
                        <div class="text-content">${processed}</div>
                        <div class="stats">
                            <span>字数：${processed.length}</span>
                            <span>词组：${processed.split(/[，。！？；：、]/g).filter(word => word.trim().length > 0).length}</span>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    // 为输出文本框添加双击复制功能
    outputText.addEventListener('dblclick', () => {
        if (outputText.value) {
            copyToClipboard(outputText.value);
        }
    });

    // 添加键盘快捷键
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter 处理文本
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            processBtn.click();
        }
        // Ctrl/Cmd + C 在出框被选中时复制文本
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === outputText) {
            copyBtn.click();
        }
    });

    // 登出功能
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                DeepSeekAPI.logout();
            }
        });
    }

    // 取消按钮点击事件
    cancelBtn.addEventListener('click', () => {
        if (confirm('确定要取消处理吗？')) {
            window.deepseekAPI.cancel();
            showNotification('正在取消处理...', 'info');
        }
    });

    // 初始化检查API状态
    checkAPIStatus();

    // 添加处理详情
    function addProcessingDetail(message, type = 'info') {
        const detail = document.createElement('div');
        detail.className = `detail-item ${type}`;
        detail.textContent = message;
        processingDetails.appendChild(detail);
        processingDetails.scrollTop = processingDetails.scrollHeight;
    }

    // 更新文本统计
    function updateTextStats(original, processed) {
        const originalCount = original.length;
        const processedCount = processed.length;
        const rate = ((processedCount - originalCount) / originalCount * 100).toFixed(1);

        originalWordCount.textContent = originalCount;
        processedWordCount.textContent = processedCount;
        changeRate.textContent = `${rate}%`;
    }

    // 显示文本对比
    function showTextComparison(original, processed) {
        textComparison.innerHTML = '';
        
        // 使用diff算法计算差异
        const diffs = diff(original, processed);
        
        diffs.forEach(diff => {
            const line = document.createElement('div');
            line.className = 'diff-line';
            
            if (diff.added) {
                line.classList.add('added');
                line.textContent = `+ ${diff.value}`;
            } else if (diff.removed) {
                line.classList.add('removed');
                line.textContent = `- ${diff.value}`;
            } else {
                line.textContent = `  ${diff.value}`;
            }
            
            textComparison.appendChild(line);
        });
    }

    // 添加优化建议
    function addOptimizationSuggestion(title, description) {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.innerHTML = `
            <h5>${title}</h5>
            <p>${description}</p>
        `;
        optimizationSuggestions.appendChild(suggestion);
    }

    // 更新评分显示
    function updateScoreDisplay(scores) {
        // 更新总分
        const scoreValue = document.getElementById('scoreValue');
        if (scoreValue) {
            scoreValue.textContent = scores.total || '-';
        }

        // 更新自然度评分
        const naturalScore = document.getElementById('naturalScore');
        if (naturalScore) {
            naturalScore.textContent = `自然度：${scores.total || '-'}`;
        }
        
        // 更新各项评分的进度条和描述
        Object.entries(scores.details).forEach(([category, detail]) => {
            const scoreItem = document.querySelector(`.score-item .item-label[data-category="${category}"]`);
            if (scoreItem) {
                const scoreBar = scoreItem.closest('.score-item').querySelector('.score-bar');
                const barFill = scoreBar.querySelector('.bar-fill');
                const scoreText = document.createElement('span');
                scoreText.className = 'score-text';
                scoreText.textContent = `${detail.score}分`;
                
                // 设置进度条宽度
                barFill.style.width = `${detail.score}%`;
                
                // 添加或更新分数文本
                const existingScoreText = scoreBar.querySelector('.score-text');
                if (existingScoreText) {
                    existingScoreText.textContent = scoreText.textContent;
                } else {
                    scoreBar.appendChild(scoreText);
                }

                // 添加描述提示
                scoreItem.title = detail.description;
            }
        });

        // 更新建议列表
        const suggestionsList = document.getElementById('optimizationSuggestions');
        if (suggestionsList && scores.suggestions.length > 0) {
            suggestionsList.innerHTML = scores.suggestions.map(suggestion => `
                <div class="suggestion-item">
                    <div class="suggestion-category">${suggestion.category}</div>
                    <div class="suggestion-description">${suggestion.description}</div>
                </div>
            `).join('');
        }
    }

    // 显示分析面板
    function showAnalysisPanel() {
        analysisPanel.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 隐藏分析面板
    function hideAnalysisPanel() {
        analysisPanel.classList.add('hide');
        setTimeout(() => {
            analysisPanel.classList.remove('show', 'hide');
            document.body.style.overflow = '';
        }, 300);
    }

    // 关闭按钮点击事件
    closeAnalysisBtn.addEventListener('click', hideAnalysisPanel);

    // 解析评分结果
    function parseScoreResult(analysis) {
        const result = {
            total: 0,
            details: {},
            suggestions: []
        };

        try {
            // 提取总分
            const scoreMatch = analysis.match(/总体评分：(\d+)/);
            if (scoreMatch) {
                result.total = parseInt(scoreMatch[1]);
            }

            // 提取各项评分
            const scoreCategories = {
                '语言自然度': '语言流畅性和表达自然程度',
                '结构多样性': '句式和结构的变化程度',
                '情感表达': '情感色彩的丰富程度',
                '逻辑连贯性': '文本的逻辑性和连贯性',
                'AI特征': 'AI生成特征的检测程度'
            };

            Object.keys(scoreCategories).forEach(category => {
                const pattern = new RegExp(`${category}：(\\d+)[^\\d]*([^\\n]+)`);
                const match = analysis.match(pattern);
                if (match) {
                    result.details[category] = {
                        score: parseInt(match[1]),
                        description: match[2].trim()
                    };
                }
            });

            // 提取改进建议
            const suggestionsMatch = analysis.match(/改进建议：([^]*?)(?=\n\n|$)/);
            if (suggestionsMatch) {
                const suggestions = suggestionsMatch[1].split(/\d+\.\s+/).filter(s => s.trim());
                suggestions.forEach(suggestion => {
                    const [category, ...description] = suggestion.split('：');
                    if (category && description.length > 0) {
                        result.suggestions.push({
                            category: category.trim(),
                            description: description.join('：').trim()
                        });
                    }
                });
            }
        } catch (error) {
            console.error('解析评分结果时出错：', error);
        }

        return result;
    }

    // 简单的diff算法
    function diff(text1, text2) {
        const result = [];
        let i = 0, j = 0;
        
        while (i < text1.length || j < text2.length) {
            if (text1[i] === text2[j]) {
                let common = '';
                while (text1[i] === text2[j] && (i < text1.length || j < text2.length)) {
                    common += text1[i] || '';
                    i++;
                    j++;
                }
                if (common) result.push({ value: common });
            } else {
                if (i < text1.length) {
                    result.push({ value: text1[i], removed: true });
                    i++;
                }
                if (j < text2.length) {
                    result.push({ value: text2[j], added: true });
                    j++;
                }
            }
        }
        
        return result;
    }

    // 更新文本比较统计
    function updateComparisonStats(original, processed) {
        updateTextStats(original, processed);
    }

    // API Key相关事件处理
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyBtn = document.getElementById('saveApiKey');

    // 初始化时加载已保存的API Key
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // 保存API Key按钮点击事件
    saveApiKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showNotification('请输入API Key', 'warning');
            return;
        }

        try {
            await window.deepseekAPI.setAPIKey(apiKey);
            showNotification('API Key保存成功', 'success');
            
            // 更新API状态
            const status = await checkAPIStatus();
            if (status) {
                // 如果API在线，启用DeepSeek选项
                if (useDeepSeek) {
                    useDeepSeek.disabled = false;
                }
            }
        } catch (error) {
            console.error('保存API Key时出错：', error);
            showNotification('API Key无效，请检查后重试', 'error');
        }
    });

    // 按Enter键保存API Key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveApiKeyBtn.click();
        }
    });
}); 