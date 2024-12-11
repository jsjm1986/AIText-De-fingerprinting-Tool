// DeepSeekAPI类定义
class DeepSeekAPI {
    constructor(apiKey = null) {
        this.apiKey = apiKey || localStorage.getItem('deepseek_api_key');
        if (!this.apiKey) {
            throw new Error('未找到API Key，请先登录');
        }
        this.apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
        this.abortController = null;
        this.progressCallback = null;
    }

    setProgressCallback(callback) {
        this.progressCallback = callback;
    }

    updateProgress(step, progress, status = '') {
        if (this.progressCallback) {
            this.progressCallback(step, progress, status);
        }
    }

    // 检查API状态
    async checkStatus() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [{
                        role: "user",
                        content: "test"
                    }],
                    max_tokens: 1
                })
            });

            return {
                status: response.ok ? 'ok' : 'error',
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('检查API状态时出错：', error);
            return { status: 'error', error: error.message };
        }
    }

    // API调用
    async callAPI(messages, temperature = 0.7) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages,
                    temperature,
                    max_tokens: 2000
                }),
                signal: this.abortController ? this.abortController.signal : null
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('操作已取消');
            }
            throw error;
        }
    }

    // 分析文本
    async analyzeText(text) {
        const response = await this.callAPI([{
            role: "system",
            content: `你是一位专业的文本分析专家，需要对文本进行全方位的分析和评估。请从以下维度进行分析：

1. 语言维度：
   - 词汇使用：词语选择的准确性和多样性
   - 句式结构：句子长度和复杂度的变化
   - 表达方式：是否自然流畅，是否有特定风格

2. 结构维度：
   - 段落组织：段落划分的合理性
   - 逻辑关系：段落间的连接和过渡
   - 主题展开：内容的层次性和完整性

3. 风格维度：
   - 语气特征：是否符合预语气
   - 情感色彩：情感表达的适当性
   - 专业程度：专业术语的使用情况

4. AI特征分析：
   - 重复模式：是否存在不自然的重复
   - 表达机械性：是否存在明显的机器生成特征
   - 逻辑连贯性：思维跳跃或不连贯的情况

5. 改进方向：
   - 需要保留的优点
   - 需要改进的方面
   - 具体的优化建议

请提供详细的分析和具体的改进建议。`
        }, {
            role: "user",
            content: `请分析以下文本：\n\n${text}\n\n请按照以下格式输出：

一、语言分析：
1. 词汇使用：[分析]
2. 句式结构：[分析]
3. 表达方式：[分析]

二、结构分析：
1. 段落组织：[分析]
2. 逻辑关系：[分析]
3. 主题展开：[分析]

三、风格分析：
1. 语气特征：[分析]
2. 情感色彩：[分析]
3. 专业程度：[分析]

四、AI特征：
1. 重复模式：[分析]
2. 表达机械性：[分析]
3. 逻辑连贯性：[分析]

五、优化建议：
1. 需要保留：[具体建议]
2. 需要改进：[具体建议]
3. 优化方向：[具体建议]`
        }]);

        return response.choices[0].message.content;
    }

    // 获取文本优化建议
    async getOptimizationSuggestions(text) {
        try {
            const response = await this.callAPI([{
                role: "system",
                content: `你是一位资深的文案优化专家和AI特征分析师，特别擅长识别和消除文本中的AI生成特征。你需要深入分析文本中的AI特征，并提供具体的优化建议。

分析重点：
1. 词汇使用特征
   - 过于规范和书面化的用词
   - 重复词汇和固定搭配
   - 缺乏口语化和生活化表达

2. 句式结构特征
   - 过于完美的句式结构
   - 重复的句式模式
   - 过度工整的排比

3. 语言习惯特征
   - 缺乏语气词和口头禅
   - 过于严谨的逻辑性
   - 缺乏情感波动

4. 内容组织特征
   - 过于规整的段落结构
   - 机械化的过渡衔接
   - 过度完整的论述

5. 表达方式特征
   - 缺乏个性化表达
   - 过于客观中立
   - 情感表达不自然

请特别注意析这些可能暴露AI生成的特征，并提供具体的修改建议。`
            }, {
                role: "user",
                content: `请分析以下文本中可能存在的AI特征，并提供详细的修改建议：

文本内容：
${text}

请按照以下格式提供分析和建议：

一、AI特征识别：
1. 词汇使用特征
   - 发现的特征：[具体描述]
   - 问题位置：[指出具体词汇]
   - 原因分析：[为什么显得像AI生成]
   - 建议修改：[具体修改建议]

2. 句式结构特征
   - 发现的特征：[具体描述]
   - 问题位置：[指出具体句子]
   - 原因分析：[为什么显得像AI生成]
   - 建议修改：[具体修改建议]

3. 语言习惯特征
   - 发现的特征：[具体描述]
   - 问题位置：[指出具体表达]
   - 原因分析：[为什么不符合人类习惯]
   - 建议修改：[具体修改建议]

4. 内容组织特征
   - 发现的特征：[具体描述]
   - 问题位置：[指出具体段落]
   - 原因分析：[为什么结构不自然]
   - 建议修改：[具体修改建议]

5. 表达方式特征
   - 发现的特征：[具体描述]
   - 问题位置：[指出具体表达]
   - 原因分析：[为什么表达不自然]
   - 建议修改：[具体修改建议]

二、优化建议：
1. 词汇层面
   - 原文：[具体词汇]
   - 建议：[替换建议]
   - 理由：[为什么这样改更自然]
   - 例子：[具体使用示例]

2. 句式层面
   - 原文：[具体句子]
   - 建议：[改写建议]
   - 理由：[为什么这样改更自然]
   - 例子：[具体使用示例]

3. 结构层面
   - 原文：[具体段落]
   - 建议：[重组建议]
   - 理由：[为什么这样改更合理]
   - 例子：[具体使用示例]

三、人性化改造建议：
1. 增加口语化表达
   - [具体建议1]
   - [具体建议2]
   - [示例展示]

2. 加入情感色彩
   - [具体建议1]
   - [具体建议2]
   - [示例展示]

3. 增加个性化特征
   - [具体建议1]
   - [具体建议2]
   - [示例展示]

四、改写示例：
[选择一个典型段落，展示多个不同风格的改写版本，并解释每个版本的特点和优势]`
            }]);

            return response.choices[0].message.content;
        } catch (error) {
            console.error('获取优化建议失败：', error);
            throw error;
        }
    }

    // 应用修改建议到文本
    async applyOptimizationSuggestions(text, suggestions) {
        try {
            const response = await this.callAPI([{
                role: "system",
                content: `你是一位精通文本优化的专家编辑，特别擅长将AI生成的文本改写得更加自然、更有人情味。你需要根据分析建议对文本进行深度优化，重点是消除AI特征，增加人性化表达。

优化重点：
1. 打破完美主义
   - 适当保留一些口语化的不完整表达
   - 加入一些自然的语气词
   - 避免过于工整的结构

2. 增加个性化
   - 加入带有个人色彩的表达
   - 使用更生活化的比喻
   - 增加适度的情感波动

3. 提升自然度
   - 打破固定的表达模式
   - 加入一些日常用语
   - 使用更接地气的说法

请根据这些原则对文本进行优化，使其更像人类书写的内容。`
            }, {
                role: "user",
                content: `请根据以下分析和建议优化文本。请确保修改到位，同时保持文本的自然流畅：

分析建议：
${suggestions}

需要优化的文本：
${text}

优化要求：
1. 严格执行分析中提到的每一条建议
2. 特别注意消除AI特征：
   - 改写过于完美的句式
   - 打破重复的表达模式
   - 加入适当的口语化表达
   - 增加情感和个性化特征
3. 分步骤执行：
   - 先应用词汇层面的修改
   - 然后优化句式结构
   - 最后调整整体风格
4. 确保优化后的文本：
   - 更自然流畅
   - 更有人情味
   - 更接近人类写作风格

请直接返回优化后的文本，不要包含任何解释或说明。`
            }]);

            return response.choices[0].message.content;
        } catch (error) {
            console.error('应用优化建议失败：', error);
            throw error;
        }
    }

    // 最终文本润色
    async finalPolish(text, suggestions) {
        try {
            const response = await this.callAPI([{
                role: "system",
                content: `你是一位资深的文字编辑，特别擅长对文本进行最后的润色和人性化处理。你需要确保文本完全摆脱AI生成的特征，展现出真实自然的人类写作风格。

润色重点：
1. 个性化表达
   - 根据上下文适当加入个人观点
   - 使用生动的比喻和例子
   - 增加适度的情感表达

2. 自然变化
   - 避免过于规整的段落结构
   - 适当打破完全的逻辑性
   - 加入一些自然的语气转折

3. 人情味
   - 增加生活化的细节
   - 加入一些口语化表达
   - 保持亲切自然的语气

4. 风格统一
   - 确保整体风格协调
   - 保持语气的连贯性
   - 维持适当的情感基调

请根据这些原则对文本进行最后的润色，使其更具有人性化特征。`
            }, {
                role: "user",
                content: `请对以下文本进行最后的润色，重点是消除任何可能的AI特征，使其更像真实的人类写作：

文本内容：
${text}

优化建议：
${suggestions}

润色要求：
1. 整体提升
   - 确保文本流畅自然
   - 增加人性化特征
   - 消除机械感
   
2. 重点关注
   - 段落之间的自然过渡
   - 语气的适当变化
   - 情感的自然表达
   
3. 特别注意
   - 避免过于完美的逻辑
   - 保留适度的随意性
   - 加入生活化的表达

请直接返回润色后的文本，不要包含任何解释或说明。`
            }]);

            return response.choices[0].message.content;
        } catch (error) {
            console.error('最终润色失败：', error);
            throw error;
        }
    }

    // 优化文本
    async optimizeText(text, options = {}) {
        this.abortController = new AbortController();

        try {
            // 第一步：获取优化建议 (0-15%)
            this.updateProgress('analysis', 0, '第1步/共6步：开始获取优化建议...');
            const suggestions = await this.getOptimizationSuggestions(text);
            this.updateProgress('analysis', 15, '第1步/共6步：优化建议获取完成');

            // 第二步：详细分析 (15-30%)
            this.updateProgress('analysis', 15, '第2步/共6步：开始详细分析...');
            const analysis = await this.analyzeText(text);
            this.updateProgress('analysis', 30, '第2步/共6步：详细分析完成');

            // 第三步：应用整体建议 (30-45%)
            this.updateProgress('optimization', 30, '第3步/共6步：开始应用整体建议...');
            const initialOptimized = await this.applyOptimizationSuggestions(text, suggestions);
            this.updateProgress('optimization', 45, '第3步/共6步：整体建议应用完成');

            if (this.abortController.signal.aborted) {
                throw new Error('操作已取消');
            }

            // 第四步：文本分段 (45-55%)
            this.updateProgress('segmentation', 45, '第4步/共6步：开始文本分段...');
            const segments = this.splitTextIntoSegments(initialOptimized);
            this.updateProgress('segmentation', 55, '第4步/共6步：文本分段完成');

            if (this.abortController.signal.aborted) {
                throw new Error('操作已取消');
            }

            // 第五步：逐段优化 (55-85%)
            this.updateProgress('optimization', 55, '第5步/共6步：开始逐段优化...');
            const optimizedSegments = [];
            for (let i = 0; i < segments.length; i++) {
                if (this.abortController.signal.aborted) {
                    throw new Error('操作已取消');
                }

                const segmentPrompt = `你是一位资深的文案优化专家，请基于之前的优化建议，进一步完善这段文本。特别注意消除AI特征，增加人性化表达。
                
之前的分析和建议：
${suggestions}

分析结果：
${analysis}

需要优化的文本：
${segments[i]}

优化要求：
1. 严格执行之前的优化建议
2. 特别注意：
   - 词汇替换的自然度
   - 句式重组的流畅性
   - 段落衔接的连贯性
   - 表达方式的人性化
   - 去除任何机械感
3. 处理选项：
   ${options.synonymReplace ? '- 使用更自然的同义词替换' : '- 保持原有用词'}
   ${options.sentenceRestructure ? '- 重组句子，增加自然度' : '- 保持原有句式'}
   ${options.punctuationVariation ? '- 调整标点，增加语气变化' : '- 保持原有标点'}
   - 风格要求：${options.style === 'academic' ? '学术严谨但不失生动' : 
                options.style === 'casual' ? '自然生动的日常表达' : '保持原有风格'}
4. 增加人性化特征：
   - 适当加入口语化表达
   - 增加生动的比喻
   - 加入适度的情感色彩
   - 保持自然的语气变化

请直接返回优化后的文本，不要包含任何解释或说明。`;

                const result = await this.callAPI([{
                    role: "system",
                    content: `你是一位精通中文写作的资深文案专家，特别擅长让文本更自然、更有人情味，同时去除机器生成的痕迹。`
                }, {
                    role: "user",
                    content: segmentPrompt
                }]);

                optimizedSegments.push(result.choices[0].message.content.trim());

                const progress = 55 + Math.round((i + 1) / segments.length * 30);
                this.updateProgress('optimization', progress, `第5步/共6步：优化进度：${Math.round((i + 1) / segments.length * 100)}%`);
            }

            // 第六步：文本组合和最终优化 (85-100%)
            this.updateProgress('combination', 85, '第6步/共6步：开始最终优化...');
            const combinedText = optimizedSegments.join('\n');
            
            // 最终润色
            const finalResult = await this.finalPolish(combinedText, suggestions);
            
            this.updateProgress('combination', 100, '第6步/共6步：文本优化完成');

            return {
                optimizedText: finalResult.trim(),
                suggestions: suggestions
            };
        } catch (error) {
            if (error.message === '操作已取消') {
                console.log('处理已取消');
            }
            throw error;
        } finally {
            this.abortController = null;
        }
    }

    // 分割文本为段落
    splitTextIntoSegments(text) {
        const segments = [];
        let currentSegment = '';
        const sentences = text.split(/(?<=[。！？])/);

        for (const sentence of sentences) {
            if (currentSegment.length + sentence.length > 500) {
                segments.push(currentSegment);
                currentSegment = sentence;
            } else {
                currentSegment += sentence;
            }
        }

        if (currentSegment) {
            segments.push(currentSegment);
        }

        return segments;
    }

    // 取消当前处理
    cancel() {
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    // 获取文本自然度评分
    async getNaturalnessScore(text) {
        try {
            const response = await this.callAPI([{
                role: "system",
                content: `你是一位专业的文本分析专家，需要对文本进行全方位的分析和评估。评估维度包括：

1. 基础维度：
   - 语言自然度：表达是否自然流畅
   - 结构多样性：句式是否变化丰富
   - 情感表达：是否包含适当的情感色彩
   - 逻辑连贯性：文本是否连贯合理
   - AI特征：是否存在明显的机器生成特征

2. 高级维度：
   - 创意性：表达是否具有创新性和独特性
   - 专业性：术语使用是否准确，领域知识是否专业
   - 可读性：文本是否易于理解和阅读
   - 目标适应性：是否符合目标受众和使用场景
   - 风格一致性：行文风格是否统一

3. 技术维度：
   - 词汇丰富度：词汇使用是否丰富多彩
   - 句式复杂度：句子结构是否合理复杂
   - 衔接性：语句之间的过渡是否自然
   - 语法规范性：是否符合语法规则
   - 标点使用：标点符号使用是否恰当

请对每个维度进行0-100的评分，并提供详细的分析理由和改进建议。`
            }, {
                role: "user",
                content: `请分析以下文本：\n\n${text}\n\n请按照以下格式输出：

总体评分：[0-100]

一、基础维度分析：
1. 语言自然度：[分数] - [分析]
2. 结构多样性：[分数] - [分析]
3. 情感表达：[分数] - [分析]
4. 逻辑连贯性：[分数] - [分析]
5. AI特征：[分数] - [分析]

二、高级维度分析：
1. 创意性：[分数] - [分析]
2. 专业性：[分数] - [分析]
3. 可读性：[分数] - [分析]
4. 目标适应性：[分数] - [分析]
5. 风格一致性：[分数] - [分析]

三、技术维度分析：
1. 词汇丰富度：[分数] - [分析]
2. 句式复杂度：[分数] - [分析]
3. 衔接性：[分数] - [分析]
4. 语法规范性：[分数] - [分析]
5. 标点使用：[分数] - [分析]

四、改进建议：
1. [维度]：[具体建议]
2. [维度]：[具体建议]
3. [维度]：[具体建议]

五、优化方向：
1. 短期改进：[建议]
2. 中期改进：[建议]
3. 长期改进：[建议]`
            }]);

            return response.choices[0].message.content;
        } catch (error) {
            console.error('获取自然度评分失败：', error);
            throw error;
        }
    }
}

// 导出类
window.DeepSeekAPI = DeepSeekAPI; 