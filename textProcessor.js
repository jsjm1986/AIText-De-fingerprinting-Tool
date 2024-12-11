class TextProcessor {
    constructor() {
        this.sentencePatterns = {
            // 基本句式模式
            simple: [
                '主语 + 谓语 + 宾语',
                '主语 + 谓语',
                '主语 + 系动词 + 表语'
            ],
            // 复杂句式模式
            complex: [
                '状语 + 主语 + 谓语 + 宾语',
                '主语 + 状语 + 谓语 + 宾语',
                '主语 + 谓语 + 宾语 + 状语'
            ],
            // 修饰性句式模式
            modified: [
                '定语 + 主语 + 谓语 + 宾语',
                '主语 + 定语 + 谓语 + 宾语',
                '主语 + 谓语 + 定语 + 宾语'
            ]
        };
    }

    // 分析句子结构
    analyzeSentence(sentence) {
        return window.grammarAnalyzer.analyze(sentence);
    }

    // 重组句子结构
    restructureSentence(sentence) {
        const analysis = this.analyzeSentence(sentence);
        const components = analysis.syntax;
        
        // 根据语义关系选择合适的重组模式
        const semantics = analysis.semantics;
        let pattern = this.selectPattern(analysis);
        
        // 根据新模式重组句子
        return this.applyPattern(components, pattern, semantics);
    }

    // 选择合适的句式模式
    selectPattern(analysis) {
        const { syntax, semantics } = analysis;
        
        // 根据句子复杂度选择模式类型
        let patternType = 'simple';
        if (syntax.attributes.length > 0 || semantics.length > 0) {
            patternType = 'modified';
        }
        if (syntax.adverbials.length > 0) {
            patternType = 'complex';
        }
        
        // 从选定类型中随机选择一个模式
        const patterns = this.sentencePatterns[patternType];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    // 应用句式模式
    applyPattern(components, pattern, semantics) {
        // 提取所有组件
        const { subject, predicate, object, attributes, adverbials } = components;
        
        // 根据语义关系调整组件
        const adjustedComponents = this.adjustComponentsBySemantics(
            { subject, predicate, object, attributes, adverbials },
            semantics
        );
        
        // 根据模式重新组合
        switch (pattern) {
            case '主语 + 谓语 + 宾语':
                return this.combineComponents(adjustedComponents, ['subject', 'predicate', 'object']);
            case '状语 + 主语 + 谓语 + 宾语':
                return this.combineComponents(adjustedComponents, ['adverbial', 'subject', 'predicate', 'object']);
            case '主语 + 状语 + 谓语 + 宾语':
                return this.combineComponents(adjustedComponents, ['subject', 'adverbial', 'predicate', 'object']);
            case '定语 + 主语 + 谓语 + 宾语':
                return this.combineComponents(adjustedComponents, ['attribute', 'subject', 'predicate', 'object']);
            default:
                return this.combineComponents(adjustedComponents, ['subject', 'predicate', 'object']);
        }
    }

    // 根据语义关系调整组件
    adjustComponentsBySemantics(components, semantics) {
        const adjusted = { ...components };
        
        semantics.forEach(relation => {
            switch (relation.type) {
                case 'causal':
                    // 调整因果关系
                    adjusted.predicate = `因此${adjusted.predicate}`;
                    break;
                case 'transition':
                    // 调整转折关系
                    adjusted.predicate = `但是${adjusted.predicate}`;
                    break;
                case 'parallel':
                    // 调整并列关系
                    if (adjusted.object) {
                        adjusted.object = `${adjusted.object}并且${relation.parts[1] || ''}`;
                    }
                    break;
                case 'progressive':
                    // 调整递进关系
                    if (adjusted.predicate) {
                        adjusted.predicate = `不仅${adjusted.predicate}而且`;
                    }
                    break;
            }
        });
        
        return adjusted;
    }

    // 组合句子组件
    combineComponents(components, order) {
        return order.map(type => {
            switch (type) {
                case 'subject':
                    return components.subject || '';
                case 'predicate':
                    return components.predicate || '';
                case 'object':
                    return components.object || '';
                case 'adverbial':
                    return components.adverbials.length > 0 ? 
                        components.adverbials[0].modifier : '';
                case 'attribute':
                    return components.attributes.length > 0 ? 
                        `${components.attributes[0].modifier}的` : '';
                default:
                    return '';
            }
        }).filter(part => part).join('');
    }

    // 优化句子
    optimizeSentence(sentence, options = {}) {
        let result = sentence;
        
        // 应用语法分析和重组
        if (options.restructure) {
            result = this.restructureSentence(result);
        }
        
        // 应用同义词替换
        if (options.useSynonyms) {
            result = this.applySynonymReplacement(result);
        }
        
        // 应用修饰语优化
        if (options.enhanceModifiers) {
            result = this.enhanceModifiers(result);
        }
        
        return result;
    }

    // 应用同义词替换
    applySynonymReplacement(text) {
        const analysis = this.analyzeSentence(text);
        let result = text;
        
        // 根据词性和语境选择同义词
        analysis.words.forEach(({ word, pos }) => {
            const synonym = window.synonymsHelper.getSmartSynonym(word, {
                pos,
                context: text
            });
            
            if (synonym && synonym !== word) {
                result = result.replace(word, synonym);
            }
        });
        
        return result;
    }

    // 增强修饰语
    enhanceModifiers(sentence) {
        const analysis = this.analyzeSentence(sentence);
        const { syntax } = analysis;
        
        if (syntax.adverbials.length === 0) {
            // 根据语境选择合适的修饰语
            const predicateWord = syntax.predicate;
            if (predicateWord) {
                const modifiers = ['很', '非常', '特别', '相当'];
                const suitableModifier = this.selectSuitableModifier(predicateWord, modifiers);
                return sentence.replace(predicateWord, `${suitableModifier}${predicateWord}`);
            }
        }
        
        return sentence;
    }

    // 选择合适的修饰语
    selectSuitableModifier(word, modifiers) {
        // TODO: 实现更智能的修饰语选择逻辑
        return modifiers[Math.floor(Math.random() * modifiers.length)];
    }

    // 优化段落
    optimizeParagraph(paragraph, options = {}) {
        // 分割段落为句子
        const sentences = paragraph.split(/(?<=[。！？])/);
        
        // 优化每个句子
        const optimizedSentences = sentences.map(sentence => {
            if (sentence.trim()) {
                return this.optimizeSentence(sentence, options);
            }
            return sentence;
        });
        
        // 重新组合段落
        return optimizedSentences.join('');
    }

    // 优化文本
    optimizeText(text, options = {}) {
        // 分割文本为段落
        const paragraphs = text.split(/\n+/);
        
        // 优化每个段落
        const optimizedParagraphs = paragraphs.map(paragraph => {
            if (paragraph.trim()) {
                return this.optimizeParagraph(paragraph, options);
            }
            return paragraph;
        });
        
        // 重新组合文本
        return optimizedParagraphs.join('\n');
    }
}

// 创建全局实例
window.textProcessor = new TextProcessor(); 