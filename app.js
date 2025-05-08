// 初始化 GUN
const gun = Gun({
    peers: ['https://gun-manhattan.herokuapp.com/gun']
});

// 獲取聊天室的參考
const chatRoom = gun.get('chatRoom');

document.addEventListener('DOMContentLoaded', () => {
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('send');
    const proList = document.getElementById('proList');
    const conList = document.getElementById('conList');
    const topicButtons = document.querySelectorAll('.topic-btn');
    let currentTopic = null;
    let lastMessageUsername = '';

    // 辯論主題和論點
    const debateTopics = {
        '早餐': {
            supports: [
                '吃早餐可以提供一天所需的能量',
                '研究顯示吃早餐的人學習效率更好',
                '吃早餐可以促進新陳代謝',
                '規律的早餐有助於維持健康體重',
                '早餐可以改善專注力和記憶力'
            ],
            against: [
                '間歇性斷食更有益健康',
                '省下早餐時間可以多睡一會',
                '不是每個人都需要吃早餐',
                '省下早餐費用可以更好的分配',
                '有些人早上沒有食慾'
            ]
        },
        '讀書': {
            supports: [
                '知識就是力量，增進競爭力',
                '學習新知識可以開闊視野',
                '好的學歷有助於找到好工作',
                '讀書培養邏輯思考能力',
                '終身學習是現代社會的必要條件'
            ],
            against: [
                '實戰經驗比理論更重要',
                '很多成功人士都沒有高學歷',
                '讀書花費時間和金錢成本太高',
                '現代資訊發達，自學更有效率',
                '學校教育內容可能跟不上時代'
            ]
        },
        '打工': {
            supports: [
                '可以累積實務經驗',
                '賺取額外收入改善生活',
                '培養獨立自主的能力',
                '建立人脈和社交關係',
                '了解職場文化和規則'
            ],
            against: [
                '可能影響課業表現',
                '時間管理變得更困難',
                '薪資普遍偏低不划算',
                '可能影響休息和健康',
                '工作內容與未來職涯無關'
            ]
        },
        '考試': {
            supports: [
                '可以檢驗學習成果',
                '培養抗壓性和時間管理',
                '提供公平的評量標準',
                '激勵學習動機',
                '有助於發現學習盲點'
            ],
            against: [
                '無法完整評估實際能力',
                '造成不必要的壓力',
                '容易導致填鴨式學習',
                '忽視創造力和實作能力',
                '考試成績不代表未來發展'
            ]
        }
    };

    // 吐槽主題和回應
    const tsundereResponses = {
        '累': [
            '喔～又躺平了呢！看來今天也是十分努力地在耍廢呢～',
            '辛苦了呢，躺著滑手機真是累人啊！',
            '該不會連走到冰箱都覺得累吧？真是個了不起的廢人呢～',
            '累是因為一直躺著吧，都長蘑菇了啦！'
        ],
        '睡': [
            '哦哦～這不是睡美人嗎？只不過好像睡太多就不美了呢！',
            '每天都在睡覺，是把自己當貓咪在養嗎？',
            '喔？睡到自然醒？那應該是明年的事了吧～',
            '你的人生是不是都在跟枕頭約會啊？'
        ],
        '餓': [
            '叫外送是今天最大的運動量了吧？',
            '喔～終於要離開沙發了嗎？冰箱離這裡5公尺遠喔！',
            '今天是第幾次覺得餓了？零食都快把你養胖了吧！',
            '餓了就自己煮啊～啊，對不起，忘記你連下床都懶得動了呢！'
        ],
        '無聊': [
            '喔？原來躺平大師也會無聊啊？真是稀奇呢～',
            '不如來數數天花板上有幾顆星星？啊，那是蜘蛛網啊...',
            '無聊到發慌？那就數數看今天第幾次說無聊了吧！',
            '要不要爬起來做點什麼？啊，抱歉，我忘記你是行動不便呢！'
        ],
        '追劇': [
            '喔～看來今天又是以看劇的名義虛度光陰呢！',
            '追劇追到天荒地老，青春都耗在這上面了呢～',
            '連續劇都快把你看成連續睡了吧？',
            '劇情比人生還精彩？也是啦，至少躺著看劇不用動腦！'
        ],
        '玩': [
            '遊戲打得比人生還認真呢！',
            '喔～又在努力提升遊戲等級啊！現實等級都掉到負數了吧？',
            '玩遊戲的技術真好呢～如果人生也能這麼認真就好了！',
            '遊戲角色都比你有生產力了呢！'
        ],
        '宅': [
            '外面的世界很可怕對吧？還是窩在家裡最安全呢～',
            '喔？你居然還記得外面的世界長什麼樣子嗎？',
            '再這樣下去，門都要長蜘蛛網了呢！',
            '把家裡當城堡啊？也是啦，畢竟外面都是大野狼呢！'
        ],
        '懶': [
            '這不是懶，這是在充電！充了這麼久，該變超級賽亞人了吧？',
            '懶惰也是一種才能呢！你可能是懶惰界的天才喔！',
            '努力的懶惰著呢！這種程度的懶惰也是需要練習的吧？',
            '懶到連呼吸都嫌麻煩了吧？'
        ],
        '掛科': [
            '哎呀～這學期又要重修了呢！集點冊要加一頁了吧？',
            '這不是你的錯，都是老師太強了～',
            '重修不要緊，多交一份學費而已嘛！',
            '看來你很喜歡這門課呢，想多上幾次？'
        ],
        '報告': [
            '又是死線前趕報告？這是傳統藝術啊！',
            '報告進度條還是0%？真有你的～',
            '讓我猜猜，這次又要熬夜了對吧？',
            '你是不是又等到最後一天才開始？'
        ],
        '翹課': [
            '今天又是自主學習的一天呢！',
            '教室太遠了對吧？床才是你的好朋友～',
            '點名系統：想你想你想你～',
            '這堂課一定又跟你的作息衝突了吧？'
        ],
        '課表': [
            '看來你的課表又排得很滿呢...躺著的時間都快沒有了！',
            '這麼多課，記得偷偷翹掉幾堂喔！',
            '八點的課是學校的錯，誰會想排那麼早？',
            '選課系統真是太壞了，都沒幫你篩掉一點！'
        ],
        '早八': [
            '早八？那不就是傳說中的課程嗎？',
            '誰發明早八的，簡直是佛地魔等級的邪惡！',
            '你確定明天早上會醒來嗎？要不要叫客服（室友）？',
            '這麼早的課，不如退選掉算了吧！'
        ],
        '抽選': [
            '看來你又在賭人品了呢！祝你中選～',
            '這次選課又要跟全校同學搶吧？',
            '不會又要去求老師簽名加簽吧？',
            '選課系統：你排第87位喔，加油！'
        ],
        '點名': [
            '又要找人幫你點名了嗎？真是個麻煩製造者呢！',
            '這次點名app又要出動了吧？',
            '老師：怎麼又只有你的座位是空的？',
            '點名專用APP要更新了，記得去下載喔！'
        ],
        '段考': [
            '又到了考試周？那不就是爆肝時間！',
            '這次考試應該又是考前臨時抱佛腳吧？',
            '考試前夜：咖啡因，我的超人！',
            '記得帶小抄...啊不是，是筆記本！'
        ],
        'deadline': [
            'deadline是什麼？能吃嗎？',
            '又在跟時間賽跑啊？我看這次又要跪了～',
            '還有幾個小時？要不要去拜拜求神明幫忙？',
            '死線就是生命線，你又要挑戰極限了嗎？'
        ],
        '摸魚': [
            '今天的摸魚配額又超標了呢！',
            '這不是摸魚，這是休息型學習！',
            '你的摸魚技術越來越高超了呢～',
            '這樣摸下去，小心變成海王！'
        ],
        '課程': [
            '這課有放學期影片嗎？沒有的話還是回去睡覺吧！',
            '又選了一堂看不懂的課？真有勇氣！',
            '這些課上完要會什麼？會睡覺嗎？',
            '我看你是把課表當菜單在點了吧？'
        ],
        '期中': [
            '期中考要到了？看來又要熬夜了呢！',
            '這次打算及格嗎？還是繼續保持傳統？',
            '要不要組讀書會？喔，你是要組睡覺會啊！',
            '期中考真難，但你更難搞！'
        ],
        '上課': [
            '上課還滑手機？這技術真是越來越厲害了～',
            '今天又坐在最後一排打混了吧？',
            '上課不要睡覺...至少裝做在認真聽！',
            '記得要錄音，這樣之後可以邊睡邊聽！'
        ],
        '讀書': [
            '你讀書的效率，就像用筷子喝湯一樣感人～',
            '書到眼前都懶得翻呢！這是什麼境界啊？',
            '你唸書的樣子像在修行，但成果像是被詛咒呢！',
            '你的專注力跟路邊的貓一樣，三秒就分心了吧？'
        ],
        '考試': [
            '又在靠猜啊？猜得像在買樂透，但從來沒中過呢！',
            '老師看你考卷的眼神，比看到bug還絕望呢～',
            '這次考試又要創造新的歷史了嗎？',
            '你不是沒天賦，是天賦看到你轉身就走了！'
        ],
        '失敗': [
            '你連拖延症都懶得發作，已經達到廢物界的巔峰了呢！',
            '就算世界給你一萬個機會，你也能從中選出最廢的那一個呢～',
            '他試過了，但失敗得很徹底...這就是你的人生勵志故事嗎？',
            '你不是不努力，你只是很擅長事倍功半啊！'
        ],
        '廢': [
            '別人是來這世界發光發熱的，你可能只是來耗電的～',
            '你最大的優點就是永遠不會讓人有壓力，因為誰都比你強呢！',
            '你不是真的沒用，你只是用不到自己～',
            '人生就像遊戲，但你一出生就選了放置模式呢！'
        ],
        '背書': [
            '別人背書靠腦，你背書靠命運，背得起來算奇蹟呢！',
            '你不是不聰明，你只是腦袋自動把書本內容設為「略過」了～',
            '書到用時方恨少，但你連看都懶得看呢！',
            '你背書的樣子，像在跟記憶體玩捉迷藏呢！'
        ],
        '學習': [
            '你的存在就是為了證明「有做不代表有成果」呢～',
            '你讀書時的專注力，連蒼蠅都笑你了！',
            '你不適合讀書，因為字太多、內容太難、你太廢了呢～',
            '書讀得跟沒讀一樣，唯一改變的是浪費的時間呢！'
        ]
    };

    // 隨機吐槽前綴
    const tsunderePrefix = [
        '哼～',
        '嘖嘖～',
        '唉呀呀～',
        '欸？',
        '喔？',
        '哎呀～',
        '噢～',
        '啊啦～',
        '哦？',
        '誒？'
    ];

    // 處理主題按鈕點擊
    topicButtons.forEach(button => {
        button.addEventListener('click', () => {
            const topic = button.dataset.topic;
            setCurrentTopic(topic);
            
            // 更新按鈕狀態
            topicButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // 設置當前主題並顯示論點
    function setCurrentTopic(topic) {
        currentTopic = topic;
        displayArguments(topic);
        messageInput.placeholder = `談談你對「${topic}」的看法...`;
    }

    // 顯示正反論點
    function displayArguments(topic) {
        const { supports, against } = debateTopics[topic];
        
        // 清空現有列表
        proList.innerHTML = '';
        conList.innerHTML = '';

        // 添加支持論點
        supports.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            proList.appendChild(li);
        });

        // 添加反對論點
        against.forEach(point => {
            const li = document.createElement('li');
            li.textContent = point;
            conList.appendChild(li);
        });
    }

    // 顯示訊息
    function appendMessage(message) {
        const messageEl = document.createElement('div');
        const isBot = message.username === '辯論機器人' || message.username === '吐槽大師';
        const isMyMessage = !isBot && message.username === '你';
        messageEl.className = `message ${isMyMessage ? 'my-message' : 'other-message'}`;
        
        messageEl.innerHTML = `
            <div class="text">${escapeHtml(message.text)}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;

        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // 格式化時間
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    // 清理訊息內容，防止 XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 判斷立場
    function detectStance(text) {
        if (!currentTopic) return null;
        
        // 檢查是否包含當前主題
        if (text.includes(currentTopic)) {
            const isPositive = text.includes('好') || text.includes('應該') || text.includes('贊成') || text.includes('支持');
            const isNegative = text.includes('不') || text.includes('別') || text.includes('反對') || text.includes('廢');
            
            return {
                topic: currentTopic,
                stance: isNegative ? 'against' : 'supports'
            };
        }
        return null;
    }

    // 取得反方論點回應
    function getCounterArgument(topic, userStance) {
        const responses = debateTopics[topic][userStance === 'supports' ? 'against' : 'supports'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 取得吐槽回應
    function getTsundereResponse(text) {
        for (const keyword in tsundereResponses) {
            if (text.includes(keyword)) {
                const responses = tsundereResponses[keyword];
                const prefix = tsunderePrefix[Math.floor(Math.random() * tsunderePrefix.length)];
                const response = responses[Math.floor(Math.random() * responses.length)];
                return `${prefix} ${response}`;
            }
        }
        return null;
    }

    // 用來追踪已顯示的訊息
    const displayedMessages = new Set();

    // 監聽訊息
    chatRoom.map().on((message, id) => {
        if (message && message.text && message.timestamp && !displayedMessages.has(id)) {
            displayedMessages.add(id);
            appendMessage(message);

            if (message.username !== '辯論機器人' && message.username !== '吐槽大師') {
                const stance = detectStance(message.text);
                if (stance) {
                    setTimeout(() => {
                        const counterMessage = {
                            text: getCounterArgument(stance.topic, stance.stance),
                            username: '辯論機器人',
                            timestamp: Date.now(),
                            id: Math.random().toString(36).substring(2)
                        };
                        chatRoom.get(counterMessage.id).put(counterMessage);
                    }, 1000);
                }

                const response = getTsundereResponse(message.text);
                if (response) {
                    setTimeout(() => {
                        const tsundereMessage = {
                            text: response,
                            username: '吐槽大師',
                            timestamp: Date.now(),
                            id: Math.random().toString(36).substring(2)
                        };
                        chatRoom.get(tsundereMessage.id).put(tsundereMessage);
                    }, 1000);
                }
            }
        }
    });

    // 發送訊息
    function sendMessage() {
        const text = messageInput.value.trim();

        if (text) {
            const message = {
                text,
                username: '你',
                timestamp: Date.now(),
                id: Math.random().toString(36).substring(2)
            };

            chatRoom.get(message.id).put(message);
            messageInput.value = '';
            messageInput.focus();
        }
    }

    // 事件監聽
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自動聚焦到訊息輸入框
    messageInput.focus();

    // 留言區相關
    const commentInput = document.getElementById('commentInput');
    const postCommentButton = document.getElementById('postComment');
    const commentsList = document.getElementById('commentsList');
    const commentsRef = gun.get('comments');

    // 特別針對留言的吐槽回應
    const commentResponses = [
        '哎呀～又在抒發內心戲啊？',
        '這種心情我懂，但你可能比我更廢一點～',
        '寫得真好！就是有點太消極了呢～',
        '要不要考慮轉行當作家？至少可以把頹廢變成文學！',
        '這麼會寫？不如去投稿「廢文月刊」吧！',
        '越看越有感覺，感覺你真的很廢呢！',
        '文采不錯～就是內容有點太真實了！',
        '這種程度的自暴自棄，你很有天份喔！'
    ];

    // 發布留言
    function postComment() {
        const text = commentInput.value.trim();
        if (text) {
            const comment = {
                text,
                timestamp: Date.now(),
                id: Math.random().toString(36).substring(2)
            };

            // 隨機選擇一個吐槽回應
            const response = commentResponses[Math.floor(Math.random() * commentResponses.length)];
            comment.response = response;

            commentsRef.get(comment.id).put(comment);
            commentInput.value = '';
        }
    }

    // 顯示留言
    function displayComment(comment) {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        
        commentEl.innerHTML = `
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-response">${escapeHtml(comment.response)}</div>
            <div class="comment-time">${formatTime(comment.timestamp)}</div>
        `;

        commentsList.insertBefore(commentEl, commentsList.firstChild);
    }

    // 監聽留言
    commentsRef.map().on((comment, id) => {
        if (comment && !displayedMessages.has(id)) {
            displayedMessages.add(id);
            displayComment(comment);
        }
    });

    // 留言按鈕事件
    postCommentButton.addEventListener('click', postComment);
    
    // 留言輸入框按 Enter 發送
    commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            postComment();
        }
    });

    // 設置預設主題
    setCurrentTopic('早餐');
});