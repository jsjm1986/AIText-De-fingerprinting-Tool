class GrammarAnalyzer {
    constructor() {
        // 词性标记
        this.posPatterns = {
            // 名词
            noun: {
                patterns: ['人', '事', '物', '时', '地', '理', '工', '学'],
                suffixes: ['家', '者', '师', '员', '长', '生'],
                common: ['研究', '分析', '开发', '设计', '管理', '系统', '方法']
            },
            // 动词
            verb: {
                patterns: ['做', '看', '说', '想', '去', '来', '用'],
                suffixes: ['化', '制', '动', '行'],
                common: ['进行', '实现', '完成', '开展', '推进', '促进']
            },
            // 形容词
            adjective: {
                patterns: ['好', '大', '小', '高', '低', '快', '慢'],
                suffixes: ['的', '地'],
                common: ['优秀', '重要', '关键', '核心', '基本']
            },
            // 副词
            adverb: {
                patterns: ['很', '非常', '特别', '相当', '极其'],
                suffixes: ['地'],
                common: ['已经', '正在', '将要', '可能', '必须']
            },
            // 介词
            preposition: {
                patterns: ['在', '对', '给', '从', '向', '把'],
                common: ['关于', '通过', '根据', '基于', '依据']
            }
        };

        // 句子成分规则
        this.syntaxRules = {
            // 主语规则
            subject: {
                patterns: [
                    '名词 + 是/为',
                    '名词 + 动词',
                    '代词 + 动词'
                ],
                indicators: ['我', '你', '他', '她', '它', '我们', '你们', '他们']
            },
            // 谓语规则
            predicate: {
                patterns: [
                    '动词 + 宾语',
                    '是/为 + 表语',
                    '动词 + 补语'
                ],
                indicators: ['是', '为', '有', '成为', '变成']
            },
            // 宾语规则
            object: {
                patterns: [
                    '动词 + 名词',
                    '介词 + 名词',
                    '形容词 + 名词'
                ]
            },
            // 定语规则
            attribute: {
                patterns: [
                    '形容词 + 的 + 名词',
                    '名词 + 的 + 名词'
                ]
            },
            // 状语规则
            adverbial: {
                patterns: [
                    '副词 + 动词',
                    '副词 + 形容词',
                    '介词短语'
                ]
            }
        };

        // 扩展语义关系规则
        this.semanticRules = {
            // 原有的语义关系
            causal: {
                indicators: ['因为', '所以', '由于', '因此', '导致'],
                patterns: ['因为A所以B', '由于A因此B']
            },
            transition: {
                indicators: ['但是', '然而', '不过', '可是', '却'],
                patterns: ['虽然A但是B', '尽管A却B']
            },
            parallel: {
                indicators: ['和', '与', '并且', '而且', '以及'],
                patterns: ['A和B', 'A并且B']
            },
            progressive: {
                indicators: ['不仅', '而且', '更', '还'],
                patterns: ['不仅A而且B', '不但A还B']
            },

            // 新增语义关系类型
            condition: {
                indicators: ['如果', '假如', '若', '倘若', '一旦'],
                patterns: ['如果A就B', '若A则B']
            },
            purpose: {
                indicators: ['为了', '以便', '目的是', '旨在'],
                patterns: ['为了A而B', '以A为目的']
            },
            comparison: {
                indicators: ['比', '相比', '较', '不如', '优于'],
                patterns: ['A比B', 'A较B']
            },
            summary: {
                indicators: ['总之', '综上', '总而言之', '概括来说'],
                patterns: ['总之A', '综上所述A']
            },
            example: {
                indicators: ['例如', '比如', '譬如', '举例来说'],
                patterns: ['例如A', '比如说A']
            },
            emphasis: {
                indicators: ['尤其', '特别是', '重点是', '主要是'],
                patterns: ['尤其是A', '特别是A']
            }
        };

        // 上下文关联规则
        this.contextRules = {
            // 指代关系
            reference: {
                pronouns: ['这', '那', '它', '他', '她', '它们', '他们', '她们'],
                demonstratives: ['这个', '那个', '这些', '那些'],
                timeReference: ['此时', '当时', '这时', '那时'],
                locationReference: ['这里', '那里', '此处', '彼处']
            },
            // 时间连贯性
            temporal: {
                sequence: ['首先', '然后', '接着', '最后'],
                concurrent: ['同时', '与此同时', '期间'],
                beforeAfter: ['之前', '之后', '以前', '以后']
            },
            // 话题连贯性
            topic: {
                continuation: ['关于这一点', '对此', '针对这个问题'],
                shift: ['说到', '至于', '关于', '谈到'],
                return: ['回到刚才的话题', '继续刚才的讨论']
            }
        };

        // 语义连贯性检查规则
        this.coherenceRules = {
            // 主题一致性
            topicConsistency: {
                indicators: ['这', '那', '该', '本', '此'],
                patterns: ['主题词重复', '近义词使用', '上下文指代']
            },
            // 逻辑连贯性
            logicalCoherence: {
                relations: ['因果', '条件', '转折', '并列'],
                patterns: ['如果-那么', '虽然-但是', '不仅-而且']
            },
            // 时间连贯性
            temporalCoherence: {
                sequence: ['先后顺序', '同时发生', '持续状态'],
                indicators: ['首先', '其次', '最后', '同时']
            }
        };
    }

    // 分析词性
    analyzePOS(word) {
        for (const [pos, patterns] of Object.entries(this.posPatterns)) {
            // 检查常用词
            if (patterns.common.includes(word)) {
                return pos;
            }
            
            // 检查模式
            if (patterns.patterns.some(pattern => word.includes(pattern))) {
                return pos;
            }
            
            // 检查后缀
            if (patterns.suffixes.some(suffix => word.endsWith(suffix))) {
                return pos;
            }
        }
        return 'unknown';
    }

    // 分析句子成分
    analyzeSyntax(sentence) {
        const components = {
            subject: null,
            predicate: null,
            object: null,
            attributes: [],
            adverbials: []
        };

        // 分词（简单实现，实际项目中应使用专业分词库）
        const words = this.tokenize(sentence);
        
        // 标注词性
        const posTagged = words.map(word => ({
            word,
            pos: this.analyzePOS(word)
        }));

        // 识别主语
        components.subject = this.findSubject(posTagged);
        
        // 识别谓语和宾语
        const predicateObject = this.findPredicateAndObject(posTagged);
        components.predicate = predicateObject.predicate;
        components.object = predicateObject.object;
        
        // 识别定语
        components.attributes = this.findAttributes(posTagged);
        
        // 识别状语
        components.adverbials = this.findAdverbials(posTagged);

        return components;
    }

    // 分析语义关系
    analyzeSemantics(sentence) {
        const relations = [];

        // 检查各种语义关系
        for (const [type, rules] of Object.entries(this.semanticRules)) {
            // 检查关系标记词
            const foundIndicators = rules.indicators.filter(indicator => 
                sentence.includes(indicator)
            );

            if (foundIndicators.length > 0) {
                relations.push({
                    type,
                    indicators: foundIndicators,
                    // 分析相关联的句子部分
                    parts: this.splitByIndicators(sentence, foundIndicators)
                });
            }
        }

        return relations;
    }

    // 分词
    tokenize(sentence) {
        // 简单的分词实现
        // 在实际项目中应使用专业的分词库
        return sentence.split(/(?=[，。！？])|(?<=[，。！？])|(?=[的地得])|(?<=[��地得])/g)
            .filter(word => word.trim());
    }

    // 查找主语
    findSubject(posTagged) {
        // 查找第一个名词或代词作为主语
        const subjectWord = posTagged.find(word => 
            word.pos === 'noun' || 
            this.syntaxRules.subject.indicators.includes(word.word)
        );

        return subjectWord ? subjectWord.word : null;
    }

    // 查找谓语和宾语
    findPredicateAndObject(posTagged) {
        const result = {
            predicate: null,
            object: null
        };

        // 查找谓语（第一个动词）
        const predicateIndex = posTagged.findIndex(word => word.pos === 'verb');
        if (predicateIndex !== -1) {
            result.predicate = posTagged[predicateIndex].word;
            
            // 查找宾语（谓语后的第一个名词）
            const objectWord = posTagged.slice(predicateIndex + 1)
                .find(word => word.pos === 'noun');
            
            if (objectWord) {
                result.object = objectWord.word;
            }
        }

        return result;
    }

    // 查找定语
    findAttributes(posTagged) {
        const attributes = [];
        
        // 查找形容词+的+名词的组合
        for (let i = 0; i < posTagged.length - 2; i++) {
            if (posTagged[i].pos === 'adjective' && 
                posTagged[i + 1].word === '的' && 
                posTagged[i + 2].pos === 'noun') {
                attributes.push({
                    modifier: posTagged[i].word,
                    noun: posTagged[i + 2].word
                });
            }
        }

        return attributes;
    }

    // 查找状语
    findAdverbials(posTagged) {
        const adverbials = [];
        
        // 查找副词+动词的组合
        for (let i = 0; i < posTagged.length - 1; i++) {
            if (posTagged[i].pos === 'adverb' && 
                posTagged[i + 1].pos === 'verb') {
                adverbials.push({
                    modifier: posTagged[i].word,
                    verb: posTagged[i + 1].word
                });
            }
        }

        return adverbials;
    }

    // 根据标记词分割句子
    splitByIndicators(sentence, indicators) {
        let parts = [sentence];
        
        for (const indicator of indicators) {
            parts = parts.flatMap(part => part.split(indicator))
                .map(part => part.trim())
                .filter(part => part);
        }

        return parts;
    }

    // 分析句子的语法结构和语义关系
    analyze(sentence) {
        const basicAnalysis = {
            syntax: this.analyzeSyntax(sentence),
            semantics: this.analyzeSemantics(sentence),
            words: this.tokenize(sentence).map(word => ({
                word,
                pos: this.analyzePOS(word)
            }))
        };

        // 如果是多句话，进行上下文和连贯性分析
        const sentences = sentence.split(/[。！？]/g).filter(s => s.trim());
        if (sentences.length > 1) {
            return {
                ...basicAnalysis,
                context: this.analyzeContext(sentences),
                coherence: this.checkCoherence(sentences)
            };
        }

        return basicAnalysis;
    }

    // 分析上下文关联
    analyzeContext(sentences) {
        const contextAnalysis = {
            references: [],
            temporalRelations: [],
            topicFlow: []
        };

        sentences.forEach((sentence, index) => {
            // 分析指代关系
            const references = this.findReferences(sentence, sentences, index);
            if (references.length > 0) {
                contextAnalysis.references.push(...references);
            }

            // 分析时间关系
            const temporalRelations = this.findTemporalRelations(sentence, sentences, index);
            if (temporalRelations.length > 0) {
                contextAnalysis.temporalRelations.push(...temporalRelations);
            }

            // 分析话题流转
            const topicFlow = this.findTopicFlow(sentence, sentences, index);
            if (topicFlow) {
                contextAnalysis.topicFlow.push(topicFlow);
            }
        });

        return contextAnalysis;
    }

    // 查找指代关系
    findReferences(sentence, sentences, currentIndex) {
        const references = [];
        
        // 检查代词
        this.contextRules.reference.pronouns.forEach(pronoun => {
            if (sentence.includes(pronoun)) {
                const referent = this.findReferent(pronoun, sentences, currentIndex);
                if (referent) {
                    references.push({
                        type: 'pronoun',
                        pronoun,
                        referent,
                        sentence: currentIndex
                    });
                }
            }
        });

        // 检查指示词
        this.contextRules.reference.demonstratives.forEach(demonstrative => {
            if (sentence.includes(demonstrative)) {
                const referent = this.findReferent(demonstrative, sentences, currentIndex);
                if (referent) {
                    references.push({
                        type: 'demonstrative',
                        demonstrative,
                        referent,
                        sentence: currentIndex
                    });
                }
            }
        });

        return references;
    }

    // 查找指代对象
    findReferent(reference, sentences, currentIndex) {
        // 在前文中查找可能的指代对象
        for (let i = currentIndex - 1; i >= 0; i--) {
            const sentence = sentences[i];
            // 使用词性标注找到可能的名词作为指代对象
            const words = this.tokenize(sentence);
            const posTagged = words.map(word => ({
                word,
                pos: this.analyzePOS(word)
            }));

            // 查找最近的名词
            const nouns = posTagged.filter(tag => tag.pos === 'noun');
            if (nouns.length > 0) {
                return {
                    word: nouns[nouns.length - 1].word,
                    sentence: i
                };
            }
        }
        return null;
    }

    // 分析时间关系
    findTemporalRelations(sentence, sentences, currentIndex) {
        const relations = [];

        // 检查时序词
        this.contextRules.temporal.sequence.forEach(marker => {
            if (sentence.includes(marker)) {
                relations.push({
                    type: 'sequence',
                    marker,
                    sentence: currentIndex
                });
            }
        });

        // 检查同时性
        this.contextRules.temporal.concurrent.forEach(marker => {
            if (sentence.includes(marker)) {
                relations.push({
                    type: 'concurrent',
                    marker,
                    sentence: currentIndex
                });
            }
        });

        return relations;
    }

    // 分析话题流转
    findTopicFlow(sentence, sentences, currentIndex) {
        // 检查话题标记词
        for (const [type, markers] of Object.entries(this.contextRules.topic)) {
            for (const marker of markers) {
                if (sentence.includes(marker)) {
                    return {
                        type,
                        marker,
                        sentence: currentIndex
                    };
                }
            }
        }
        return null;
    }

    // 检查语义连贯性
    checkCoherence(sentences) {
        return {
            topicConsistency: this.checkTopicConsistency(sentences),
            logicalCoherence: this.checkLogicalCoherence(sentences),
            temporalCoherence: this.checkTemporalCoherence(sentences)
        };
    }

    // 检查主题一致性
    checkTopicConsistency(sentences) {
        const topics = [];
        sentences.forEach((sentence, index) => {
            // 提取主题词（通常是句子的主语或主要名词）
            const words = this.tokenize(sentence);
            const posTagged = words.map(word => ({
                word,
                pos: this.analyzePOS(word)
            }));

            const nouns = posTagged.filter(tag => tag.pos === 'noun');
            if (nouns.length > 0) {
                topics.push({
                    topic: nouns[0].word,
                    sentence: index
                });
            }
        });

        // 分析主题连贯性
        return {
            topics,
            shifts: this.findTopicShifts(topics),
            consistency: this.calculateTopicConsistency(topics)
        };
    }

    // 查找主题转换
    findTopicShifts(topics) {
        const shifts = [];
        for (let i = 1; i < topics.length; i++) {
            if (topics[i].topic !== topics[i-1].topic) {
                shifts.push({
                    from: topics[i-1],
                    to: topics[i],
                    position: i
                });
            }
        }
        return shifts;
    }

    // 计算主题一致性得分
    calculateTopicConsistency(topics) {
        if (topics.length <= 1) return 1;
        
        let consistentPairs = 0;
        for (let i = 1; i < topics.length; i++) {
            if (topics[i].topic === topics[i-1].topic) {
                consistentPairs++;
            }
        }
        return consistentPairs / (topics.length - 1);
    }

    // 检查逻辑连贯性
    checkLogicalCoherence(sentences) {
        const relations = [];
        sentences.forEach((sentence, index) => {
            // 检查逻辑关系标记词
            for (const [type, rule] of Object.entries(this.semanticRules)) {
                const foundIndicators = rule.indicators.filter(indicator => 
                    sentence.includes(indicator)
                );
                if (foundIndicators.length > 0) {
                    relations.push({
                        type,
                        indicators: foundIndicators,
                        sentence: index
                    });
                }
            }
        });

        return {
            relations,
            coherenceScore: this.calculateLogicalCoherenceScore(relations, sentences.length)
        };
    }

    // 计算逻辑连贯性得分
    calculateLogicalCoherenceScore(relations, totalSentences) {
        if (totalSentences <= 1) return 1;
        return Math.min(relations.length / (totalSentences - 1), 1);
    }

    // 检查时间连贯性
    checkTemporalCoherence(sentences) {
        const temporalMarkers = [];
        sentences.forEach((sentence, index) => {
            // 检查时间标记词
            this.contextRules.temporal.sequence.forEach(marker => {
                if (sentence.includes(marker)) {
                    temporalMarkers.push({
                        type: 'sequence',
                        marker,
                        sentence: index
                    });
                }
            });
        });

        return {
            markers: temporalMarkers,
            isCoherent: this.checkTemporalSequence(temporalMarkers)
        };
    }

    // 检查时间序列是否合理
    checkTemporalSequence(markers) {
        if (markers.length <= 1) return true;
        
        // 检查时间标记词的顺序是否合理
        const expectedOrder = ['首先', '然后', '接着', '最后'];
        let currentOrderIndex = -1;
        
        for (const marker of markers) {
            const orderIndex = expectedOrder.indexOf(marker.marker);
            if (orderIndex > -1) {
                if (orderIndex <= currentOrderIndex) {
                    return false;
                }
                currentOrderIndex = orderIndex;
            }
        }
        
        return true;
    }
}

// 创建全局实例
window.grammarAnalyzer = new GrammarAnalyzer();