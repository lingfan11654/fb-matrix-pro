import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Spintax and Cold DM generation endpoint
app.post('/api/ai/generate-spintax', async (req, res) => {
  try {
    const { industry, targetAudience, goal, language = 'zh' } = req.body;
    
    if (!ai) {
      // Fallback pre-crafted smart spintax templates if API key is not yet set
      const defaultTemplates = [
        {
          id: 'sp-1',
          name: '高转化破冰话术 (好友通过即发)',
          template: '{您好|嗨|Hi} {name}！{关注到您在|看到您也在}{group_name}小组，{感觉您对跨境出海很专业|看到您分享的行业经验非常赞}。我们团队近期开发了一套{FB多入口拓客自动化脚本|社交矩阵精准引流工具}，{支持云端去重与自动加粉|每天可稳定获取30-80位高意向精准客户}。{方便发您一份演示视频了解下吗？|期待和您交流出海获客心得！}',
          preview: '您好 Alex！看到您也在出海电商卖家联盟小组，感觉您对跨境出海很专业。我们团队近期开发了一套FB多入口拓客自动化脚本，支持云端去重与自动加粉。方便发您一份演示视频了解下吗？'
        },
        {
          id: 'sp-2',
          name: '帖子点赞/互动定向跟进',
          template: '{Hello|你好} {name}，{注意到您点赞了关于|看到您在}{topic}{的帖子|的讨论}，{我们近期正好整理了一套关于这个方向的最新获客玩法|这里有一份详细的实操引流SOP方案}。{如果有兴趣的话，我私发给您看看？|方便给您发个简版资料参考下吗？}',
          preview: 'Hello Sarah，注意到您点赞了关于独立站精准投流的帖子，我们近期正好整理了一套关于这个方向的最新获客玩法。如果有兴趣的话，我私发给您看看？'
        }
      ];
      return res.json({ templates: defaultTemplates, source: 'fallback' });
    }

    const prompt = `你是一名精通Facebook海外社媒矩阵引流与冷启动私信营销专家。
请根据以下要求生成3组高质量、高回复率的Spintax（自旋转语法变体，如 {Hi|Hello|您好}）冷启动私信文案：
- 目标行业/业务：${industry || '跨境电商与出海独立站'}
- 目标受众画像：${targetAudience || '欧美独立站卖家、跨境采购商、社媒运营者'}
- 营销获客目标：${goal || '吸引对方加好友、索取演示视频或咨询方案'}
- 语言：${language}

要求：
1. 每组文案必须包含丰富的Spintax花括号变体语法，例如 {Hi|Hello|您好}，确保每次脚本发送时随机组合，防止Facebook平台被判定为垃圾消息。
2. 包含变量占位符：{name}、{group_name} 或 {topic}。
3. 语调自然真诚、不令人反感、注重价值提供与低心理门槛破冰。

请以严格的JSON格式返回数组，结构如下：
[
  {
    "id": "sp-1",
    "name": "方案名称",
    "template": "带有{变体1|变体2}的Spintax模板",
    "preview": "展开后的一条自然示例文本"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '[]');
    return res.json({ templates: parsed, source: 'gemini' });
  } catch (error) {
    console.error('Error generating spintax:', error);
    return res.status(500).json({ error: 'Failed to generate spintax' });
  }
});

// AI Customer Support Live Chatbot endpoint
app.post('/api/ai/bot-chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!ai) {
      // High-quality smart response fallback
      const quickResponses: Record<string, string> = {
        '价格': '您好！我们目前提供：\n1️⃣ 月度体验版：$49/月（支持2个FB账号并发）\n2️⃣ 季度矩阵版：$129/季（支持5个账号+云端去重）\n3️⃣ 年度旗舰版：$369/年（支持20个账号+AI智能筛选+私有代理集成）\n4️⃣ 独立源码私有部署：$1,299（提供完整前后端源码+机器人Webhook+终身技术支持）。',
        '防封': '系统采用多重防封技术保障：\n✅ 指纹浏览器深度隔离（独立Canvas、WebGL、User-Agent、WebRTC）\n✅ 动态随机拟人时延（15s-45s波动防机器特征检测）\n✅ 独家动态住宅代理IP轮巡绑定\n✅ 单号每日阈值熔断机制与云端去重池。',
        '演示': '您可以在界面中点击【Facebook 演示】按钮查看实时脚本执行沙箱，包含从小组抓取成员、筛选资料、自动加好友并执行图文私信的完整流程！'
      };
      
      let matched = '您好！我是FBMatrix官方客服。本系统支持多入口精准搜客（推荐好友、小组、点赞、个人链接）、多维条件筛选（国家/性别/好友量）、自动加好友/私信/点赞及云端去重。请问您需要了解具体功能、价格套餐还是定制源码？';
      for (const [key, reply] of Object.entries(quickResponses)) {
        if (message.includes(key)) {
          matched = reply;
          break;
        }
      }
      return res.json({ reply: matched });
    }

    const systemInstruction = `你是 FBMatrix（Facebook多场景精准获客与社交矩阵自动化系统）的专业售前技术顾问与客户支持客服。
你的任务是以专业、热情、诚信且有说服力的口吻回答用户的咨询。
产品核心能力：
1. 入口：推荐好友、好友的好友关系、帖子点赞反应者、公共主页与小组成员提取、指定个人主页URL列表。
2. 筛选条件：国家/地区IP判断、性别、年龄段、好友数量上下限、公开主页关键词匹配、排除同行竞品负向词。
3. 自动化动作：批量自动加好友、图文私信（支持Spintax动态防重变体）、Messenger自动迎新回复、自动加入小组并养号发帖、Reels短视频与帖子点赞评论、自动取消超时挂起请求。
4. 防封与亮点：云端全局去重（避免矩阵号重复触达同一客户）、拟人键鼠操作与随机时间微扰动、独立指纹浏览器环境、支持Socks5/HTTP独立住宅代理。
5. 购买方式：支持USDT(TRC20)、支付宝、微信卡密自动秒发，以及提供完整私有化部署和全套源码交付。
请保持回复简练结构化，友好热情，必要时引导对方体验演示或查看价格套餐。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: message,
      config: {
        systemInstruction,
      },
    });

    return res.json({ reply: response.text?.trim() || '感谢您的咨询，客服正在跟进中。' });
  } catch (error) {
    console.error('Error in bot-chat:', error);
    return res.status(500).json({ error: 'Chat service error' });
  }
});

// AI Lead Qualification endpoint
app.post('/api/ai/qualify-lead', async (req, res) => {
  try {
    const { profile, idealCustomerProfile } = req.body;
    if (!ai) {
      return res.json({
        qualified: true,
        score: 88,
        reason: '用户个人资料符合目标出海商户特征，好友量适中，活跃度高。',
        suggestedGreeting: `Hi ${profile.name || 'there'}, noticed your work in e-commerce, would love to connect!`
      });
    }

    const prompt = `请对以下Facebook用户资料进行获客匹配度评估：
目标客户画像要求：${idealCustomerProfile || '跨境电商、外贸采购、出海品牌运营人员，非同行机器人'}
用户资料数据：
${JSON.stringify(profile, null, 2)}

请以JSON格式输出评估结果：
{
  "qualified": true or false,
  "score": 0-100,
  "reason": "简述匹配或拒绝原因",
  "suggestedGreeting": "量身定制的一句私信破冰语"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const result = JSON.parse(response.text?.trim() || '{}');
    return res.json(result);
  } catch (error) {
    console.error('Error qualifying lead:', error);
    return res.status(500).json({ error: 'Lead qualification error' });
  }
});

// Setup Vite middlewares in dev mode, or static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`FBMatrix platform running on http://localhost:${PORT}`);
  });
}

startServer();
