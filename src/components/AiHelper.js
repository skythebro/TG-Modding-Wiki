import React, { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import styles from './AiHelper.module.css';

function buildClassUrlMap(knowledgeBase) {
    if (!knowledgeBase) return {};
    const map = {};
    knowledgeBase.forEach(doc => {
        const match = doc.u.match(/\/api\/([^/]+)\/([^/]+)\/?$/);
        if (match) {
            const className = match[2];
            map[className] = doc.u;
        }
    });
    return map;
}

function parseMessageWithLinks(text, classUrlMap) {
    if (!classUrlMap || Object.keys(classUrlMap).length === 0) {
        return text;
    }
    
    const classNames = Object.keys(classUrlMap).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${classNames.map(c => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'g');
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
        }
        parts.push({ type: 'link', content: match[1], url: classUrlMap[match[1]] });
        lastIndex = pattern.lastIndex;
    }
    
    if (lastIndex < text.length) {
        parts.push({ type: 'text', content: text.slice(lastIndex) });
    }
    
    return parts.length > 0 ? parts : text;
}

function MessageContent({ text, classUrlMap }) {
    const parsed = parseMessageWithLinks(text, classUrlMap);
    
    if (typeof parsed === 'string') {
        return <span style={{whiteSpace: 'pre-wrap'}}>{parsed}</span>;
    }
    
    return (
        <span style={{whiteSpace: 'pre-wrap'}}>
            {parsed.map((part, i) => 
                part.type === 'link' ? (
                    <a 
                        key={i} 
                        href={part.url} 
                        className={styles.classLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {part.content}
                    </a>
                ) : (
                    part.content
                )
            )}
        </span>
    );
}
const SYNONYMS = {
    'xp': ['experience', 'exp', 'levelup'],
    'exp': ['experience', 'xp', 'levelup'],
    'hp': ['health', 'hitpoints', 'life'],
    'health': ['hp', 'hitpoints', 'life'],
    'dmg': ['damage', 'attack', 'hurt'],
    'damage': ['dmg', 'attack', 'hurt'],
    'npc': ['enemy', 'monster', 'creature', 'mob'],
    'enemy': ['npc', 'monster', 'creature', 'mob'],
    'mob': ['enemy', 'npc', 'monster', 'creature'],
    'stats': ['statistics', 'attributes', 'stat'],
    'stat': ['statistics', 'attributes', 'stats'],
    'buff': ['bonus', 'boost', 'modifier', 'effect'],
    'debuff': ['penalty', 'malus', 'negative', 'effect'],
    'ui': ['interface', 'gui', 'hud', 'menu'],
    'gui': ['interface', 'ui', 'hud', 'menu'],
    'hud': ['interface', 'ui', 'gui', 'display'],
    'inv': ['inventory', 'items', 'bag'],
    'inventory': ['inv', 'items', 'bag', 'storage'],
    'item': ['object', 'equipment', 'gear', 'loot'],
    'equip': ['equipment', 'gear', 'item', 'wear'],
    'char': ['character', 'player', 'hero'],
    'character': ['char', 'player', 'hero', 'unit'],
    'lvl': ['level', 'tier', 'rank'],
    'level': ['lvl', 'tier', 'rank'],
    'mod': ['modifier', 'modification', 'bonus'],
    'multiplier': ['modifier', 'bonus', 'scale', 'factor'],
    'spawn': ['create', 'instantiate', 'generate', 'summon'],
    'save': ['persist', 'store', 'serialize'],
    'load': ['deserialize', 'restore', 'read'],
};

function expandTokensWithSynonyms(tokens) {
    const expanded = new Set(tokens);
    tokens.forEach(token => {
        if (SYNONYMS[token]) {
            SYNONYMS[token].forEach(syn => expanded.add(syn));
        }
    });
    return Array.from(expanded);
}

function scoreDocument(doc, queryTokens, originalQuery) {
    let score = 0;
    const text = (doc.t + ' ' + doc.c).toLowerCase();
    
    if (text.includes(originalQuery.toLowerCase())) {
        score += 50; 
    }

    queryTokens.forEach(token => {
        if (text.includes(token)) score += 1;
        if (doc.t.toLowerCase().includes(token)) score += 10;
        if (doc.t.toLowerCase() === token) score += 30;
    });

    if (text.includes('overview') || text.includes('modding relevance')) {
        score += 5;
    }
    
    return score;
}

export default function AiHelper() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I am your Modding Assistant. I can read the wiki for you. What do you need?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [knowledgeBase, setKnowledgeBase] = useState(null);
    const [classUrlMap, setClassUrlMap] = useState({});
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !knowledgeBase) {
            console.log("Loading AI Index...");
            fetch('/Wiki/ai-index.json')
                .then(res => res.json())
                .then(data => {
                    console.log("AI Index Loaded:", data.length);
                    setKnowledgeBase(data);
                    setClassUrlMap(buildClassUrlMap(data));
                })
                .catch(err => console.error("Failed to load AI index:", err));
        }

        if (!window.puter) {
            console.log("Loading Puter.js...");
            const script = document.createElement('script');
            script.src = "https://js.puter.com/v2/";
            script.async = true;
            script.onload = () => console.log("Puter.js loaded manually");
            document.body.appendChild(script);
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!query.trim()) return;
        
        const userMsg = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setIsLoading(true);

        try {
            let context = "";
            if (knowledgeBase) {
                const rawTokens = userMsg.text.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
                const tokens = expandTokensWithSynonyms(rawTokens);
                
                const results = knowledgeBase.map(doc => ({ ...doc, score: scoreDocument(doc, tokens, userMsg.text) }))
                                             .filter(doc => doc.score > 0)
                                             .sort((a, b) => b.score - a.score)
                                             .slice(0, 5); // Increased context to top 5

                if (results.length > 0) {
                    context = "Here is relevant information from the wiki:\n" + 
                              results.map(d => `[Page: ${d.t}](${d.u})\n${d.c}`).join('\n\n');
                } else {
                    context = "I couldn't find any specific documents matching your keywords.";
                }
            }

            if (window.puter) {
                const prompt = `You are a helpful assistant for Tainted Grail: Fall of Avalon modding.
Use the following context to answer the user's question. If the context doesn't help, say so.
Do not hallucinate APIs that are not in the context.

Context:
${context}

User Question: ${userMsg.text}

Answer:`;

                const resp = await window.puter.ai.chat(prompt);
                
                let finalText = typeof resp === 'string' ? resp : (resp.message?.content || JSON.stringify(resp));
                
                setMessages(prev => [...prev, { role: 'assistant', text: finalText }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', text: "Error: Puter.js not loaded." }]);
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button className={styles.fab} onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '❌' : '🤖'}
            </button>

            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <h3>Modding Helper</h3>
                        <span className={styles.poweredBy}>Powered by DeepSeek & Puter.js</span>
                    </div>
                    <div className={styles.messages}>
                        {messages.map((m, i) => (
                            <div key={i} className={clsx(styles.message, styles[m.role])}>
                                <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong> 
                                <MessageContent text={m.text} classUrlMap={classUrlMap} />
                            </div>
                        ))}
                        {isLoading && <div className={clsx(styles.message, styles.loading)}><em>Thinking... (Searching {knowledgeBase?.length || 0} pages)</em></div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className={styles.inputArea}>
                        <input 
                            value={query} 
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about classes, methods..."
                        />
                        <button onClick={handleSend} disabled={isLoading}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
}
