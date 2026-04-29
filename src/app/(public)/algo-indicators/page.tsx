import Image from 'next/image';
import { Star, ShieldCheck, ArrowRight, Zap, TrendingUp, Activity } from 'lucide-react';

const tools = [
  {
    id: 1,
    title: 'Market Analysis Pro',
    description: 'Get deep insights into market conditions with our AI-driven analysis tool. Features sleek data tables, glowing charts, and professional trading widgets tailored for seasoned investors.',
    image: '/images/market_analysis_tool_1777373584406.png',
    icon: Activity,
    reviewCount: 1240,
    rating: 4.8,
    price: '$49/mo',
    tags: ['Market Data', 'AI Insights', 'Live Tracking'],
  },
  {
    id: 2,
    title: 'Alpha Trend Finder',
    description: 'A dynamic trend finder graphing interface. Spot upward trends effortlessly with our vibrant data visualization tools. Never miss a bullish momentum again.',
    image: '/images/trend_finder_pro_1777373602553.png',
    icon: TrendingUp,
    reviewCount: 980,
    rating: 4.9,
    price: '$79/mo',
    tags: ['Momentum', 'Chart Patterns', 'Real-time'],
  },
  {
    id: 3,
    title: 'Signal Alerts Dashboard',
    description: 'Stay ahead of the curve with our Signal Alerts Dashboard. Receive glowing badges for buy/sell signals and a comprehensive list of trading alerts in a premium interface.',
    image: '/images/signal_indicator_alerts_1777373618713.png',
    icon: Zap,
    reviewCount: 2150,
    rating: 4.7,
    price: '$39/mo',
    tags: ['Alerts', 'Buy/Sell', 'Crypto & Stocks'],
  }
];

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < fullStars 
              ? 'fill-orange-400 text-orange-400' 
              : i === fullStars && hasHalfStar 
                ? 'fill-orange-400/50 text-orange-400' 
                : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{rating}</span>
    </div>
  );
}

export default function AlgoIndicatorsPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 mix-blend-multiply" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-semibold text-sm mb-6 shadow-sm">
            <Zap className="w-4 h-4" />
            <span>Premium Tools Subscription</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
            Algo & <span className="text-transparent bg-clip-text sun-gradient">Indicators</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Supercharge your trading with our professional suite of market analysis tools, trend finders, and signal indicators. Available via flexible subscription plans.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              className="glass-card rounded-2xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 group border border-orange-100/50 flex flex-col bg-white/60"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden bg-gray-900">
                <Image 
                  src={tool.image} 
                  alt={tool.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {tool.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                      <tool.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{tool.title}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <StarRating rating={tool.rating} />
                  <span className="text-sm text-gray-500 font-medium">({tool.reviewCount} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-gray-600 leading-relaxed mb-8 flex-1">
                  {tool.description}
                </p>

                {/* Footer / CTA */}
                <div className="mt-auto pt-6 border-t border-gray-100">
                  <button className="w-full py-4 rounded-xl text-white font-bold sun-gradient shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                    <span>Subscribe Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>Secure subscription. Cancel anytime.</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
