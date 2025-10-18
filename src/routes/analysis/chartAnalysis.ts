import express, { Request, Response } from 'express';
import multer from 'multer';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const apiKey = process.env.OPENAI_API_KEY;

// Debug: Log the first and last few characters of the API key (for verification)
if (apiKey) {
  console.log(`🔑 OpenAI API Key loaded: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
} else {
  console.error('❌ OPENAI_API_KEY not found in environment variables!');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  },
});

// Analyze chart image using OpenAI Vision API
async function analyzeChartImage(imageBuffer: Buffer, mimetype: string): Promise<{ 
  isChart: boolean; 
  description: string;
  summary?: string;
  chartSymbol?: string;
  timeRange?: string;
  keyInsights?: {
    trend: { value: string; positive: boolean };
    volatility: { value: string; positive: boolean };
    momentum: { value: string; percentage: number; positive: boolean };
    patternType: { value: string; positive: boolean };
  };
}> {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64Image}`;

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert trading chart analyst. Your task is to:
                1. Determine if the image contains a trading chart (stock, forex, crypto, etc.)
                2. If it's a trading chart, provide a structured analysis with these exact fields:

                Return JSON in this exact format:
                {
                  "isChart": boolean,
                  "description": "Brief technical description",
                  "summary": "2-3 sentence analysis of the chart's key points and potential price direction",
                  "chartSymbol": "Trading pair or asset symbol if visible (e.g. BTC/USDT, AAPL, EUR/USD) or 'Unknown' if not visible",
                  "timeRange": "Chart timeframe if visible (e.g. 1H, 4H, 1D, 1W) or 'Unknown' if not visible",
                  "keyInsights": {
                    "trend": {
                      "value": "Bullish" | "Bearish" | "Sideways",
                      "positive": boolean
                    },
                    "volatility": {
                      "value": "High" | "Medium" | "Low",
                      "positive": boolean (low volatility = true, high = false)
                    },
                    "momentum": {
                      "value": "Strong" | "Moderate" | "Weak",
                      "percentage": number (0-100, represents momentum strength),
                      "positive": boolean (strong momentum = true)
                    },
                    "patternType": {
                      "value": "Breakout" | "Reversal" | "Continuation" | "Consolidation" | "Triangle" | "Head & Shoulders" | "Double Top/Bottom" | "Flag" | "Wedge" | "Channel",
                      "positive": boolean (bullish patterns = true, bearish = false)
                    }
                  }
                }

                3. If it's NOT a trading chart, return:
                {
                  "isChart": false
                }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this trading chart image and provide structured key insights in the exact JSON format specified."
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      max_tokens: 800,
    });

    // Parse the response
    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to extract JSON from the response
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback structured response
      const isChart = content.toLowerCase().includes('trading chart') || 
                      content.toLowerCase().includes('stock chart') ||
                      content.toLowerCase().includes('candlestick');
      
      if (isChart) {
        analysisResult = {
          isChart: true,
          description: 'Chart analysis completed',
          summary: content.substring(0, 200) + '...',
          chartSymbol: 'Unknown',
          timeRange: 'Unknown',
          keyInsights: {
            trend: { value: 'Neutral', positive: true },
            volatility: { value: 'Medium', positive: true },
            momentum: { value: 'Moderate', percentage: 50, positive: true },
            patternType: { value: 'Consolidation', positive: true }
          }
        };
      } else {
        analysisResult = {
          isChart: false,
          description: content
        };
      }
    }

    return analysisResult;

  } catch (error: any) {
    console.error('Error calling OpenAI API:', error.message);
    
    // Return a fallback response
    return {
      isChart: false,
      description: 'Unable to analyze image at this time. Please try again later.'
    };
  }
}

// POST /api/analysis/chart - Analyze a trading chart image
router.post('/chart', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    console.log('\n==========================================');
    console.log('📊 CHART ANALYSIS REQUEST RECEIVED');
    console.log('==========================================');
    console.log('File name:', req.file.originalname);
    console.log('File size:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('File type:', req.file.mimetype);
    console.log('------------------------------------------');
    console.log('🤖 Analyzing with OpenAI Vision API...\n');

    // Analyze the image with OpenAI
    const analysis = await analyzeChartImage(req.file.buffer, req.file.mimetype);

    console.log('\n🔍 ANALYSIS RESULT:');
    console.log('Is Trading Chart:', analysis.isChart ? '✅ YES' : '❌ NO');
    console.log('\n📝 Description:');
    console.log(analysis.description);
    
    if (analysis.keyInsights) {
      console.log('\n📊 CHART INFO:');
      console.log('- Symbol:', analysis.chartSymbol || 'Unknown');
      console.log('- Time Range:', analysis.timeRange || 'Unknown');
      console.log('\n📊 KEY INSIGHTS:');
      console.log('- Trend:', analysis.keyInsights.trend.value, analysis.keyInsights.trend.positive ? '📈' : '📉');
      console.log('- Volatility:', analysis.keyInsights.volatility.value, analysis.keyInsights.volatility.positive ? '✅' : '⚠️');
      console.log('- Momentum:', analysis.keyInsights.momentum.value, `(${analysis.keyInsights.momentum.percentage}%)`, analysis.keyInsights.momentum.positive ? '💪' : '📉');
      console.log('- Pattern Type:', analysis.keyInsights.patternType.value, analysis.keyInsights.patternType.positive ? '🔺' : '🔻');
      console.log('\n📝 Summary:', analysis.summary);
    }
    
    console.log('\n==========================================\n');

    // Return the result
    return res.status(200).json({
      success: true,
      isChart: analysis.isChart,
      description: analysis.description,
      summary: analysis.summary,
      chartSymbol: analysis.chartSymbol,
      timeRange: analysis.timeRange,
      keyInsights: analysis.keyInsights,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('\n❌ ERROR ANALYZING CHART:');
    console.error(error.message);
    console.error('==========================================\n');

    return res.status(500).json({
      success: false,
      error: 'Failed to analyze chart image',
      message: error.message,
    });
  }
});

export default router;
